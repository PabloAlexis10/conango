"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Target, Sparkles, CheckCircle2, Zap, Gift, Trophy } from "lucide-react";
import ConanMascot from "./ConanMascot";
import { getDailyQuests, claimQuestReward, getCurrentUser, subscribeAuth } from "@/lib/supabase";
import { DailyQuest, UserProfile } from "@/lib/types";
import { soundEffects } from "@/lib/soundEffects";
import confetti from "canvas-confetti";

interface DailyQuestsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DailyQuestsModal({ isOpen, onClose }: DailyQuestsModalProps) {
  const [quests, setQuests] = useState<DailyQuest[]>([]);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [rewardMsg, setRewardMsg] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setUser(getCurrentUser());
      setQuests(getDailyQuests());
      setRewardMsg(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClaim = (questId: string) => {
    const res = claimQuestReward(questId);
    if (res.success) {
      soundEffects.playLevelUp();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#3B82F6", "#F59E0B"],
      });
      setRewardMsg(res.rewardText);
      setQuests(getDailyQuests());
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl border-4 border-amber-300 shadow-2xl max-w-md w-full p-6 relative overflow-hidden"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-[#A67B5B] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 mx-auto flex items-center justify-center text-white text-3xl shadow-md mb-2">
            🎯
          </div>
          <h3 className="text-2xl font-black text-[#6B4423]">
            Misiones Diarias
          </h3>
          <p className="text-xs text-[#A67B5B] font-semibold mt-0.5">
            Completa tus objetivos de hoy para ganar gemas 💎 y pociones de 2x XP ⚡.
          </p>
        </div>

        {rewardMsg && (
          <div className="mb-4 p-3 bg-emerald-100 border border-emerald-300 rounded-2xl text-xs font-black text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>{rewardMsg}</span>
          </div>
        )}

        <div className="space-y-3 mb-6">
          {quests.map((q) => {
            const pct = Math.min(100, Math.round((q.current / q.target) * 100));

            return (
              <div
                key={q.id}
                className="bg-[#FAF6F0] p-4 rounded-2xl border border-[#E5D5C5] text-left"
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{q.emoji}</span>
                    <span className="text-xs font-black text-[#6B4423]">{q.title}</span>
                  </div>

                  <span className="text-[11px] font-black text-[#A67B5B]">
                    {q.current} / {q.target}
                  </span>
                </div>

                <p className="text-[11px] text-[#A67B5B] font-medium mb-2.5">
                  {q.description}
                </p>

                {/* Progress bar */}
                <div className="w-full bg-white h-2 rounded-full overflow-hidden border border-[#E5D5C5] mb-3">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>

                {/* Claim Button */}
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-black text-blue-900 flex items-center gap-1">
                    <span>Recompensa:</span>
                    <span>{q.rewardType === "double_xp" ? "⚡ Potenciador 2x XP" : `💎 +${q.rewardValue} Gemas`}</span>
                  </span>

                  {q.claimed ? (
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                      Reclamado ✓
                    </span>
                  ) : q.completed ? (
                    <button
                      type="button"
                      onClick={() => handleClaim(q.id)}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:brightness-105 text-white font-black text-xs rounded-xl shadow-xs animate-bounce"
                    >
                      ¡Reclamar!
                    </button>
                  ) : (
                    <span className="text-[10px] font-bold text-[#A67B5B]">
                      En progreso ({pct}%)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-full py-3 bg-[#6B4423] hover:bg-[#8C5D35] text-white font-black rounded-2xl text-xs uppercase tracking-wider transition-transform active:scale-95"
        >
          Cerrar Misiones
        </button>
      </motion.div>
    </div>
  );
}
