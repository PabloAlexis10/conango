"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Sparkles, CheckCircle2, Shield, Crown, Zap, Ban, Heart } from "lucide-react";
import ConanMascot from "./ConanMascot";
import { setProStatus, getCurrentUser } from "@/lib/supabase";
import { soundEffects } from "@/lib/soundEffects";
import confetti from "canvas-confetti";

interface ProSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function ProSubscriptionModal({
  isOpen,
  onClose,
  onSuccess,
}: ProSubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const [activated, setActivated] = useState(false);

  if (!isOpen) return null;

  const handleActivatePro = () => {
    setProStatus(true);
    setActivated(true);
    soundEffects.playLevelUp();
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
      colors: ["#F59E0B", "#FBBF24", "#6B4423"],
    });
    setTimeout(() => {
      if (onSuccess) onSuccess();
      onClose();
      setActivated(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl border-4 border-amber-300 shadow-2xl max-w-lg w-full overflow-hidden relative"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-white z-20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Premium Banner Header */}
        <div className="bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-6 sm:p-8 text-center text-white relative">
          <div className="flex justify-center mb-2">
            <ConanMascot size="lg" mood="celebrate" accessory="crown" animate={true} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-black uppercase tracking-wider mb-2">
            <Crown className="w-3.5 h-3.5 text-yellow-200" />
            <span>Suscripción Oficial</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
            Conan<span className="text-yellow-200">PRO</span> Cadete Supremo
          </h2>

          <p className="text-xs sm:text-sm text-amber-50 font-medium max-w-sm mx-auto mt-1">
            Elimina límites y entrena con todas las ventajas tácticas de la plataforma.
          </p>
        </div>

        {/* Benefits Checklist */}
        <div className="p-6 sm:p-8">
          <div className="space-y-3 mb-6">
            <div className="flex items-start gap-3 bg-amber-50 p-3 rounded-2xl border border-amber-200 text-xs font-bold text-[#6B4423]">
              <div className="p-1.5 bg-amber-500 text-white rounded-xl flex-shrink-0">
                <Heart className="w-4 h-4" />
              </div>
              <div>
                <span className="font-black text-sm block">Vidas / Medallas Infinitas (∞)</span>
                <span className="text-[#A67B5B] font-semibold text-[11px]">
                  Nunca te quedes sin vidas. Practica sin temor a equivocarte.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-emerald-50 p-3 rounded-2xl border border-emerald-200 text-xs font-bold text-[#6B4423]">
              <div className="p-1.5 bg-emerald-600 text-white rounded-xl flex-shrink-0">
                <Ban className="w-4 h-4" />
              </div>
              <div>
                <span className="font-black text-sm block">Cero Anuncios (100% Libre de Publicidad)</span>
                <span className="text-[#A67B5B] font-semibold text-[11px]">
                  Experiencia limpia, rápida y sin interrupciones ni pausas obligadas.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-blue-50 p-3 rounded-2xl border border-blue-200 text-xs font-bold text-[#6B4423]">
              <div className="p-1.5 bg-blue-600 text-white rounded-xl flex-shrink-0">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <span className="font-black text-sm block">Doble Experiencia Permanente (2x XP)</span>
                <span className="text-[#A67B5B] font-semibold text-[11px]">
                  Asciende de rango militar el doble de rápido en todas las evaluaciones.
                </span>
              </div>
            </div>

            <div className="flex items-start gap-3 bg-purple-50 p-3 rounded-2xl border border-purple-200 text-xs font-bold text-[#6B4423]">
              <div className="p-1.5 bg-purple-600 text-white rounded-xl flex-shrink-0">
                <Crown className="w-4 h-4" />
              </div>
              <div>
                <span className="font-black text-sm block">Todos los Atuendos y Corona Dorada</span>
                <span className="text-[#A67B5B] font-semibold text-[11px]">
                  Desbloquea instantáneamente todos los trajes tácticos de Conan.
                </span>
              </div>
            </div>
          </div>

          {/* Pricing Options */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <button
              type="button"
              onClick={() => setSelectedPlan("yearly")}
              className={`p-3.5 rounded-2xl border-2 text-left relative transition-all ${
                selectedPlan === "yearly"
                  ? "border-amber-500 bg-amber-50/50 shadow-sm"
                  : "border-[#E5D5C5] hover:border-[#A67B5B]"
              }`}
            >
              <div className="absolute -top-2.5 right-2 bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                Ahorra 33%
              </div>
              <span className="text-xs font-black text-[#6B4423] block">Plan Anual</span>
              <div className="text-base font-black text-amber-800 mt-1">
                $3.325 <span className="text-[10px] text-[#A67B5B]">/mes</span>
              </div>
              <span className="text-[10px] text-[#A67B5B] font-bold block mt-0.5">
                Facturado anualmente
              </span>
            </button>

            <button
              type="button"
              onClick={() => setSelectedPlan("monthly")}
              className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                selectedPlan === "monthly"
                  ? "border-amber-500 bg-amber-50/50 shadow-sm"
                  : "border-[#E5D5C5] hover:border-[#A67B5B]"
              }`}
            >
              <span className="text-xs font-black text-[#6B4423] block">Plan Mensual</span>
              <div className="text-base font-black text-[#6B4423] mt-1">
                $4.990 <span className="text-[10px] text-[#A67B5B]">/mes</span>
              </div>
              <span className="text-[10px] text-[#A67B5B] font-bold block mt-0.5">
                Cancela cuando quieras
              </span>
            </button>
          </div>

          {/* CTA Button */}
          <button
            type="button"
            onClick={handleActivatePro}
            className="w-full py-4 bg-gradient-to-r from-[#F59E0B] to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black rounded-2xl shadow-conan-btn flex items-center justify-center gap-2 text-sm transition-transform active:scale-95"
          >
            <Crown className="w-4 h-4 text-yellow-200" />
            <span>{activated ? "¡Membresía Activada con Éxito!" : "Comenzar Prueba Gratuita Conan PRO"}</span>
          </button>
          <p className="text-center text-[10px] text-[#A67B5B] font-bold mt-2.5">
            Garantía de satisfacción táctica. Cancela en cualquier momento sin penalidad.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
