import { createClient } from "@supabase/supabase-js";
import { ExamResult, SessionResult, UserProfile, FriendChallenge, DailyQuest, ShopPowerUp } from "./types";
import { getRankByXp } from "./accessories";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

const isSupabaseConfigured =
  supabaseUrl.trim() !== "" &&
  supabaseAnonKey.trim() !== "" &&
  supabaseUrl !== "tu_url" &&
  supabaseAnonKey !== "tu_key";

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// Storage keys
const STORAGE_KEY_CURRENT_USER = "conango_current_user";
const STORAGE_KEY_ACCOUNTS = "conango_registered_accounts";

// Listeners for reactive auth updates
type AuthListener = (user: UserProfile | null) => void;
const authListeners: Set<AuthListener> = new Set();

export function subscribeAuth(listener: AuthListener) {
  authListeners.add(listener);
  return () => {
    authListeners.delete(listener);
  };
}

function notifyAuthListeners(user: UserProfile | null) {
  authListeners.forEach((fn) => fn(user));
}

// ----------------------------------------------------
// AUTHENTICATION FUNCTIONS
// ----------------------------------------------------

export function getCurrentUser(): UserProfile | null {
  if (typeof window === "undefined") return null;
  const stored = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return null;
    }
  }
  return null;
}

export function getRegisteredAccounts(): UserProfile[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY_ACCOUNTS) || "[]");
  } catch {
    return [];
  }
}

export async function registerAccount(
  name: string,
  email: string,
  password: string
): Promise<{ user: UserProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();
  const cleanName = name.trim() || cleanEmail.split("@")[0];

  if (!cleanEmail || !cleanPass) {
    return { user: null as unknown as UserProfile, error: "Ingresa un correo y contraseña válidos." };
  }

  // Preserve any guest session progress so the user doesn't lose what they just played!
  const guestUser = getCurrentUser();
  const initialXp = guestUser && guestUser.id === "guest" ? (guestUser.xp || 0) : 0;
  const initialStreak = guestUser && guestUser.id === "guest" ? (guestUser.streakDays || 0) : 0;
  const initialMedals = guestUser && guestUser.id === "guest" && guestUser.medals ? guestUser.medals : 15;

  // Local / Offline Multi-Account Engine (Always saved locally for zero data loss)
  if (typeof window !== "undefined") {
    const accounts: UserProfile[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY_ACCOUNTS) || "[]"
    );

    const exists = accounts.find((a) => a.email.trim().toLowerCase() === cleanEmail);
    if (exists) {
      return {
        user: null as unknown as UserProfile,
        error: "Ya existe una cuenta registrada con este correo electrónico. Por favor inicia sesión.",
      };
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      email: cleanEmail,
      password: cleanPass, // securely kept in device local storage
      medals: initialMedals,
      streakDays: initialStreak,
      xp: initialXp,
      coins: 50,
      gems: 50,
      streakFreeze: 0,
      created_at: new Date().toISOString(),
    };

    accounts.push(newUser);
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(newUser));

    // Migrate any guest exam and session history to this newly registered account
    try {
      const guestExams = localStorage.getItem("conango_exams_guest");
      if (guestExams) {
        localStorage.setItem(`conango_exams_${newUser.id}`, guestExams);
      }
      const guestSessions = localStorage.getItem("conango_sessions_guest");
      if (guestSessions) {
        localStorage.setItem(`conango_sessions_${newUser.id}`, guestSessions);
      }
    } catch {}

    notifyAuthListeners(newUser);
    return { user: newUser };
  }

  return { user: null as unknown as UserProfile, error: "No se pudo crear la cuenta." };
}

