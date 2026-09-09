"use client";

import React, { useEffect, useState, useMemo } from "react";
import Header from "@/components/Header";
import Link from "next/link";
import {
  Trophy,
  ArrowLeft,
  Flame,
  Zap,
  Crown,
  Shield,
  Clock,
  ArrowUp,
  ArrowDown,
  Minus,
  Sparkles,
  Award,
} from "lucide-react";
import { getCurrentUser, subscribeAuth } from "@/lib/supabase";
import { UserProfile } from "@/lib/types";
import ConanMascot from "@/components/ConanMascot";
import AdBanner from "@/components/AdBanner";

interface Competitor {
  rank: number;
  name: string;
  flag: string;
  xp: number;
  badge: string;
  isUser?: boolean;
}

type LeagueDivision = "bronze" | "silver" | "gold" | "diamond";

// Base de nombres de aviadores para bots por división
const BOT_NAMES = {
  bronze: [
    { name: "Amn J. Walker", flag: "🇺🇸", badge: "🥉" },
    { name: "Cadete C. Morales", flag: "🇨🇱", badge: "🪖" },
    { name: "A1C M. Campbell", flag: "🇺🇸", badge: "🎖️" },
    { name: "Cadete P. Silva", flag: "🇨🇱", badge: "🪖" },
    { name: "Amn D. Clark", flag: "🇺🇸", badge: "🥉" },
    { name: "Cadete S. Rojas", flag: "🇨🇱", badge: "🪖" },
    { name: "AB L. Wright", flag: "🇺🇸", badge: "🪖" },
    { name: "Cadete F. Soto", flag: "🇨🇱", badge: "🪖" },
  ],
  silver: [
    { name: "SrA R. Johnson", flag: "🇺🇸", badge: "⭐" },
    { name: "Teniente V. Torres", flag: "🇨🇱", badge: "🔹" },
    { name: "SSgt K. Miller", flag: "🇺🇸", badge: "⭐⭐" },
    { name: "Cadete E. Castro", flag: "🇨🇱", badge: "🎖️" },
    { name: "SrA T. Baker", flag: "🇺🇸", badge: "⭐" },
    { name: "Oficial B. Núñez", flag: "🇨🇱", badge: "🔹" },
    { name: "SSgt H. Adams", flag: "🇺🇸", badge: "⭐⭐" },
    { name: "Cadete G. Muñoz", flag: "🇨🇱", badge: "⭐" },
  ],
  gold: [
    { name: "TSgt B. Henderson", flag: "🇺🇸", badge: "⭐⭐⭐" },
    { name: "Capitán A. Rivas", flag: "🇨🇱", badge: "⚡" },
    { name: "MSgt C. Ramirez", flag: "🇺🇸", badge: "🏅" },
    { name: "Mayor D. Fuentes", flag: "🇨🇱", badge: "⚜️" },
    { name: "TSgt P. Foster", flag: "🇺🇸", badge: "⭐⭐⭐" },
    { name: "Capitán M. Lagos", flag: "🇨🇱", badge: "⚡" },
    { name: "SMSgt E. Collins", flag: "🇺🇸", badge: "🛡️" },
    { name: "Mayor R. Vega", flag: "🇨🇱", badge: "⚜️" },
  ],
  diamond: [
    { name: "Col S. Mitchell", flag: "🇺🇸", badge: "🥇" },
    { name: "Coronel F. Valenzuela", flag: "🇨🇱", badge: "🥇" },
    { name: "Brig Gen T. Hayes", flag: "🇺🇸", badge: "🌟" },
    { name: "General H. Tapia", flag: "🇨🇱", badge: "🌟" },
    { name: "CMSgt W. Cooper", flag: "🇺🇸", badge: "🦅" },
    { name: "Maj Gen R. Price", flag: "🇺🇸", badge: "🌟🌟" },
    { name: "Col N. Brooks", flag: "🇺🇸", badge: "🥇" },
    { name: "Teniente Gral. J. Soto", flag: "🇨🇱", badge: "🌟🌟🌟" },
  ],
};

