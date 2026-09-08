"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Sparkles, CheckCircle2, Shield, Crown, Zap, Ban, Heart, CreditCard, ExternalLink, ShieldCheck, Check, Send, Smartphone, Building2, KeyRound } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState<"gateway" | "transfer" | "coupon">("gateway");
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [activated, setActivated] = useState(false);

  if (!isOpen) return null;

  const planPrice = selectedPlan === "yearly" ? "$39.900 CLP ($40 USD)" : "$4.990 CLP ($5 USD)";

  const handleActivateDemo = () => {
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

  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (clean === "CONANPRO" || clean === "ALCPT2026" || clean === "CADETE100") {
      handleActivateDemo();
    } else {
      setCouponMsg("Código inválido o expirado.");
      setTimeout(() => setCouponMsg(""), 3000);
    }
  };

  const handleTransferWhatsApp = () => {
    const text = encodeURIComponent(
      `Hola! Quiero activar mi suscripción Conan PRO (${selectedPlan === "yearly" ? "Plan Anual - $39.900 CLP" : "Plan Mensual - $4.990 CLP"}). Ya realicé la transferencia, adjunto mi comprobante para que activen mi cuenta con vidas infinitas.`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
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
            Desbloquea vidas infinitas (∞), elimina toda publicidad y sube de rango US Army al doble de velocidad.
          </p>
        </div>

        <div className="p-5 sm:p-7">
          {/* THE 3 TIERS COMPARISON */}
          <div className="mb-5">
            <span className="text-[11px] font-black uppercase tracking-wider text-[#A67B5B] block mb-2">
              Las 3 Versiones de ConanGO
            </span>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200">
                <span className="font-black text-slate-800 block text-[11px]">1. Invitado</span>
                <span className="text-[10px] text-slate-500 font-semibold block mt-1">2 Sesiones gratis</span>
                <div className="mt-2 text-[10px] font-bold text-amber-700 bg-amber-50 py-0.5 rounded-lg">
                  Límite 2
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-amber-50/70 border border-amber-200">
                <span className="font-black text-amber-900 block text-[11px]">2. Gratis</span>
                <span className="text-[10px] text-amber-800 font-semibold block mt-1">100 Fórmulas</span>
                <div className="mt-2 text-[10px] font-bold text-blue-700 bg-blue-50 py-0.5 rounded-lg">
                  Con Anuncios
                </div>
              </div>

              <div className="p-2.5 rounded-2xl bg-gradient-to-b from-amber-100 to-yellow-100 border-2 border-amber-400 shadow-xs ring-1 ring-amber-300">
                <div className="inline-flex items-center gap-1 font-black text-amber-950 text-[11px]">
                  <Crown className="w-3 h-3 text-amber-600" />
                  <span>3. PRO</span>
                </div>
                <span className="text-[10px] text-amber-900 font-semibold block mt-1">Vidas ∞ y 0 Ads</span>
                <div className="mt-2 text-[10px] font-black text-white bg-amber-600 py-0.5 rounded-lg shadow-xs">
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
              <div className="text-base font-black text-amber-800 mt-0.5">
                $39.900 CLP
              </div>
              <span className="text-[10px] text-[#A67B5B] font-bold block">
                $40 USD &bull; Todo un año completo
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
              <div className="text-base font-black text-[#6B4423] mt-0.5">
                $4.990 CLP
              </div>
              <span className="text-[10px] text-[#A67B5B] font-bold block">
                $5 USD &bull; Cancela cuando quieras
              </span>
            </button>
          </div>

          {/* PAYMENT METHOD TABS */}
          <div className="flex border-b border-[#E5D5C5] mb-4 text-xs font-black">
            <button
              type="button"
              onClick={() => setActiveTab("gateway")}
              className={`flex-1 py-2.5 text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === "gateway"
                  ? "border-[#F59E0B] text-amber-900"
                  : "border-transparent text-[#A67B5B] hover:text-[#6B4423]"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Tarjeta / Webpay</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("transfer")}
              className={`flex-1 py-2.5 text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === "transfer"
                  ? "border-[#F59E0B] text-amber-900"
                  : "border-transparent text-[#A67B5B] hover:text-[#6B4423]"
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>Transferencia</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("coupon")}
              className={`flex-1 py-2.5 text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                activeTab === "coupon"
                  ? "border-[#F59E0B] text-amber-900"
                  : "border-transparent text-[#A67B5B] hover:text-[#6B4423]"
              }`}
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>Código</span>
            </button>
          </div>

          {/* TAB 1: CARD GATEWAYS (MERCADO PAGO & STRIPE) */}
          {activeTab === "gateway" && (
            <div className="space-y-3">
              <p className="text-xs text-[#A67B5B] font-medium leading-relaxed">
                Paga con dinero real mediante pasarelas bancarias seguras con soporte para Cuenta RUT, Débito, Webpay, Visa o Mastercard:
              </p>

              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://www.mercadopago.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleActivateDemo}
                  className="p-3 rounded-2xl bg-blue-50 border border-blue-200 hover:border-blue-400 text-center transition-all"
                >
                  <span className="text-xs font-black text-blue-900 block">Mercado Pago 💳</span>
                  <span className="text-[10px] text-blue-700 font-bold block mt-0.5">Webpay, Débito, Cuenta RUT</span>
                </a>

                <a
                  href="https://stripe.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleActivateDemo}
                  className="p-3 rounded-2xl bg-indigo-50 border border-indigo-200 hover:border-indigo-400 text-center transition-all"
                >
                  <span className="text-xs font-black text-indigo-900 block">Stripe 🌐</span>
                  <span className="text-[10px] text-indigo-700 font-bold block mt-0.5">Tarjetas, Apple Pay</span>
                </a>
              </div>

              <button
                type="button"
                onClick={handleActivateDemo}
                className="w-full py-3.5 bg-gradient-to-r from-[#F59E0B] to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-black rounded-2xl shadow-conan-btn flex items-center justify-center gap-2 text-xs uppercase tracking-wider transition-transform active:scale-95 mt-2"
              >
                <Crown className="w-4 h-4 text-yellow-200" />
                <span>{activated ? "¡Suscripción Activada!" : `Suscribirme ahora por ${planPrice}`}</span>
              </button>
            </div>
          )}

          {/* TAB 2: BANK TRANSFER & WHATSAPP */}
          {activeTab === "transfer" && (
            <div className="space-y-3 bg-[#FAF6F0] p-4 rounded-2xl border border-[#E5D5C5]">
              <div className="flex items-center gap-2 text-xs font-black text-[#6B4423]">
                <Building2 className="w-4 h-4 text-[#F59E0B]" />
                <span>Datos para Transferencia Bancaria Directa:</span>
              </div>
              <div className="text-xs font-mono bg-white p-3 rounded-xl border border-[#E5D5C5] text-[#6B4423] space-y-1">
                <div><strong>Monto:</strong> {planPrice}</div>
                <div><strong>Cuenta:</strong> Transferencia o Depósito</div>
                <div><strong>Asunto:</strong> Conan PRO + tu correo</div>
              </div>
              <p className="text-[11px] text-[#A67B5B] font-medium">
                Una vez transferido, pulsa el botón de abajo para enviar tu comprobante por WhatsApp y activaremos tu cuenta PRO al instante:
              </p>
              <button
                type="button"
                onClick={handleTransferWhatsApp}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Comprobante por WhatsApp</span>
              </button>
            </div>
          )}

          {/* TAB 3: COUPON CODE */}
          {activeTab === "coupon" && (
            <form onSubmit={handleCouponSubmit} className="space-y-3">
              <p className="text-xs text-[#A67B5B] font-medium">
                Si recibiste un código promocional o clave de acceso de tu instructor o academia, ingrésalo aquí:
              </p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ej: CONANPRO"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  className="flex-1 p-3 rounded-xl border-2 border-[#E5D5C5] bg-[#FAF6F0] text-xs font-black text-[#6B4423] uppercase tracking-wider focus:outline-none focus:border-[#F59E0B]"
                />
                <button
                  type="submit"
                  className="px-5 py-3 bg-[#6B4423] hover:bg-[#8C5D35] text-white font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95"
                >
                  Canjear
                </button>
              </div>
              {couponMsg && (
                <p className="text-xs font-bold text-red-600">{couponMsg}</p>
              )}
              <p className="text-[10px] text-[#A67B5B] font-bold">
                (Código de prueba disponible para pruebas: <code>CONANPRO</code>)
              </p>
            </form>
          )}

          <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#A67B5B] font-bold mt-4 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Encriptación bancaria SSL 256 bits &bull; Cancelación inmediata sin cargos sorpresa.</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
