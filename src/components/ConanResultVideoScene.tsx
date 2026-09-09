"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { Trophy, Sparkles, Volume2, ShieldAlert, RotateCcw, Heart, Star, Award } from "lucide-react";
import { soundEffects } from "@/lib/soundEffects";
import { getCurrentUser } from "@/lib/supabase";
import { getUserRankTitle, getUserRankBadge } from "@/lib/accessories";
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
  const user = getCurrentUser();
  const playerRank = getUserRankTitle(user?.xp || 0);
  const rankBadge = getUserRankBadge(user?.xp || 0);

  const handleInteract = () => {
    setIsPlayingBark(true);
    if (isPassed) {
      soundEffects.playLevelUp();
      try {
        confetti({
          particleCount: 75,
          spread: 85,
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
        ? `Mission accomplished, ${playerRank}! Outstanding performance on your test!`
        : `Hold your head high, ${playerRank}! Review your tactical debrief and try again!`;
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.lang = "en-US";
      utterance.rate = 0.95;
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
            <span>¡Misión Cumplida! • Victoria {rankBadge}</span>
          </>
        ) : (
          <>
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span>Debriefing Táctico • {playerRank}</span>
          </>
        )}
      </div>

      {/* Interactive Tactical Emoji Mascot (No moving photo image) */}
      <div className="flex justify-center mb-4 relative">
        <motion.div
          onClick={handleInteract}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          animate={isPassed ? { scale: [1, 1.05, 1] } : {}}
          transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          className={`w-28 h-28 sm:w-32 sm:h-32 rounded-3xl flex items-center justify-center text-5xl sm:text-6xl cursor-pointer select-none shadow-2xl border-4 transition-all ${
            isPassed
              ? "bg-gradient-to-tr from-yellow-300 via-amber-400 to-yellow-500 border-white shadow-yellow-500/40"
              : "bg-gradient-to-tr from-slate-700 via-slate-800 to-slate-900 border-slate-600 shadow-slate-900/50"
          }`}
          title="Toca al compañero táctico para interactuar"
        >
          {isPassed ? "🐶🏆" : "🐶🛡️"}
        </motion.div>

        {/* Floating Rank Crest */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1, rotate: [0, 8, -8, 0] }}
          transition={{ repeat: Infinity, duration: 2.5 }}
          className="absolute -top-2 right-1/4 sm:right-1/3 bg-yellow-400 text-amber-950 px-2.5 py-1 rounded-xl shadow-lg font-black text-xs flex items-center gap-1"
        >
          <span>{rankBadge}</span>
          <span>{playerRank}</span>
        </motion.div>
      </div>

      {/* Title & Message */}
      <h2 className="text-2xl sm:text-4xl font-black tracking-tight mb-2 text-white drop-shadow-sm">
        {isPassed
          ? `¡Felicitaciones, Aprobaste con Éxito, ${playerRank}!`
          : `¡Cabeza en alto, ${playerRank}!`}
      </h2>

      <p className="text-sm sm:text-base max-w-lg mx-auto font-medium leading-relaxed opacity-95 mb-6">
        {isPassed
          ? `Obtuviste un ${percentage}% de efectividad (${correct} de ${correct + incorrect} correctas). Conan y el mando de la USAF celebran tu precisión táctica en inglés.`
          : `Tuviste ${incorrect} fallos en esta misión. Como ${playerRank}, repasa la retroalimentación de cada reactivo para dominar las 100 fórmulas.`}
      </p>

      {/* Interactive Interaction Button */}
      <button
        type="button"
        onClick={handleInteract}
        disabled={isPlayingBark}
        className={`px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider shadow-lg flex items-center justify-center gap-2 mx-auto transition-transform active:scale-95 cursor-pointer ${
          isPassed
            ? "bg-white text-amber-900 hover:bg-yellow-50"
            : "bg-amber-500 hover:bg-amber-600 text-white"
        }`}
      >
        <Volume2 className="w-4 h-4" />
        <span>
          {isPassed
            ? isPlayingBark
              ? `🐾 ¡${playerRank} en Victoria!`
              : `🐾 Toca para escuchar saludo oficial`
            : isPlayingBark
            ? `🐾 '¡La próxima la dominamos, ${playerRank}!'`
            : `🐾 Mensaje táctico de apoyo`}
        </span>
      </button>
    </div>
  );
}
