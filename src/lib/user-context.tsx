import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { bmiInfo } from "@/lib/mock-data";

export type WorkoutType = "gym" | "run" | "home";

const XP_REWARD: Record<WorkoutType, number> = { gym: 40, run: 30, home: 20 };
const XP_PER_LEVEL = 100;

export type UserState = {
  name: string;
  email: string;
  avatar: string;
  goal: string;
  role: "admin" | "user";
  height: number;
  weight: number;
  xp: number;
  streak: number;
  totalWorkouts: number;
  runningKm: number;
  lastActiveDate: string | null;
  subscription: { plan: string; status: string; renews: string; trialDays: number };
};

const initialUser: UserState = {
  name: "Arjun Rahman",
  email: "arjun@fitx.app",
  avatar: "AR",
  goal: "Build lean muscle",
  role: "admin",
  height: 178,
  weight: 73,
  xp: 320,
  streak: 6,
  totalWorkouts: 12,
  runningKm: 18,
  lastActiveDate: "2026-06-18",
  subscription: { plan: "Pro Monthly", status: "active", renews: "Jul 19, 2026", trialDays: 4 },
};

type DerivedBadge = { id: string; name: string; icon: string; desc: string; unlocked: boolean };

type Ctx = {
  user: UserState;
  level: number;
  xpInLevel: number;
  xpToNext: number;
  bmi: ReturnType<typeof bmiInfo>;
  badges: DerivedBadge[];
  completeWorkout: (type: WorkoutType, actionId: string, extra?: { km?: number }) => void;
};

const UserContext = createContext<Ctx | null>(null);

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}
function daysBetween(a: string, b: string) {
  const da = Date.parse(a + "T00:00:00Z");
  const db = Date.parse(b + "T00:00:00Z");
  return Math.round((db - da) / 86400000);
}

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserState>(initialUser);
  const completedRef = useRef<Set<string>>(new Set());

  const completeWorkout = useCallback((type: WorkoutType, actionId: string, extra?: { km?: number }) => {
    if (completedRef.current.has(actionId)) return;
    completedRef.current.add(actionId);
    const today = todayISO();
    setUser((u) => {
      let streak = u.streak;
      if (u.lastActiveDate !== today) {
        const diff = u.lastActiveDate ? daysBetween(u.lastActiveDate, today) : 99;
        streak = diff === 1 ? u.streak + 1 : 1;
      }
      return {
        ...u,
        xp: u.xp + XP_REWARD[type],
        streak,
        lastActiveDate: today,
        totalWorkouts: u.totalWorkouts + 1,
        runningKm: type === "run" ? u.runningKm + (extra?.km ?? 0) : u.runningKm,
      };
    });
  }, []);

  const derived = useMemo<Ctx>(() => {
    const level = Math.floor(user.xp / XP_PER_LEVEL) + 1;
    const xpInLevel = user.xp % XP_PER_LEVEL;
    const bmi = bmiInfo(user.height, user.weight);
    const badges: DerivedBadge[] = [
      { id: "bronze", name: "Bronze",  icon: "🥉", desc: "Earn 100 XP",      unlocked: user.xp >= 100 },
      { id: "silver", name: "Silver",  icon: "🥈", desc: "Earn 300 XP",      unlocked: user.xp >= 300 },
      { id: "gold",   name: "Gold",    icon: "🥇", desc: "Earn 600 XP",      unlocked: user.xp >= 600 },
      { id: "fire",   name: "On Fire", icon: "🔥", desc: "7-day streak",     unlocked: user.streak >= 7 },
    ];
    return { user, level, xpInLevel, xpToNext: XP_PER_LEVEL, bmi, badges, completeWorkout };
  }, [user, completeWorkout]);

  return <UserContext.Provider value={derived}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error("useUser must be used inside UserProvider");
  return ctx;
}
