"use client";

import React from "react";
import Link from "next/link";
import { Shield, LogIn, ArrowLeft, Sparkles, CheckCircle2 } from "lucide-react";
import ConanMascot from "./ConanMascot";

interface GuestLimitWallProps {
  onOpenAuth: () => void;
  backUrl?: string;
  className?: string;
}

export default function GuestLimitWall({
  onOpenAuth,
  backUrl = "/",
  className = "",
}: GuestLimitWallProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#A67B5B] dark:border-slate-700 shadow-conan-card p-6 sm:p-10 text-center max-w-lg mx-auto ${className}`}
    >
      <div className="flex justify-center mb-3">
        <ConanMascot size="lg" mood="thinking" animate={true} />
      </div>

      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-black uppercase tracking-wider mb-3">
        <Shield className="w-3.5 h-3.5 text-[#F59E0B]" />
        <span>Límite de Prueba Alcanzado (2 de 2)</span>
      </div>

      <h2 className="text-2xl sm:text-3xl font-black text-[#6B4423] dark:text-white tracking-tight mb-2">
        ¡Has completado tus lecciones gratuitas! 🐾
      </h2>

      <p className="text-xs sm:text-sm text-[#A67B5B] dark:text-slate-300 font-semibold leading-relaxed mb-6">
        Has aprovechado al máximo tus 2 lecciones de prueba como invitado. Para continuar practicando con las <strong className="text-[#6B4423] dark:text-amber-400">100 fórmulas oficiales</strong>, audios en inglés 🇺🇸, vocabulario interactivo y guardar tus notas, inicia sesión o crea tu cuenta gratis.
      </p>

      {/* Benefits checklist */}
      <div className="bg-[#FAF6F0] dark:bg-slate-800/80 p-4 rounded-2xl border border-[#E5D5C5] dark:border-slate-700 text-left space-y-2 mb-6 text-xs text-[#6B4423] dark:text-slate-200 font-bold">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>Acceso ilimitado a las 100 fórmulas (Listening y Reading)</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>Guarda tu historial de calificaciones y medallas</span>
        </div>
        <div className="flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
          <span>Entrenamiento de pronunciación por voz sin restricciones</span>
        </div>
      </div>

      <div className="space-y-2.5">
        <button
          type="button"
          onClick={onOpenAuth}
          className="w-full py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black rounded-2xl shadow-conan-btn flex items-center justify-center gap-2 text-sm transition-transform active:scale-98"
        >
          <LogIn className="w-4 h-4" />
          <span>Iniciar Sesión / Crear Cuenta Gratis</span>
        </button>

        <Link
          href={backUrl}
          className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 text-xs font-bold text-[#A67B5B] hover:text-[#6B4423] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Menú Principal</span>
        </Link>
      </div>
    </div>
  );
}
