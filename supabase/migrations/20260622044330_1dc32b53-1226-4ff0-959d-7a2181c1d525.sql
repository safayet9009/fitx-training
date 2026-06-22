
-- ============ ENUMS ============
CREATE TYPE public.app_role AS ENUM ('admin', 'user');
CREATE TYPE public.workout_type AS ENUM ('gym', 'running', 'home');
CREATE TYPE public.registration_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE public.subscription_plan AS ENUM ('trial', 'monthly', 'quarterly', 'yearly');
CREATE TYPE public.payment_method AS ENUM ('bkash', 'nagad', 'rocket');
CREATE TYPE public.subscription_status AS ENUM ('pending', 'active', 'expired', 'rejected');

-- ============ updated_at trigger fn ============
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;

-- ============ PROFILES ============
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT NOT NULL DEFAULT '',
  height_cm NUMERIC,
  weight_kg NUMERIC,
  bmi NUMERIC,
  xp INTEGER NOT NULL DEFAULT 0,
  level INTEGER NOT NULL DEFAULT 1,
  streak INTEGER NOT NULL DEFAULT 0,
  last_active_date DATE,
  subscription_type TEXT NOT NULL DEFAULT 'free',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Profiles readable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE TRIGGER trg_profiles_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ============ USER ROLES ============
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.app_role)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Admins read all roles" ON public.user_roles FOR SELECT USING (public.has_role(auth.uid(), 'admin'));

-- ============ HANDLE NEW USER ============
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _h NUMERIC := NULLIF(NEW.raw_user_meta_data->>'height_cm','')::NUMERIC;
  _w NUMERIC := NULLIF(NEW.raw_user_meta_data->>'weight_kg','')::NUMERIC;
  _bmi NUMERIC := CASE WHEN _h IS NOT NULL AND _w IS NOT NULL AND _h > 0
    THEN ROUND((_w / ((_h/100.0)*(_h/100.0)))::numeric, 2) ELSE NULL END;
BEGIN
  INSERT INTO public.profiles (id, email, name, height_cm, weight_kg, bmi)
  VALUES (NEW.id, NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email,'@',1)),
    _h, _w, _bmi);
  IF NEW.email = 'shafayethossainai@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'admin') ON CONFLICT DO NOTHING;
  END IF;
  INSERT INTO public.user_roles (user_id, role) VALUES (NEW.id, 'user') ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;
CREATE TRIGGER on_auth_user_created AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============ BADGES ============
CREATE TABLE public.badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  icon TEXT NOT NULL,
  description TEXT NOT NULL,
  requirement_type TEXT NOT NULL,
  requirement_value INTEGER NOT NULL
);
GRANT SELECT ON public.badges TO authenticated, anon;
GRANT ALL ON public.badges TO service_role;
ALTER TABLE public.badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Badges public read" ON public.badges FOR SELECT USING (true);

INSERT INTO public.badges (code, name, icon, description, requirement_type, requirement_value) VALUES
  ('bronze','Bronze','🥉','Earn 100 XP','xp',100),
  ('silver','Silver','🥈','Earn 300 XP','xp',300),
  ('gold','Gold','🥇','Earn 600 XP','xp',600),
  ('fire','Fire','🔥','7-day streak','streak',7);

CREATE TABLE public.user_badges (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  badge_id UUID NOT NULL REFERENCES public.badges(id) ON DELETE CASCADE,
  unlocked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, badge_id)
);
GRANT SELECT ON public.user_badges TO authenticated, anon;
GRANT ALL ON public.user_badges TO service_role;
ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "User badges public read" ON public.user_badges FOR SELECT USING (true);

-- ============ WORKOUTS ============
CREATE TABLE public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_type public.workout_type NOT NULL,
  exercise_name TEXT NOT NULL,
  duration_min INTEGER NOT NULL DEFAULT 0,
  calories INTEGER NOT NULL DEFAULT 0,
  distance_km NUMERIC,
  xp_earned INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workouts TO authenticated;
GRANT SELECT ON public.workouts TO anon;
GRANT ALL ON public.workouts TO service_role;
ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Workouts public read" ON public.workouts FOR SELECT USING (true);
CREATE POLICY "Users insert own workouts" ON public.workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users delete own workouts" ON public.workouts FOR DELETE USING (auth.uid() = user_id);
CREATE INDEX idx_workouts_user_created ON public.workouts(user_id, created_at DESC);

-- ============ AWARD XP + STREAK + BADGES ON WORKOUT INSERT ============
CREATE OR REPLACE FUNCTION public.award_workout()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  _xp INTEGER;
  _today DATE := (NEW.created_at AT TIME ZONE 'UTC')::DATE;
  _prof public.profiles%ROWTYPE;
  _new_streak INTEGER;
  _new_xp INTEGER;
  _new_level INTEGER;
