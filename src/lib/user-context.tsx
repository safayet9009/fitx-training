import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { profileService, type Profile } from "@/services/profileService";
import { authService } from "@/services/authService";
import { bmiInfo } from "@/lib/mock-data";

const XP_PER_LEVEL = 100;

type BadgeRow = { code: string; name: string; icon: string; description: string; requirement_type: string; requirement_value: number };
type DerivedBadge = BadgeRow & { unlocked: boolean };

type Ctx = {
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  badges: DerivedBadge[];
  bmi: ReturnType<typeof bmiInfo>;
  level: number;
  xpInLevel: number;
  xpToNext: number;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const UserContext = createContext<Ctx | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [allBadges, setAllBadges] = useState<BadgeRow[]>([]);
  const [unlockedCodes, setUnlockedCodes] = useState<Set<string>>(new Set());

  const loadFor = useCallback(async (uid: string) => {
    const [p, admin, all, mine] = await Promise.all([
      profileService.getById(uid),
      profileService.isAdmin(uid),
      profileService.getAllBadges(),
      profileService.getUserBadges(uid),
    ]);
    setProfile(p);
    setIsAdmin(admin);
    setAllBadges((all ?? []) as BadgeRow[]);
    setUnlockedCodes(new Set((mine as any[]).map((r) => r.badges?.code).filter(Boolean)));
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!session?.user) return;
    await loadFor(session.user.id);
  }, [session?.user, loadFor]);

  useEffect(() => {
    // Set up listener FIRST, then check existing session
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      if (s?.user) {
        // defer to avoid deadlocks
        setTimeout(() => { loadFor(s.user.id); }, 0);
      } else {
        setProfile(null);
        setIsAdmin(false);
        setUnlockedCodes(new Set());
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      if (data.session?.user) {
        loadFor(data.session.user.id).finally(() => setLoading(false));
      } else {
        setLoading(false);
      }
    });
    return () => { sub.subscription.unsubscribe(); };
  }, [loadFor]);

  const value = useMemo<Ctx>(() => {
    const xp = profile?.xp ?? 0;
    const level = Math.floor(xp / XP_PER_LEVEL) + 1;
    const xpInLevel = xp % XP_PER_LEVEL;
    const bmi = bmiInfo(profile?.height_cm ?? 0, profile?.weight_kg ?? 0);
    const badges: DerivedBadge[] = allBadges.map((b) => ({ ...b, unlocked: unlockedCodes.has(b.code) }));
    return {
      loading,
      session,
      profile,
      isAdmin,
      badges,
      bmi,
      level,
      xpInLevel,
      xpToNext: XP_PER_LEVEL,
      refreshProfile,
      signOut: authService.signOut,
    };
  }, [loading, session, profile, isAdmin, allBadges, unlockedCodes, refreshProfile]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
