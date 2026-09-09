"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Header from "@/components/Header";
import ConanMascot from "@/components/ConanMascot";
import ProSubscriptionModal from "@/components/ProSubscriptionModal";
import AuthModal from "@/components/AuthModal";
import { MAGIC_POTIONS, DIAMOND_PACKS } from "@/lib/accessories";
import {
  getCurrentUser,
  subscribeAuth,
  buyPowerUp,
  activateDoubleXp,
  saveCurrentUserProfile,
} from "@/lib/supabase";
import { UserProfile, ShopPowerUp, DiamondPack } from "@/lib/types";
import { soundEffects } from "@/lib/soundEffects";
import {
  ArrowLeft,
  Zap,
  Shield,
  Heart,
  Crown,
  Sparkles,
  CheckCircle2,
  CreditCard,
  Loader2,
} from "lucide-react";
import confetti from "canvas-confetti";

function ShopContent() {
  const searchParams = useSearchParams();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [loadingPayId, setLoadingPayId] = useState<string | null>(null);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    const unsub = subscribeAuth((u) => setUser(u));
    return () => unsub();
  }, []);

  // Manejar retorno de pago exitoso de Mercado Pago
  useEffect(() => {
    const payment = searchParams.get("payment");
    const type = searchParams.get("type");

    if (payment === "success") {
      soundEffects.playLevelUp();
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#3B82F6", "#F59E0B", "#10B981"],
      });

      let currentUser = getCurrentUser();
      if (!currentUser) {
        currentUser = {
          id: "guest",
          name: "Invitado",
          email: "invitado@conango.com",
          avatar: "🐶",
          xp: 0,
          coins: 100,
          gems: 100,
          streak: 1,
          lastActiveDate: new Date().toISOString().split("T")[0],
          isPro: false,
          hearts: 5,
          maxHearts: 5,
          streakFreeze: 0,
          medals: 0,
          created_at: new Date().toISOString(),
        };
      }

      if (type === "diamonds") {
        const count = parseInt(searchParams.get("gems") || "150", 10);
        currentUser.gems = (currentUser.gems ?? currentUser.coins ?? 100) + count;
        currentUser.coins = currentUser.gems;
        saveCurrentUserProfile(currentUser);
        setMsg({
          text: `¡Pago exitoso vía Mercado Pago! Se han acreditado +${count} Diamantes a tu cuenta.`,
          type: "success",
        });
      } else if (type === "potion") {
        const itemId = searchParams.get("itemId");
        if (itemId === "double_xp_15") {
          activateDoubleXp(15);
        } else if (itemId === "streak_freeze") {
          currentUser.streakFreeze = (currentUser.streakFreeze || 0) + 1;
          saveCurrentUserProfile(currentUser);
        } else if (itemId === "refill_hearts") {
          currentUser.hearts = 5;
          saveCurrentUserProfile(currentUser);
        }
        setMsg({
          text: "¡Pago exitoso vía Mercado Pago! Tu poción mágica ha sido activada y equipada.",
          type: "success",
        });
      }

      // Limpiar parámetros de la URL
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", "/shop");
      }
    } else if (payment === "failure") {
      setMsg({
        text: "El pago no pudo completarse en Mercado Pago. Intenta nuevamente.",
        type: "error",
      });
      if (typeof window !== "undefined") {
        window.history.replaceState({}, "", "/shop");
      }
    }
  }, [searchParams]);

  const gems = user?.gems ?? user?.coins ?? 100;
  const streakFreezes = user?.streakFreeze || 0;

  // Compra de pociones con Diamantes / Gemas
  const handleBuyWithGems = (item: ShopPowerUp) => {
    if (item.category === "pro") {
      setProModalOpen(true);
      return;
    }

    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    const res = buyPowerUp(item.id);
    if (res.success) {
      soundEffects.playLevelUp();
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#3B82F6", "#F59E0B", "#10B981"],
      });
      setMsg({ text: `¡Has adquirido la ${item.name}!`, type: "success" });
      setTimeout(() => setMsg(null), 3500);
    } else {
      soundEffects.playIncorrect();
      setMsg({ text: res.error || "No tienes suficientes diamantes.", type: "error" });
      setTimeout(() => setMsg(null), 3500);
    }
  };

  // Compra de poción con Dinero Real vía Mercado Pago
  const handleBuyPotionRealMoney = async (item: ShopPowerUp) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setLoadingPayId(item.id);
    try {
      const res = await fetch("/api/checkout/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "potion",
          potionId: item.id,
          itemId: item.id,
          title: item.name,
          priceClp: item.priceClp || 990,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await res.json();
      if (data.success && data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        setMsg({ text: data.error || "Error al conectar con Mercado Pago.", type: "error" });
        setLoadingPayId(null);
      }
    } catch (err) {
      setMsg({ text: "Error de conexión al procesar el pago.", type: "error" });
      setLoadingPayId(null);
    }
  };

  // Compra de paquete de Diamantes con Dinero Real vía Mercado Pago
  const handleBuyDiamondsRealMoney = async (pack: DiamondPack) => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }

    setLoadingPayId(pack.id);
    try {
      const res = await fetch("/api/checkout/preference", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "diamonds",
          packId: pack.id,
          itemId: pack.id,
          gemsCount: pack.gemsCount,
          title: pack.name,
          priceClp: pack.priceClp,
          userId: user.id,
          userEmail: user.email,
        }),
      });

      const data = await res.json();
      if (data.success && data.initPoint) {
        window.location.href = data.initPoint;
      } else {
        setMsg({ text: data.error || "Error al conectar con Mercado Pago.", type: "error" });
        setLoadingPayId(null);
      }
    } catch (err) {
      setMsg({ text: "Error de conexión al procesar el pago.", type: "error" });
      setLoadingPayId(null);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] dark:bg-slate-950 flex flex-col font-sans text-[#6B4423] dark:text-slate-100 transition-colors">
      <Header sessionTitle="Tienda" />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col">
        {/* Top Navigation */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-[#A67B5B] dark:text-slate-400 hover:text-[#6B4423] dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>

          {/* Balance Badges */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-full text-xs font-black text-blue-900 dark:text-blue-300 shadow-xs">
              <span className="text-sm">💎</span>
              <span>{gems} Diamantes</span>
            </div>

            <button
              type="button"
              onClick={() => setProModalOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full text-xs font-black shadow-xs flex items-center gap-1.5 hover:brightness-105 transition-all"
            >
              <Crown className="w-3.5 h-3.5 text-yellow-100" />
              <span>Conan PRO</span>
            </button>
          </div>
        </div>

        {/* Alert Feedback */}
        {msg && (
          <div
            className={`mb-6 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-xs ${
              msg.type === "success"
                ? "bg-emerald-100 dark:bg-emerald-950 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-800"
                : "bg-red-100 dark:bg-red-950 text-red-900 dark:text-red-200 border border-red-300 dark:border-red-800"
            }`}
          >
            {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> : <span>⚠️</span>}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Super Conan PRO Card */}
        <div className="bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-500 rounded-3xl p-6 sm:p-8 text-white shadow-conan-card mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider mb-2">
              <Crown className="w-3.5 h-3.5 text-yellow-200" />
              <span>Membresía Suprema Oficial</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Conan<span className="text-yellow-200">PRO</span>
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 font-medium mt-1 leading-relaxed max-w-md">
              Vidas infinitas (∞), cero anuncios en toda la plataforma y potenciador 2x XP permanente para ascender a los grados máximos de la Fuerza Aérea.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setProModalOpen(true)}
            className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-amber-50 text-amber-900 font-black rounded-2xl shadow-md text-xs uppercase tracking-wider transition-transform active:scale-95 flex-shrink-0"
          >
            {user?.isPro ? "Membresía Activa" : "Activar Conan PRO"}
          </button>
        </div>

        {/* 1. SECCIÓN: BANCO DE DIAMANTES & GEMAS TÁCTICAS (COMPRA CON DINERO REAL) */}
        <div className="mb-10">
          <div className="flex items-center justify-between gap-2 mb-1">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <h3 className="text-lg sm:text-xl font-black text-[#6B4423] dark:text-white">
                Banco de Diamantes Tácticos
              </h3>
            </div>
            <span className="text-[10px] font-black uppercase px-2.5 py-1 bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 rounded-full border border-emerald-300 dark:border-emerald-800">
              Vía Mercado Pago 🇨🇱
            </span>
          </div>
          <p className="text-xs text-[#A67B5B] dark:text-slate-400 font-semibold mb-5">
            Adquiere paquetes de diamantes con dinero real para canjear pociones mágicas y potenciar tu aprendizaje.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {DIAMOND_PACKS.map((pack) => {
              const isLoading = loadingPayId === pack.id;

              return (
                <div
                  key={pack.id}
                  className={`bg-white dark:bg-slate-900 rounded-3xl border-2 p-5 flex flex-col justify-between transition-all shadow-xs relative ${
                    pack.popular
                      ? "border-amber-400 dark:border-amber-500 shadow-md ring-2 ring-amber-400/20"
                      : "border-[#E5D5C5] dark:border-slate-800 hover:border-[#A67B5B]"
                  }`}
                >
                  {pack.bonusText && (
                    <div className="absolute -top-2.5 right-4 bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black text-[9px] uppercase px-2.5 py-0.5 rounded-full shadow-2xs">
                      {pack.bonusText}
                    </div>
                  )}

                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 flex items-center justify-center text-2xl mb-3 shadow-2xs">
                      {pack.emoji}
                    </div>

                    <h4 className="text-sm font-black text-[#6B4423] dark:text-white mb-1">
                      {pack.name}
                    </h4>

                    <div className="flex items-baseline gap-1 text-xl font-black text-blue-900 dark:text-blue-300 mb-1.5">
                      <span>💎 {pack.gemsCount}</span>
                      <span className="text-[11px] font-bold text-[#A67B5B]">Diamantes</span>
                    </div>

                    <p className="text-[11px] text-[#A67B5B] dark:text-slate-400 font-medium leading-tight mb-4">
                      {pack.description}
                    </p>
                  </div>

                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => handleBuyDiamondsRealMoney(pack)}
                    className="w-full py-2.5 px-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:brightness-105 disabled:opacity-50 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Comprar • ${pack.priceClp.toLocaleString("es-CL")} CLP</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* 2. SECCIÓN: POCIONES MÁGICAS (CON DIAMANTES O MERCADO PAGO) */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-2xl">🧪</span>
            <h3 className="text-lg sm:text-xl font-black text-[#6B4423] dark:text-white">
              Pociones Mágicas & Elixires
            </h3>
          </div>
          <p className="text-xs text-[#A67B5B] dark:text-slate-400 font-semibold mb-6">
            Adquiere tus pociones mágicas canjeando tus diamantes o directamente con dinero real vía Mercado Pago.
          </p>

          <div className="space-y-4">
            {MAGIC_POTIONS.filter((p) => p.category !== "pro").map((item) => {
              const isLoading = loadingPayId === item.id;

              return (
                <div
                  key={item.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#E5D5C5] dark:border-slate-800 hover:border-[#A67B5B] p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-14 h-14 rounded-2xl bg-[#FAF6F0] dark:bg-slate-800 border border-[#E5D5C5] dark:border-slate-700 flex items-center justify-center text-3xl shadow-xs shrink-0">
                      {item.emoji}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm sm:text-base font-black text-[#6B4423] dark:text-white truncate">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#A67B5B] dark:text-slate-400 font-medium mt-0.5 leading-relaxed max-w-md">
                        {item.description}
                      </p>
                      {item.id === "streak_freeze" && streakFreezes > 0 && (
                        <span className="inline-block mt-1 text-[10px] font-black text-blue-700 bg-blue-50 dark:bg-blue-950 dark:text-blue-300 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                          Equipados en inventario: {streakFreezes}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Botones de Compra Dual: Diamantes O Dinero Real */}
                  <div className="flex flex-row sm:flex-col gap-2 w-full md:w-auto shrink-0">
                    {/* Botón 1: Comprar con Diamantes */}
                    <button
                      type="button"
                      onClick={() => handleBuyWithGems(item)}
                      className="flex-1 md:flex-none px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                    >
                      <span>💎 {item.priceGems} Diamantes</span>
                    </button>

                    {/* Botón 2: Comprar con Mercado Pago */}
                    {item.priceClp && (
                      <button
                        type="button"
                        disabled={isLoading}
                        onClick={() => handleBuyPotionRealMoney(item)}
                        className="flex-1 md:flex-none px-4 py-2 bg-[#FAF6F0] dark:bg-slate-800 hover:bg-[#F3EADF] text-[#6B4423] dark:text-amber-300 border border-[#E5D5C5] dark:border-slate-700 font-black text-xs rounded-xl shadow-2xs flex items-center justify-center gap-1.5 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        {isLoading ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <>
                            <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
                            <span>💳 ${item.priceClp.toLocaleString("es-CL")} CLP</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <ProSubscriptionModal
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
        onSuccess={() => {
          soundEffects.playLevelUp();
          setUser(getCurrentUser());
        }}
      />

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          setUser(getCurrentUser());
          setAuthModalOpen(false);
        }}
      />
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#FAF6F0] flex items-center justify-center font-bold">Cargando tienda...</div>}>
      <ShopContent />
    </Suspense>
  );
}
