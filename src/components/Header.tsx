"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ConanMascot from "./ConanMascot";
import MedalCounter from "./MedalCounter";
import Timer from "./Timer";
import AuthModal from "./AuthModal";
import StreakModal from "./StreakModal";
import BoosterModal from "./BoosterModal";
import DailyQuestsModal from "./DailyQuestsModal";
import ProSubscriptionModal from "./ProSubscriptionModal";
import { User, LogIn, LogOut, Volume2, BookOpen, Sparkles, UserCheck, Flame, Zap, Crown, Swords, Trophy, Moon, Sun, Bell } from "lucide-react";
import { getCurrentUser, logoutAccount, subscribeAuth, isDoubleXpActive, getUserMascotName } from "@/lib/supabase";
import { getAppTheme, toggleAppTheme, subscribeTheme, AppTheme } from "@/lib/theme";
import { requestNotificationPermission, getNotificationPermission, checkAndSendStreakReminder } from "@/lib/notifications";
import { UserProfile } from "@/lib/types";
import { getUserRankTitle, getRankByXp, getUserRankGrade, getUserRankBadge } from "@/lib/accessories";

interface HeaderProps {
  sessionTitle?: string;
  sessionType?: "listening" | "reading" | "mixed";
  sessionSize?: number;
  medals?: number;
  showTimer?: boolean;
  onTimerExpire?: () => void;
  className?: string;
}

