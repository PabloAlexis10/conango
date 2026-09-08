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
  Layers
} from "lucide-react";
import { getCurrentUser, subscribeAuth } from "@/lib/supabase";
import { UserProfile } from "@/lib/types";

export default function HomePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formulaModalOpen, setFormulaModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    const unsubscribe = subscribeAuth((updatedUser) => {
      setUser(updatedUser);
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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Header */}
      <Header medals={user?.medals ?? 10} />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Hero Section */}
        <section className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10 bg-gradient-to-b from-[#FAF6F0] to-white p-6 sm:p-10 rounded-3xl border-2 border-[#E5D5C5] shadow-conan-card relative overflow-hidden">
          <div className="flex-1 text-center md:text-left z-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF3C7] border border-[#FDE68A] text-[#92400E] text-xs font-black uppercase tracking-wider mb-4 shadow-sm">
              <Sparkles className="w-4 h-4 text-[#F59E0B]" />
              A.L.C.P.T. • Adiestramiento Lingüístico con Conan, Perro Táctico 🇺🇸
            </div>

            <h1 className="text-3xl sm:text-5xl font-black text-[#6B4423] tracking-tight leading-tight mb-4">
              ¡Entrena y domina el examen con{" "}
              <span className="text-[#F59E0B]">Conan</span>!
            </h1>

            <p className="text-base sm:text-lg text-[#A67B5B] font-medium max-w-xl leading-relaxed mb-6">
              Plataforma de preparación para <strong className="text-[#6B4423]">A.L.C.P.T.</strong> (Adiestramiento Lingüístico con Conan, Perro Táctico). Inglés Estadounidense 🇺🇸. Rinde el examen completo de 100 preguntas, escoge tu fórmula o practica vocabulario interactivo con voz y cartas.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5 text-xs font-bold text-[#6B4423]">
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#E5D5C5] shadow-sm">
                <Clock className="w-4 h-4 text-[#F59E0B]" />
                <span>Examen 60 Min</span>
              </div>
              <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-xl border border-[#E5D5C5] shadow-sm">
                <ShieldCheck className="w-4 h-4 text-green-600" />
                <span>60L + 40R</span>
              </div>
              <button
                type="button"
                onClick={handleOpenInstall}
                className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white px-3.5 py-1.5 rounded-xl shadow-sm transition-transform active:scale-95"
              >
                <Smartphone className="w-4 h-4" />
                <span>Instalar en Celular</span>
              </button>
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-1.5 bg-[#FEF3C7] text-[#92400E] px-3 py-1.5 rounded-xl border border-[#FDE68A] hover:bg-[#FDE68A] transition-colors shadow-sm"
              >
                <Share2 className="w-4 h-4" />
                <span>{copiedLink ? "¡Link Copiado!" : "Compartir Link"}</span>
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center flex-shrink-0 z-10">
            <ConanMascot size="hero" mood="happy" animate={true} />
            <div className="mt-3 text-center">
              <span className="text-xs font-black uppercase tracking-widest text-[#6B4423] block">
                Conan
              </span>
              <span className="text-[11px] font-bold text-[#A67B5B]">
                Compañero Táctico Supremo 🐾
              </span>
            </div>
          </div>
        </section>

        {/* CORE SECTION: EVALUACIONES OFICIALES */}
        <section className="mb-10">
          <div className="text-center mb-6">
            <h2 className="text-2xl sm:text-3xl font-black text-[#6B4423] tracking-tight">
              Modalidades de Evaluación
            </h2>
            <p className="text-xs sm:text-sm text-[#A67B5B] font-semibold mt-1">
              Rinde el examen completo al azar o escoge la fórmula que necesitas reforzar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OPTION 1: EXAMEN FINAL CON FÓRMULA ALEATORIA */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#F59E0B] shadow-conan-card flex flex-col justify-between relative overflow-hidden group hover:border-[#D97706] transition-all">
              <div className="absolute top-0 right-0 bg-[#F59E0B] text-white px-4 py-1.5 rounded-bl-2xl font-black text-xs uppercase tracking-wider shadow-sm flex items-center gap-1.5">
                <Shuffle className="w-3.5 h-3.5" />
                Fórmula Aleatoria
              </div>

              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#F59E0B] to-[#FBBF24] flex items-center justify-center text-white shadow-md mb-5">
                  <Shuffle className="w-7 h-7" />
                </div>

                <h3 className="text-2xl font-black text-[#6B4423] mb-2">
                  Examen Final Aleatorio
                </h3>

                <p className="text-xs sm:text-sm text-[#A67B5B] leading-relaxed mb-6 font-medium">
                  El sistema selecciona automáticamente una fórmula al azar del banco oficial.
                  Consta de <strong className="text-[#6B4423]">100 preguntas</strong> divididas en{" "}
                  <strong className="text-[#6B4423]">60 de Listening</strong> (audio en inglés estadounidense 🇺🇸) y{" "}
                  <strong className="text-[#6B4423]">40 de Reading</strong> (gramática y vocabulario), con{" "}
                  <strong className="text-[#6B4423]">temporizador de 60 minutos</strong>.
                </p>

                <div className="space-y-2 mb-6 text-xs font-bold text-[#6B4423]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                    <span>Fórmula asignada al azar en cada intento</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    <span>Diagnóstico de porcentaje oficial</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-red-500" />
                    <span>Revisión detallada de fallos con explicaciones</span>
                  </div>
                </div>
              </div>

              <Link
                href="/practice?size=100&formula=random"
                className="w-full py-4 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black rounded-2xl shadow-conan-btn flex items-center justify-center gap-2 text-base transition-transform active:translate-y-1 group-hover:shadow-lg"
              >
                <span>Rendir Examen Aleatorio</span>
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>

            {/* OPTION 2: ESCOGER LA FÓRMULA ESPECÍFICA */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border-2 border-[#E5D5C5] shadow-conan-card flex flex-col justify-between relative overflow-hidden group hover:border-[#A67B5B] transition-all">
              <div className="absolute top-0 right-0 bg-[#FAF6F0] text-[#6B4423] border-b border-l border-[#E5D5C5] px-4 py-1.5 rounded-bl-2xl font-black text-xs uppercase tracking-wider flex items-center gap-1.5">
                <ListOrdered className="w-3.5 h-3.5 text-[#F59E0B]" />
                Cuadernillos 1 al 100
              </div>

              <div>
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#6B4423] to-[#A67B5B] flex items-center justify-center text-white shadow-md mb-5">
                  <ListOrdered className="w-7 h-7" />
                </div>

                <h3 className="text-2xl font-black text-[#6B4423] mb-2">
                  Escoger la Fórmula
                </h3>

                <p className="text-xs sm:text-sm text-[#A67B5B] leading-relaxed mb-6 font-medium">
                  Elige explícitamente el cuadernillo que deseas practicar (ej: <strong className="text-[#6B4423]">Fórmula 1</strong>, <strong className="text-[#6B4423]">Fórmula 2</strong>, etc.).
                  Podrás realizar el examen completo de 100 preguntas o quizzes de práctica de 10, 20, 30 o 50 preguntas.
                </p>

                <div className="space-y-2 mb-6 text-xs font-bold text-[#6B4423]">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#6B4423]" />
                    <span>100 Fórmulas oficiales disponibles</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
                    <span>Opción de Examen (100) o Quizzes (10, 20, 30, 50)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Preguntas aleatorias en cada intento de quiz</span>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setFormulaModalOpen(true)}
                className="w-full py-4 bg-[#FAF6F0] hover:bg-[#F5EFEB] text-[#6B4423] font-black rounded-2xl border-2 border-[#E5D5C5] hover:border-[#A67B5B] flex items-center justify-center gap-2 text-base transition-colors shadow-sm"
              >
                <span>Explorar y Elegir Fórmula</span>
                <ChevronRight className="w-5 h-5 text-[#A67B5B]" />
              </button>
            </div>
          </div>
        </section>

        {/* NEW SECTION: ENTRENAMIENTO DE VOCABULARIO INTERACTIVO */}
        <section className="mb-10">
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-black uppercase tracking-wider mb-2 border border-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              Nuevas Sesiones de Vocabulario Táctico
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-[#6B4423] tracking-tight">
              Refuerzo de Vocabulario en Inglés
            </h2>
            <p className="text-xs sm:text-sm text-[#A67B5B] font-semibold mt-1">
              Practica palabras y modismos clave con tarjetas interactivas y juegos de emparejamiento.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* VOCAB GAME 1: DEFINITIONS */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-[#E5D5C5] shadow-conan-card flex flex-col justify-between hover:border-[#F59E0B] transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-[#F59E0B] flex items-center justify-center shadow-xs mb-4">
                  <BookOpen className="w-6 h-6" />
                </div>

                <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-black uppercase tracking-wide mb-2">
                  🎙️ Reto de Pronunciación (Voz)
                </div>

                <h3 className="text-xl font-black text-[#6B4423] mb-2">
                  Pronunciación con Micrófono
                </h3>

                <p className="text-xs sm:text-sm text-[#A67B5B] font-medium leading-relaxed mb-6">
                  Habla por el micrófono y la aplicación detectará si pronunciaste correctamente o de forma similar en inglés estadounidense 🇺🇸, con corrección auditiva inmediata.
                </p>
              </div>

              <Link
                href="/vocabulary/definitions"
                className="w-full py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black rounded-2xl shadow-conan-btn flex items-center justify-center gap-2 text-sm transition-transform active:scale-98"
              >
                <span>Entrenar Pronunciación</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {/* VOCAB GAME 2: MATCHING CARDS */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border-2 border-[#E5D5C5] shadow-conan-card flex flex-col justify-between hover:border-[#F59E0B] transition-all">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 flex items-center justify-center shadow-xs mb-4">
                  <Layers className="w-6 h-6" />
                </div>

                <div className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-800 border border-indigo-200 text-[11px] font-black uppercase tracking-wide mb-2">
                  🇪🇸 Español ↔ 🇺🇸 Inglés (Columnas)
                </div>

                <h3 className="text-xl font-black text-[#6B4423] mb-2">
                  Emparejar en Dos Columnas
                </h3>

                <p className="text-xs sm:text-sm text-[#A67B5B] font-medium leading-relaxed mb-6">
                  Columna izquierda en español y columna derecha en inglés. Al armar los pares se eliminan y aparecen más palabras de forma continua.
                </p>
              </div>

              <Link
                href="/vocabulary/matching"
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-conan-btn flex items-center justify-center gap-2 text-sm transition-transform active:scale-98"
              >
                <span>Jugar Columnas de Cartas</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* MOBILE APP PROMO SECTION */}
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
                Descarga la aplicación directo a tu celular como app nativa. Funciona a pantalla completa, reproduce audios fluidos y guarda tus medallas y notas.
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

        {/* EDUCATIONAL / DOCTRINE BANNER: SIGNIFICADO DE A.L.C.P.T. */}
        <section className="bg-[#FAF6F0] rounded-3xl border-2 border-[#E5D5C5] p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-amber-100 rounded-2xl text-[#F59E0B] flex-shrink-0">
              <Info className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black text-[#6B4423] mb-1">
                ¿Qué significa A.L.C.P.T. en ConanGo?
              </h4>
              <p className="text-xs sm:text-sm text-[#A67B5B] leading-relaxed font-medium">
                En ConanGo, las siglas <strong className="text-[#6B4423]">A.L.C.P.T.</strong> corresponden a: <strong className="text-[#92400E]">&ldquo;Adiestramiento Lingüístico con Conan, Perro Táctico&rdquo;</strong>. Es un entorno de simulación educativa enfocado en inglés estadounidense 🇺🇸 (la contraparte al inglés británico), estructurado en cuadernillos correlativos de 100 reactivos (60 de comprensión auditiva y 40 de gramática y lectura).
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer with Dedication to Conan */}
      <footer className="border-t border-[#E5D5C5] py-8 px-4 text-center text-xs text-[#A67B5B] bg-[#FAF6F0] space-y-3">
        <p className="font-black text-[#6B4423]">
          ConanGo &copy; {new Date().getFullYear()} &bull; A.L.C.P.T. (Adiestramiento Lingüístico con Conan, Perro Táctico) &bull; Inglés Estadounidense 🇺🇸
        </p>
        <div className="max-w-2xl mx-auto p-3.5 bg-white rounded-2xl border border-[#E5D5C5] shadow-xs text-xs text-[#8C6B4B] leading-relaxed">
          🐾 <strong>Dedicatoria de Honor:</strong> Dedicado con eterno amor, respeto y honor a nuestro querido camarada el <strong>Perro Conan</strong>, el compañero más fiel, noble y valiente de todas nuestras misiones. ¡Tu lealtad y temple viven en cada estudiante!
        </div>
      </footer>

      {/* Formula Selector Modal */}
      <FormulaModal
        isOpen={formulaModalOpen}
        onClose={() => setFormulaModalOpen(false)}
      />
    </div>
  );
}