export async function loginAccount(
  email: string,
  password: string
): Promise<{ user: UserProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = password.trim();

  if (!cleanEmail || !cleanPass) {
    return { user: null as unknown as UserProfile, error: "Ingresa tu correo y contraseña." };
  }

  // Local Accounts Verification
  if (typeof window !== "undefined") {
    const accounts: UserProfile[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY_ACCOUNTS) || "[]"
    );

    const match = accounts.find(
      (a) =>
        a.email.trim().toLowerCase() === cleanEmail &&
        (a.password || "").trim() === cleanPass
    );

    if (match) {
      // Migrate any guest exams played in current unauthenticated session
      try {
        const guestExams = localStorage.getItem("conango_exams_guest");
        if (guestExams) {
          const userExamKey = `conango_exams_${match.id}`;
          const currentExams: ExamResult[] = JSON.parse(localStorage.getItem(userExamKey) || "[]");
          const incomingExams: ExamResult[] = JSON.parse(guestExams);
          const merged = [...incomingExams, ...currentExams];
          localStorage.setItem(userExamKey, JSON.stringify(merged));
        }
      } catch {}

      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(match));
      notifyAuthListeners(match);
      return { user: match };
    }

    // Helpful feedback if email exists vs if account doesn't exist
    const emailExists = accounts.some((a) => a.email.trim().toLowerCase() === cleanEmail);
    if (emailExists) {
      return {
        user: null as unknown as UserProfile,
        error: "Contraseña incorrecta. Puedes restablecerla con la opción ¿Olvidaste tu clave?",
      };
    }

    return {
      user: null as unknown as UserProfile,
      error: "No existe ninguna cuenta registrada con este correo. Puedes crear tu cuenta en la pestaña Registrarse.",
    };
  }

  return { user: null as unknown as UserProfile, error: "Error al iniciar sesión." };
}

export async function logoutAccount(): Promise<void> {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch {
      // ignore
    }
  }

  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
  }
  notifyAuthListeners(null);
}

export async function resetPassword(
  email: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanPass = newPassword.trim();
  if (!cleanEmail || !cleanPass || cleanPass.length < 6) {
    return { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres." };
  }

  if (typeof window !== "undefined") {
    const accounts: UserProfile[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY_ACCOUNTS) || "[]"
    );

    const idx = accounts.findIndex((a) => a.email.trim().toLowerCase() === cleanEmail);
    if (idx === -1) {
      return { success: false, error: "No se encontró ninguna cuenta registrada con este correo electrónico." };
    }

    accounts[idx].password = cleanPass;
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));

    const cur = getCurrentUser();
    if (cur && cur.email.trim().toLowerCase() === cleanEmail) {
      cur.password = cleanPass;
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(cur));
      notifyAuthListeners(cur);
    }

    return { success: true };
  }

  return { success: false, error: "No se pudo restablecer la contraseña." };
}

export async function changePassword(
  currentPassword: string,
  newPassword: string
): Promise<{ success: boolean; error?: string }> {
  const cur = getCurrentUser();
  if (!cur) {
    return { success: false, error: "Debes iniciar sesión para cambiar tu contraseña." };
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres." };
  }

  if (supabase) {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) {
        return { success: false, error: error.message };
      }
    } catch (e: any) {
      console.warn("Supabase password update fallback:", e);
    }
  }

  if (typeof window !== "undefined") {
    const accounts: UserProfile[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY_ACCOUNTS) || "[]"
    );

    const idx = accounts.findIndex((a) => a.id === cur.id || a.email.toLowerCase() === cur.email.toLowerCase());
    if (idx !== -1) {
      // Validate current password if set
      if (accounts[idx].password && accounts[idx].password !== currentPassword) {
        return { success: false, error: "La contraseña actual no es correcta." };
      }
      accounts[idx].password = newPassword;
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    }

    cur.password = newPassword;
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(cur));
    notifyAuthListeners(cur);
    return { success: true };
  }

  return { success: false, error: "Error al actualizar la contraseña." };
}

// ----------------------------------------------------
// GUEST LESSON LIMIT ENGINE (LOGIN-WALL)
// ----------------------------------------------------

export const GUEST_LIMIT = 2; // Maximum lessons allowed before forcing login
const STORAGE_KEY_GUEST_USAGE = "conango_guest_usage_count";

export function getGuestUsageCount(): number {
  if (typeof window === "undefined") return 0;
  const val = localStorage.getItem(STORAGE_KEY_GUEST_USAGE);
  return val ? parseInt(val, 10) || 0 : 0;
}

export function incrementGuestUsage(): number {
  if (typeof window === "undefined") return 0;
  // If user is already logged in, do not count
  if (getCurrentUser()) return 0;

  const current = getGuestUsageCount();
  const next = current + 1;
  localStorage.setItem(STORAGE_KEY_GUEST_USAGE, next.toString());
  return next;
}

export function hasReachedGuestLimit(): boolean {
  // Logged-in cadets have UNLIMITED access
  if (getCurrentUser()) return false;
  return getGuestUsageCount() >= GUEST_LIMIT;
}

export function resetGuestUsage(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY_GUEST_USAGE);
  }
}

// ----------------------------------------------------
// USER PROGRESS & HISTORY PERSISTENCE
// ----------------------------------------------------

