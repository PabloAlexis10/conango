"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ConanMascot from "@/components/ConanMascot";
import {
  ArrowLeft,
  ShieldCheck,
  Award,
  BookOpen,
  Clock,
  Sparkles,
  Plane,
  Heart,
  HelpCircle,
  Trophy,
  ExternalLink,
} from "lucide-react";
import { getCurrentUser } from "@/lib/supabase";
import { UserProfile } from "@/lib/types";

export default function AboutPage() {
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-[#6B4423] dark:text-slate-100 transition-colors">
      <Header medals={user?.medals ?? 10} />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 md:py-12">
        {/* Back Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#FAF6F0] dark:bg-slate-900 border border-[#E5D5C5] dark:border-slate-800 text-[#6B4423] dark:text-slate-200 text-xs font-black hover:bg-[#F5EFEB] dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la Base de Entrenamiento</span>
          </Link>
        </div>

        {/* Hero Card */}
        <section className="bg-gradient-to-b from-[#FAF6F0] to-white dark:from-slate-900 dark:to-slate-950 rounded-3xl border-2 border-[#E5D5C5] dark:border-slate-800 p-6 sm:p-10 shadow-conan-card mb-10 text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#FEF3C7] dark:bg-amber-950/60 border border-[#FDE68A] dark:border-amber-700 text-[#92400E] dark:text-amber-200 text-xs font-black uppercase tracking-wider mb-5 shadow-xs">
            <Sparkles className="w-4 h-4 text-[#F59E0B]" />
            Información Oficial &bull; Plataforma ConanGo
          </div>

          <div className="flex justify-center mb-5">
            <ConanMascot size="hero" mood="happy" animate={true} />
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-[#6B4423] dark:text-white tracking-tight mb-3">
            Acerca de <span className="text-[#F59E0B]">ConanGo</span>
          </h1>

          <p className="text-sm sm:text-base text-[#A67B5B] dark:text-slate-300 font-medium max-w-2xl mx-auto leading-relaxed">
            La plataforma líder de adiestramiento militar en inglés técnico y preparación especializada para el examen oficial <strong className="text-[#6B4423] dark:text-amber-400">A.L.C.P.T.</strong> de las Fuerzas Armadas.
          </p>
        </section>

        {/* 1. ¿Quién es Conan? */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E5D5C5] dark:border-slate-800 p-6 sm:p-8 shadow-conan-card mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300 flex items-center justify-center font-black text-xl shadow-xs">
              🐾
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#6B4423] dark:text-white">
                ¿Quién es el Perro Táctico Conan?
              </h2>
              <p className="text-xs text-[#A67B5B] dark:text-slate-400 font-semibold">
                Símbolo de lealtad incondicional, templanza y coraje
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#7A5433] dark:text-slate-300 leading-relaxed font-medium">
            <p>
              <strong>Conan</strong> no es simplemente una mascota: es el espíritu guardián de nuestra academia. Inspirado en los caninos de operaciones especiales militares y de rescate que destacan por su obediencia inquebrantable, alerta constante y compañerismo en las condiciones más exigentes.
            </p>
            <p>
              En cada sesión de estudio, <strong>Conan te acompaña paso a paso</strong>: celebra tus aciertos con saltos y medallas, te anima cuando cometes un error para que no te desanimes, y protege tus vidas con su armadura táctica.
            </p>
          </div>
        </section>

        {/* 2. ¿Qué es A.L.C.P.T. en ConanGo? */}
        <section className="bg-[#FAF6F0] dark:bg-slate-900 rounded-3xl border-2 border-amber-300/80 dark:border-amber-700/60 p-6 sm:p-8 shadow-conan-card mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B] text-white flex items-center justify-center font-black text-xl shadow-xs">
              🎖️
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#6B4423] dark:text-white">
                La Doctrina A.L.C.P.T.
              </h2>
              <p className="text-xs text-amber-800 dark:text-amber-300 font-semibold">
                Adiestramiento Lingüístico con Conan, Perro Táctico
              </p>
            </div>
          </div>

          <div className="space-y-4 text-xs sm:text-sm text-[#6B4423] dark:text-slate-300 leading-relaxed font-medium">
            <p>
              En ConanGo, las siglas <strong>A.L.C.P.T.</strong> rinden doble propósito:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Definición de Identidad:</strong> &ldquo;<em>Adiestramiento Lingüístico con Conan, Perro Táctico</em>&rdquo; &bull; El método interactivo de práctica gamificada diseñado para generar constancia y memoria muscular lingüística.
              </li>
              <li>
                <strong>Equivalencia Técnica Oficial:</strong> Reproduce con fidelidad la estructura del <em>American Language Course Placement Test</em> (desarrollado por el DLIELC - Defense Language Institute English Language Center de EE.UU.), utilizado por las Fuerzas Aéreas y Ejércitos del mundo para clasificar a los postulantes a misiones internacionales, becas de vuelo y cursos de Estado Mayor.
              </li>
            </ul>
          </div>

          {/* Key Test Specs */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-6">
            <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-[#E5D5C5] dark:border-slate-800 shadow-xs text-center">
              <Clock className="w-5 h-5 text-[#F59E0B] mx-auto mb-1.5" />
              <div className="font-black text-base text-[#6B4423] dark:text-white">60 Minutos</div>
              <p className="text-[11px] text-[#A67B5B] dark:text-slate-400 font-semibold">Tiempo oficial de examen</p>
            </div>
            <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-[#E5D5C5] dark:border-slate-800 shadow-xs text-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" />
              <div className="font-black text-base text-[#6B4423] dark:text-white">60 Listening</div>
              <p className="text-[11px] text-[#A67B5B] dark:text-slate-400 font-semibold">Comprensión por audio</p>
            </div>
            <div className="bg-white dark:bg-slate-950 p-4 rounded-2xl border border-[#E5D5C5] dark:border-slate-800 shadow-xs text-center">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400 mx-auto mb-1.5" />
              <div className="font-black text-base text-[#6B4423] dark:text-white">40 Reading</div>
              <p className="text-[11px] text-[#A67B5B] dark:text-slate-400 font-semibold">Gramática y vocabulario</p>
            </div>
          </div>
        </section>

        {/* 3. Escala Oficial de Calificación y Comisiones */}
        <section className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E5D5C5] dark:border-slate-800 p-6 sm:p-8 shadow-conan-card mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-xl shadow-xs">
              <Plane className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#6B4423] dark:text-white">
                Escala de Rendimiento & Comisiones USAF
              </h2>
              <p className="text-xs text-[#A67B5B] dark:text-slate-400 font-semibold">
                Porcentajes oficiales requeridos para misiones de vuelo
              </p>
            </div>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-black text-emerald-900 dark:text-emerald-200 block">
                  🟢 85% a 100% &bull; Apto Vuelo Combate USAF / OTAN
                </span>
                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium">
                  Candidato apto para cursos de aviación táctica (F-16, F-22, C-130) y misiones bilaterales de alta complejidad.
                </span>
              </div>
              <span className="text-xs font-black px-2 py-1 rounded bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-100 shrink-0">
                TOP GUN
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-yellow-50 dark:bg-yellow-950/40 border border-yellow-300 dark:border-yellow-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-black text-yellow-900 dark:text-yellow-200 block">
                  🟡 75% a 84% &bull; Apto Tráfico Aéreo (ATC) & Oficiales
                </span>
                <span className="text-[11px] text-yellow-700 dark:text-yellow-400 font-medium">
                  Habilitado para control de tráfico aéreo táctico, navegación y escuelas de especialidad en el extranjero.
                </span>
              </div>
              <span className="text-xs font-black px-2 py-1 rounded bg-yellow-200 dark:bg-yellow-900 text-yellow-900 dark:text-yellow-100 shrink-0">
                OFICIAL
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-black text-amber-900 dark:text-amber-200 block">
                  🟠 60% a 74% &bull; Apto Mantenimiento & Especialidades
                </span>
                <span className="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
                  Habilitado para lectura de manuales técnicos de mantenimiento aeronáutico y cuadro permanente.
                </span>
              </div>
              <span className="text-xs font-black px-2 py-1 rounded bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 shrink-0">
                TÉCNICO
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-800 flex items-center justify-between gap-3">
              <div>
                <span className="text-xs font-black text-red-900 dark:text-red-200 block">
                  🔴 Menos de 60% &bull; Nivel Básico de Instrucción
                </span>
                <span className="text-[11px] text-red-700 dark:text-red-400 font-medium">
                  Se recomienda entrenamiento intensivo mediante quizzes rápidos de 10 a 50 preguntas y la Biblioteca de Vocabulario.
                </span>
              </div>
              <span className="text-xs font-black px-2 py-1 rounded bg-red-200 dark:bg-red-900 text-red-900 dark:text-red-100 shrink-0">
                CADETE
              </span>
            </div>
          </div>
        </section>

        {/* 4. Dedicatoria de Honor a Conan */}
        <section className="bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:to-slate-900 border-2 border-amber-300 dark:border-amber-700 rounded-3xl p-6 sm:p-8 shadow-conan-card mb-10 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-500 text-white flex items-center justify-center text-2xl mx-auto mb-3 shadow-md">
            🐾
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-[#6B4423] dark:text-white mb-2">
            Dedicatoria de Honor a Conan
          </h3>
          <p className="text-xs sm:text-sm text-[#7A5433] dark:text-slate-300 max-w-xl mx-auto leading-relaxed font-medium">
            Dedicado con eterno amor, respeto y honor a nuestro entrañable camarada el <strong>Perro Conan</strong>, el compañero más fiel, noble y valiente de todas nuestras misiones. ¡Tu lealtad, tu nobleza y tu temple militar viven para siempre en cada despegue y en cada logro de esta academia!
          </p>
        </section>

        {/* Action Button */}
        <div className="text-center mb-6">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black text-sm rounded-2xl shadow-conan-btn transition-transform active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Ir a la Base de Entrenamiento</span>
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5D5C5] dark:border-slate-800 py-6 px-4 text-center text-xs text-[#A67B5B] dark:text-slate-400 bg-[#FAF6F0] dark:bg-slate-900 transition-colors">
        <p className="font-black text-[#6B4423] dark:text-slate-200">
          ConanGo &copy; {new Date().getFullYear()} &bull; A.L.C.P.T. (Adiestramiento Lingüístico con Conan, Perro Táctico) &bull; Inglés 🇺🇸
        </p>
      </footer>
    </div>
  );
}
