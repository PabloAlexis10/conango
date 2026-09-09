"use client";

import React, { useEffect, useState } from "react";
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

export default function LeaderboardPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [activeLeague, setActiveLeague] = useState<"bronze" | "silver" | "gold" | "diamond">("gold");

  useEffect(() => {
    setUser(getCurrentUser());
    const unsub = subscribeAuth((u) => setUser(u));
    return () => unsub();
  }, []);

  const userXp = user?.xp || 420;

  // Competidores de la liga semanal simulados + el usuario en su posición real
  const baseCompetitors: Omit<Competitor, "rank">[] = [
    { name: "SGT Miller", flag: "🇺🇸", xp: 1850, badge: "⭐" },
    { name: "Cadete R. Morales", flag: "🇨🇱", xp: 1620, badge: "🥉" },
    { name: "CPT Henderson", flag: "🇺🇸", xp: 1490, badge: "💎" },
    { name: "Cadete V. Torres", flag: "🇨🇱", xp: 1250, badge: "🎖️" },
    { name: "SSG Ramirez", flag: "🇺🇸", xp: 980, badge: "⭐⭐" },
    { name: "SFC Walker", flag: "🇺🇸", xp: 840, badge: "⭐⭐⭐" },
    { name: "Piloto D. Silva", flag: "🇨🇱", xp: 620, badge: "🎖️" },
    { name: "PFC Johnson", flag: "🇺🇸", xp: 450, badge: "🥉" },
    { name: "Cadete F. Soto", flag: "🇨🇱", xp: 310, badge: "🐾" },
    { name: "PVT Campbell", flag: "🇺🇸", xp: 190, badge: "🐾" },
  ];

  // Insert user
  const allList: Omit<Competitor, "rank">[] = [
    ...baseCompetitors,
    {
      name: user?.name || user?.email?.split("@")[0] || "Cadete Tú",
      flag: "🇨🇱",
      xp: userXp,
      badge: user?.isPro ? "👑" : "🎖️",
      isUser: true,
    },
  ];

  // Sort descending by XP
  allList.sort((a, b) => b.xp - a.xp);

  // Assign 1-indexed ranks
  const rankedList: Competitor[] = allList.map((item, idx) => ({
    ...item,
    rank: idx + 1,
  }));

  const leagues = [
    { id: "bronze", name: "Liga Bronce", icon: "🥉", color: "from-amber-700 to-amber-900", border: "border-amber-600" },
    { id: "silver", name: "Liga Plata", icon: "🥈", color: "from-slate-400 to-slate-600", border: "border-slate-400" },
    { id: "gold", name: "Liga Oro", icon: "🥇", color: "from-amber-400 to-yellow-600", border: "border-amber-400" },
    { id: "diamond", name: "Liga Diamante", icon: "💎", color: "from-sky-400 to-blue-600", border: "border-sky-400" },
  ];

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-slate-950 flex flex-col font-sans text-[#6B4423] dark:text-slate-100 transition-colors">
      <Header sessionTitle="Clasificación Semanal de Cadetes" />

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
            <span>La liga termina en: 3d 14h</span>
          </div>
        </div>

        {/* Hero League Card */}
        <div className="bg-gradient-to-br from-white to-amber-50 dark:from-slate-900 dark:to-slate-800 rounded-3xl border-2 border-[#E5D5C5] dark:border-slate-700 shadow-conan-card p-6 mb-6 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 dark:bg-amber-950/50 border-2 border-amber-300 dark:border-amber-700 flex items-center justify-center text-3xl shadow-sm">
              🏆
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-900 dark:text-amber-200 text-[10px] font-black uppercase tracking-wider mb-1">
                <Sparkles className="w-3 h-3 text-[#F59E0B]" />
                <span>División Táctica Semanal</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-[#6B4423] dark:text-amber-400">
                Liga de Honor ALCPT
              </h1>
              <p className="text-xs text-[#A67B5B] dark:text-slate-400 mt-0.5 font-medium">
                Gana experiencia (XP) rindiendo evaluaciones para ascender a la siguiente liga militar.
              </p>
            </div>
          </div>

          <div className="text-center sm:text-right bg-white dark:bg-slate-950 px-4 py-3 rounded-2xl border border-[#E5D5C5] dark:border-slate-800">
            <span className="text-[10px] font-black uppercase text-[#A67B5B] dark:text-slate-400 block">
              Tu Experiencia
            </span>
            <span className="text-2xl font-black text-amber-600 dark:text-amber-400">
              {userXp} XP
            </span>
          </div>
        </div>

        {/* League Selector Tabs */}
        <div className="grid grid-cols-4 gap-2 mb-6 text-center">
          {leagues.map((lg) => (
            <button
              key={lg.id}
              type="button"
              onClick={() => setActiveLeague(lg.id as any)}
              className={`p-3 rounded-2xl border-2 transition-all ${
                activeLeague === lg.id
                  ? `${lg.border} bg-white dark:bg-slate-900 shadow-sm font-black`
                  : "border-transparent bg-white/60 dark:bg-slate-900/60 opacity-60 hover:opacity-100"
              }`}
            >
              <span className="text-2xl block mb-1">{lg.icon}</span>
              <span className="text-[11px] font-black text-[#6B4423] dark:text-slate-200 block">
                {lg.name}
              </span>
            </button>
          ))}
        </div>

        {/* Leaderboard Table Card */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E5D5C5] dark:border-slate-800 shadow-sm overflow-hidden mb-8">
          <div className="bg-[#FAF6F0] dark:bg-slate-800/80 px-5 py-3 border-b border-[#E5D5C5] dark:border-slate-700 flex items-center justify-between text-xs font-black text-[#A67B5B] dark:text-slate-400">
            <span>Puesto & Cadete</span>
            <span>Experiencia Ganada</span>
          </div>

          <div className="divide-y divide-[#E5D5C5]/60 dark:divide-slate-800">
            {rankedList.map((competitor) => {
              const isTop3 = competitor.rank <= 3;
              const isPromotion = competitor.rank <= 5;
              const isDemotion = competitor.rank >= rankedList.length - 2;

              return (
                <div
                  key={competitor.rank}
                  className={`px-5 py-3.5 flex items-center justify-between transition-colors ${
                    competitor.isUser
                      ? "bg-amber-50 dark:bg-amber-950/30 border-l-4 border-[#F59E0B] font-black"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/40"
                  }`}
                >
                  {/* Rank & User Info */}
                  <div className="flex items-center gap-3.5">
                    <div className="w-7 text-center font-black">
                      {competitor.rank === 1 ? (
                        <span className="text-xl">🥇</span>
                      ) : competitor.rank === 2 ? (
                        <span className="text-xl">🥈</span>
                      ) : competitor.rank === 3 ? (
                        <span className="text-xl">🥉</span>
                      ) : (
                        <span className="text-sm font-mono text-[#A67B5B] dark:text-slate-400">
                          #{competitor.rank}
                        </span>
                      )}
                    </div>

                    {/* Movement Indicator */}
                    <div className="w-4">
                      {isPromotion ? (
                        <ArrowUp className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      ) : isDemotion ? (
                        <ArrowDown className="w-3.5 h-3.5 text-red-500" />
                      ) : (
                        <Minus className="w-3.5 h-3.5 text-slate-400" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm">{competitor.flag}</span>
                        <span className="text-xs sm:text-sm font-black text-[#6B4423] dark:text-slate-200">
                          {competitor.name} {competitor.isUser && <span className="text-[#F59E0B]">(Tú)</span>}
                        </span>
                        <span className="text-xs">{competitor.badge}</span>
                      </div>
                      <span className="text-[10px] text-[#A67B5B] dark:text-slate-400 font-semibold block">
                        {isPromotion ? "Zona de Ascenso ▲" : isDemotion ? "Zona de Descenso ▼" : "Permanece en liga"}
                      </span>
                    </div>
                  </div>

                  {/* XP */}
                  <div className="text-right">
                    <span className="text-sm sm:text-base font-black text-[#F59E0B] dark:text-amber-400">
                      {competitor.xp} XP
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ad Placement */}
        <AdBanner
          slotId="7890123456"
          sponsorTitle="Entrenamiento Intensivo para Ascenso en Liga ALCPT 🚀"
          sponsorDescription="Practica el doble de preguntas diarias con el potenciador 2x XP y consolida tu primer lugar en la división semanal."
          sponsorCta="Ver Potenciadores"
          sponsorLink="/shop"
        />
      </main>
    </div>
  );
}
