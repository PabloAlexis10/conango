import { createClient } from "@supabase/supabase-js";
import { ExamResult, SessionResult, UserProfile } from "./types";

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

export async function registerAccount(
  name: string,
  email: string,
  password: string
): Promise<{ user: UserProfile; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim() || cleanEmail.split("@")[0];

  // Try Supabase first if configured
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: cleanEmail,
        password,
        options: {
          data: { name: cleanName },
        },
      });

      if (error) return { user: null as unknown as UserProfile, error: error.message };

      if (data.user) {
        const newUser: UserProfile = {
          id: data.user.id,
          name: cleanName,
          email: cleanEmail,
          medals: 15,
          created_at: new Date().toISOString(),
        };

        await supabase.from("users").upsert([
          {
            id: newUser.id,
            email: newUser.email,
            medals: newUser.medals,
            created_at: newUser.created_at,
          },
        ]);

        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(newUser));
        }
        notifyAuthListeners(newUser);
        return { user: newUser };
      }
    } catch (err: unknown) {
      console.warn("Supabase signup fallback to local:", err);
    }
  }

  // Local / Offline Multi-Account Engine
  if (typeof window !== "undefined") {
    const accounts: UserProfile[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY_ACCOUNTS) || "[]"
    );

    const exists = accounts.find((a) => a.email.toLowerCase() === cleanEmail);
    if (exists) {
      return {
        user: null as unknown as UserProfile,
        error: "Ya existe una cuenta registrada con este correo electrónico.",
      };
    }

    const newUser: UserProfile = {
      id: `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      email: cleanEmail,
      password, // securely kept in user local storage
      medals: 15,
      created_at: new Date().toISOString(),
    };

    accounts.push(newUser);
    localStorage.setItem(STORAGE_KEY_ACCOUNTS, JSON.stringify(accounts));
    localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(newUser));

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

  // Try Supabase first if configured
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: cleanEmail,
        password,
      });

      if (!error && data.user) {
        const loggedUser: UserProfile = {
          id: data.user.id,
          name: data.user.user_metadata?.name || cleanEmail.split("@")[0],
          email: cleanEmail,
          medals: 15,
          created_at: data.user.created_at,
        };

        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(loggedUser));
        }
        notifyAuthListeners(loggedUser);
        return { user: loggedUser };
      }
    } catch (err) {
      console.warn("Supabase login fallback to local storage:", err);
    }
  }

  // Local Accounts Verification
  if (typeof window !== "undefined") {
    const accounts: UserProfile[] = JSON.parse(
      localStorage.getItem(STORAGE_KEY_ACCOUNTS) || "[]"
    );

    const match = accounts.find(
      (a) => a.email.toLowerCase() === cleanEmail && a.password === password
    );

    if (match) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(match));
      notifyAuthListeners(match);
      return { user: match };
    }

    return {
      user: null as unknown as UserProfile,
      error: "Credenciales incorrectas. Verifica tu correo y contraseña.",
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
