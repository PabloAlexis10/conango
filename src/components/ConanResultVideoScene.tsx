"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import ConanMascot from "./ConanMascot";
import { Trophy, Sparkles, Volume2, ShieldAlert, RotateCcw, Heart } from "lucide-react";
import { soundEffects } from "@/lib/soundEffects";
import confetti from "canvas-confetti";

interface ConanResultVideoSceneProps {
  percentage: number;
  correct: number;
  incorrect: number;
}

export default function ConanResultVideoScene({
  percentage,
  correct,
  incorrect,
}: ConanResultVideoSceneProps) {
  const isPassed = percentage >= 70;
  const [isPlayingBark, setIsPlayingBark] = useState(false);

  const handleInteract = () => {
    setIsPlayingBark(true);
    if (isPassed) {
      soundEffects.playLevelUp();
      try {
        confetti({
          particleCount: 70,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#F59E0B", "#10B981", "#3B82F6"],
        });
      } catch {}
    } else {
      soundEffects.playClick();
    }

    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const phrase = isPassed
        ? "Mission accomplished, cadet! Great job on your test!"
        : "Hold your head high, cadet! Review your mistakes and try again!";
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = "en-US";
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    }

    setTimeout(() => setIsPlayingBark(false), 2000);
  };

  return (
    <div
      className={`rounded-3xl border-4 p-6 sm:p-8 text-center relative overflow-hidden mb-8 shadow-xl transition-all ${
        isPassed
          ? "bg-gradient-to-b from-amber-500 via-amber-600 to-yellow-600 border-amber-300 text-white"
          : "bg-gradient-to-b from-slate-800 via-slate-900 to-slate-950 border-slate-700 text-slate-100"
      }`}
    >
      {/* Background Animated Glow */}
      <div className="absolute inset-0 bg-radial from-white/10 to-transparent pointer-events-none" />

      {/* Interactive Badge */}
      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/20 backdrop-blur-sm text-xs font-black uppercase tracking-wider mb-4 text-white">
        {isPassed ? (
          <>
            <Sparkles className="w-4 h-4 text-yellow-300 animate-spin" />
            <span>¡Misión Cumplida! • Escena de Victoria</span>
          </>
        ) : (
          <>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Debriefing Táctico • Conan te Apoya</span>
          </>
        )}
      </div>

      {/* Mascot Animated Character */}
      <div className="flex justify-center mb-4 relative">
        <motion.div
          animate={isPassed ? { y: [0, -10, 0] } : { y: [0, -3, 0] }}
          transition={{ repeat: Infinity, duration: isPassed ? 1.5 : 3, ease: "easeInOut" }}
        >
          <ConanMascot
            size="hero"
            mood={isPassed ? "celebrate" : "thinking"}
            animate={true}
          />
        </motion.div>

        {isPassed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -top-2 right-1/4 sm:right-1/3 bg-yellow-400 text-amber-950 p-2 rounded-2xl shadow-lg"
          >
            <Trophy className="w-6 h-6" />
          </motion.div>
        )}
      </div>

      {/* Title & Message */}
      <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-2 text-white drop-shadow-sm">
        {isPassed ? "¡Felicitaciones, Aprobaste con Éxito!" : "¡Cabeza en alto, Cadete!"}
      </h2>

      <p className="text-sm sm:text-base max-w-lg mx-auto font-medium leading-relaxed opacity-95 mb-6">
        {isPassed
          ? `Obtuviste un ${percentage}% de efectividad (${correct} de ${correct + incorrect} correctas). Conan y el comando militar celebran tu avance en inglés.`
          : `Tuviste ${incorrect} fallos en esta misión. Los mejores pilotos de la Fuerza Aérea se forjan repitiendo las fórmulas hasta dominar la regla.`}
      </p>

      {/* Interactive Interaction Button */}
      <button
        type="button"
        onClick={handleInteract}
        disabled={isPlayingBark}
        className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 mx-auto transition-transform active:scale-95 ${
          isPassed
            ? "bg-white text-amber-900 hover:bg-yellow-50"
            : "bg-amber-500 hover:bg-amber-600 text-white"
        }`}
      >
        <Volume2 className="w-4 h-4" />
        <span>
          {isPassed
            ? isPlayingBark
              ? "🐾 ¡Celebrando con Conan!"
              : "🐾 Toca para interactuar con Conan"
            : isPlayingBark
            ? "🐾 '¡La próxima la dominamos!'"
            : "🐾 Mensaje de apoyo de Conan"}
        </span>
      </button>
    </div>
  );
}