export function updateUserMedals(delta: number): number {
  const user = getCurrentUser();
  if (!user) return 5;

  user.medals = Math.max(0, user.medals + delta);

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));

    // Update in accounts array too
    const accounts: UserProfile[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY_ACCOUNTS) || "[]"
    );
    const idx = accounts.findIndex((a) => a.id === user.id);
    if (idx !== -1) {
      accounts[idx].medals = user.medals;
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    }
  }

  notifyAuthListeners(user);
  return user.medals;
}

export async function saveSessionResult(data: Omit<SessionResult, "id">): Promise<void> {
  const user = getCurrentUser();
  const userId = user?.id || "guest";

  const newSession: SessionResult = {
    ...data,
    id: `sess_${Date.now()}`,
    user_id: userId,
  };

  // User-scoped localStorage persistence
  if (typeof window !== "undefined") {
    const key = `conango_sessions_${userId}`;
    const list: SessionResult[] = JSON.parse(localStorage.getItem(key) || "[]");
    list.unshift(newSession);
    localStorage.setItem(key, JSON.stringify(list));

    // Also update global fallback for backwards compatibility
    const globalList: SessionResult[] = JSON.parse(
      localStorage.getItem("conango_sessions") || "[]"
    );
    globalList.unshift(newSession);
    localStorage.setItem("conango_sessions", JSON.stringify(globalList));
  }

  if (supabase && user) {
    try {
      await supabase.from("sessions").insert([
        {
          user_id: user.id,
          type: data.type,
          size: data.size,
          correct: data.correct,
          incorrect: data.incorrect,
          percentage: data.percentage,
          created_at: data.created_at,
        },
      ]);
    } catch (err) {
      console.warn("Could not sync session with Supabase:", err);
    }
  }
}

export async function saveExamResult(data: Omit<ExamResult, "id">): Promise<void> {
  const user = getCurrentUser();
  const userId = user?.id || "guest";

  const newExam: ExamResult = {
    ...data,
    id: `exam_${Date.now()}`,
    user_id: userId,
  };

  if (typeof window !== "undefined") {
    const key = `conango_exams_${userId}`;
    const list: ExamResult[] = JSON.parse(localStorage.getItem(key) || "[]");
    list.unshift(newExam);
    localStorage.setItem(key, JSON.stringify(list));

    const globalList: ExamResult[] = JSON.parse(
      localStorage.getItem("conango_exams") || "[]"
    );
    globalList.unshift(newExam);
    localStorage.setItem("conango_exams", JSON.stringify(globalList));
  }

  if (supabase && user) {
    try {
      await supabase.from("exam_results").insert([
        {
          user_id: user.id,
          type: data.type,
          correct: data.correct,
          incorrect: data.incorrect,
          percentage: data.percentage,
          details: data.details,
          created_at: data.created_at,
        },
      ]);
    } catch (err) {
      console.warn("Could not sync exam with Supabase:", err);
    }
  }
}

export async function getSessionHistory(): Promise<SessionResult[]> {
  const user = getCurrentUser();
  const userId = user?.id || "guest";

  if (supabase && user) {
    try {
      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(25);
      if (!error && data && data.length > 0) return data;
    } catch {
      // fallback
    }
  }

  if (typeof window !== "undefined") {
    const key = `conango_sessions_${userId}`;
    const userSessions = localStorage.getItem(key);
    if (userSessions) return JSON.parse(userSessions);

    // Fallback to general list if guest
    return JSON.parse(localStorage.getItem("conango_sessions") || "[]");
  }
  return [];
}

export async function getExamHistory(): Promise<ExamResult[]> {
  const user = getCurrentUser();
  const userId = user?.id || "guest";

  if (supabase && user) {
    try {
      const { data, error } = await supabase
        .from("exam_results")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(25);
      if (!error && data && data.length > 0) return data;
    } catch {
      // fallback
    }
  }

  if (typeof window !== "undefined") {
    const key = `conango_exams_${userId}`;
    const userExams = localStorage.getItem(key);
    if (userExams) return JSON.parse(userExams);

    return JSON.parse(localStorage.getItem("conango_exams") || "[]");
  }
  return [];
}

// ----------------------------------------------------
// GAMIFICATION: STREAK, XP, PRO & ACCESSORIES
// ----------------------------------------------------

const STORAGE_KEY_CHALLENGES = "conango_friend_challenges";

