"use client";

import React from "react";
import { motion } from "framer-motion";
import { X, Flame, Shield, Calendar, Sparkles, CheckCircle2 } from "lucide-react";
import ConanMascot from "./ConanMascot";
import { getCurrentUser } from "@/lib/supabase";

interface StreakModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DAYS_OF_WEEK = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

export default function StreakModal({ isOpen, onClose }: StreakModalProps) {
  if (!isOpen) return null;

  const user = getCurrentUser();
  const streak = user?.streakDays || 1;

  // Compute current day of week (0=Mon, 6=Sun)
  const now = new Date();
  const todayIdx = (now.getDay() + 6) % 7;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl border-4 border-orange-300 shadow-2xl max-w-sm w-full p-6 text-center relative overflow-hidden"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-[#A67B5B] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex justify-center mb-3">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-white shadow-lg text-4xl">
            🔥
          </div>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-900 text-xs font-black uppercase tracking-wider mb-2">
          <span>Constancia de Estudio</span>
        </div>

        <h3 className="text-2xl font-black text-[#6B4423]">
          ¡Racha de {streak} {streak === 1 ? "Día" : "Días"}!
        </h3>

        <p className="text-xs text-[#A67B5B] font-semibold mt-1 mb-6">
          Completa al menos 1 evaluación diaria en inglés 🇺🇸 para mantener encendida la llama de Conan y ganar doble experiencia.
        </p>

        {/* Weekly calendar tracker */}
        <div className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#E5D5C5] mb-6">
          <span className="text-[11px] font-black uppercase tracking-wider text-[#A67B5B] block mb-3">
            Esta Semana
          </span>

          <div className="grid grid-cols-7 gap-1.5">
            {DAYS_OF_WEEK.map((d, idx) => {
              const isPastOrToday = idx <= todayIdx;
              const isToday = idx === todayIdx;

              return (
                <div key={d} className="flex flex-col items-center gap-1">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                      isToday
                        ? "bg-orange-500 text-white shadow-sm ring-2 ring-orange-300"
                        : isPastOrToday
                        ? "bg-amber-100 text-amber-900 border border-amber-300"
                        : "bg-white text-slate-400 border border-slate-200"
                    }`}
                  >
                    {isPastOrToday ? "🐾" : ""}
                  </div>
                  <span
                    className={`text-[10px] font-extrabold ${
                      isToday ? "text-orange-600 font-black" : "text-[#A67B5B]"
                    }`}
                  >
                    {d}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black rounded-2xl shadow-conan-btn text-xs uppercase tracking-wider transition-transform active:scale-95"
        >
          ¡A Seguir Entrenando!
        </button>
      </motion.div>
    </div>
  );
}
