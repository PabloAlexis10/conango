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
import { getCurrentUser, logoutAccount, subscribeAuth, isDoubleXpActive } from "@/lib/supabase";
import { getAppTheme, toggleAppTheme, subscribeTheme, AppTheme } from "@/lib/theme";
import { requestNotificationPermission, getNotificationPermission, checkAndSendStreakReminder } from "@/lib/notifications";
import { UserProfile } from "@/lib/types";
import { getUserRankTitle } from "@/lib/accessories";

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

          {/* Right Status Controls (DUOLINGO STYLE) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 1. Daily Streak Button (ONLY VISIBLE IF USER IS LOGGED IN) */}
            {user && (
              <button
                type="button"
                onClick={() => setStreakModalOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200 hover:bg-orange-100 text-orange-700 text-xs font-black transition-colors shadow-xs"
                title="Racha Diaria de Estudio"
              >
                <span className="text-sm">🔥</span>
                <span>{streak}</span>
              </button>
            )}

            {/* 2. Gems Counter & Shop Link (ONLY VISIBLE IF LOGGED IN) */}
            {user && (
              <Link
                href="/shop"
                className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-50 border border-blue-200 hover:bg-blue-100 text-blue-900 text-xs font-black transition-colors shadow-xs"
                title="Gemas y Tienda de Potenciadores"
              >
                <span className="text-xs">💎</span>
                <span>{user.gems ?? user.coins ?? 100}</span>
              </Link>
            )}

            {/* 3. Daily Quests Button (ONLY VISIBLE IF LOGGED IN) */}
            {user && (
              <button
                type="button"
                onClick={() => setQuestsModalOpen(true)}
                className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 hover:bg-purple-100 text-purple-900 text-xs font-black transition-colors shadow-xs"
                title="Misiones Diarias"
              >
                <span>🎯</span>
                <span className="hidden md:inline">Misiones</span>
              </button>
            )}

            {/* 4. 2x XP Booster Button (ONLY VISIBLE IF LOGGED IN OR SUBSCRIBED) */}
            {user && (
              <button
                type="button"
                onClick={() => setBoosterModalOpen(true)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black transition-all shadow-xs ${
                  hasDoubleXp || user.isPro
                    ? "bg-amber-100 border border-amber-400 text-amber-900 animate-pulse ring-1 ring-amber-300"
                    : "bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100"
                }`}
                title="Potenciador Doble Experiencia"
              >
                <Zap className="w-3 h-3 text-amber-500" />
                <span className="hidden sm:inline">{user.isPro ? "2x PRO" : hasDoubleXp ? "2x ACTIVO" : "2x XP"}</span>
              </button>
            )}

            {/* 5. Shop Link */}
            <Link
              href="/shop"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF6F0] border border-[#E5D5C5] hover:bg-[#F5EFEB] text-[#6B4423] text-xs font-black transition-colors shadow-xs"
              title="Tienda de Potenciadores"
            >
              <span>🏪</span>
              <span className="hidden md:inline">Tienda</span>
            </Link>

            {/* 6. Leaderboard / Ligas */}
            <Link
              href="/leaderboard"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 hover:bg-amber-100 text-amber-900 dark:text-amber-200 text-xs font-black transition-colors shadow-xs"
              title="Ligas y Clasificación Semanal"
            >
              <Trophy className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="hidden lg:inline">Ligas</span>
            </Link>

            {/* 7. Friend Challenge Link */}
            <Link
              href="/challenge"
              className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#FAF6F0] border border-[#E5D5C5] hover:bg-[#F5EFEB] text-[#6B4423] text-xs font-black transition-colors shadow-xs"
              title="Duelos y Desafíos con Amigos"
            >
              <Swords className="w-3 h-3 text-[#F59E0B]" />
              <span>Duelo</span>
            </Link>

            {/* 8. Notification Bell (Streak Reminders) */}
            <button
              type="button"
              onClick={handleNotificationClick}
              className={`p-1.5 rounded-full border transition-colors shadow-xs ${
                notifEnabled
                  ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-300"
                  : "bg-[#FAF6F0] dark:bg-slate-800 border-[#E5D5C5] dark:border-slate-700 text-[#A67B5B] hover:text-[#6B4423]"
              }`}
              title={notifEnabled ? "Recordatorios de guardia y racha activados" : "Activar recordatorios de racha"}
            >
              <Bell className="w-3.5 h-3.5" />
            </button>

            {/* 9. Theme Toggle (Night Ops / Day) */}
            <button
              type="button"
              onClick={handleToggleTheme}
              className="p-1.5 rounded-full bg-[#FAF6F0] dark:bg-slate-800 border border-[#E5D5C5] dark:border-slate-700 text-[#6B4423] dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-slate-700 transition-colors shadow-xs"
              title={theme === "dark" ? "Modo Diurno" : "Modo Nocturno (Night Ops)"}
            >
              {theme === "dark" ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Lives Counter for 10/30/50 */}
            {isLivesMode && <MedalCounter medals={effectiveMedals} maxMedals={5} />}

            {/* Countdown Timer for 100 Exam */}
            {isExamMode && <Timer initialSeconds={3600} onExpire={onTimerExpire} />}

            {/* Pro Button if not pro */}
            {!user?.isPro && (
              <button
                type="button"
                onClick={() => setProModalOpen(true)}
                className="hidden xl:flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-105 text-white text-xs font-black shadow-xs transition-all"
              >
                <Crown className="w-3 h-3 text-yellow-100" />
                <span>PRO</span>
              </button>
            )}

            {/* User Account / Auth Section */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-1.5 p-1 sm:px-2.5 sm:py-1 bg-[#FAF6F0] hover:bg-[#F5EFEB] border border-[#E5D5C5] rounded-full text-[#6B4423] font-bold text-xs transition-colors shadow-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-black text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : "C"}
                  </div>
                  <span className="max-w-[80px] truncate hidden sm:inline">
                    {user.name || user.email}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border-2 border-[#E5D5C5] rounded-2xl shadow-xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-[#E5D5C5]/60 mb-1">
                      <p className="text-xs font-black text-[#6B4423] truncate">
                        {user.name || getUserRankTitle(user?.xp || 0)}
                      </p>
                      <p className="text-[10px] text-[#A67B5B] truncate">{user.email}</p>
                      <div className="mt-1 flex items-center justify-between text-[11px] font-bold text-[#F59E0B]">
                        <span>🏅 {user.isPro ? "Vidas ∞" : `${user.medals} Medallas`}</span>
                        <span>🪙 {user.coins || 0}</span>
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#6B4423] hover:bg-[#FAF6F0] rounded-xl transition-colors"
                    >
                      <User className="w-4 h-4 text-[#A67B5B]" />
                      <span>Mi Perfil y Progreso</span>
                    </Link>

                    <Link
                      href="/shop"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#6B4423] hover:bg-[#FAF6F0] rounded-xl transition-colors"
                    >
                      <span>🏪</span>
                      <span>Tienda de Potenciadores</span>
                    </Link>

                    <button
                      type="button"
                      onClick={() => {
                        setMenuOpen(false);
                        setQuestsModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#6B4423] hover:bg-[#FAF6F0] rounded-xl transition-colors text-left"
                    >
                      <span>🎯</span>
                      <span>Misiones Diarias</span>
                    </button>

                    <Link
                      href="/challenge"
                      onClick={() => setMenuOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-bold text-[#6B4423] hover:bg-[#FAF6F0] rounded-xl transition-colors"
                    >
                      <Swords className="w-4 h-4 text-[#F59E0B]" />
                      <span>Duelos con Amigos</span>
                    </Link>

                    {!user.isPro && (
                      <button
                        type="button"
                        onClick={() => {
                          setMenuOpen(false);
                          setProModalOpen(true);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs font-black text-amber-700 hover:bg-amber-50 rounded-xl transition-colors text-left"
                      >
                        <Crown className="w-4 h-4 text-amber-500" />
                        <span>Obtener Conan PRO</span>
                      </button>
                    )}

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl transition-colors text-left"
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
