"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Zap, Sparkles, Video, Coins, CheckCircle2 } from "lucide-react";
import { activateDoubleXp, getCurrentUser } from "@/lib/supabase";
import { soundEffects } from "@/lib/soundEffects";
import RewardedVideoModal from "./RewardedVideoModal";

interface BoosterModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BoosterModal({ isOpen, onClose }: BoosterModalProps) {
  const [showVideoModal, setShowVideoModal] = useState(false);
  const [activated, setActivated] = useState(false);

  if (!isOpen) return null;

  const user = getCurrentUser();
  const coins = user?.coins || 0;

  const handleBuyWithCoins = () => {
    if (coins < 40) return;
    activateDoubleXp(15);
    setActivated(true);
    soundEffects.playLevelUp();
    setTimeout(() => {
      setActivated(false);
      onClose();
    }, 1200);
  };

  const handleVideoRewarded = () => {
    activateDoubleXp(15);
    soundEffects.playLevelUp();
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border-4 border-amber-300 dark:border-amber-500 shadow-2xl max-w-sm w-full p-6 text-center relative overflow-hidden"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-[#A67B5B] dark:text-slate-400 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-yellow-400 mx-auto flex items-center justify-center text-white text-3xl shadow-md mb-3">
            🧪
          </div>

          <h3 className="text-2xl font-black text-[#6B4423] dark:text-white">
            Poción Multijugos 2x XP
          </h3>

          <p className="text-xs text-[#A67B5B] dark:text-slate-400 font-semibold mt-1 mb-5">
            Bebe la poción mágica para duplicar la experiencia (XP) obtenida durante los próximos 15 minutos y ascender en la Fuerza Aérea.
          </p>

          <div className="space-y-3">
            {/* Option 1: Watch Ad */}
            <button
              type="button"
              onClick={() => setShowVideoModal(true)}
              className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-sm flex items-center justify-between text-xs transition-transform active:scale-95"
            >
              <div className="flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-200" />
                <span>Ver Anuncio de 5s</span>
              </div>
              <span className="bg-emerald-700 px-2.5 py-1 rounded-lg text-[10px] uppercase tracking-wider">
                GRATIS
              </span>
            </button>

            {/* Option 2: Spend Coins */}
            <button
              type="button"
              onClick={handleBuyWithCoins}
              disabled={coins < 40}
              className={`w-full py-3.5 px-4 border-2 rounded-2xl flex items-center justify-between text-xs font-black transition-all ${
                coins >= 40
                  ? "border-[#F59E0B] bg-[#FAF6F0] text-[#6B4423] hover:bg-[#FEF3C7]"
                  : "border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed"
              }`}
            >
              <div className="flex items-center gap-2">
                <Coins className="w-4 h-4 text-amber-500" />
                <span>Comprar con Monedas</span>
              </div>
              <span>40 🪙 (Tienes {coins})</span>
            </button>
          </div>
        </motion.div>
      </div>

      <RewardedVideoModal
        isOpen={showVideoModal}
        onClose={() => setShowVideoModal(false)}
        onRewarded={handleVideoRewarded}
      />
    </>
  );
}
