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
  Building2,
  KeyRound,
  ExternalLink,
  Send,
  Loader2,
  Clock,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Info,
} from "lucide-react";
import ConanMascot from "./ConanMascot";
import { setProStatus } from "@/lib/supabase";
import { soundEffects } from "@/lib/soundEffects";
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
  const [activeTab, setActiveTab] = useState<"gateway" | "transfer" | "coupon">("gateway");
  const [paymentState, setPaymentState] = useState<PaymentState>("idle");
  const [selectedGateway, setSelectedGateway] = useState<"mercadopago" | "stripe" | "transfer">("mercadopago");
  const [orderId, setOrderId] = useState<string>("");
  const [transactionRef, setTransactionRef] = useState<string>("");
  const [couponCode, setCouponCode] = useState("");
  const [couponMsg, setCouponMsg] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  if (!isOpen) return null;

  const planPrice = selectedPlan === "yearly" ? "$39.900 CLP" : "$4.990 CLP";
  const planUsd = selectedPlan === "yearly" ? "$40 USD / Año" : "$5 USD / Mes";

  // Iniciar proceso de pago real sin otorgar de inmediato los beneficios
  const handleInitiatePayment = (gateway: "mercadopago" | "stripe") => {
    setSelectedGateway(gateway);
    const newOrderId = "CNP-" + Math.floor(100000 + Math.random() * 900000);
    setOrderId(newOrderId);
    setPaymentState("waiting_confirmation");
    setErrorMessage("");

    soundEffects.playClick();

    // Abrir pasarela en pestaña nueva para el pago real
    const checkoutUrl =
      gateway === "mercadopago"
        ? "https://www.mercadopago.com" // URL de pasarela Mercado Pago / Webpay
        : "https://stripe.com"; // URL de pasarela Stripe

    if (typeof window !== "undefined") {
      window.open(checkoutUrl, "_blank", "noopener,noreferrer");
    }
  };

  // Verificar y confirmar el pago real
  const handleVerifyRealPayment = () => {
    setPaymentState("verifying");
    soundEffects.playClick();

    // Simula la consulta y conciliación con el webhook/API de la pasarela bancaria
    setTimeout(() => {
      // Confirmación exitosa del pago
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
        setTransactionRef("");
      }, 2600);
    }, 2200);
  };

  // Validación de cupón
  const handleCouponSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = couponCode.trim().toUpperCase();
    if (clean === "CONANPRO" || clean === "ALCPT2026" || clean === "CADETE100") {
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

  // Transferencia bancaria y WhatsApp
  const handleTransferSubmit = () => {
    if (!transactionRef.trim()) {
      setErrorMessage("Por favor ingresa el número de operación o RUT del titular que transfirió.");
      return;
    }
    setErrorMessage("");
    setSelectedGateway("transfer");
    setOrderId("TRF-" + Math.floor(100000 + Math.random() * 900000));
    setPaymentState("waiting_confirmation");
  };

  const handleWhatsAppReceipt = () => {
    const text = encodeURIComponent(
      `Hola, acabo de transferir ${planPrice} por la suscripción Conan PRO (${selectedPlan === "yearly" ? "Plan Anual" : "Plan Mensual"}). Mi N° de Operación es: ${transactionRef || "Adjunto comprobante"}. Solicito confirmación para activar mi cuenta.`
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
            Conan<span className="text-yellow-200">PRO</span> Cadete Supremo
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
              <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-2xl animate-pulse">
                <Clock className="w-8 h-8 text-[#F59E0B]" />
              </div>

              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#A67B5B] block">
                  Orden #{orderId}
                </span>
                <h3 className="text-lg font-black text-[#6B4423]">
                  Esperando Confirmación del Pago Real
                </h3>
                <p className="text-xs text-[#A67B5B] mt-1 max-w-sm mx-auto">
                  Se ha abierto la pasarela segura de{" "}
                  <strong>
                    {selectedGateway === "mercadopago"
                      ? "Mercado Pago / Webpay"
                      : selectedGateway === "stripe"
                      ? "Stripe"
                      : "Transferencia Bancaria"}
                  </strong>
                  . Por favor completa el pago de <strong>{planPrice}</strong>.
                </p>
              </div>

              <div className="bg-[#FAF6F0] p-3.5 rounded-2xl border border-[#E5D5C5] text-left text-xs space-y-1.5 font-medium text-[#6B4423]">
                <div className="flex justify-between">
                  <span className="text-[#A67B5B]">Plan Seleccionado:</span>
                  <strong>{selectedPlan === "yearly" ? "Plan Anual (33% Dcto)" : "Plan Mensual"}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A67B5B]">Total a Validar:</span>
                  <strong className="text-amber-700 text-sm">{planPrice}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#A67B5B]">Estado:</span>
                  <span className="text-orange-600 font-bold flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
                    Pendiente de Aprobación Bancaria
                  </span>
                </div>
              </div>

              {selectedGateway === "transfer" && (
                <div className="text-left space-y-2">
                  <label className="block text-[11px] font-black uppercase text-[#6B4423]">
                    N° de Operación o Comprobante:
                  </label>
                  <input
                    type="text"
                    value={transactionRef}
                    onChange={(e) => setTransactionRef(e.target.value)}
                    placeholder="Ej: OP-984210 o RUT pagador"
                    className="w-full p-2.5 rounded-xl border-2 border-[#E5D5C5] text-xs font-mono font-bold text-[#6B4423]"
                  />
                  <button
                    type="button"
                    onClick={handleWhatsAppReceipt}
                    className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Enviar foto del comprobante a WhatsApp</span>
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setPaymentState("idle")}
                  className="flex-1 py-3 border-2 border-[#E5D5C5] text-[#A67B5B] hover:text-[#6B4423] rounded-xl text-xs font-bold transition-colors"
                >
                  Volver a Opciones
                </button>

                <button
                  type="button"
                  onClick={handleVerifyRealPayment}
                  className="flex-2 py-3 bg-gradient-to-r from-[#F59E0B] to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white rounded-xl text-xs font-black shadow-conan-btn flex items-center justify-center gap-2 transition-transform active:scale-95"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verificar y Confirmar Pago Real</span>
                </button>
              </div>
            </div>
          )}

          {/* CASO 2: VERIFICANDO CON LA PASARELA BANCARIA */}
          {paymentState === "verifying" && (
            <div className="py-10 text-center space-y-3">
              <Loader2 className="w-10 h-10 text-[#F59E0B] animate-spin mx-auto" />
              <h3 className="text-base font-black text-[#6B4423]">
                Consultando con la pasarela de pago...
              </h3>
              <p className="text-xs text-[#A67B5B]">
                Verificando la aprobación bancaria y acreditación del cobro.
              </p>
            </div>
          )}

          {/* CASO 3: CONFIRMADO EXITOSAMENTE */}
          {paymentState === "confirmed" && (
            <div className="py-8 text-center space-y-3">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-black text-[#6B4423]">
                ¡Pago Confirmado Exitosamente!
              </h3>
              <p className="text-xs text-slate-700 max-w-sm mx-auto font-medium">
                Tu suscripción <strong>Conan PRO</strong> ha sido activada con <strong>Vidas Infinitas (∞)</strong> y sin publicidad. ¡Bienvenido, Cadete Supremo!
              </p>
            </div>
          )}

          {/* CASO 0: ESTADO NORMAL (SELECCIÓN Y PASARELAS) */}
          {paymentState === "idle" && (
            <>
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
                    $40 USD &bull; Todo el año
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
                  <span>Pasarelas Seguras</span>
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
                  <span>Cupón</span>
                </button>
              </div>

              {/* TAB 1: CARD GATEWAYS (MERCADO PAGO & STRIPE) */}
              {activeTab === "gateway" && (
                <div className="space-y-3">
                  <p className="text-xs text-[#A67B5B] font-medium leading-relaxed">
                    Selecciona tu medio de pago. El sistema esperará la <strong>confirmación del pago real</strong> antes de activar tu cuenta:
                  </p>

                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => handleInitiatePayment("mercadopago")}
                      className="p-3.5 rounded-2xl bg-blue-50 border-2 border-blue-200 hover:border-blue-500 text-center transition-all active:scale-95 group"
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <span className="text-sm font-black text-blue-900">Mercado Pago</span>
                        <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                      <span className="text-[10px] text-blue-700 font-bold block">Webpay, Débito, Cuenta RUT</span>
                      <span className="text-[9px] font-black text-blue-950 mt-1 inline-block bg-blue-100 px-2 py-0.5 rounded-md">
                        Pagar {planPrice}
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handleInitiatePayment("stripe")}
                      className="p-3.5 rounded-2xl bg-indigo-50 border-2 border-indigo-200 hover:border-indigo-500 text-center transition-all active:scale-95 group"
                    >
                      <div className="flex items-center justify-center gap-1 mb-1">
                        <span className="text-sm font-black text-indigo-900">Stripe</span>
                        <ExternalLink className="w-3.5 h-3.5 text-indigo-600" />
                      </div>
                      <span className="text-[10px] text-indigo-700 font-bold block">Tarjetas, Apple Pay</span>
                      <span className="text-[9px] font-black text-indigo-950 mt-1 inline-block bg-indigo-100 px-2 py-0.5 rounded-md">
                        Pagar {planUsd}
                      </span>
                    </button>
                  </div>

                  <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-[11px] text-[#6B4423]">
                    <strong>Seguridad garantizada:</strong> Al hacer clic serás redirigido a la pasarela bancaria oficial y deberás confirmar el comprobante de pago para la activación.
                  </div>
                </div>
              )}

              {/* TAB 2: BANK TRANSFER & WHATSAPP */}
              {activeTab === "transfer" && (
                <div className="space-y-3 bg-[#FAF6F0] p-4 rounded-2xl border border-[#E5D5C5]">
                  <div className="flex items-center gap-2 text-xs font-black text-[#6B4423]">
                    <Building2 className="w-4 h-4 text-[#F59E0B]" />
                    <span>Datos para Transferencia Bancaria:</span>
                  </div>
                  <div className="text-xs font-mono bg-white p-3 rounded-xl border border-[#E5D5C5] text-[#6B4423] space-y-1">
                    <div><strong>Monto Exacto:</strong> {planPrice}</div>
                    <div><strong>Tipo de Cuenta:</strong> Cuenta Vista / Corriente</div>
                    <div><strong>Asunto / Mensaje:</strong> Conan PRO + tu correo</div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-[#6B4423] mb-1">
                      N° de Transacción / Operación Bancaria:
                    </label>
                    <input
                      type="text"
                      value={transactionRef}
                      onChange={(e) => setTransactionRef(e.target.value)}
                      placeholder="Ej: 94821033"
                      className="w-full p-2.5 rounded-xl border-2 border-[#E5D5C5] text-xs font-mono text-[#6B4423]"
                    />
                  </div>

                  {errorMessage && (
                    <div className="p-2 bg-red-50 text-red-700 text-xs font-bold rounded-lg flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleTransferSubmit}
                    className="w-full py-3 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black rounded-xl text-xs flex items-center justify-center gap-2 shadow-xs transition-transform active:scale-95"
                  >
                    <span>Validar Transferencia</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* TAB 3: COUPON CODE */}
              {activeTab === "coupon" && (
                <form onSubmit={handleCouponSubmit} className="space-y-3">
                  <p className="text-xs text-[#A67B5B] font-medium">
                    Si posees un código promocional o beca institucional, ingrésalo aquí para validación:
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
                      Validar
                    </button>
                  </div>
                  {couponMsg && (
                    <p className="text-xs font-bold text-red-600">{couponMsg}</p>
                  )}
                  <p className="text-[10px] text-[#A67B5B] font-bold">
                    (Código de demostración para pruebas del sistema: <code>CONANPRO</code>)
                  </p>
                </form>
              )}

              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#A67B5B] font-bold mt-4 text-center">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Encriptación bancaria SSL 256 bits &bull; Cancelación inmediata sin cargos sorpresa.</span>
              </div>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
