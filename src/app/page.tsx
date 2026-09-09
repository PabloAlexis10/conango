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
  Mic,
  ArrowRight,
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
import ConanFreakFacts from "@/components/ConanFreakFacts";
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

    // Detección automática al retornar de pagar con Webpay / Mercado Pago
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
          } catch {
            // ignore confetti errors
          }
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

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-[#6B4423] dark:text-slate-100 transition-colors">
      {/* Top Header */}
      <Header medals={user?.medals ?? 10} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 md:py-10">
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-8 mb-8 bg-gradient-to-b from-[#FAF6F0] to-white dark:from-slate-900 dark:to-slate-950 p-6 sm:p-10 rounded-3xl border-2 border-[#E5D5C5] dark:border-slate-800 shadow-conan-card relative overflow-hidden">
          <div className="flex-1 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF3C7] dark:bg-amber-950/60 border border-[#FDE68A] dark:border-amber-700 text-[#92400E] dark:text-amber-200 text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              A.L.C.P.T. • Adiestramiento Lingüístico con Conan, Perro Táctico 🇺🇸
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-[#6B4423] dark:text-white tracking-tight leading-tight mb-4">
              ¡Entrena y domina el examen con{" "}
              <span className="text-[#F59E0B]">Conan</span>!
            </h1>

            <p className="text-base sm:text-lg text-[#A67B5B] dark:text-slate-300 font-medium max-w-xl leading-relaxed mb-6">
              Plataforma de preparación para <strong className="text-[#6B4423] dark:text-amber-400">A.L.C.P.T.</strong> (Adiestramiento Lingüístico con Conan, Perro Táctico) &bull; Inglés 🇺🇸. Rinde el examen completo de 100 preguntas, escoge tu fórmula o practica vocabulario interactivo con voz y cartas.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs font-bold">
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-[#E5D5C5] dark:border-slate-800 shadow-sm text-[#6B4423] dark:text-slate-200">
                <Clock className="w-4 h-4 text-[#F59E0B]" />
                <span>Examen 60 Min</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 px-3 py-1.5 rounded-xl border border-[#E5D5C5] dark:border-slate-800 shadow-sm text-[#6B4423] dark:text-slate-200">
                <ShieldCheck className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span>60L + 40R</span>
              </div>
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 bg-[#FEF3C7] dark:bg-amber-950/60 text-[#92400E] dark:text-amber-200 px-3 py-1.5 rounded-xl border border-[#FDE68A] dark:border-amber-700 hover:bg-[#FDE68A] transition-colors shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedLink ? "¡Link Copiado!" : "Compartir Link"}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center flex-shrink-0 z-10">
            <ConanMascot size="hero" mood="happy" animate={true} />
            <div className="mt-3 text-center">
              <span className="text-xs font-black uppercase tracking-widest text-[#6B4423] dark:text-white block">
                {user ? getUserMascotName(user) : "Conan"}
              </span>
              <span className="text-[11px] font-bold text-[#A67B5B] dark:text-slate-400">
                Compañero Táctico 🐾
              </span>
            </div>
          </div>
        </section>

        {/* 🎖️ WIDGET PERMANENTE: RANGO USAF ACTUAL Y PROGRESIÓN DE ASCENSO */}
        <section className="mb-8 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-slate-900/40 dark:to-slate-900 border-2 border-amber-300/80 dark:border-amber-700/60 rounded-3xl p-5 sm:p-6 shadow-conan-card relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
            {/* Rank info */}
            <div className="flex items-start sm:items-center gap-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center text-2xl sm:text-3xl shadow-md flex-shrink-0 border-2 border-white dark:border-slate-800">
                {getUserRankBadge(user?.xp || 0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm font-black text-[#6B4423] dark:text-white">
                    {user ? (user.name || user.email) : "Invitado"}
                  </span>
                  <span className="px-2 py-0.5 rounded-md bg-amber-200 dark:bg-amber-900/60 text-amber-950 dark:text-amber-200 text-[11px] font-black uppercase tracking-wider">
                    {getRankByXp(user?.xp || 0).currentRank.abbr}
                  </span>
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                    🐾 <strong className="text-amber-700 dark:text-amber-300">{getUserMascotName(user)}</strong>
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-[#6B4423] dark:text-white mt-1">
                  {getUserRankTitle(user?.xp || 0)}
                </h3>
                {getRankByXp(user?.xp || 0).nextRank && (
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mt-0.5">
                    Siguiente grado: <span className="font-black">{getRankByXp(user?.xp || 0).nextRank?.name}</span> ({getRankByXp(user?.xp || 0).nextRank?.abbr})
                  </p>
                )}
                <p className="text-xs text-[#A67B5B] dark:text-slate-400 font-medium mt-1">
                  {getRankByXp(user?.xp || 0).currentRank.desc}
                </p>
              </div>
            </div>

            {/* Link to profile/edit */}
            <div className="flex items-center gap-2 flex-shrink-0">
              {user ? (
                <Link
                  href="/profile"
                  className="px-4 py-2 bg-white dark:bg-slate-800 hover:bg-[#FAF6F0] dark:hover:bg-slate-700 border border-[#E5D5C5] dark:border-slate-700 text-[#6B4423] dark:text-slate-200 rounded-xl text-xs font-bold transition-all shadow-xs flex items-center gap-1.5"
                >
                  <span>Base & Personalizar</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl text-xs font-black transition-all shadow-xs"
                >
                  Registrar mi Cuenta & Mascota
                </button>
              )}
            </div>
          </div>

          {/* Progress Bar & Missing XP */}
          <div className="mt-4 pt-4 border-t border-amber-200/60 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs font-bold mb-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[#6B4423] dark:text-white">
                  Progreso de Ascenso:
                </span>
                <span className="text-amber-600 dark:text-amber-400 font-black">
                  {getRankByXp(user?.xp || 0).progress}%
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  ({user?.xp || 0} XP acumulados)
                </span>
              </div>
              <div className="text-xs font-black text-amber-800 dark:text-amber-300">
                {getRankByXp(user?.xp || 0).nextRank ? (
                  <span>
                    Faltan <span className="underline decoration-amber-500 font-black">{Math.max(0, (getRankByXp(user?.xp || 0).nextRank?.minXp || 0) - (user?.xp || 0))} XP</span> para ascender a {getRankByXp(user?.xp || 0).nextRank?.name} ({getRankByXp(user?.xp || 0).nextRank?.abbr})
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400">
                    🎖️ ¡Has alcanzado el Grado Supremo de General de la USAF!
                  </span>
                )}
              </div>
            </div>

            <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-3 p-0.5 overflow-hidden shadow-inner">
              <div
                className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.max(4, getRankByXp(user?.xp || 0).progress)}%` }}
              />
            </div>
          </div>
        </section>

        {/* GUEST USAGE BANNER (IF APPLICABLE) */}
        {!user && (
          <div className="mb-8">
            {guestLimitHit ? (
              <div className="bg-amber-50 dark:bg-amber-950/40 border-2 border-amber-300 dark:border-amber-700 rounded-3xl p-5 sm:p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-black text-xl flex-shrink-0 shadow-sm">
                    🔒
                  </div>
                  <div>
                    <h3 className="text-base font-black text-amber-950 dark:text-amber-200">
                      Límite de prueba alcanzado ({guestUsage} de {GUEST_LIMIT} lecciones)
                    </h3>
                    <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold mt-0.5">
                      Has completado tus 2 lecciones gratuitas de prueba. Inicia sesión o crea tu cuenta gratis para acceder a las 100 fórmulas y vocabulario completo.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black text-xs rounded-xl shadow-conan-btn transition-transform active:scale-95 flex-shrink-0"
                >
                  Iniciar Sesión / Crear Cuenta
                </button>
              </div>
            ) : guestUsage > 0 ? (
              <div className="bg-[#FAF6F0] dark:bg-slate-900 border border-[#E5D5C5] dark:border-slate-800 rounded-2xl p-4 shadow-xs flex items-center justify-between gap-3 text-xs font-bold text-[#6B4423] dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] animate-pulse" />
                  <span>Modo Invitado: Has completado {guestUsage} de {GUEST_LIMIT} lecciones de prueba gratuitas.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setAuthModalOpen(true)}
                  className="text-xs font-black text-[#F59E0B] hover:underline flex-shrink-0"
                >
                  Crear cuenta gratis &rarr;
                </button>
              </div>
            ) : null}
          </div>
        )}

        {/* 🚀 TOP SECTION: LOS TRES MODOS PRINCIPALES DE ESTUDIO (DE LOS PRIMEROS) */}
        <section className="mb-10">
          <div className="mb-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-2 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Entrenamiento Inmediato</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#6B4423] dark:text-white tracking-tight">
              Modos Principales de Estudio
            </h2>
            <p className="text-xs sm:text-sm text-[#A67B5B] dark:text-slate-400 font-semibold mt-0.5">
              Empieza a estudiar de inmediato: simulacro oficial completo, audios de voz o cartas de vocabulario.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            {/* MODO 1: EXAMEN ALCPT OFICIAL (100 PREGUNTAS) */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-[#F59E0B] shadow-conan-card flex flex-col justify-between relative overflow-hidden group hover:border-[#D97706] transition-all">
              <div className="absolute top-0 right-0 bg-[#F59E0B] text-white px-3 py-1 rounded-bl-2xl font-black text-[11px] uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Trophy className="w-3 h-3" />
                Oficial ALCPT
              </div>

              <div>
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#F59E0B] to-[#FBBF24] flex items-center justify-center text-white shadow-md mb-4 group-hover:scale-105 transition-transform">
                  <Shuffle className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-black text-[#6B4423] dark:text-white mb-2">
                  1. Examen ALCPT (100 Preguntas)
                </h3>

                <p className="text-xs text-[#A67B5B] dark:text-slate-400 leading-relaxed mb-5 font-medium">
                  Simulación estandarizada oficial de <strong className="text-[#6B4423] dark:text-amber-400">60 Listening</strong> + <strong className="text-[#6B4423] dark:text-amber-400">40 Reading</strong> con temporizador de 60 min. Rinde al azar o elige cuadernillo del 1 al 100.
                </p>

                <div className="space-y-1.5 mb-5 text-[11px] font-bold text-[#6B4423] dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Fórmula aleatoria o cuadernillos 1 al 100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    <span>Diagnóstico de porcentaje oficial USAF</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Link
                  href="/practice?size=100&formula=random"
                  className="w-full py-3 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black rounded-xl shadow-conan-btn flex items-center justify-center gap-2 text-xs sm:text-sm transition-transform active:translate-y-0.5"
                >
                  <Play className="w-3.5 h-3.5 fill-white" />
                  <span>Rendir Examen Aleatorio</span>
                </Link>

                <button
                  type="button"
                  onClick={() => setFormulaModalOpen(true)}
                  className="w-full py-2.5 bg-[#FAF6F0] dark:bg-slate-800 hover:bg-[#F5EFEB] dark:hover:bg-slate-700 text-[#6B4423] dark:text-slate-200 font-bold rounded-xl border border-[#E5D5C5] dark:border-slate-700 flex items-center justify-center gap-1.5 text-xs transition-colors"
                >
                  <ListOrdered className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Elegir Fórmula Específica (1-100)</span>
                </button>
              </div>
            </div>

            {/* MODO 2: ENTRENAMIENTO DE PRONUNCIACIÓN & LISTENING */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-[#E5D5C5] dark:border-slate-800 shadow-conan-card flex flex-col justify-between relative overflow-hidden group hover:border-[#F59E0B] transition-all">
              <div className="absolute top-0 right-0 bg-blue-600 text-white px-3 py-1 rounded-bl-2xl font-black text-[11px] uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Mic className="w-3 h-3" />
                Voz Táctica
              </div>

              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center shadow-xs mb-4 group-hover:scale-105 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-black text-[#6B4423] dark:text-white mb-2">
                  2. Pronunciación & Listening
                </h3>

                <p className="text-xs text-[#A67B5B] dark:text-slate-400 leading-relaxed mb-5 font-medium">
                  Escucha el vocabulario clave con audio en inglés americano nativo 🇺🇸 y habla por el micrófono para evaluar tu precisión auditiva y fonética al instante.
                </p>

                <div className="space-y-1.5 mb-5 text-[11px] font-bold text-[#6B4423] dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Detección por voz en tiempo real</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Audio con pronunciación americana nativa</span>
                  </div>
                </div>
              </div>

              <Link
                href="/vocabulary/definitions"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-xl shadow-conan-btn flex items-center justify-center gap-2 text-xs sm:text-sm transition-transform active:translate-y-0.5"
              >
                <span>Entrenar Pronunciación</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* MODO 3: JUEGO DE EMPAREJAR CARTAS EN DOS COLUMNAS */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border-2 border-[#E5D5C5] dark:border-slate-800 shadow-conan-card flex flex-col justify-between relative overflow-hidden group hover:border-[#F59E0B] transition-all">
              <div className="absolute top-0 right-0 bg-indigo-600 text-white px-3 py-1 rounded-bl-2xl font-black text-[11px] uppercase tracking-wider shadow-sm flex items-center gap-1">
                <Layers className="w-3 h-3" />
                Columnas
              </div>

              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-xs mb-4 group-hover:scale-105 transition-transform">
                  <Layers className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-black text-[#6B4423] dark:text-white mb-2">
                  3. Emparejar en Dos Columnas
                </h3>

                <p className="text-xs text-[#A67B5B] dark:text-slate-400 leading-relaxed mb-5 font-medium">
                  Empareja palabras en español (izquierda) con su significado en inglés (derecha). Al armar los pares se eliminan continuamente en una cascada dinámica.
                </p>

                <div className="space-y-1.5 mb-5 text-[11px] font-bold text-[#6B4423] dark:text-slate-300">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-indigo-500" />
                    <span>Eliminación continua de cartas emparejadas</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    <span>Modismos y vocabulario militar frecuente</span>
                  </div>
                </div>
              </div>

              <Link
                href="/vocabulary/matching"
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-conan-btn flex items-center justify-center gap-2 text-xs sm:text-sm transition-transform active:translate-y-0.5"
              >
                <span>Jugar Columnas de Cartas</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
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
                <div className="w-10 h-10 rounded-2xl bg-orange-500 text-white flex items-center justify-center text-xl shadow-xs mb-2 group-hover:scale-110 transition-transform">
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
                <div className="w-10 h-10 rounded-2xl bg-[#F59E0B] text-white flex items-center justify-center text-xl shadow-xs mb-2 group-hover:scale-110 transition-transform">
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
              <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-xl shadow-xs mb-2 group-hover:scale-110 transition-transform">
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
              <div className="w-10 h-10 rounded-2xl bg-purple-600 text-white flex items-center justify-center text-xl shadow-xs mb-2 group-hover:scale-110 transition-transform">
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
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white flex items-center justify-center text-xl shadow-xs mb-2 group-hover:scale-110 transition-transform">
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
              <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-lg shadow-xs mb-2 group-hover:scale-110 transition-transform">
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

        {/* VENTANA DE DATOS FREAK & TIPS (13 SEGUNDOS) */}
        <ConanFreakFacts />

        <AdBanner className="mb-8" />

        {/* ÚNICA SECCIÓN DE INSTALACIÓN EN EL DISPOSITIVO */}
        <section className="mb-10 bg-gradient-to-r from-blue-900 via-indigo-900 to-blue-950 text-white rounded-3xl p-6 sm:p-8 shadow-conan-card flex flex-col sm:flex-row items-center justify-between gap-6 border-2 border-blue-700/40">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-blue-300 shrink-0 shadow-inner">
              <Smartphone className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[11px] font-black uppercase tracking-wider mb-1">
                Android &bull; iPhone &bull; Sin Descargas Pesadas
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-white">
                Instala ConanGo en tu Teléfono
              </h3>
              <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-xl font-medium">
                Acceso directo desde tu pantalla de inicio como aplicación nativa. Funciona a pantalla completa, reproduce audios nativos y guarda tu progreso.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleOpenInstall}
            className="w-full sm:w-auto px-6 py-3.5 bg-white text-blue-900 hover:bg-blue-50 font-black rounded-2xl shadow-lg flex items-center justify-center gap-2 text-sm shrink-0 transition-transform active:scale-95"
          >
            <Download className="w-4 h-4 text-blue-700" />
            <span>Instalar en Celular</span>
          </button>
        </section>

        {/* EDUCATIONAL BANNER: DOCTRINA A.L.C.P.T. */}
        <section className="bg-[#FAF6F0] dark:bg-slate-900 rounded-3xl border-2 border-[#E5D5C5] dark:border-slate-800 p-6 sm:p-8 mb-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-950/60 rounded-2xl text-[#F59E0B] flex-shrink-0">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-[#6B4423] dark:text-white mb-1">
                ¿Qué significa A.L.C.P.T. en ConanGo?
              </h4>
              <p className="text-xs sm:text-sm text-[#A67B5B] dark:text-slate-300 leading-relaxed font-medium">
                En ConanGo, las siglas <strong className="text-[#6B4423] dark:text-amber-400">A.L.C.P.T.</strong> corresponden a: <strong className="text-[#92400E] dark:text-amber-300">&ldquo;Adiestramiento Lingüístico con Conan, Perro Táctico&rdquo;</strong>. Es un entorno de simulación educativa enfocado en inglés 🇺🇸, estructurado en cuadernillos correlativos de 100 reactivos (60 de comprensión auditiva y 40 de gramática y lectura).
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* PRO Modal */}
      <ProSubscriptionModal
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
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

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />

      {/* Formula Selector Modal */}
      <FormulaModal
        isOpen={formulaModalOpen}
        onClose={() => setFormulaModalOpen(false)}
      />

      {/* Footer with Dedication to Conan */}
      <footer className="border-t border-[#E5D5C5] dark:border-slate-800 py-8 px-4 text-center text-xs text-[#A67B5B] dark:text-slate-400 bg-[#FAF6F0] dark:bg-slate-900 space-y-3 transition-colors">
        <p className="font-black text-[#6B4423] dark:text-slate-200">
          ConanGo &copy; {new Date().getFullYear()} &bull; A.L.C.P.T. (Adiestramiento Lingüístico con Conan, Perro Táctico) &bull; Inglés 🇺🇸
        </p>
        <div className="max-w-2xl mx-auto p-3.5 bg-white dark:bg-slate-950 rounded-2xl border border-[#E5D5C5] dark:border-slate-800 shadow-xs text-xs text-[#8C6B4B] dark:text-slate-300 leading-relaxed">
          🐾 <strong>Dedicatoria de Honor:</strong> Dedicado con eterno amor, respeto y honor a nuestro querido camarada el <strong>Perro Conan</strong>, el compañero más fiel, noble y valiente de todas nuestras misiones. ¡Tu lealtad y temple viven en cada uno de nosotros!
        </div>
      </footer>
    </div>
  );
}
