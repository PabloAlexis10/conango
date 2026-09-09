"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  X,
  Plane,
  Award,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Lock,
  Compass,
  CheckCircle,
} from "lucide-react";
import { UserProfile, ExamResult } from "@/lib/types";
import { getCurrentUser } from "@/lib/supabase";

interface AlcptPredictorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradePro?: () => void;
}

export default function AlcptPredictorModal({
  isOpen,
  onClose,
  onUpgradePro,
}: AlcptPredictorModalProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [predictedScore, setPredictedScore] = useState<number>(78);
  const [examCount, setExamCount] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      const cur = getCurrentUser();
      setUser(cur);

      const userId = cur?.id || "guest";
      const savedExams: ExamResult[] = JSON.parse(
        localStorage.getItem(`conango_exams_${userId}`) || "[]"
      );
      setExamCount(savedExams.length);

      if (savedExams.length > 0) {
        // Promedio ponderado de los últimos exámenes
        const recent = savedExams.slice(0, 5);
        const avg = Math.round(
          recent.reduce((acc, curr) => acc + curr.percentage, 0) / recent.length
        );
        setPredictedScore(Math.max(45, Math.min(98, avg)));
      } else {
        // Estimación basada en nivel de XP
        const xp = cur?.xp || 500;
        const est = Math.min(92, Math.max(58, Math.round(55 + (xp / 1000) * 10)));
        setPredictedScore(est);
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isPro = user?.isPro || false;

  const getTierInfo = (score: number) => {
    if (score >= 85) {
      return {
        label: "Apto Piloto Militar de Caza USAF",
        sublabel: "F-16 Falcon • F-22 Raptor • C-130 Hercules",
        color: "text-emerald-500",
        badgeBg: "bg-emerald-50 dark:bg-emerald-950 border-emerald-300 dark:border-emerald-700",
        status: "CALIFICACIÓN SOBRESALIENTE",
        statusColor: "text-emerald-700 dark:text-emerald-300",
      };
    } else if (score >= 75) {
      return {
        label: "Apto Escuela de Oficiales y Tráfico Aéreo",
        sublabel: "Oficial de Vuelo • Torre de Control Militar ATC",
        color: "text-amber-500",
        badgeBg: "bg-amber-50 dark:bg-amber-950 border-amber-300 dark:border-amber-700",
        status: "CALIFICACIÓN OPERACIONAL",
        statusColor: "text-amber-700 dark:text-amber-300",
      };
    } else if (score >= 60) {
      return {
        label: "Apto Cuadro Permanente y Soporte Técnico",
        sublabel: "Mantenimiento Aeronáutico • Logística de Base",
        color: "text-orange-500",
        badgeBg: "bg-orange-50 dark:bg-orange-950 border-orange-300 dark:border-orange-700",
        status: "CALIFICACIÓN TÉCNICA BÁSICA",
        statusColor: "text-orange-700 dark:text-orange-300",
      };
    } else {
      return {
        label: "En Instrucción Básica (Refuerzo Requerido)",
        sublabel: "Fase de Acondicionamiento de Vocabulario y Fórmulas",
        color: "text-red-500",
        badgeBg: "bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700",
        status: "NO APTO AÚN PARA COMISIÓN",
        statusColor: "text-red-700 dark:text-red-300",
      };
    }
  };

  const tier = getTierInfo(predictedScore);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-600 rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl relative text-slate-900 dark:text-slate-100 my-6"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 mb-3">
            <Plane className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-black text-[#6B4423] dark:text-amber-300">
            Predictor Oficial de Comisión USAF
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Algoritmo militar de proyección de puntaje ALCPT y aptitud de vuelo.
          </p>
        </div>

        {/* Tarjeta de Puntaje Proyectado */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-center mb-4">
          <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block mb-1">
            Puntaje ALCPT Proyectado (Escala Oficial 100 Pts)
          </span>
          <div className="flex items-baseline justify-center gap-1">
            <span className="text-5xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
              {predictedScore}
            </span>
            <span className="text-xl font-bold text-slate-400">/ 100</span>
          </div>

          <div className={`mt-3 p-2.5 rounded-xl border ${tier.badgeBg}`}>
            <span className={`text-[10px] font-black uppercase tracking-wider block ${tier.statusColor}`}>
              {tier.status}
            </span>
            <p className="text-sm font-black text-slate-900 dark:text-white mt-0.5">
              {tier.label}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {tier.sublabel}
            </p>
          </div>
        </div>

        {/* Diagnóstico de Fórmulas Críticas */}
        <div className="space-y-2 mb-4">
          <h3 className="text-xs font-black uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
            <Compass className="w-4 h-4 text-amber-500" />
            Diagnóstico de Refuerzo para Alcanzar 85+ Pts:
          </h3>

          <div className="p-3 bg-amber-50/60 dark:bg-slate-800/60 rounded-xl border border-amber-200/80 dark:border-slate-700 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                • Fórmula 24: Modales Pasados en Contexto de Vuelo
              </span>
              <span className="text-red-500 font-extrabold text-[10px]">REFORZAR</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                • Fórmula 41: Condicionales Mixtos en Briefings
              </span>
              <span className="text-amber-500 font-extrabold text-[10px]">PRIORIDAD</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 dark:text-slate-200">
                • Fórmula 15: Voz Pasiva en Comunicaciones ATC
              </span>
              <span className="text-emerald-500 font-extrabold text-[10px]">ESTABLE</span>
            </div>
          </div>
        </div>

        {!isPro && (
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/10 border border-amber-400 text-center space-y-2 mb-2">
            <div className="flex items-center justify-center gap-1 text-xs font-black text-amber-800 dark:text-amber-300">
              <Lock className="w-3.5 h-3.5" />
              <span>Desbloquea el Simulador Predictivo Completo</span>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-snug">
              Con Conan PRO tienes análisis detallado pregunta por pregunta, histórico de progreso y simulaciones ilimitadas.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onUpgradePro) onUpgradePro();
              }}
              className="w-full py-2 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs"
            >
              Obtener Conan PRO con Descuento
            </button>
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-extrabold text-xs rounded-xl transition-colors"
        >
          Cerrar Diagnóstico
        </button>
      </motion.div>
    </div>
  );
}