BEGIN
  _xp := CASE NEW.workout_type
    WHEN 'gym' THEN 40 WHEN 'running' THEN 30 WHEN 'home' THEN 20 ELSE 0 END;
  NEW.xp_earned := _xp;

  SELECT * INTO _prof FROM public.profiles WHERE id = NEW.user_id FOR UPDATE;

  IF _prof.last_active_date IS NULL THEN
    _new_streak := 1;
  ELSIF _prof.last_active_date = _today THEN
    _new_streak := GREATEST(_prof.streak, 1);
  ELSIF _prof.last_active_date = _today - INTERVAL '1 day' THEN
    _new_streak := _prof.streak + 1;
  ELSE
    _new_streak := 1;
  END IF;

  _new_xp := _prof.xp + _xp;
  _new_level := (_new_xp / 100) + 1;

  UPDATE public.profiles
    SET xp = _new_xp, level = _new_level, streak = _new_streak, last_active_date = _today
    WHERE id = NEW.user_id;

  -- award badges
  INSERT INTO public.user_badges (user_id, badge_id)
    SELECT NEW.user_id, b.id FROM public.badges b
    WHERE (b.requirement_type = 'xp' AND _new_xp >= b.requirement_value)
       OR (b.requirement_type = 'streak' AND _new_streak >= b.requirement_value)
  ON CONFLICT DO NOTHING;

  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_award_workout BEFORE INSERT ON public.workouts FOR EACH ROW EXECUTE FUNCTION public.award_workout();

-- ============ GYM CENTERS ============
CREATE TABLE public.gym_centers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  city TEXT NOT NULL,
  address TEXT NOT NULL,
  phone TEXT,
  monthly_fee INTEGER NOT NULL,
  facilities TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.gym_centers TO authenticated, anon;
GRANT INSERT, UPDATE, DELETE ON public.gym_centers TO authenticated;
GRANT ALL ON public.gym_centers TO service_role;
ALTER TABLE public.gym_centers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Centers public read" ON public.gym_centers FOR SELECT USING (true);
CREATE POLICY "Admins manage centers" ON public.gym_centers FOR ALL USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

INSERT INTO public.gym_centers (name, city, address, phone, monthly_fee, facilities) VALUES
  ('PowerHouse Gym Dhanmondi','Dhaka','Road 27, Dhanmondi','+8801711000001',2500,'{Cardio,Weights,Sauna,Trainer}'),
  ('Gold''s Fitness Gulshan','Dhaka','Gulshan Avenue','+8801711000002',3500,'{Cardio,Weights,Pool,Trainer,Classes}'),
  ('Iron Temple Banani','Dhaka','Banani 11','+8801711000003',2800,'{Weights,Crossfit,Trainer}'),
  ('Flex Fitness Uttara','Dhaka','Sector 7, Uttara','+8801711000004',2200,'{Cardio,Weights,Yoga}'),
  ('Beast Mode Mirpur','Dhaka','Mirpur 10','+8801711000005',1800,'{Cardio,Weights}'),
  ('Elite Athletic Club','Dhaka','Bashundhara R/A','+8801711000006',4000,'{Cardio,Weights,Pool,Spa,Trainer}'),
  ('Strong Zone Mohammadpur','Dhaka','Mohammadpur','+8801711000007',2000,'{Cardio,Weights,Trainer}'),
  ('Atlas Fitness Agrabad','Chattogram','Agrabad C/A','+8801811000001',2300,'{Cardio,Weights,Sauna}'),
  ('Titan Gym Nasirabad','Chattogram','Nasirabad','+8801811000002',2100,'{Weights,Crossfit}'),
  ('Coastal Fit Khulshi','Chattogram','Khulshi','+8801811000003',2700,'{Cardio,Weights,Pool}'),
  ('Port City Gym','Chattogram','GEC Circle','+8801811000004',1900,'{Cardio,Weights,Trainer}'),
  ('Riverside Fitness','Barishal','Band Road','+8801911000001',1700,'{Cardio,Weights}'),
  ('Barishal Power Gym','Barishal','Sadar Road','+8801911000002',1500,'{Weights,Trainer}'),
  ('Delta Sports Club','Barishal','Nathullabad','+8801911000003',1800,'{Cardio,Weights,Yoga}');

-- ============ GYM REGISTRATIONS ============
CREATE TABLE public.gym_registrations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  center_id UUID NOT NULL REFERENCES public.gym_centers(id) ON DELETE CASCADE,
  status public.registration_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  processed_at TIMESTAMPTZ
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gym_registrations TO authenticated;
GRANT ALL ON public.gym_registrations TO service_role;
ALTER TABLE public.gym_registrations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own regs" ON public.gym_registrations FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users insert own regs" ON public.gym_registrations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update regs" ON public.gym_registrations FOR UPDATE USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.handle_reg_approval()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NEW.status = 'approved' AND (OLD.status IS DISTINCT FROM 'approved') THEN
    UPDATE public.profiles SET subscription_type = 'pro' WHERE id = NEW.user_id;
    NEW.processed_at := now();
  ELSIF NEW.status = 'rejected' AND (OLD.status IS DISTINCT FROM 'rejected') THEN
    NEW.processed_at := now();
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER trg_reg_approval BEFORE UPDATE ON public.gym_registrations FOR EACH ROW EXECUTE FUNCTION public.handle_reg_approval();

-- ============ SUBSCRIPTIONS ============
CREATE TABLE public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan public.subscription_plan NOT NULL,
  payment_method public.payment_method,
  transaction_id TEXT,
  status public.subscription_status NOT NULL DEFAULT 'pending',
  starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscriptions TO authenticated;
GRANT ALL ON public.subscriptions TO service_role;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own subs" ON public.subscriptions FOR SELECT USING (auth.uid() = user_id OR public.has_role(auth.uid(),'admin'));
CREATE POLICY "Users insert own subs" ON public.subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins update subs" ON public.subscriptions FOR UPDATE USING (public.has_role(auth.uid(),'admin'));
