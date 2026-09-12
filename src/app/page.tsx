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
  getDailyQuests,
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
import { UserProfile, DailyQuest } from "@/lib/types";

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
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [listenSize, setListenSize] = useState<number>(30);
  const [listenFormula, setListenFormula] = useState<string>("random");
  const [readingSize, setReadingSize] = useState<number>(30);
  const [readingFormula, setReadingFormula] = useState<string>("random");

  useEffect(() => {
    const cur = getCurrentUser();
    setUser(cur);
    setQuests(getDailyQuests());
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
      setQuests(getDailyQuests());
      setGuestUsage(getGuestUsageCount());
      setGuestLimitHit(hasReachedGuestLimit());
    });
    return () => unsubscribe();
  }, []);

  const completedQuestsCount = quests.filter((q) => q.completed).length;
  const totalQuestsCount = quests.length || 3;
  const hasUnclaimedQuests = quests.some((q) => q.completed && !q.claimed);
  const questsProgressPercent = Math.round((completedQuestsCount / totalQuestsCount) * 100);

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
        {/* 🎖️ RESUMEN COMPACTO DEL GRADO MILITAR (Acceso Directo a Perfil) */}
        <div className="flex items-center justify-between gap-3 mb-4 bg-amber-50/70 dark:bg-slate-900/80 px-3.5 py-2.5 rounded-2xl border border-amber-200/80 dark:border-slate-800 shadow-xs">
          <Link
            href="/profile"
            className="flex items-center gap-2.5 text-xs font-black text-[#6B4423] dark:text-white hover:text-amber-600 dark:hover:text-amber-400 transition-colors group"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-sm shadow-xs shrink-0 border border-white dark:border-slate-700">
              {getUserRankBadge(user?.xp || 0)}
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2">
              <span className="truncate max-w-[140px] sm:max-w-none font-black text-sm">
                {user ? user.name || user.email : "Cadete"}
              </span>
              <div className="flex items-center gap-1.5">
                <span className="px-1.5 py-0.2 rounded bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 text-[10px] font-black uppercase tracking-wider">
                  {rankInfo.currentRank.abbr}
                </span>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-bold">
                  {user?.xp || 0} XP
                </span>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-500 group-hover:translate-x-0.5 transition-transform shrink-0" />
          </Link>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setQuestsModalOpen(true)}
              className="px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 dark:bg-amber-950/70 dark:hover:bg-amber-900 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 rounded-xl text-[11px] font-black transition-all shadow-xs flex items-center gap-1.5"
              title="Misiones de Hoy"
            >
              <span>🎯 Misiones</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-300 dark:bg-amber-800 text-amber-950 dark:text-amber-100 text-[10px] font-black">
                {completedQuestsCount}/{totalQuestsCount}
              </span>
              {hasUnclaimedQuests && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>

            <Link
              href="/profile"
              className="px-3 py-1.5 bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-slate-700 border border-[#E5D5C5] dark:border-slate-700 text-[#6B4423] dark:text-slate-200 rounded-xl text-[11px] font-black transition-all shadow-xs flex items-center gap-1"
            >
              <span>Ver Mi Perfil & Base</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>

        {/* 🐾 HERO CON FOTO CIRCULAR DE CONAN */}
        <section className="flex flex-col sm:flex-row items-center justify-center gap-4 my-4 p-4 sm:p-5 text-center sm:text-left bg-gradient-to-r from-[#FAF6F0] via-amber-50/40 to-white dark:from-slate-900 dark:via-slate-900/60 dark:to-slate-950 rounded-3xl border-2 border-[#E5D5C5] dark:border-slate-800 shadow-conan-card">
          {/* Foto de Conan en forma de círculo pequeña */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-amber-400 dark:border-amber-500 bg-white dark:bg-slate-800 shadow-lg overflow-hidden flex items-center justify-center shrink-0 p-1">
            <ConanMascot size="sm" mood="happy" animate={true} />
          </div>

          <div className="flex-1">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#FEF3C7] dark:bg-amber-950/60 border border-[#FDE68A] dark:border-amber-700 text-[#92400E] dark:text-amber-200 text-[10px] font-black uppercase tracking-wider mb-1">
              <Sparkles className="w-3 h-3 text-[#F59E0B]" />
              ALCPT • Entrenamiento Táctico
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-[#6B4423] dark:text-white tracking-tight">
              ¡Entrena y domina el examen con{" "}
              <span className="text-amber-500">{user ? getUserMascotName(user) : "Conan"}</span>! 🐾
            </h1>
            <p className="text-xs sm:text-sm text-[#A67B5B] dark:text-slate-400 font-semibold max-w-xl mt-0.5">
              Lecciones rápidas y aleatorias. Pasa el cursor sobre cualquier frase para ver la traducción contextual de la oración completa.
            </p>
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

        {/* ⚡ LAS 6 CASILLAS RECTANGULARES: LECCIONES RÁPIDAS Y ALEATORIAS */}
        <section className="mb-8">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-wider shadow-xs">
              <Zap className="w-3.5 h-3.5 text-[#F59E0B] fill-amber-500" />
              <span>Quizzes Tácticos • Acceso Directo</span>
            </div>
            <span className="text-[11px] text-[#A67B5B] dark:text-slate-400 font-bold hidden sm:inline">
              Traducción contextual al posar el cursor (excepto modo real)
            </span>
          </div>

          {/* Grid de 6 Casillas en formato Tarjetas ConanGo */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* 1. quiz 10 preguntas listening */}
            <Link
              href="/practice?size=10&type=listening&formula=random"
              className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-slate-900 dark:to-slate-800 border-2 border-blue-200 dark:border-blue-800 hover:border-blue-400 p-4 rounded-3xl text-left shadow-xs transition-all active:scale-95 group flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-lg shadow-xs mb-2 group-hover:scale-110 transition-transform">
                  🎧
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-blue-900 dark:text-blue-400 block mb-0.5">
                  Audio Express
                </span>
                <span className="text-sm sm:text-base font-black text-[#6B4423] dark:text-white leading-tight block">
                  quiz 10 preguntas listening
                </span>
              </div>
            </Link>

            {/* 2. quiz de 10 preguntas Reading */}
            <Link
              href="/practice?size=10&type=reading&formula=random"
              className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-slate-900 dark:to-slate-800 border-2 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 p-4 rounded-3xl text-left shadow-xs transition-all active:scale-95 group flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-lg shadow-xs mb-2 group-hover:scale-110 transition-transform">
                  📖
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-900 dark:text-emerald-400 block mb-0.5">
                  Lectura Express
                </span>
                <span className="text-sm sm:text-base font-black text-[#6B4423] dark:text-white leading-tight block">
                  quiz de 10 preguntas Reading
                </span>
              </div>
            </Link>

            {/* 3. quiz solo listening */}
            <Link
              href="/practice?type=listening&size=30&formula=random"
              className="bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-slate-900 dark:to-slate-800 border-2 border-cyan-200 dark:border-cyan-800 hover:border-cyan-400 p-4 rounded-3xl text-left shadow-xs transition-all active:scale-95 group flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-2xl bg-cyan-600 text-white flex items-center justify-center text-lg shadow-xs mb-2 group-hover:scale-110 transition-transform">
                  ⚡
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-cyan-900 dark:text-cyan-400 block mb-0.5">
                  Solo Audio
                </span>
                <span className="text-sm sm:text-base font-black text-[#6B4423] dark:text-white leading-tight block">
                  quiz solo listening
                </span>
              </div>
            </Link>

            {/* 4. quiz solo reading */}
            <Link
              href="/practice?type=reading&size=30&formula=random"
              className="bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 border-2 border-teal-200 dark:border-teal-800 hover:border-teal-400 p-4 rounded-3xl text-left shadow-xs transition-all active:scale-95 group flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-2xl bg-teal-600 text-white flex items-center justify-center text-lg shadow-xs mb-2 group-hover:scale-110 transition-transform">
                  📚
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-teal-900 dark:text-teal-400 block mb-0.5">
                  Solo Lectura
                </span>
                <span className="text-sm sm:text-base font-black text-[#6B4423] dark:text-white leading-tight block">
                  quiz solo reading
                </span>
              </div>
            </Link>

            {/* 5. quiz completo con ayuda */}
            <Link
              href="/practice?size=100&formula=random&mode=assisted"
              className="bg-gradient-to-br from-amber-50 to-yellow-100 dark:from-slate-900 dark:to-slate-800 border-2 border-amber-300 dark:border-amber-800 hover:border-amber-500 p-4 rounded-3xl text-left shadow-xs transition-all active:scale-95 group flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-2xl bg-[#F59E0B] text-white flex items-center justify-center text-lg shadow-xs mb-2 group-hover:scale-110 transition-transform">
                  💡
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-amber-950 dark:text-amber-400 block mb-0.5">
                  100 Reactivos
                </span>
                <span className="text-sm sm:text-base font-black text-[#6B4423] dark:text-white leading-tight block">
                  quiz completo con ayuda
                </span>
              </div>
            </Link>

            {/* 6. quiz completo real */}
            <Link
              href="/practice?size=100&formula=random&mode=real"
              className="bg-gradient-to-br from-rose-50 to-red-100 dark:from-slate-900 dark:to-slate-800 border-2 border-rose-300 dark:border-rose-800 hover:border-rose-500 p-4 rounded-3xl text-left shadow-xs transition-all active:scale-95 group flex flex-col justify-between"
            >
              <div>
                <div className="w-9 h-9 rounded-2xl bg-rose-600 text-white flex items-center justify-center text-lg shadow-xs mb-2 group-hover:scale-110 transition-transform">
                  🎯
                </div>
                <span className="text-[10px] font-black uppercase tracking-wider text-rose-950 dark:text-rose-400 block mb-0.5">
                  Simulacro Real
                </span>
                <span className="text-sm sm:text-base font-black text-[#6B4423] dark:text-white leading-tight block">
                  quiz completo real
                </span>
              </div>
            </Link>
          </div>
        </section>

        {/* 📚 SECCIÓN INFERIOR: PRÁCTICA ESTRUCTURADA CON SELECTOR DE PREGUNTAS Y FÓRMULAS */}
        <section className="mb-10">
          <div className="mb-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-black uppercase tracking-wider mb-1.5 shadow-xs">
              <ListOrdered className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Entrenamiento Estructurado</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#6B4423] dark:text-white tracking-tight">
              Configura tu Cuadernillo & Habilidad
            </h2>
            <p className="text-xs sm:text-sm text-[#A67B5B] dark:text-slate-400 font-semibold">
              Personaliza la cantidad exacta de preguntas y la fórmula oficial que deseas practicar (1 al 100).
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            {/* 1. Comprensión Auditiva (Listening) Personalizable */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border-2 border-[#E5D5C5] dark:border-slate-800 shadow-conan-card flex flex-col justify-between hover:border-blue-500 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs">
                    <Volume2 className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    6,000 Reactivos
                  </span>
                </div>
                <h3 className="text-lg font-black text-[#6B4423] dark:text-white mb-1">
                  1. Listening Personalizado
                </h3>
                <p className="text-xs text-[#A67B5B] dark:text-slate-400 font-medium mb-4">
                  Elige cuántas preguntas resolver y qué fórmula escuchar.
                </p>

                {/* Selector de Cantidad */}
                <div className="mb-3">
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 block mb-1.5">
                    Cantidad de preguntas:
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[10, 20, 30, 60].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setListenSize(sz)}
                        className={`py-1.5 rounded-xl text-xs font-black transition-all border ${
                          listenSize === sz
                            ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selector de Fórmula */}
                <div className="mb-4">
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 block mb-1.5">
                    Fórmula ALCPT:
                  </label>
                  <select
                    value={listenFormula}
                    onChange={(e) => setListenFormula(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100"
                  >
                    <option value="random">🔀 Fórmula Aleatoria</option>
                    {Array.from({ length: 100 }, (_, i) => i + 1).map((f) => (
                      <option key={f} value={f}>
                        Fórmula {f} {f <= 8 ? "(Gratis)" : "(PRO)"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Link
                href={`/practice?type=listening&size=${listenSize}&formula=${listenFormula}`}
                className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Iniciar Listening ({listenSize} Preguntas)</span>
              </Link>
            </div>

            {/* 2. Lectura y Gramática (Reading) Personalizable */}
            <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border-2 border-[#E5D5C5] dark:border-slate-800 shadow-conan-card flex flex-col justify-between hover:border-emerald-500 transition-all">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shadow-xs">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    4,000 Reactivos
                  </span>
                </div>
                <h3 className="text-lg font-black text-[#6B4423] dark:text-white mb-1">
                  2. Reading Personalizado
                </h3>
                <p className="text-xs text-[#A67B5B] dark:text-slate-400 font-medium mb-4">
                  Elige cuántas preguntas resolver y qué fórmula leer.
                </p>

                {/* Selector de Cantidad */}
                <div className="mb-3">
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 block mb-1.5">
                    Cantidad de preguntas:
                  </label>
                  <div className="grid grid-cols-4 gap-1.5">
                    {[10, 20, 30, 40].map((sz) => (
                      <button
                        key={sz}
                        type="button"
                        onClick={() => setReadingSize(sz)}
                        className={`py-1.5 rounded-xl text-xs font-black transition-all border ${
                          readingSize === sz
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                            : "bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100"
                        }`}
                      >
                        {sz}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Selector de Fórmula */}
                <div className="mb-4">
                  <label className="text-[11px] font-black uppercase text-slate-500 dark:text-slate-400 block mb-1.5">
                    Fórmula ALCPT:
                  </label>
                  <select
                    value={readingFormula}
                    onChange={(e) => setReadingFormula(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold text-slate-800 dark:text-slate-100"
                  >
                    <option value="random">🔀 Fórmula Aleatoria</option>
                    {Array.from({ length: 100 }, (_, i) => i + 1).map((f) => (
                      <option key={f} value={f}>
                        Fórmula {f} {f <= 8 ? "(Gratis)" : "(PRO)"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Link
                href={`/practice?type=reading&size=${readingSize}&formula=${readingFormula}`}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-transform active:scale-95"
              >
                <Play className="w-3.5 h-3.5 fill-white" />
                <span>Iniciar Reading ({readingSize} Preguntas)</span>
              </Link>
            </div>
          </div>

          {/* Cuadernillos Oficiales (1 al 100) */}
          <div className="bg-gradient-to-r from-amber-50 via-yellow-50/50 to-white dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-2 border-amber-300 dark:border-amber-700/80 p-4 sm:p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-conan-card">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-2xl shadow-xs shrink-0">
                📋
              </div>
              <div>
                <h4 className="text-base font-black text-[#6B4423] dark:text-white">
                  Catálogo Oficial de 100 Fórmulas ALCPT
                </h4>
                <p className="text-xs text-[#A67B5B] dark:text-slate-400 font-semibold mt-0.5">
                  Explora las 100 formas completas (10,000 preguntas). Formas 1 al 8 gratis para todos los cadetes.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setFormulaModalOpen(true)}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl text-xs shadow-conan-btn transition-transform active:scale-95 shrink-0 flex items-center gap-1.5"
            >
              <ListOrdered className="w-4 h-4" />
              <span>Abrir Selector de Fórmulas (1-100)</span>
            </button>
          </div>
        </section>

          {/* DUAL VOCABULARY SUITE: BIBLIOTECA + JUEGO DE CARTAS */}
        <section className="mb-10">
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
