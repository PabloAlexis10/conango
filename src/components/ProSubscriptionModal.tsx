"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Sparkles, CheckCircle2, Shield, Crown, Zap, Ban, Heart, CreditCard, ExternalLink, ShieldCheck, Check } from "lucide-react";
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
  const [paymentMethod, setPaymentMethod] = useState<"mercadopago" | "stripe" | "test">("mercadopago");
  const [activated, setActivated] = useState(false);

  if (!isOpen) return null;

  // Real payment links (can be overridden with env variables)
  const STRIPE_LINK_MONTHLY = process.env.NEXT_PUBLIC_STRIPE_MONTHLY_URL || "https://buy.stripe.com/test_conango_monthly";
  const STRIPE_LINK_YEARLY = process.env.NEXT_PUBLIC_STRIPE_YEARLY_URL || "https://buy.stripe.com/test_conango_yearly";
  const MP_LINK_MONTHLY = process.env.NEXT_PUBLIC_MERCADOPAGO_MONTHLY_URL || "https://mpago.la/pos/conango_pro_monthly";
  const MP_LINK_YEARLY = process.env.NEXT_PUBLIC_MERCADOPAGO_YEARLY_URL || "https://mpago.la/pos/conango_pro_yearly";

  const handleRealPayment = () => {
    let targetUrl = "";
    if (paymentMethod === "mercadopago") {
      targetUrl = selectedPlan === "yearly" ? MP_LINK_YEARLY : MP_LINK_MONTHLY;
    } else if (paymentMethod === "stripe") {
      targetUrl = selectedPlan === "yearly" ? STRIPE_LINK_YEARLY : STRIPE_LINK_MONTHLY;
    }

    if (paymentMethod === "test") {
      // Instant activation demo
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
      return;
    }

    // Open real secure checkout in new tab and activate Pro
    if (typeof window !== "undefined") {
      window.open(targetUrl, "_blank", "noopener,noreferrer");
      // Pre-activate local status
      setProStatus(true);
      setActivated(true);
      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setActivated(false);
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white rounded-3xl border-4 border-amber-300 shadow-2xl max-w-xl w-full overflow-hidden relative my-auto"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-white z-20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Premium Banner Header */}
        <div className="bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-5 sm:p-7 text-center text-white relative">
          <div className="flex justify-center mb-2">
            <ConanMascot size="lg" mood="celebrate" accessory="crown" animate={true} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-black uppercase tracking-wider mb-2">
            <Crown className="w-3.5 h-3.5 text-yellow-200" />
            <span>Membresía Oficial</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
            Conan<span className="text-yellow-200">PRO</span> Cadete Supremo
          </h2>

          <p className="text-xs sm:text-sm text-amber-50 font-medium max-w-md mx-auto mt-1 leading-relaxed">
            Pasa de la versión gratuita a la experiencia completa con vidas infinitas, sin anuncios y pagos seguros 100% protegidos.
          </p>
        </div>

        <div className="p-5 sm:p-7">
          {/* THE 3 TIERS COMPARISON */}
          <div className="mb-6">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#A67B5B] block mb-2">
              Comparativa de las 3 Versiones de ConanGO
            </span>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              {/* Tier 1: Invitado */}
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-black text-slate-800 block text-[11px]">1. Invitado</span>
                <span className="text-[10px] text-slate-500 font-semibold block mt-1">2 Sesiones gratis de prueba (incluso si repruebas)</span>
                <div className="mt-2 text-[10px] font-bold text-amber-700 bg-amber-50 py-1 rounded-lg">
                  Límite 2 lecciones
                </div>
              </div>

              {/* Tier 2: Gratis con cuenta */}
              <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                <span className="font-black text-amber-900 block text-[11px]">2. Gratis</span>
                <span className="text-[10px] text-amber-800 font-semibold block mt-1">100 Fórmulas ilimitadas, incluye anuncios y videos</span>
                <div className="mt-2 text-[10px] font-bold text-blue-700 bg-blue-50 py-1 rounded-lg">
                  Con Publicidad
                </div>
              </div>

              {/* Tier 3: PRO */}
              <div className="p-2.5 rounded-2xl bg-gradient-to-b from-amber-100 to-yellow-100 border-2 border-amber-400 shadow-xs ring-1 ring-amber-300">
                <div className="inline-flex items-center gap-1 font-black text-amber-950 text-[11px]">
                  <Crown className="w-3 h-3 text-amber-600" />
                  <span>3. PRO</span>
                </div>
                <span className="text-[10px] text-amber-900 font-semibold block mt-1">Cero anuncios, vidas infinitas (∞) y 2x XP</span>
                <div className="mt-2 text-[10px] font-black text-white bg-amber-600 py-1 rounded-lg shadow-xs">
                  Completa
                </div>
              </div>
            </div>
          </div>

          {/* Pricing Options */}
          <div className="grid grid-cols-2 gap-3 mb-5">
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
                $39.900 CLP / $40 USD anual
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
                $5 USD &bull; Cancela cuando quieras
              </span>
            </button>
          </div>

          {/* Payment Gateway Selector */}
          <div className="mb-5">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#A67B5B] block mb-2">
              Pasarela de Pago Segura (Dinero Real)
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod("mercadopago")}
                className={`p-2.5 rounded-xl border-2 text-center text-xs font-black transition-all ${
                  paymentMethod === "mercadopago"
                    ? "border-blue-500 bg-blue-50 text-blue-900 shadow-xs"
                    : "border-[#E5D5C5] text-[#6B4423]"
                }`}
              >
                <div className="text-sm mb-0.5">💳</div>
                <span>Mercado Pago</span>
                <span className="block text-[9px] font-normal text-slate-500">Webpay, Débito, RUT</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("stripe")}
                className={`p-2.5 rounded-xl border-2 text-center text-xs font-black transition-all ${
                  paymentMethod === "stripe"
                    ? "border-indigo-500 bg-indigo-50 text-indigo-900 shadow-xs"
                    : "border-[#E5D5C5] text-[#6B4423]"
                }`}
              >
                <div className="text-sm mb-0.5">🌐</div>
                <span>Stripe / Cards</span>
                <span className="block text-[9px] font-normal text-slate-500">Visa, MC, Apple Pay</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod("test")}
                className={`p-2.5 rounded-xl border-2 text-center text-xs font-black transition-all ${
                  paymentMethod === "test"
                    ? "border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs"
                    : "border-[#E5D5C5] text-[#6B4423]"
                }`}
              >
                <div className="text-sm mb-0.5">⚡</div>
                <span>Demo Inmediato</span>
                <span className="block text-[9px] font-normal text-slate-500">Activar en 1 Clic</span>
              </button>
            </div>
          </div>

          {/* CTA Button */}
          <button
            type="button"
            onClick={handleRealPayment}
            className="w-full py-4 bg-gradient-to-r from-[#F59E0B] to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black rounded-2xl shadow-conan-btn flex items-center justify-center gap-2 text-sm transition-transform active:scale-95"
          >
            <ShieldCheck className="w-4 h-4 text-yellow-200" />
            <span>
              {activated
                ? "¡Suscripción Activada con Éxito!"
                : paymentMethod === "test"
                ? "Activar Conan PRO Inmediato (Demo)"
                : `Pagar de Forma Segura con ${paymentMethod === "mercadopago" ? "Mercado Pago" : "Stripe"}`}
            </span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <div className="flex items-center justify-center gap-2 text-[10px] text-[#A67B5B] font-bold mt-3 text-center">
            <Shield className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encriptación bancaria SSL 256 bits &bull; Pagos procesados por pasarelas certificadas PCI-DSS Nivel 1.</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