function getTodayStr(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getYesterdayStr(): string {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function updateUserStreak(): { streak: number; increased: boolean } {
  let user = getCurrentUser();
  const today = getTodayStr();
  const yesterday = getYesterdayStr();

  // If no user is logged in, create a temporary guest profile for streak tracking
  if (!user) {
    user = {
      id: "guest",
      email: "invitado@conango.com",
      name: "Aviador Invitado",
      medals: 5,
      streakDays: 0,
      xp: 0,
      coins: 20,
      level: 1,
      gems: 50,
      streakFreeze: 0,
      created_at: new Date().toISOString(),
    };
  }

  const currentStreak = user.streakDays || 0;
  const lastDate = user.lastStreakDate;

  let newStreak = currentStreak;
  let increased = false;

  if (lastDate === today) {
    return { streak: currentStreak, increased: false };
  } else if (lastDate === yesterday) {
    newStreak = currentStreak + 1;
    increased = true;
  } else {
    // Check if user has a Streak Freeze (Protector de Racha estilo Duolingo)
    if ((user.streakFreeze || 0) > 0 && currentStreak > 0) {
      user.streakFreeze = (user.streakFreeze || 0) - 1;
      newStreak = currentStreak + 1;
      increased = true;
    } else {
      newStreak = 1;
      increased = true;
    }
  }

  user.streakDays = newStreak;
  user.lastStreakDate = today;

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    const accounts: UserProfile[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY_ACCOUNTS) || "[]"
    );
    const idx = accounts.findIndex((a) => a.id === user?.id);
    if (idx !== -1) {
      accounts[idx].streakDays = user.streakDays;
      accounts[idx].lastStreakDate = user.lastStreakDate;
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    }
  }

  notifyAuthListeners(user);
  return { streak: newStreak, increased };
}

export function isDoubleXpActive(): boolean {
  const user = getCurrentUser();
  if (!user || !user.doubleXpExpiresAt) return false;
  return new Date(user.doubleXpExpiresAt).getTime() > Date.now();
}

export function getDoubleXpTimeRemaining(): number {
  const user = getCurrentUser();
  if (!user || !user.doubleXpExpiresAt) return 0;
  const diff = new Date(user.doubleXpExpiresAt).getTime() - Date.now();
  return Math.max(0, Math.floor(diff / 1000));
}

export function activateDoubleXp(minutes: number = 15): boolean {
  const user = getCurrentUser();
  if (!user) return false;

  const expiresAt = new Date(Date.now() + minutes * 60 * 1000).toISOString();
  user.doubleXpExpiresAt = expiresAt;

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    const accounts: UserProfile[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY_ACCOUNTS) || "[]"
    );
    const idx = accounts.findIndex((a) => a.id === user.id);
    if (idx !== -1) {
      accounts[idx].doubleXpExpiresAt = expiresAt;
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    }
  }

  notifyAuthListeners(user);
  return true;
}

export function addExperience(baseAmount: number): { addedXp: number; newXp: number; levelUp: boolean; newRank: string } {
  let user = getCurrentUser();
  if (!user) return { addedXp: baseAmount, newXp: baseAmount, levelUp: false, newRank: "Recluta Táctico" };

  const multiplier = isDoubleXpActive() || user.isPro ? 2 : 1;
  const addedXp = baseAmount * multiplier;
  const currentXp = user.xp || 0;
  const newXp = currentXp + addedXp;

  // Add coins proportional to XP
  const addedCoins = Math.max(1, Math.floor(addedXp / 5));
  user.coins = (user.coins || 0) + addedCoins;
  user.xp = newXp;

  const oldRank = getRankByXp(currentXp).currentRank;
  const rankInfo = getRankByXp(newXp);
  const levelUp = rankInfo.currentRank.level > oldRank.level;

  user.level = rankInfo.currentRank.level;
  user.rankName = rankInfo.currentRank.name;

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    const accounts: UserProfile[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY_ACCOUNTS) || "[]"
    );
    const idx = accounts.findIndex((a) => a.id === user.id);
    if (idx !== -1) {
      accounts[idx].xp = user.xp;
      accounts[idx].coins = user.coins;
      accounts[idx].level = user.level;
      accounts[idx].rankName = user.rankName;
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    }
  }

  notifyAuthListeners(user);
  return { addedXp, newXp, levelUp, newRank: rankInfo.currentRank.name };
}