export default function LeaderboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeLeague, setActiveLeague] = useState<LeagueDivision>("gold");

  useEffect(() => {
    setUser(getCurrentUser());
    const unsub = subscribeAuth((u) => setUser(u));
    return () => unsub();
  }, []);

  const userXp = user?.xp || 420;

  // Cálculo de bots dinámicos según el día para que varíen diariamente
  const rankedList = useMemo(() => {
    const today = new Date();
    // Semilla basada en día del año
    const daySeed = today.getDate() + (today.getMonth() + 1) * 31;

    // Rango base de XP por división
    const ranges: Record<LeagueDivision, { min: number; max: number }> = {
      bronze: { min: 120, max: 550 },
      silver: { min: 450, max: 1100 },
      gold: { min: 900, max: 1950 },
      diamond: { min: 1800, max: 3800 },
    };

    const divisionBots = BOT_NAMES[activeLeague].map((bot, idx) => {
      const { min, max } = ranges[activeLeague];
      // Variación determinista por día e índice
      const variation = Math.sin(daySeed + idx * 7) * 0.35 + 0.5; // Entre 0.15 y 0.85
      const xp = Math.round(min + (max - min) * variation);
      return {
        name: bot.name,
        flag: bot.flag,
        badge: bot.badge,
        xp,
        isUser: false,
      };
    });

    // Añadir usuarios reales registrados guardados en localStorage si existen
    const realAccounts: Omit<Competitor, "rank">[] = [];
    if (typeof window !== "undefined") {
      try {
        const stored = JSON.parse(localStorage.getItem("conango_registered_accounts") || "[]");
        if (Array.isArray(stored)) {
          stored.forEach((acc: any) => {
            if (acc.id !== user?.id && acc.name && acc.xp) {
              realAccounts.push({
                name: acc.name,
                flag: "🇨🇱",
                xp: acc.xp,
                badge: acc.isPro ? "👑" : "🎖️",
                isUser: false,
              });
            }
          });
        }
      } catch {}
    }

    // Insertar el usuario en la lista
    const combined: Omit<Competitor, "rank">[] = [
      ...divisionBots,
      ...realAccounts,
      {
        name: user?.name || user?.email?.split("@")[0] || "Cadete Tú",
        flag: "🇨🇱",
        xp: userXp,
        badge: user?.isPro ? "👑" : "🎖️",
        isUser: true,
      },
    ];

    // Ordenar descendente por XP
    combined.sort((a, b) => b.xp - a.xp);

    // Asignar rangos 1-indexed
    return combined.map((item, idx) => ({
      ...item,
      rank: idx + 1,
    }));
  }, [activeLeague, user, userXp]);

  const leagues: { id: LeagueDivision; name: string; icon: string; color: string; border: string }[] = [
    { id: "bronze", name: "Liga Bronce", icon: "🥉", color: "from-amber-700 to-amber-900", border: "border-amber-600" },
    { id: "silver", name: "Liga Plata", icon: "🥈", color: "from-slate-400 to-slate-600", border: "border-slate-400" },
    { id: "gold", name: "Liga Oro", icon: "🥇", color: "from-amber-400 to-yellow-600", border: "border-amber-400" },
    { id: "diamond", name: "Liga Diamante", icon: "💎", color: "from-sky-400 to-blue-600", border: "border-sky-400" },
  ];

  const currentLeagueObj = leagues.find((l) => l.id === activeLeague) || leagues[2];
  const userRankObj = rankedList.find((c) => c.isUser);

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-slate-950 flex flex-col font-sans text-[#6B4423] dark:text-slate-100 transition-colors">
      <Header sessionTitle="Ligas" />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col">
        {/* Navigation & Title */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-[#A67B5B] dark:text-slate-400 hover:text-[#6B4423] dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>

          {/* Time Remaining */}
          <div className="flex items-center gap-1.5 px-3 py-1 bg-white dark:bg-slate-900 border border-[#E5D5C5] dark:border-slate-800 rounded-full text-xs font-black text-amber-800 dark:text-amber-400 shadow-xs">
            <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>La liga termina el domingo a medianoche</span>
          </div>
        </div>

        {/* Hero League Card */}
        <div className={`bg-gradient-to-tr ${currentLeagueObj.color} rounded-3xl p-6 sm:p-8 text-white shadow-conan-card mb-6 relative overflow-hidden`}>
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
            <div className="text-center sm:text-left">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider mb-2">
                <Trophy className="w-3.5 h-3.5 text-yellow-200" />
                <span>División Semanal</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
                {currentLeagueObj.name} {currentLeagueObj.icon}
              </h1>
              <p className="text-xs sm:text-sm text-white/90 font-medium mt-1 max-w-md leading-relaxed">
                Entrena diariamente con quizzes y cartas de vocabulario para sumar XP, ascender al podio y subir de división.
              </p>
            </div>

            {/* User Standings Preview */}
            <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl text-center min-w-[140px] shadow-sm">
              <span className="text-[10px] font-black uppercase tracking-wider text-white/80 block">
                Tu Posición
              </span>
              <div className="text-2xl sm:text-3xl font-black text-white my-0.5">
                #{userRankObj?.rank || "-"}
              </div>
              <span className="text-xs font-black text-yellow-200 block">
                {userXp} XP Acumulada
              </span>
            </div>
          </div>
        </div>

        {/* League Selector Tabs */}
        <div className="grid grid-cols-4 gap-2 mb-6">
          {leagues.map((l) => (
            <button
              key={l.id}
              type="button"
              onClick={() => setActiveLeague(l.id)}
              className={`p-3 rounded-2xl border-2 text-center transition-all ${
                activeLeague === l.id
                  ? `${l.border} bg-white dark:bg-slate-900 shadow-sm scale-102`
                  : "border-[#E5D5C5] dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 opacity-80 hover:opacity-100"
              }`}
            >
              <span className="text-xl sm:text-2xl block mb-1">{l.icon}</span>
              <span className="text-[11px] sm:text-xs font-black text-[#6B4423] dark:text-slate-200 block truncate">
                {l.name.replace("Liga ", "")}
              </span>
            </button>
          ))}
        </div>

        {/* Zones explanation */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-white dark:bg-slate-900 rounded-xl border border-[#E5D5C5] dark:border-slate-800 text-[11px] font-bold text-[#A67B5B] dark:text-slate-400 mb-4">
          <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Puestos 1 al 3: Zona de Ascenso</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400">
            <Minus className="w-3.5 h-3.5" />
            <span>Puestos 4 al 6: Zona Segura</span>
          </div>
          <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400">
            <ArrowDown className="w-3.5 h-3.5" />
            <span>Últimos puestos: Descenso</span>
          </div>
        </div>

        {/* Leaderboard Competitors List */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E5D5C5] dark:border-slate-800 overflow-hidden shadow-xs divide-y divide-[#E5D5C5]/60 dark:divide-slate-800">
          {rankedList.map((competitor) => {
            const isTop3 = competitor.rank <= 3;
            const isPromotion = competitor.rank <= 3;
            const isDemotion = competitor.rank >= rankedList.length - 2;

            return (
              <div
                key={`${competitor.name}-${competitor.rank}`}
                className={`p-4 flex items-center justify-between gap-3 transition-colors ${
                  competitor.isUser
                    ? "bg-amber-50/80 dark:bg-amber-950/40 font-black border-l-4 border-l-[#F59E0B]"
                    : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                {/* Rank & Indicator */}
                <div className="flex items-center gap-3">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shrink-0 ${
                      competitor.rank === 1
                        ? "bg-yellow-400 text-amber-950 shadow-xs"
                        : competitor.rank === 2
                        ? "bg-slate-300 text-slate-900 shadow-xs"
                        : competitor.rank === 3
                        ? "bg-amber-600 text-white shadow-xs"
                        : "text-[#A67B5B] dark:text-slate-400"
                    }`}
                  >
                    {competitor.rank === 1
                      ? "🥇"
                      : competitor.rank === 2
                      ? "🥈"
                      : competitor.rank === 3
                      ? "🥉"
                      : competitor.rank}
                  </div>

                  {/* Name and Badges */}
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-black text-[#6B4423] dark:text-white">
                        {competitor.name}
                      </span>
                      <span className="text-xs">{competitor.flag}</span>
                      {competitor.isUser && (
                        <span className="px-1.5 py-0.5 rounded-md bg-[#F59E0B] text-white text-[9px] font-black uppercase">
                          Tú
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-[#A67B5B] dark:text-slate-400 font-bold block">
                      {isPromotion ? "Ascendiendo a la siguiente división" : isDemotion ? "En riesgo de descenso" : "Permanencia segura"}
                    </span>
                  </div>
                </div>

                {/* Score and Trophy */}
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <span className="text-sm font-black text-[#6B4423] dark:text-white block">
                      {competitor.xp} XP
                    </span>
                    <span className="text-[10px] text-[#A67B5B] dark:text-slate-400 font-bold">
                      Semanal
                    </span>
                  </div>
                  <span className="text-base">{competitor.badge}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Ad Placement */}
        <AdBanner className="mt-8" />
      </main>
    </div>
  );
}
