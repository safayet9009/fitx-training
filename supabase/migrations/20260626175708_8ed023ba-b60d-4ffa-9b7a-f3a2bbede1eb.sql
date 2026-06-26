
-- pgcrypto for bcrypt-style hashing
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============ admin_pins ============
CREATE TABLE IF NOT EXISTS public.admin_pins (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  pin_hash TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.admin_pins TO authenticated;
GRANT ALL ON public.admin_pins TO service_role;
ALTER TABLE public.admin_pins ENABLE ROW LEVEL SECURITY;
-- Admins can see only existence of their own row (we never expose pin_hash via app code)
CREATE POLICY "admin reads own pin row" ON public.admin_pins
  FOR SELECT TO authenticated
  USING (user_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));

-- ============ admin_logs ============
CREATE TABLE IF NOT EXISTS public.admin_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target TEXT,
  status TEXT NOT NULL DEFAULT 'success',
  browser TEXT,
  ip TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.admin_logs TO authenticated;
GRANT ALL ON public.admin_logs TO service_role;
ALTER TABLE public.admin_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "admins read all logs" ON public.admin_logs
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "admins insert their own log" ON public.admin_logs
  FOR INSERT TO authenticated
  WITH CHECK (admin_id = auth.uid() AND public.has_role(auth.uid(), 'admin'));
CREATE INDEX IF NOT EXISTS admin_logs_created_idx ON public.admin_logs (created_at DESC);

-- ============ Soft delete columns ============
ALTER TABLE public.gym_centers
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);
ALTER TABLE public.gym_registrations
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);
ALTER TABLE public.subscriptions
  ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS deleted_by UUID REFERENCES auth.users(id);

-- ============ RPCs ============
CREATE OR REPLACE FUNCTION public.set_admin_pin(_pin TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  IF _pin !~ '^[0-9]{6}$' THEN RAISE EXCEPTION 'PIN must be 6 digits'; END IF;
  INSERT INTO public.admin_pins (user_id, pin_hash, updated_at)
    VALUES (auth.uid(), crypt(_pin, gen_salt('bf', 10)), now())
  ON CONFLICT (user_id) DO UPDATE
    SET pin_hash = EXCLUDED.pin_hash, updated_at = now();
END $$;

CREATE OR REPLACE FUNCTION public.verify_admin_pin(_pin TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE _hash TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RETURN false; END IF;
  IF NOT public.has_role(auth.uid(), 'admin') THEN RETURN false; END IF;
  SELECT pin_hash INTO _hash FROM public.admin_pins WHERE user_id = auth.uid();
  IF _hash IS NULL THEN RETURN false; END IF;
  RETURN _hash = crypt(_pin, _hash);
END $$;

CREATE OR REPLACE FUNCTION public.admin_has_pin()
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.admin_pins WHERE user_id = auth.uid())
$$;

CREATE OR REPLACE FUNCTION public.log_admin_action(
  _action TEXT, _target TEXT DEFAULT NULL, _status TEXT DEFAULT 'success',
  _browser TEXT DEFAULT NULL, _ip TEXT DEFAULT NULL, _metadata JSONB DEFAULT NULL
) RETURNS VOID
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL THEN RETURN; END IF;
  IF NOT public.has_role(auth.uid(), 'admin') THEN RETURN; END IF;
  INSERT INTO public.admin_logs (admin_id, action, target, status, browser, ip, metadata)
  VALUES (auth.uid(), _action, _target, _status, _browser, _ip, _metadata);
END $$;

GRANT EXECUTE ON FUNCTION public.set_admin_pin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.verify_admin_pin(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_has_pin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_admin_action(TEXT, TEXT, TEXT, TEXT, TEXT, JSONB) TO authenticated;