export function setProStatus(isPro: boolean): void {
  let user = getCurrentUser();
  if (!user) {
    user = {
      id: "guest_pro",
      email: "oficial.pro@conango.com",
      name: "Aviador PRO",
      medals: 9999, // Vidas infinitas
      isPro: true,
      streakDays: 0,
      xp: 500,
      coins: 50,
      gems: 50, // NO da gemas infinitas, solo las vidas
      streakFreeze: 0,
      created_at: new Date().toISOString(),
    };
  } else {
    user.isPro = isPro;
    if (isPro) {
      user.medals = 9999; // Vidas infinitas
      // NO se modifican las gemas: las gemas no son infinitas
    }
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    const accounts: UserProfile[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY_ACCOUNTS) || "[]"
    );
    const idx = accounts.findIndex((a) => a.id === user?.id);
    if (idx !== -1) {
      accounts[idx].isPro = user.isPro;
      accounts[idx].medals = user.medals;
      // Preserve normal gems and freeze
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    }
  }

  notifyAuthListeners(user);
}

export function restoreMedalsAfterAd(): void {
  const user = getCurrentUser();
  if (!user) return;

  user.medals = 5;

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    const accounts: UserProfile[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY_ACCOUNTS) || "[]"
    );
    const idx = accounts.findIndex((a) => a.id === user.id);
    if (idx !== -1) {
      accounts[idx].medals = 5;
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    }
  }

  notifyAuthListeners(user);
}

// ----------------------------------------------------
// DUOLINGO POWERUPS SHOP & DAILY QUESTS
// ----------------------------------------------------

export function buyPowerUp(powerUpId: string): { success: boolean; error?: string } {
  const user = getCurrentUser();
  if (!user) return { success: false, error: "Debes iniciar sesión para acceder a la Tienda de Potenciadores." };

  const gems = user.gems ?? user.coins ?? 100;

  if (powerUpId === "double_xp_15") {
    if (gems < 100) return { success: false, error: "Necesitas 100 gemas para la Poción de 2x XP." };
    user.gems = gems - 100;
    user.coins = user.gems;
    activateDoubleXp(15);
  } else if (powerUpId === "streak_freeze") {
    if (gems < 200) return { success: false, error: "Necesitas 200 gemas para el Protector de Racha." };
    user.gems = gems - 200;
    user.coins = user.gems;
    user.streakFreeze = (user.streakFreeze || 0) + 1;
  } else if (powerUpId === "refill_hearts") {
    if (gems < 150) return { success: false, error: "Necesitas 150 gemas para recargar tus vidas." };
    user.gems = gems - 150;
    user.coins = user.gems;
    user.medals = 5;
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    const accounts: UserProfile[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY_ACCOUNTS) || "[]"
    );
    const idx = accounts.findIndex((a) => a.id === user.id);
    if (idx !== -1) {
      accounts[idx] = { ...accounts[idx], ...user };
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    }
  }

  notifyAuthListeners(user);
  return { success: true };
}

export function getDailyQuests(): DailyQuest[] {
  let user = getCurrentUser();
  const today = getTodayStr();

  const xpEarned = user?.dailyQuestsDate === today ? (user.dailyXpEarned || 0) : 0;
  const lessonsCompleted = user?.dailyQuestsDate === today ? (user.dailyLessonsCompleted || 0) : 0;
  const bestScore = user?.dailyQuestsDate === today ? (user.dailyBestScore || 0) : 0;
  const claimed = new Set(user?.claimedQuests || []);

  return [
    {
      id: "quest_xp",
      title: "Gana 50 XP hoy",
      emoji: "⚡",
      description: "Responde preguntas correctas en cualquier evaluación para ganar experiencia.",
      target: 50,
      current: Math.min(50, xpEarned),
      rewardType: "gems",
      rewardValue: 25,
      completed: xpEarned >= 50,
      claimed: claimed.has("quest_xp"),
    },
    {
      id: "quest_lessons",
      title: "Completa 2 lecciones",
      emoji: "📚",
      description: "Rinde y finaliza 2 sesiones cortas de práctica o vocabulario.",
      target: 2,
      current: Math.min(2, lessonsCompleted),
      rewardType: "gems",
      rewardValue: 40,
      completed: lessonsCompleted >= 2,
      claimed: claimed.has("quest_lessons"),
    },
    {
      id: "quest_score",
      title: "Acierta 80% o más",
      emoji: "🎯",
      description: "Supera el 80% de aciertos en cualquier evaluación.",
      target: 80,
      current: Math.min(80, bestScore),
      rewardType: "double_xp",
      rewardValue: 15,
      completed: bestScore >= 80,
      claimed: claimed.has("quest_score"),
    },
  ];
}