export default function Header({
  sessionTitle,
  sessionType,
  sessionSize,
  medals,
  showTimer = false,
  onTimerExpire,
  className = "",
}: HeaderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [streakModalOpen, setStreakModalOpen] = useState(false);
  const [boosterModalOpen, setBoosterModalOpen] = useState(false);
  const [questsModalOpen, setQuestsModalOpen] = useState(false);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [hasDoubleXp, setHasDoubleXp] = useState(false);
  const [theme, setTheme] = useState<AppTheme>("light");
  const [notifEnabled, setNotifEnabled] = useState(false);

  useEffect(() => {
    setTheme(getAppTheme());
    const unsubTheme = subscribeTheme((t) => setTheme(t));
    setNotifEnabled(getNotificationPermission() === "granted");
    return () => unsubTheme();
  }, []);

  const handleToggleTheme = () => {
    const next = toggleAppTheme();
    setTheme(next);
  };

  const handleNotificationClick = async () => {
    if (notifEnabled) {
      checkAndSendStreakReminder();
    } else {
      const granted = await requestNotificationPermission();
      setNotifEnabled(granted);
    }
  };

  useEffect(() => {
    const cur = getCurrentUser();
    setUser(cur);
    setHasDoubleXp(isDoubleXpActive());

    const unsubscribe = subscribeAuth((updatedUser) => {
      setUser(updatedUser);
      setHasDoubleXp(isDoubleXpActive());
    });
    return () => unsubscribe();
  }, []);

  const isLivesMode = sessionSize && sessionSize < 100 && medals !== undefined;
  const isExamMode = sessionSize === 100 || showTimer;

  const handleLogout = async () => {
    await logoutAccount();
    setMenuOpen(false);
  };

  const streak = user?.streakDays || 1;
  const effectiveMedals = user?.isPro ? 9999 : (medals ?? user?.medals ?? 5);

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-[#E5D5C5] px-3 sm:px-6 py-2.5 transition-all ${className}`}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          {/* Brand Logo & Mascot */}
          <Link
            href="/"
            className="flex items-center gap-2 group hover:opacity-95 transition-opacity"
          >
            <div className="w-9 h-9 relative flex-shrink-0">
              <ConanMascot size="sm" mood="happy" animate={false} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-lg sm:text-2xl text-[#6B4423] tracking-tight flex items-center">
                Conan<span className="text-[#F59E0B]">Go</span>
                {user?.isPro && (
                  <span className="ml-1 px-1.5 py-0.2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white text-[9px] font-black uppercase rounded shadow-xs">
                    PRO
                  </span>
                )}
              </span>
              <span className="text-[9px] uppercase font-extrabold text-[#A67B5B] tracking-widest -mt-1 hidden sm:block">
                A.L.C.P.T. Táctico 🇺🇸
              </span>
            </div>
          </Link>

          {/* Center Session Title / Badge if inside a session */}
          {sessionTitle ? (
            <div className="hidden sm:flex items-center gap-2 px-3 py-1 bg-[#FAF6F0] rounded-full border border-[#E5D5C5] shadow-sm max-w-xs truncate">
              {sessionType === "listening" ? (
                <Volume2 className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0" />
              ) : sessionType === "reading" ? (
                <BookOpen className="w-3.5 h-3.5 text-[#A67B5B] flex-shrink-0" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B] flex-shrink-0" />
              )}
              <span className="text-xs font-black text-[#6B4423] truncate">
                {sessionTitle}
              </span>
            </div>
          ) : null}

          {/* Right Status Controls (Simplified & Streamlined for clean UX) */}
          <div className="flex items-center gap-2">
            {/* 1. Daily Streak Button */}
            {user && (
              <button
                type="button"
                onClick={() => setStreakModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/50 text-orange-700 dark:text-orange-300 text-xs font-black transition-colors shadow-xs"
                title="Racha Diaria de Estudio"
              >
                <span className="text-sm">🔥</span>
                <span>{streak}</span>
              </button>
            )}

            {/* 2. USAF Rank Badge (Fast access to current grade) */}
            {user && (
              <Link
                href="/profile"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black transition-colors shadow-xs"
                title={`Grado USAF: ${getRankByXp(user.xp || 0).currentRank.name} (${getRankByXp(user.xp || 0).currentRank.abbr})`}
              >
                <span>{getUserRankBadge(user.xp || 0)}</span>
                <span className="text-[11px] uppercase tracking-wide font-extrabold">{getRankByXp(user.xp || 0).currentRank.abbr}</span>
              </Link>
            )}

            {/* 3. Lives Counter for 10/30/50 */}
            {isLivesMode && <MedalCounter medals={effectiveMedals} maxMedals={5} />}

            {/* 4. Countdown Timer for 100 Exam */}
            {isExamMode && <Timer initialSeconds={3600} onExpire={onTimerExpire} />}

            {/* 5. Theme Toggle (Night Ops / Day) */}
            <button
              type="button"
              onClick={handleToggleTheme}
              className="p-1.5 rounded-full bg-[#FAF6F0] dark:bg-slate-800 border border-[#E5D5C5] dark:border-slate-700 text-[#6B4423] dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
              title={theme === "dark" ? "Modo Diurno" : "Modo Nocturno (Night Ops)"}
            >
              {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* 6. User Account / Auth Section */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 bg-[#FAF6F0] dark:bg-slate-800 hover:bg-[#F5EFEB] dark:hover:bg-slate-700 border border-[#E5D5C5] dark:border-slate-700 rounded-full text-[#6B4423] dark:text-amber-100 font-bold text-xs transition-colors shadow-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100 flex items-center justify-center font-black text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : "C"}
                  </div>
                  <span className="max-w-[80px] truncate hidden sm:inline">
                    {user.name || "Usuario"}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 border-2 border-[#E5D5C5] dark:border-slate-700 rounded-2xl shadow-xl p-2 z-50">
                    {/* User & Rank Summary Card */}
                    <div className="p-3 bg-[#FAF6F0]/80 dark:bg-slate-800/80 rounded-xl border border-[#E5D5C5]/60 dark:border-slate-700/60 mb-2">
                      <div className="flex items-center justify-between">
                        <p className="text-xs font-black text-[#6B4423] dark:text-amber-300 truncate">
                          {user.name || user.email || "Usuario ConanGo"}
                        </p>
                        <span className="text-[10px] px-1.5 py-0.5 bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 font-extrabold rounded-md">
                          {getRankByXp(user.xp || 0).currentRank.abbr}
                        </span>
                      </div>
                      <p className="text-[11px] font-bold text-slate-600 dark:text-slate-300 mt-0.5">
                        {getUserRankBadge(user.xp || 0)} {getRankByXp(user.xp || 0).currentRank.name}
                      </p>
                      <p className="text-[10px] text-[#A67B5B] dark:text-slate-400 truncate mt-0.5">
                        🐾 Mascota: <span className="font-bold text-[#6B4423] dark:text-amber-200">{getUserMascotName(user)}</span>
                      </p>

                      {/* Rank Progression */}
                      <div className="mt-2 pt-2 border-t border-[#E5D5C5]/50 dark:border-slate-700/50">
                        <div className="flex justify-between text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                          <span>Progreso de Ascenso</span>
                          <span>{getRankByXp(user.xp || 0).progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full rounded-full transition-all"
                            style={{ width: `${getRankByXp(user.xp || 0).progress}%` }}
                          />
                        </div>
                        <p className="text-[9px] text-amber-700 dark:text-amber-400 font-semibold mt-1">
                          {getRankByXp(user.xp || 0).nextRank
                            ? `Faltan ${Math.max(0, (getRankByXp(user.xp || 0).nextRank?.minXp || 0) - (user.xp || 0))} XP para ascender a ${getRankByXp(user.xp || 0).nextRank?.name} (${getRankByXp(user.xp || 0).nextRank?.abbr})`
                            : "¡Grado Máximo Supremo de la USAF alcanzado!"}
                        </p>
                      </div>

                      <div className="mt-2 flex items-center justify-between text-[11px] font-bold text-[#F59E0B]">
                        <span>🏅 {user.isPro ? "Vidas ∞" : `${user.medals} Medallas`}</span>
                        <span>💎 {user.gems ?? user.coins ?? 100}</span>
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#6B4423] dark:text-slate-200 hover:bg-[#FAF6F0] dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <User className="w-4 h-4 text-[#A67B5B]" />
                      <span>Mi Perfil y Base Táctica</span>
                    </Link>

                    <Link
                      href="/shop"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#6B4423] dark:text-slate-200 hover:bg-[#FAF6F0] dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <span>🏪</span>
                      <span>Tienda de Pociones Mágicas</span>
                    </Link>

                    <Link
                      href="/leaderboard"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#6B4423] dark:text-slate-200 hover:bg-[#FAF6F0] dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <Trophy className="w-4 h-4 text-[#F59E0B]" />
                      <span>Ligas y Clasificación</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setQuestsModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#6B4423] dark:text-slate-200 hover:bg-[#FAF6F0] dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
                    >
                      <span>🎯</span>
                      <span>Misiones Diarias</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setBoosterModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#6B4423] dark:text-slate-200 hover:bg-[#FAF6F0] dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
                    >
                      <Zap className="w-4 h-4 text-amber-500" />
                      <span>Potenciador Doble XP ({hasDoubleXp ? "Activo" : "Disponible"})</span>
                    </button>

                    <Link
                      href="/challenge"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#6B4423] dark:text-slate-200 hover:bg-[#FAF6F0] dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <Swords className="w-4 h-4 text-[#F59E0B]" />
                      <span>Duelos Tácticos con Amigos</span>
                    </Link>

                    <button
                      type="button"
                      onClick={handleNotificationClick}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#6B4423] dark:text-slate-200 hover:bg-[#FAF6F0] dark:hover:bg-slate-800 rounded-xl transition-colors text-left"
                    >
                      <Bell className="w-4 h-4 text-emerald-600" />
                      <span>Recordatorios de Guardia ({notifEnabled ? "Activados" : "Desactivados"})</span>
                    </button>

                    {!user.isPro && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setProModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-black text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-xl transition-colors text-left"
                      >
                        <Crown className="w-4 h-4 text-amber-500" />
                        <span>Obtener Conan PRO</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition-colors text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black rounded-xl text-xs shadow-conan-btn transition-transform active:scale-95"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Ingresar</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode="login"
      />

      {/* Streak Modal */}
      <StreakModal
        isOpen={streakModalOpen}
        onClose={() => setStreakModalOpen(false)}
      />

      {/* 2x XP Booster Modal */}
      <BoosterModal
        isOpen={boosterModalOpen}
        onClose={() => setBoosterModalOpen(false)}
      />

      {/* Daily Quests Modal */}
      <DailyQuestsModal
        isOpen={questsModalOpen}
        onClose={() => setQuestsModalOpen(false)}
      />

      {/* Pro Subscription Modal */}
      <ProSubscriptionModal
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
      />
    </>
  );
}
