"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ConanMascot from "@/components/ConanMascot";
import FormulaModal from "@/components/FormulaModal";
import {
  Sparkles,
  Shuffle,
  ListOrdered,
  Clock,
  ShieldCheck,
  ChevronRight,
  Info,
  Share2,
  Smartphone,
  Download,
  BookOpen,
  Layers,
  Swords,
  Trophy,
  Play,
  Volume2,
  Zap,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import {
  getCurrentUser,
  subscribeAuth,
  getGuestUsageCount,
  hasReachedGuestLimit,
  GUEST_LIMIT,
  setProStatus,
  getUserMascotName,
} from "@/lib/supabase";
import {
  getRankByXp,
  getUserRankBadge,
  getUserRankGrade,
  getUserRankTitle,
} from "@/lib/accessories";
import {
  checkReturnPaymentStatus,
  clearPaymentQueryParams,
  verifyPaymentWithServer,
} from "@/lib/payments";
import confetti from "canvas-confetti";
import AuthModal from "@/components/AuthModal";
import AdBanner from "@/components/AdBanner";
import ProSubscriptionModal from "@/components/ProSubscriptionModal";
import StreakModal from "@/components/StreakModal";
import BoosterModal from "@/components/BoosterModal";
import DailyQuestsModal from "@/components/DailyQuestsModal";
import { UserProfile } from "@/lib/types";

export default function HomePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formulaModalOpen, setFormulaModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [guestUsage, setGuestUsage] = useState(0);
  const [guestLimitHit, setGuestLimitHit] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [streakModalOpen, setStreakModalOpen] = useState(false);
  const [boosterModalOpen, setBoosterModalOpen] = useState(false);
  const [questsModalOpen, setQuestsModalOpen] = useState(false);

  useEffect(() => {
    const cur = getCurrentUser();
    setUser(cur);
    setGuestUsage(getGuestUsageCount());
    setGuestLimitHit(hasReachedGuestLimit());

    // Detección de pago Webpay / Mercado Pago
    const paymentCheck = checkReturnPaymentStatus();
    if (paymentCheck.isApproved) {
      const pid = paymentCheck.paymentId || "ONLINE-" + Date.now();
      verifyPaymentWithServer(pid).then((res) => {
        if (res.verified) {
          setProStatus(true);
          try {
            confetti({
              particleCount: 120,
              spread: 85,
              origin: { y: 0.6 },
              colors: ["#F59E0B", "#10B981", "#3B82F6"],
            });
          } catch {}
          clearPaymentQueryParams();
        }
      });
    }

    const unsubscribe = subscribeAuth((updatedUser) => {
      setUser(updatedUser);
      setGuestUsage(getGuestUsageCount());
      setGuestLimitHit(hasReachedGuestLimit());
    });
    return () => unsubscribe();
  }, []);

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.origin);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  const handleOpenInstall = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("open-install-modal"));
    }
  };

  const rankInfo = getRankByXp(user?.xp || 0);

  // Quick Random Quiz Options (10, 20, 30, 40, 50)
  const quickQuizzes = [
    { size: 10, label: "10 Preguntas", sub: "Express • ~5 min", badge: "Rápido" },
    { size: 20, label: "20 Preguntas", sub: "Corto • ~10 min", badge: "Dinámico" },
    { size: 30, label: "30 Preguntas", sub: "Medio • ~15 min", badge: "Popular" },
    { size: 40, label: "40 Preguntas", sub: "Intensivo • ~20 min", badge: "Enfocado" },
    { size: 50, label: "50 Preguntas", sub: "Medio Examen • ~30 min", badge: "Desafío" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-[#6B4423] dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <Header medals={user?.medals ?? 10} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-5 md:py-8">
        {/* COMPACT HERO WITH SMALL ANIMATRONIC CONAN & ABOUT LINK */}
        <section className="flex items-center justify-between gap-4 mb-6 bg-gradient-to-r from-[#FAF6F0] via-amber-50/40 to-white dark:from-slate-900 dark:via-slate-900/80 dark:to-slate-950 p-4 sm:p-6 rounded-3xl border-2 border-[#E5D5C5] dark:border-slate-800 shadow-conan-card">
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF3C7] dark:bg-amber-950/60 border border-[#FDE68A] dark:border-amber-700 text-[#92400E] dark:text-amber-200 text-[11px] font-black uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                A.L.C.P.T. • Inglés Militar 🇺🇸
              </span>

              {/* Link directo a Información de la página y Conan */}
              <Link
                href="/about"
                className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white dark:bg-slate-800 border border-[#E5D5C5] dark:border-slate-700 text-xs font-bold text-[#6B4423] dark:text-slate-200 hover:bg-amber-50 dark:hover:bg-slate-700 transition-colors shadow-xs"
              >
                <Info className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                <span>Acerca de ConanGo & Información</span>
              </Link>
            </div>

            <h1 className="text-xl sm:text-3xl font-black text-[#6B4423] dark:text-white tracking-tight leading-tight">
              ¡Entrena y domina el examen con{" "}
              <span className="text-[#F59E0B]">{user ? getUserMascotName(user) : "Conan"}</span>!
            </h1>
            <p className="text-xs sm:text-sm text-[#A67B5B] dark:text-slate-300 font-medium mt-1 max-w-xl">
              Simulación interactiva para clasificación y comisiones de vuelo USAF. Elige un quiz rápido aleatorio o tu cuadernillo de práctica.
            </p>
          </div>

          {/* Small subtle animatronic mascot Conan */}
          <div className="flex flex-col items-center shrink-0">
            <div className="p-1 rounded-2xl bg-white dark:bg-slate-800 shadow-sm border border-[#E5D5C5] dark:border-slate-700">
              <ConanMascot size="md" mood="happy" animate={true} />
            </div>
            <span className="text-[10px] font-black uppercase tracking-wider text-[#6B4423] dark:text-amber-300 mt-1">
              {user ? getUserMascotName(user) : "Conan"} 🐾
            </span>
          </div>
        </section>

        {/* 🎖️ WIDGET PERMANENTE: RANGO USAF ACTUAL Y PROGRESIÓN DE ASCENSO */}
        <section className="mb-8 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-slate-900/40 dark:to-slate-900 border-2 border-amber-300/80 dark:border-amber-700/60 rounded-3xl p-4 sm:p-5 shadow-conan-card relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Rank info */}
            <div className="flex items-start sm:items-center gap-3.5">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md flex-shrink-0 border-2 border-white dark:border-slate-800">
                {getUserRankBadge(user?.xp || 0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-black text-[#6B4423] dark:text-white">
                    {user ? user.name || user.email : "Invitado"}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 text-[10px] font-black uppercase tracking-wider">
                    {rankInfo.currentRank.abbr}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    🐾 <strong className="text-amber-700 dark:text-amber-300">{getUserMascotName(user)}</strong>
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-[#6B4423] dark:text-white mt-0.5">
                  {getUserRankTitle(user?.xp || 0)}
                </h3>
                {rankInfo.nextRank && (
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                    Siguiente grado: <span className="font-black">{rankInfo.nextRank.name}</span> ({rankInfo.nextRank.abbr})
                  </p>
                )}
              </div>
            </div>

            {/* Profile Link or Login */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {user ? (
                <Link
                  href="/profile"
                  className="px-3.5 py-1.5 bg-white dark:bg-slate-800 hover:bg-[#FAF6F0] dark:hover:bg-slate-700 border border-[#E5D5C5] dark:border-slate-700 text-[#6B4423] dark:text-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span>Base & Personalizar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="px-3.5 py-1.5 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl text-xs font-black transition-all shadow-xs"
                >
                  Registrar mi Cuenta & Mascota
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar & Missing XP */}
          <div className="mt-3 pt-3 border-t border-amber-200/60 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[#6B4423] dark:text-white">
                  Progreso de Ascenso:
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-black">
                  {rankInfo.progress}%
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  ({user?.xp || 0} XP acumulados)
                </span>
              </div>
              <div className="text-xs font-black text-amber-800 dark:text-amber-300">
                {rankInfo.nextRank ? (
                  <span>
                    Faltan <span className="underline decoration-amber-500 font-black">{Math.max(0, (rankInfo.nextRank.minXp || 0) - (user?.xp || 0))} XP</span> para ascender a {rankInfo.nextRank.name} ({rankInfo.nextRank.abbr})
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    🎖️ ¡Has alcanzado el Grado Supremo de General de la USAF!
                  </span>
                )}
              </div>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 p-0.5 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(4, rankInfo.progress)}%` }}
              />
            </div>
          </div>
        </section>

        {/* GUEST LIMIT NOTICE (IF NEEDED) */}
        {!user && guestLimitHit && (
          <div className="mb-6 bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-black text-lg shrink-0">
                🔒
              </div>
              <div>
                <h4 className="text-sm font-black text-amber-950 dark:text-amber-200">
                  Límite de prueba alcanzado ({guestUsage} de {GUEST_LIMIT} lecciones)
                </h4>
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  Inicia sesión o crea tu cuenta gratis para continuar practicando sin límites.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setAuthModalOpen(true)}
              className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black text-xs rounded-xl shadow-sm shrink-0"
            >
              Iniciar Sesión / Crear Cuenta
            </button>
          </div>
        )}

        {/* ⚡ SECCIÓN 1 (ARRIBA): QUIZ ALEATORIOS RÁPIDOS (10, 20, 30, 40, 50) */}
        <section className="mb-10">
          <div className="mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-1.5 shadow-xs">
              <Zap className="w-3.5 h-3.5 text-[#F59E0B] fill-amber-500" />
              <span>Entrenamiento Inmediato</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#6B4423] dark:text-white tracking-tight">
              Quiz Aleatorios Rápidos
            </h2>
            <p className="text-xs sm:text-sm text-[#A67B5B] dark:text-slate-400 font-semibold">
              Practica al instante sin elegir fórmulas: preguntas 50% Listening + 50% Reading al azar.
            </p>
          </div>

          {/* Quick Quiz Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {quickQuizzes.map((quiz) => (
              <Link
                key={quiz.size}
                href={`/practice?size=${quiz.size}&formula=random`}
                className="bg-white dark:bg-slate-900 border-2 border-[#E5D5C5] dark:border-slate-800 hover:border-[#F59E0B] dark:hover:border-amber-500 p-4 rounded-2xl shadow-conan-card transition-all group flex flex-col justify-between hover:scale-[1.02] active:scale-98"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-[#F59E0B] font-black text-xs flex items-center justify-center shadow-xs">
                      {quiz.size}
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60">
                      {quiz.badge}
                    </span>
                  </div>
                  <h3 className="text-base sm:text-lg font-black text-[#6B4423] dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                    {quiz.label}
                  </h3>
                  <p className="text-[11px] text-[#A67B5B] dark:text-slate-400 font-medium mt-0.5">
                    {quiz.sub}
                  </p>
                </div>

                <div className="mt-4 pt-2 border-t border-[#E5D5C5]/60 dark:border-slate-800 flex items-center justify-between text-xs font-black text-[#F59E0B]">
                  <span>Iniciar Quiz</span>
                  <Play className="w-3.5 h-3.5 fill-[#F59E0B] group-hover:translate-x-0.5 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* 📚 SECCIÓN 2 (ABAJO): PRÁCTICA NORMAL & MODALIDADES ESPECÍFICAS */}
        <section className="mb-10">
          <div className="mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black uppercase tracking-wider mb-1.5 shadow-xs">
              <ListOrdered className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Entrenamiento Estructurado</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#6B4423] dark:text-white tracking-tight">
              Práctica Normal & Fórmulas Oficiales
            </h2>
            <p className="text-xs sm:text-sm text-[#A67B5B] dark:text-slate-400 font-semibold">
              Elige tu modalidad de estudio por habilidad o realiza el examen completo con el cuadernillo de tu elección (1 al 100).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            {/* 1. Comprensión Auditiva (Listening) */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border-2 border-[#E5D5C5] dark:border-slate-800 shadow-conan-card flex flex-col justify-between hover:border-blue-500 transition-all">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs mb-3">
                  <Volume2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-[#6B4423] dark:text-white mb-1.5">
                  1. Listening (Comprensión Auditiva)
                </h3>
                <p className="text-xs text-[#A67B5B] dark:text-slate-400 font-medium leading-relaxed mb-4">
                  Entrenamiento exclusivo de audios militares, reportes meteorológicos y radiocomunicaciones ATC en inglés americano 🇺🇸.
                </p>
              </div>

              <div className="space-y-2">
                <Link
                  href="/practice?type=listening&formula=random"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Listening Aleatorio</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setFormulaModalOpen(true)}
                  className="w-full py-2 bg-[#FAF6F0] dark:bg-slate-800 text-[#6B4423] dark:text-slate-200 font-bold rounded-xl border border-[#E5D5C5] dark:border-slate-700 text-xs hover:bg-[#F5EFEB]"
                >
                  Elegir Fórmula Específica (1-100)
                </button>
              </div>
            </div>

            {/* 2. Lectura y Gramática (Reading) */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border-2 border-[#E5D5C5] dark:border-slate-800 shadow-conan-card flex flex-col justify-between hover:border-emerald-500 transition-all">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs mb-3">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-[#6B4423] dark:text-white mb-1.5">
                  2. Reading (Lectura & Gramática)
                </h3>
                <p className="text-xs text-[#A67B5B] dark:text-slate-400 font-medium leading-relaxed mb-4">
                  Estructuras de gramática militar, tiempos verbales, modismos de aviación y lectura técnica oficial del ALCPT.
                </p>
              </div>

              <div className="space-y-2">
                <Link
                  href="/practice?type=reading&formula=random"
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Reading Aleatorio</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setFormulaModalOpen(true)}
                  className="w-full py-2 bg-[#FAF6F0] dark:bg-slate-800 text-[#6B4423] dark:text-slate-200 font-bold rounded-xl border border-[#E5D5C5] dark:border-slate-700 text-xs hover:bg-[#F5EFEB]"
                >
                  Elegir Fórmula Específica (1-100)
                </button>
              </div>
            </div>

            {/* 3. Examen Completo Oficial (100 Preguntas) */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border-2 border-[#F59E0B] shadow-conan-card flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#F59E0B] text-white px-2.5 py-0.5 rounded-bl-xl font-black text-[10px] uppercase tracking-wider shadow-xs">
                Oficial 100
              </div>

              <div>
                <div className="w-11 h-11 rounded-2xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-xs mb-3">
                  <Trophy className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-black text-[#6B4423] dark:text-white mb-1.5">
                  3. Examen Oficial ALCPT (100)
                </h3>
                <p className="text-xs text-[#A67B5B] dark:text-slate-400 font-medium leading-relaxed mb-4">
                  Simulación estandarizada completa: <strong>60 Listening + 40 Reading</strong> con temporizador oficial de 60 min y diploma de graduación.
                </p>
              </div>

              <div className="space-y-2">
                <Link
                  href="/practice?size=100&formula=random"
                  className="w-full py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-conan-btn transition-transform active:scale-95"
                >
                  <Play className="w-3 h-3 fill-white" />
                  <span>Rendir Examen Aleatorio</span>
                </Link>
                <button
                  type="button"
                  onClick={() => setFormulaModalOpen(true)}
                  className="w-full py-2 bg-[#FAF6F0] dark:bg-slate-800 text-[#6B4423] dark:text-slate-200 font-bold rounded-xl border border-[#E5D5C5] dark:border-slate-700 text-xs hover:bg-[#F5EFEB]"
                >
                  Elegir Cuadernillo (1-100)
                </button>
              </div>
            </div>
          </div>

          {/* DUAL VOCABULARY SUITE: BIBLIOTECA + JUEGO DE CARTAS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Biblioteca de Vocabulario */}
            <Link
              href="/vocabulary"
              className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-slate-900 dark:to-slate-800 border-2 border-amber-200 dark:border-amber-800 hover:border-amber-400 p-5 rounded-3xl flex items-center justify-between gap-4 shadow-xs transition-all group active:scale-98"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  📚
                </div>
                <div>
                  <h4 className="text-base font-black text-[#6B4423] dark:text-white">
                    Biblioteca de Vocabulario
                  </h4>
                  <p className="text-xs text-[#A67B5B] dark:text-slate-400 font-semibold mt-0.5">
                    Glosario táctico con audio nativo americano, fonética y oraciones.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>

            {/* Juego de Cartas Finito */}
            <Link
              href="/vocabulary/matching"
              className="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-slate-900 dark:to-slate-800 border-2 border-indigo-200 dark:border-indigo-800 hover:border-indigo-400 p-5 rounded-3xl flex items-center justify-between gap-4 shadow-xs transition-all group active:scale-98"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center text-xl shadow-xs shrink-0 group-hover:scale-105 transition-transform">
                  🃏
                </div>
                <div>
                  <h4 className="text-base font-black text-[#6B4423] dark:text-white">
                    Juego de Emparejar Cartas
                  </h4>
                  <p className="text-xs text-[#A67B5B] dark:text-slate-400 font-semibold mt-0.5">
                    Rondas de 10 pares con vidas tácticas, XP y medallas.
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </section>

        {/* TACTICAL HUB (STREAK, TIENDA DE POCIONES, QUESTS, LIGAS, DUELOS) */}
        <section className="mb-10">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* 1. STREAK CARD */}
            {user ? (
              <button
                type="button"
                onClick={() => setStreakModalOpen(true)}
                className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-slate-900 dark:to-slate-800 border-2 border-orange-200 dark:border-orange-800 hover:border-orange-400 p-4 rounded-3xl text-left shadow-xs transition-all active:scale-95 group"
              >
                <div className="w-9 h-9 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-lg shadow-xs mb-2 group-hover:scale-110 transition-transform">
                  🔥
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-orange-800 dark:text-orange-400 block">
                  Racha Diaria
                </span>
                <span className="text-base sm:text-lg font-black text-[#6B4423] dark:text-white">
                  {user.streakDays || 0} {user.streakDays === 1 ? "Día" : "Días"}
                </span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setAuthModalOpen(true)}
                className="bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-slate-900 dark:to-slate-800 border-2 border-amber-200 dark:border-amber-800 hover:border-amber-400 p-4 rounded-3xl text-left shadow-xs transition-all active:scale-95 group"
              >
                <div className="w-9 h-9 rounded-2xl bg-[#F59E0B] text-white flex items-center justify-center text-lg shadow-xs mb-2 group-hover:scale-110 transition-transform">
                  🐾
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 dark:text-amber-400 block">
                  Modo Invitado
                </span>
                <span className="text-xs sm:text-sm font-black text-[#6B4423] dark:text-white leading-tight block">
                  Crear Cuenta
                </span>
              </button>
            )}

            {/* 2. TIENDA DE POCIONES MÁGICAS */}
            <Link
              href="/shop"
              className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 p-4 rounded-3xl text-left shadow-xs transition-all active:scale-95 group"
            >
              <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-xs mb-2 group-hover:scale-110 transition-transform">
                🧪
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 dark:text-blue-400 block">
                Tienda
              </span>
              <span className="text-base sm:text-lg font-black text-[#6B4423] dark:text-white">
                Pociones ⚡
              </span>
            </Link>

            {/* 3. DAILY QUESTS CARD */}
            <button
              type="button"
              onClick={() => {
                if (!user) setAuthModalOpen(true);
                else setQuestsModalOpen(true);
              }}
              className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-slate-900 dark:to-slate-800 border-2 border-purple-200 dark:border-purple-800 hover:border-purple-400 p-4 rounded-3xl text-left shadow-xs transition-all active:scale-95 group"
            >
              <div className="w-9 h-9 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-lg shadow-xs mb-2 group-hover:scale-110 transition-transform">
                🎯
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 dark:text-purple-400 block">
                Misiones Diarias
              </span>
              <span className="text-base sm:text-lg font-black text-[#6B4423] dark:text-white">
                Ganar 2x XP ⚡
              </span>
            </button>

            {/* 4. LEADERBOARD CARD (LIGAS) */}
            <Link
              href="/leaderboard"
              className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-slate-900 dark:to-slate-800 border-2 border-amber-300 dark:border-amber-800 hover:border-amber-500 p-4 rounded-3xl text-left shadow-xs transition-all active:scale-95 group"
            >
              <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white flex items-center justify-center text-lg shadow-xs mb-2 group-hover:scale-110 transition-transform">
                🏆
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 dark:text-amber-400 block">
                Ligas
              </span>
              <span className="text-base sm:text-lg font-black text-[#6B4423] dark:text-white">
                División 🥇
              </span>
            </Link>

            {/* 5. FRIEND CHALLENGE / DUELS CARD */}
            <Link
              href="/challenge"
              className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 border-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 p-4 rounded-3xl text-left shadow-xs transition-all active:scale-95 group"
            >
              <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-base shadow-xs mb-2 group-hover:scale-110 transition-transform">
                <Swords className="w-5 h-5 text-white" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-400 block">
                Desafíos
              </span>
              <span className="text-base sm:text-lg font-black text-[#6B4423] dark:text-white">
                Duelo ⚔️
              </span>
            </Link>
          </div>
        </section>

        <AdBanner className="mb-8" />

        {/* INSTALACIÓN EN EL DISPOSITIVO */}
        <section className="mb-10 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-3xl p-6 sm:p-7 shadow-conan-card flex flex-col sm:flex-row items-center justify-between gap-5 border-2 border-blue-700/40">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0 shadow-inner">
              <Smartphone className="w-7 h-7" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-black uppercase tracking-wider mb-1">
                Android &bull; iPhone &bull; PWA Directo
              </div>
              <h3 className="text-lg sm:text-xl font-black text-white">
                Instala ConanGo en tu Teléfono
              </h3>
              <p className="text-xs text-blue-200 mt-0.5 max-w-xl font-medium">
                Acceso directo a pantalla completa, reproduce audios nativos de cabina y guarda tu progreso automáticamente.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenInstall}
            className="w-full sm:w-auto px-5 py-3 bg-white text-blue-900 hover:bg-blue-50 font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 text-xs sm:text-sm shrink-0 transition-transform active:scale-95"
          >
            <Download className="w-4 h-4 text-blue-700" />
            <span>Instalar en Celular</span>
          </button>
        </section>
      </main>

      {/* Modals */}
      <ProSubscriptionModal isOpen={proModalOpen} onClose={() => setProModalOpen(false)} />
      <StreakModal isOpen={streakModalOpen} onClose={() => setStreakModalOpen(false)} />
      <BoosterModal isOpen={boosterModalOpen} onClose={() => setBoosterModalOpen(false)} />
      <DailyQuestsModal isOpen={questsModalOpen} onClose={() => setQuestsModalOpen(false)} />
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
      <FormulaModal isOpen={formulaModalOpen} onClose={() => setFormulaModalOpen(false)} />

      {/* Footer with Link to About */}
      <footer className="border-t border-[#E5D5C5] dark:border-slate-800 py-6 px-4 text-center text-xs text-[#A67B5B] dark:text-slate-400 bg-[#FAF6F0] dark:bg-slate-900 space-y-2 transition-colors">
        <div className="flex items-center justify-center gap-4 text-xs font-bold text-[#6B4423] dark:text-slate-300 mb-1">
          <Link href="/about" className="hover:text-amber-600 dark:hover:text-amber-400 hover:underline">
            Acerca de ConanGo
          </Link>
          <span>&bull;</span>
          <Link href="/vocabulary" className="hover:text-amber-600 dark:hover:text-amber-400 hover:underline">
            Biblioteca de Vocabulario
          </Link>
          <span>&bull;</span>
          <Link href="/vocabulary/matching" className="hover:text-amber-600 dark:hover:text-amber-400 hover:underline">
            Juego de Cartas
          </Link>
        </div>
        <p className="font-black text-[#6B4423] dark:text-slate-200">
          ConanGo &copy; {new Date().getFullYear()} &bull; A.L.C.P.T. (Adiestramiento Lingüístico con Conan, Perro Táctico) &bull; Inglés 🇺🇸
        </p>
      </footer>
    </div>
  );
}