export function claimQuestReward(questId: string): { success: boolean; rewardText: string } {
  const user = getCurrentUser();
  if (!user) return { success: false, rewardText: "Inicia sesión para reclamar recompensas." };

  const quests = getDailyQuests();
  const quest = quests.find((q) => q.id === questId);
  if (!quest || !quest.completed || quest.claimed) {
    return { success: false, rewardText: "Esta misión aún no se ha completado o ya fue reclamada." };
  }

  const claimed = new Set(user.claimedQuests || []);
  claimed.add(questId);
  user.claimedQuests = Array.from(claimed);

  let rewardText = "";
  if (quest.rewardType === "double_xp") {
    activateDoubleXp(15);
    rewardText = "¡Activado Potenciador 2x XP por 15 Minutos!";
  } else {
    user.gems = (user.gems ?? user.coins ?? 100) + quest.rewardValue;
    user.coins = user.gems;
    rewardText = `¡Has ganado +${quest.rewardValue} Gemas!`;
  }

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    const accounts: UserProfile[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY_ACCOUNTS) || "[]"
    );
    const idx = accounts.findIndex((a) => a.id === user.id);
    if (idx !== -1) {
      accounts[idx] = { ...accounts[idx], ...user };
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    }
  }

  notifyAuthListeners(user);
  return { success: true, rewardText };
}

export function recordLessonProgress(xpGain: number, percentage: number): void {
  const user = getCurrentUser();
  if (!user) return;

  const today = getTodayStr();
  if (user.dailyQuestsDate !== today) {
    user.dailyQuestsDate = today;
    user.dailyXpEarned = 0;
    user.dailyLessonsCompleted = 0;
    user.dailyBestScore = 0;
    user.claimedQuests = [];
  }

  user.dailyXpEarned = (user.dailyXpEarned || 0) + xpGain;
  user.dailyLessonsCompleted = (user.dailyLessonsCompleted || 0) + 1;
  user.dailyBestScore = Math.max(user.dailyBestScore || 0, percentage);

  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    const accounts: UserProfile[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY_ACCOUNTS) || "[]"
    );
    const idx = accounts.findIndex((a) => a.id === user.id);
    if (idx !== -1) {
      accounts[idx] = { ...accounts[idx], ...user };
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    }
  }

  notifyAuthListeners(user);
}

// ----------------------------------------------------
// FRIEND CHALLENGES (DUELOS)
// ----------------------------------------------------

export function saveFriendChallenge(challenge: FriendChallenge): void {
  if (typeof window === "undefined") return;
  const list: FriendChallenge[] = JSON.parse(
    localStorage.getItem(STORAGE_KEY_CHALLENGES) || "[]"
  );
  list.unshift(challenge);
  localStorage.setItem(STORAGE_KEY_CHALLENGES, JSON.stringify(list.slice(0, 30)));
}

export function getFriendChallenges(): FriendChallenge[] {
  if (typeof window === "undefined") return [];
  return JSON.parse(localStorage.getItem(STORAGE_KEY_CHALLENGES) || "[]");
}

export function saveCurrentUserProfile(user: UserProfile): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    const accounts: UserProfile[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY_ACCOUNTS) || "[]"
    );
    const idx = accounts.findIndex((a) => a.id === user.id);
    if (idx !== -1) {
      accounts[idx] = { ...accounts[idx], ...user };
      localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    }
  }
  notifyAuthListeners(user);
}

export function updateUserProfile(name: string, mascotName?: string): void {
  let user = getCurrentUser();
  if (!user) {
    if (typeof window !== "undefined" && mascotName) {
      localStorage.setItem("conango_custom_mascot_name", mascotName.trim());
    }
    return;
  }
  user.name = name.trim();
  if (mascotName !== undefined) {
    user.mascotName = mascotName.trim();
    if (typeof window !== "undefined") {
      localStorage.setItem("conango_custom_mascot_name", mascotName.trim());
    }
  }
  saveCurrentUserProfile(user);
}

export function getUserMascotName(user?: UserProfile | null): string {
  if (user?.mascotName && user.mascotName.trim().length > 0) {
    return user.mascotName.trim();
  }
  if (typeof window !== "undefined") {
    const saved = localStorage.getItem("conango_custom_mascot_name");
    if (saved && saved.trim().length > 0) return saved.trim();
  }
  return "Conan";
}

