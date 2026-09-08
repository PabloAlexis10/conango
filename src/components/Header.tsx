"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import ConanMascot from "./ConanMascot";
import MedalCounter from "./MedalCounter";
import Timer from "./Timer";
import AuthModal from "./AuthModal";
import { User, LogIn, LogOut, Volume2, BookOpen, Sparkles, UserCheck } from "lucide-react";
import { getCurrentUser, logoutAccount, subscribeAuth } from "@/lib/supabase";
import { UserProfile } from "@/lib/types";

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
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    const unsubscribe = subscribeAuth((updatedUser) => {
      setUser(updatedUser);
    });
    return () => unsubscribe();
  }, []);

  const isLivesMode = sessionSize && sessionSize < 100 && medals !== undefined;
  const isExamMode = sessionSize === 100 || showTimer;

  const handleLogout = async () => {
    await logoutAccount();
    setMenuOpen(false);
  };

  return (
    <>
      <header
        className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-[#E5D5C5] px-4 sm:px-6 py-3 transition-all ${className}`}
      >
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
          {/* Brand Logo & Mascot */}
          <Link
            href="/"
            className="flex items-center gap-2.5 group hover:opacity-95 transition-opacity"
          >
            <div className="w-10 h-10 relative flex-shrink-0">
              <ConanMascot size="sm" mood="happy" animate={false} />
            </div>
            <div className="flex flex-col">
              <span className="font-black text-xl sm:text-2xl text-[#6B4423] tracking-tight flex items-center">
                Conan<span className="text-[#F59E0B]">Go</span>
              </span>
              <span className="text-[10px] uppercase font-extrabold text-[#A67B5B] tracking-widest -mt-1 hidden sm:block">
                A.L.C.P.T. Táctico
              </span>
            </div>
          </Link>

          {/* Center Session Title / Badge if inside a session */}
          {sessionTitle ? (
            <div className="flex items-center gap-2 px-3.5 py-1.5 bg-[#FAF6F0] rounded-full border border-[#E5D5C5] shadow-sm">
              {sessionType === "listening" ? (
                <Volume2 className="w-4 h-4 text-[#F59E0B]" />
              ) : sessionType === "reading" ? (
                <BookOpen className="w-4 h-4 text-[#A67B5B]" />
              ) : (
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              )}
              <span className="text-xs sm:text-sm font-black text-[#6B4423]">
                {sessionTitle}
              </span>
            </div>
          ) : null}

          {/* Right Status Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Lives Counter for 10/30/50 */}
            {isLivesMode && <MedalCounter medals={medals!} maxMedals={5} />}

            {/* Countdown Timer for 100 Exam */}
            {isExamMode && <Timer initialSeconds={3600} onExpire={onTimerExpire} />}

            {/* User Account / Auth Section */}
            {user ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-1.5 bg-[#FAF6F0] hover:bg-[#F5EFEB] border border-[#E5D5C5] rounded-full text-[#6B4423] font-bold text-xs sm:text-sm transition-colors shadow-sm"
                >
                  <div className="w-6 h-6 rounded-full bg-amber-200 text-amber-900 flex items-center justify-center font-black text-xs">
                    {user.name ? user.name.charAt(0).toUpperCase() : "C"}
                  </div>
                  <span className="max-w-[90px] sm:max-w-[120px] truncate hidden sm:inline">
                    {user.name || user.email}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white border-2 border-[#E5D5C5] rounded-2xl shadow-xl p-2 z-50">
                    <div className="px-3 py-2 border-b border-[#E5D5C5]/60 mb-1">
                      <p className="text-xs font-black text-[#6B4423] truncate">
                        {user.name || "Cadete"}
                      </p>
                      <p className="text-[10px] text-[#A67B5B] truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1 text-[11px] font-bold text-[#F59E0B]">
                        <span>🏅 {user.medals} Medallas</span>
                      </div>
                    </div>

                    <Link
                      href="/profile"
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-[#6B4423] hover:bg-[#FAF6F0] rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <User className="w-3.5 h-3.5 text-[#A67B5B]" />
                      <span>Ver mi perfil</span>
                    </Link>

                    <Link
                      href="/vocabulary/definitions"
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-[#6B4423] hover:bg-[#FAF6F0] rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-[#F59E0B]" />
                      <span>Vocabulario (Pronunciación)</span>
                    </Link>

                    <Link
                      href="/vocabulary/matching"
                      onClick={() => setMenuOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-[#6B4423] hover:bg-[#FAF6F0] rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Vocabulario (Emparejar)</span>
                    </Link>

                    <div className="border-t border-[#E5D5C5]/60 my-1" />

                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-red-600 hover:bg-red-50 rounded-xl flex items-center gap-2 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Cerrar sesión</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="px-3.5 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black text-xs sm:text-sm rounded-full shadow-sm flex items-center gap-1.5 transition-transform active:translate-y-0.5"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Iniciar Sesión</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setUser(getCurrentUser())}
      />
    </>
  );
}
