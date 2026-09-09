"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Crown,
  Check,
  ShieldCheck,
  Zap,
  CreditCard,
  KeyRound,
  ExternalLink,
  Loader2,
  Clock,
  CheckCircle2,
  Lock,
  Sparkles,
  Info,
  BadgeCheck,
  AlertCircle,
} from "lucide-react";
import ConanMascot from "./ConanMascot";
import { setProStatus } from "@/lib/supabase";
import { soundEffects } from "@/lib/soundEffects";
import { getCheckoutUrl, verifyPaymentWithServer, createCheckoutPreference } from "@/lib/payments";
import confetti from "canvas-confetti";

interface ProSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type PaymentState = "idle" | "waiting_confirmation" | "verifying" | "confirmed" | "error";

export default function ProSubscriptionModal({
  isOpen,
  onClose,
  onSuccess,
}: ProSubscriptionModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<"monthly" | "yearly">("yearly");
  const [activeTab, setActiveTab] = useState<"gateway" | "coupon">("gateway");
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [selectedGateway, setSelectedGateway] = useState<"mercadopago" | "stripe">("mercadopago");
  const [orderId, setOrderId] = useState<string>("");
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");

  const [operationNumber, setOperationNumber] = useState<string>("");
  const [verifyError, setVerifyError] = useState<string>("");

  if (!isOpen) return null;

  const planPrice = selectedPlan === "yearly" ? "$39.900 CLP" : "$4.990 CLP";
  const planUsd = selectedPlan === "yearly" ? "$40 USD / Año" : "$5 USD / Mes";

  // Iniciar proceso de pago real mediante pasarela blindada
  const handleInitiatePayment = async (gateway: "mercadopago" | "stripe") => {
    setSelectedGateway(gateway);
    const newOrderId = "CNP-" + Math.floor(100000 + Math.random() * 900000);
    setOrderId(newOrderId);
    setVerifyError("");
    setPaymentState("waiting_confirmation");

    soundEffects.playClick();

    if (gateway === "mercadopago") {
      try {
        const pref = await createCheckoutPreference(selectedPlan, newOrderId);
        const urlToOpen = pref.initPoint || getCheckoutUrl("mercadopago", selectedPlan);
        if (typeof window !== "undefined") {
          window.open(urlToOpen, "_blank", "noopener,noreferrer");
        }
      } catch {
        const fallbackUrl = getCheckoutUrl("mercadopago", selectedPlan);
        if (typeof window !== "undefined") {
          window.open(fallbackUrl, "_blank", "noopener,noreferrer");
        }
      }
    } else {
      const checkoutUrl = getCheckoutUrl(gateway, selectedPlan);
      if (typeof window !== "undefined") {
        window.open(checkoutUrl, "_blank", "noopener,noreferrer");
      }
    }
  };

  // Verificar y confirmar el pago real contra los servidores de Mercado Pago
  const handleVerifyRealPayment = async () => {
    setVerifyError("");
    setPaymentState("verifying");
    soundEffects.playClick();

    const idToVerify = operationNumber.trim() || orderId;
    const result = await verifyPaymentWithServer(idToVerify);

    if (result.verified) {
      setPaymentState("confirmed");
      setProStatus(true); // Activa vidas infinitas (medals: 9999), pero NO gemas infinitas
      soundEffects.playLevelUp();

      try {
        confetti({
          particleCount: 90,
          spread: 80,
          origin: { y: 0.6 },
          colors: ["#F59E0B", "#FBBF24", "#6B4423"],
        });
      } catch {
        // ignore confetti errors
      }

      setTimeout(() => {
        if (onSuccess) onSuccess();
        onClose();
        setPaymentState("idle");
        setOperationNumber("");
      }, 2600);
    } else {
      setPaymentState("waiting_confirmation");
      setVerifyError(
        result.error ||
          "El pago no figura acreditado en Mercado Pago. Si ya pagaste en Webpay, espera unos segundos a que se procese o verifica el N° de operación."
      );
      soundEffects.playIncorrect();
    }
  };

  // Validación de cupón
  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (clean === "CONANPRO" || clean === "ALCPT2026" || clean === "AIRFORCE100" || clean === "USAF100") {
      setPaymentState("verifying");
      setTimeout(() => {
        setPaymentState("confirmed");
        setProStatus(true);
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
          setPaymentState("idle");
        }, 2200);
      }, 1500);
    } else {
      setCouponMsg("Código inválido o expirado. Ingresa un cupón autorizado.");
      setTimeout(() => setCouponMsg(""), 3500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl border-4 border-amber-300 dark:border-amber-500 shadow-2xl max-w-xl w-full overflow-hidden relative my-auto"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-white z-20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header con Conan Realista */}
        <div className="bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 p-5 sm:p-7 text-center text-white relative">
          <div className="flex justify-center mb-2">
            <ConanMascot size="lg" mood="celebrate" animate={true} />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-xs font-black uppercase tracking-wider mb-2">
            <Crown className="w-3.5 h-3.5 text-yellow-200" />
            <span>Membresía Oficial</span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-sm">
            Conan<span className="text-yellow-200">PRO</span> Élite Táctica
          </h2>

          <p className="text-xs sm:text-sm text-amber-50 font-medium max-w-md mx-auto mt-1 leading-relaxed">
            Desbloquea vidas infinitas (∞), elimina toda publicidad y obtén 2x XP permanente.
          </p>

          <div className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-lg bg-black/20 text-[11px] font-bold text-yellow-100">
            <Info className="w-3 h-3" />
            <span>El plan PRO otorga vidas infinitas. Las gemas se deben ganar en misiones.</span>
          </div>
        </div>

        {/* BODY */}
        <div className="p-5 sm:p-7">
          {/* CASO 1: ESPERANDO CONFIRMACIÓN DEL PAGO REAL */}
          {paymentState === "waiting_confirmation" && (
            <div className="space-y-4 text-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 flex items-center justify-center mx-auto text-2xl animate-pulse">
                <Clock className="w-8 h-8 text-[#F59E0B]" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#A67B5B] dark:text-slate-400 block">
                  Orden #{orderId}
                </span>
                <h3 className="text-lg font-black text-[#6B4423] dark:text-white">
                  Completando Pago en Modo Seguro
                </h3>
                <p className="text-xs text-[#A67B5B] dark:text-slate-300 mt-1 max-w-sm mx-auto">
                  Se abrió la pasarela oficial de{" "}
                  <strong className="text-blue-600 dark:text-blue-400">
                    {selectedGateway === "mercadopago" ? "Webpay Plus / Mercado Pago" : "Stripe"}
                  </strong>
                  . Tus datos y los del vendedor están 100% blindados y cifrados.
                </p>
              </div>

              <div className="bg-[#FAF6F0] dark:bg-slate-800/80 p-3.5 rounded-2xl border border-[#E5D5C5] dark:border-slate-700 text-left text-xs space-y-1.5 font-medium text-[#6B4423] dark:text-slate-200">
                <div className="flex justify-between">
                  <span className="text-[#A67B5B] dark:text-slate-400">Plan Seleccionado:</span>
                  <strong>{selectedPlan === "yearly" ? "Plan Anual (33% Dcto)" : "Plan Mensual"}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A67B5B] dark:text-slate-400">Total a Validar:</span>
                  <strong className="text-amber-700 dark:text-amber-400 text-sm">{planPrice}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A67B5B] dark:text-slate-400">Estado:</span>
                  <span className="text-orange-600 dark:text-orange-400 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                    Esperando Pago en Pasarela
                  </span>
                </div>
              </div>

              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[11px] text-emerald-800 dark:text-emerald-300 flex flex-col gap-2 text-left">
                <div className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Transacción Privada:</strong> Al pagar con Webpay / Redcompra o Tarjeta, no necesitas transferir ni ver cuentas personales. El cobro entra seguro a la plataforma y se acredita al instante.
                  </span>
                </div>
                {selectedGateway === "mercadopago" && (
                  <div className="pt-2 border-t border-emerald-200 dark:border-emerald-800/60 flex items-center justify-between text-xs">
                    <span>Monto a ingresar en Mercado Pago: <strong className="text-emerald-900 dark:text-emerald-200 font-black">{planPrice}</strong></span>
                    <a
                      href={getCheckoutUrl("mercadopago", selectedPlan)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 font-bold underline hover:text-blue-800 flex items-center gap-1"
                    >
                      <span>Abrir Link Directo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                )}
              </div>

              {/* Input opcional de N° de Operación para verificación bancaria */}
              <div className="text-left space-y-1.5 pt-1">
                <label className="block text-[11px] font-black uppercase text-[#6B4423] dark:text-slate-300">
                  N° de Operación / Comprobante de Mercado Pago (Opcional):
                </label>
                <input
                  type="text"
                  value={operationNumber}
                  onChange={(e) => setOperationNumber(e.target.value)}
                  placeholder="Ej: 8492019482 (de tu email o cartola)"
                  className="w-full p-2.5 rounded-xl border-2 border-[#E5D5C5] dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-mono font-bold text-[#6B4423] dark:text-white placeholder:text-slate-400"
                />
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  Si pagaste con Webpay o CuentaRUT, este número figura en el comprobante de pago emitido por Mercado Pago.
                </p>
              </div>

              {verifyError && (
                <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-800 rounded-xl text-xs font-bold text-red-700 dark:text-red-300 flex items-start gap-2 text-left">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{verifyError}</span>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentState("idle")}
                  className="flex-1 py-3 border-2 border-[#E5D5C5] dark:border-slate-700 text-[#A67B5B] dark:text-slate-300 hover:text-[#6B4423] rounded-xl text-xs font-bold transition-colors"
                >
                  Volver a Planes
                </button>

                <button
                  type="button"
                  onClick={handleVerifyRealPayment}
                  className="flex-2 py-3 bg-gradient-to-r from-[#F59E0B] to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-black shadow-conan-btn flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Ya Pagué en Webpay &bull; Activar PRO</span>
                </button>
              </div>
            </div>
          )}

          {/* CASO 2: VERIFICANDO CON LA PASARELA BANCARIA */}
          {paymentState === "verifying" && (
            <div className="py-10 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-[#F59E0B] animate-spin mx-auto" />
              <h3 className="text-base font-black text-[#6B4423] dark:text-white">
                Consultando con la pasarela de pago...
              </h3>
              <p className="text-xs text-[#A67B5B] dark:text-slate-300">
                Verificando la aprobación bancaria de Webpay / Mercado Pago.
              </p>
            </div>
          )}

          {/* CASO 3: CONFIRMADO EXITOSAMENTE */}
          {paymentState === "confirmed" && (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-[#6B4423] dark:text-white">
                ¡Pago Confirmado Exitosamente!
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 max-w-sm mx-auto font-medium">
                Tu suscripción <strong>Conan PRO</strong> ha sido activada con <strong>Vidas Infinitas (∞)</strong> y sin publicidad. ¡Bienvenido a bordo!
              </p>
            </div>
          )}

          {/* CASO 0: ESTADO NORMAL (SELECCIÓN Y PASARELAS) */}
          {paymentState === "idle" && (
            <>
              {/* THE 3 TIERS COMPARISON */}
              <div className="mb-5">
                <span className="text-[11px] font-black uppercase tracking-wider text-[#A67B5B] dark:text-slate-400 block mb-2">
                  Las 3 Versiones de ConanGO
                </span>

                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <span className="font-black text-slate-800 dark:text-slate-200 block text-[11px]">1. Invitado</span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block mt-1">2 Sesiones</span>
                    <div className="mt-2 text-[10px] font-bold text-amber-700 bg-amber-50 dark:bg-amber-950/40 py-0.5 rounded-lg">
                      Límite 2
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800">
                    <span className="font-black text-amber-900 dark:text-amber-200 block text-[11px]">2. Gratis</span>
                    <span className="text-[10px] text-amber-800 dark:text-amber-300 font-semibold block mt-1">100 Fórmulas</span>
                    <div className="mt-2 text-[10px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 py-0.5 rounded-lg">
                      Con Anuncios
                    </div>
                  </div>

                  <div className="p-2.5 rounded-2xl bg-gradient-to-b from-amber-100 to-yellow-100 dark:from-amber-950/60 dark:to-yellow-950/40 border-2 border-amber-400 dark:border-amber-500 shadow-xs ring-1 ring-amber-300">
                    <div className="inline-flex items-center gap-1 font-black text-amber-950 dark:text-amber-100 text-[11px]">
                      <Crown className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                      <span>3. PRO</span>
                    </div>
                    <span className="text-[10px] text-amber-900 dark:text-amber-200 font-semibold block mt-1">Vidas ∞ y 0 Ads</span>
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
                      ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 shadow-sm"
                      : "border-[#E5D5C5] dark:border-slate-700 hover:border-[#A67B5B]"
                  }`}
                >
                  <div className="absolute -top-2.5 right-2 bg-amber-500 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                    Ahorra 33%
                  </div>
                  <span className="text-xs font-black text-[#6B4423] dark:text-slate-200 block">Plan Anual</span>
                  <div className="text-base font-black text-amber-800 dark:text-amber-400 mt-0.5">
                    $39.900 CLP
                  </div>
                  <span className="text-[10px] text-[#A67B5B] dark:text-slate-400 font-bold block">
                    $40 USD &bull; Todo el año
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedPlan("monthly")}
                  className={`p-3.5 rounded-2xl border-2 text-left transition-all ${
                    selectedPlan === "monthly"
                      ? "border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 shadow-sm"
                      : "border-[#E5D5C5] dark:border-slate-700 hover:border-[#A67B5B]"
                  }`}
                >
                  <span className="text-xs font-black text-[#6B4423] dark:text-slate-200 block">Plan Mensual</span>
                  <div className="text-base font-black text-[#6B4423] dark:text-white mt-0.5">
                    $4.990 CLP
                  </div>
                  <span className="text-[10px] text-[#A67B5B] dark:text-slate-400 font-bold block">
                    $5 USD &bull; Cancela cuando quieras
                  </span>
                </button>
              </div>

              {/* PAYMENT METHOD TABS: EXCLUSIVELY SECURE GATEWAYS (NO MANUAL DATA LEAK) */}
              <div className="flex border-b border-[#E5D5C5] dark:border-slate-700 mb-4 text-xs font-black">
                <button
                  type="button"
                  onClick={() => setActiveTab("gateway")}
                  className={`flex-1 py-2.5 text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === "gateway"
                      ? "border-[#F59E0B] text-amber-900 dark:text-amber-400"
                      : "border-transparent text-[#A67B5B] dark:text-slate-400 hover:text-[#6B4423]"
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span>Pasarelas Seguras (Webpay & Tarjetas)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("coupon")}
                  className={`flex-1 py-2.5 text-center border-b-2 flex items-center justify-center gap-1.5 transition-colors ${
                    activeTab === "coupon"
                      ? "border-[#F59E0B] text-amber-900 dark:text-amber-400"
                      : "border-transparent text-[#A67B5B] dark:text-slate-400 hover:text-[#6B4423]"
                  }`}
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Beca / Cupón</span>
                </button>
              </div>

              {/* TAB 1: 100% SECURE GATEWAYS */}
              {activeTab === "gateway" && (
                <div className="space-y-3">
                  {/* Opción 1: Mercado Pago / Webpay Plus (Principal para Chile) */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-sky-950/20 border-2 border-blue-300 dark:border-blue-700 relative">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-blue-950 dark:text-blue-200">
                            Mercado Pago • Webpay Plus 🇨🇱
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[9px] font-black uppercase">
                            Recomendado
                          </span>
                        </div>
                        <p className="text-[11px] text-blue-800 dark:text-blue-300 font-medium mt-1">
                          Paga con <strong>Redcompra</strong>, <strong>CuentaRUT</strong>, Débito o Crédito en cuotas.
                        </p>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-600 shadow-2xs">
                            Webpay Plus
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-600 shadow-2xs">
                            CuentaRUT
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-600 shadow-2xs">
                            Redcompra
                          </span>
                          <span className="px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-bold border border-slate-200 dark:border-slate-600 shadow-2xs">
                            Tarjetas Bancarias
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleInitiatePayment("mercadopago")}
                        className="py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs shadow-md transition-transform active:scale-95 flex items-center gap-1.5 shrink-0 self-center"
                      >
                        <span>Pagar {planPrice}</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Opción 2: Stripe (Internacional) */}
                  <div className="p-3.5 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-800 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-indigo-950 dark:text-indigo-200">
                          Stripe (Tarjetas Internacionales) 🌎
                        </span>
                      </div>
                      <span className="text-[10px] text-indigo-700 dark:text-indigo-300 font-medium block mt-0.5">
                        Visa, Mastercard, American Express, Apple Pay y Google Pay.
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleInitiatePayment("stripe")}
                      className="py-2 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-xs transition-transform active:scale-95 flex items-center gap-1 shrink-0"
                    >
                      <span>Pagar {planUsd}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Banner de Cero Exposición de Datos Personales */}
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-[11px] text-emerald-900 dark:text-emerald-300 flex items-start gap-2">
                    <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong>Privacidad 100% Protegida:</strong>
                      <p className="text-[10px] text-emerald-800 dark:text-emerald-300 mt-0.5 leading-relaxed">
                        Nadie ve tus datos bancarios ni tu RUT. La transacción la procesan directamente los servidores seguros de Webpay Plus y Mercado Pago bajo cifrado bancario SSL 256-bit.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: COUPON CODE */}
              {activeTab === "coupon" && (
                <form onSubmit={handleCouponSubmit} className="space-y-3">
                  <p className="text-xs text-[#A67B5B] dark:text-slate-400 font-medium">
                    Si posees un código promocional o beca institucional, ingrésalo aquí para validación:
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Ej: CONANPRO"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      className="flex-1 p-3 rounded-xl border-2 border-[#E5D5C5] dark:border-slate-700 bg-[#FAF6F0] dark:bg-slate-800 text-xs font-black text-[#6B4423] dark:text-white uppercase tracking-wider focus:outline-none focus:border-[#F59E0B]"
                    />
                    <button
                      type="submit"
                      className="px-5 py-3 bg-[#6B4423] dark:bg-amber-600 hover:bg-[#8C5D35] text-white font-black text-xs rounded-xl shadow-xs transition-transform active:scale-95"
                    >
                      Validar
                    </button>
                  </div>
                  {couponMsg && (
                    <p className="text-xs font-bold text-red-600">{couponMsg}</p>
                  )}
                  <p className="text-[10px] text-[#A67B5B] dark:text-slate-400 font-bold">
                    (Código de demostración para pruebas del sistema: <code>CONANPRO</code>)
                  </p>
                </form>
              )}

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#A67B5B] dark:text-slate-400 font-bold mt-4 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Cifrado bancario seguro &bull; Activación oficial de Vidas Infinitas (∞).</span>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
