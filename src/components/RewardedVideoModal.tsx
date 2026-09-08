"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Sparkles, Volume2, ShieldCheck, CheckCircle2, Play, Award } from "lucide-react";
import ConanMascot from "./ConanMascot";
import { restoreMedalsAfterAd } from "@/lib/supabase";
import { soundEffects } from "@/lib/soundEffects";
import confetti from "canvas-confetti";

interface RewardedVideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRewarded: () => void;
}

export default function RewardedVideoModal({
  isOpen,
  onClose,
  onRewarded,
}: RewardedVideoModalProps) {
  const [secondsLeft, setSecondsLeft] = useState(5);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setSecondsLeft(5);
      setIsCompleted(false);
      return;
    }

    setSecondsLeft(5);
    setIsCompleted(false);

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCompleted(true);
          restoreMedalsAfterAd();
          soundEffects.playLevelUp();
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.6 },
            colors: ["#F59E0B", "#10B981", "#6B4423"],
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl border-4 border-[#A67B5B] shadow-2xl max-w-md w-full overflow-hidden flex flex-col"
      >
        {/* Top Header */}
        <div className="bg-[#6B4423] text-white px-5 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Anuncio Recompensado Táctico</span>
          </div>

          <div className="text-xs font-black px-2.5 py-1 rounded-full bg-white/20 text-white">
            {isCompleted ? "¡Completado!" : `Recompensa en ${secondsLeft}s`}
          </div>
        </div>

        {/* Video Screen Area */}
        <div className="bg-slate-900 text-white p-6 sm:p-8 text-center relative overflow-hidden flex flex-col items-center justify-center min-h-[220px]">
          <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#F59E0B_1px,transparent_1px)] [background-size:16px_16px]" />

          <div className="relative z-10">
            <ConanMascot size="md" mood={isCompleted ? "celebrate" : "thinking"} animate={true} />
            <h4 className="text-lg font-black mt-3 text-amber-400 tracking-tight">
              Academia Táctica Conan &bull; ALCPT Inglés 🇺🇸
            </h4>
            <p className="text-xs text-slate-300 font-medium max-w-xs mx-auto mt-1 leading-relaxed">
              Material de audio oficial, ejercicios de listening y simulacros de 100 preguntas para asegurar tu aprobación.
            </p>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full mt-5 overflow-hidden border border-slate-700">
            <div
              className="bg-gradient-to-r from-amber-500 to-yellow-400 h-full transition-all duration-1000 ease-linear"
              style={{ width: `${((5 - secondsLeft) / 5) * 100}%` }}
            />
          </div>
        </div>

        {/* Bottom Reward Notification */}
        <div className="p-6 bg-white text-center">
          {isCompleted ? (
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full font-black text-xs uppercase tracking-wider">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                ¡5 Vidas Restauradas!
              </div>

              <p className="text-xs text-[#A67B5B] font-semibold">
                Has recuperado todas tus medallas. Puedes continuar tu sesión justo donde te quedaste.
              </p>

              <button
                type="button"
                onClick={() => {
                  onRewarded();
                  onClose();
                }}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-conan-btn flex items-center justify-center gap-2 text-sm transition-transform active:scale-95"
              >
                <span>Continuar Jugando</span>
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-[#6B4423]">
                <ShieldCheck className="w-4 h-4 text-[#F59E0B]" />
                <span>Por favor espera que finalice el anuncio ({secondsLeft}s)...</span>
              </div>
              <p className="text-[11px] text-[#A67B5B]">
                Al finalizar recibirás 5 medallas completas para no perder tu avance.
              </p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
