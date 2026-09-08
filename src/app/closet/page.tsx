"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ConanMascot from "@/components/ConanMascot";
import ProSubscriptionModal from "@/components/ProSubscriptionModal";
import { CONAN_ACCESSORIES, getRankByXp } from "@/lib/accessories";
import { getCurrentUser, subscribeAuth, equipAccessory, buyAccessory } from "@/lib/supabase";
import { UserProfile, ConanAccessory } from "@/lib/types";
import { soundEffects } from "@/lib/soundEffects";
import { ArrowLeft, Sparkles, Coins, Crown, Check, ShieldCheck, Lock } from "lucide-react";
import confetti from "canvas-confetti";

export default function ClosetPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [previewAccessory, setPreviewAccessory] = useState<string | null>(null);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    const cur = getCurrentUser();
    setUser(cur);
    setPreviewAccessory(cur?.activeAccessory || null);

    const unsubscribe = subscribeAuth((updated) => {
      setUser(updated);
      setPreviewAccessory(updated?.activeAccessory || null);
    });
    return () => unsubscribe();
  }, []);

  const coins = user?.coins || 0;
  const unlocked = new Set(user?.unlockedAccessories || ["sunglasses"]);
  const active = user?.activeAccessory || null;
  const rankInfo = getRankByXp(user?.xp || 0);

  const handleEquip = (accId: string) => {
    equipAccessory(accId);
    setPreviewAccessory(accId);
    soundEffects.playCorrect();
    setMsg({ text: "¡Accesorio equipado con éxito!", type: "success" });
    setTimeout(() => setMsg(null), 2500);
  };

  const handleUnequip = () => {
    equipAccessory(null);
    setPreviewAccessory(null);
    setMsg({ text: "Accesorio retirado.", type: "success" });
    setTimeout(() => setMsg(null), 2000);
  };

  const handleBuy = (item: ConanAccessory) => {
    if (item.isProOnly && !user?.isPro) {
      setProModalOpen(true);
      return;
    }

    const res = buyAccessory(item.id, item.price);
    if (res.success) {
      soundEffects.playLevelUp();
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 },
        colors: ["#F59E0B", "#10B981"],
      });
      setMsg({ text: `¡Has desbloqueado ${item.name}!`, type: "success" });
      setTimeout(() => setMsg(null), 3000);
    } else {
      soundEffects.playIncorrect();
      setMsg({ text: res.error || "No tienes suficientes monedas.", type: "error" });
      setTimeout(() => setMsg(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col font-sans text-[#6B4423]">
      <Header sessionTitle="Armario Táctico de Conan" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-[#A67B5B] hover:text-[#6B4423] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-100 border border-amber-300 rounded-full text-xs font-black text-amber-900 shadow-xs">
              <Coins className="w-4 h-4 text-amber-600" />
              <span>{coins} Monedas</span>
            </div>

            <button
              type="button"
              onClick={() => setProModalOpen(true)}
              className="px-3 py-1 bg-gradient-to-r from-amber-500 to-yellow-500 text-white rounded-full text-xs font-black shadow-xs flex items-center gap-1 hover:brightness-105 transition-all"
            >
              <Crown className="w-3.5 h-3.5 text-yellow-100" />
              <span>Conan PRO</span>
            </button>
          </div>
        </div>

        {/* Hero Mascot Preview */}
        <div className="bg-white rounded-3xl border-2 border-[#E5D5C5] shadow-conan-card p-6 text-center mb-8 relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-40 h-40 bg-amber-100/50 rounded-full blur-2xl" />

          <div className="relative z-10 flex flex-col items-center">
            <ConanMascot
              size="hero"
              mood="celebrate"
              accessory={previewAccessory}
              animate={true}
            />

            <div className="mt-3">
              <span className="text-xs font-black uppercase tracking-widest text-[#6B4423] block">
                Conan el Compañero Táctico 🐾
              </span>
              <span className="text-xs font-bold text-[#A67B5B]">
                Rango: {rankInfo.currentRank.badge} {rankInfo.currentRank.name}
              </span>
            </div>

            {previewAccessory && (
              <button
                type="button"
                onClick={handleUnequip}
                className="mt-3 text-[11px] font-bold text-red-600 hover:underline"
              >
                Quitar accesorio actual
              </button>
            )}

            {msg && (
              <div
                className={`mt-3 px-4 py-1.5 rounded-xl text-xs font-bold ${
                  msg.type === "success"
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-red-100 text-red-800 border border-red-300"
                }`}
              >
                {msg.text}
              </div>
            )}
          </div>
        </div>

        {/* Accessories Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-black text-[#6B4423]">
                Catálogo de Atuendos y Accesorios
              </h3>
              <p className="text-xs text-[#A67B5B] font-semibold">
                Gana monedas en tus quizzes para desbloquear equipamiento o suscríbete a PRO.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {CONAN_ACCESSORIES.map((item) => {
              const isUnlocked = unlocked.has(item.id) || (item.isProOnly && user?.isPro);
              const isEquipped = active === item.id;

              return (
                <div
                  key={item.id}
                  className={`bg-white rounded-2xl border-2 p-4 flex flex-col justify-between transition-all relative overflow-hidden ${
                    isEquipped
                      ? "border-amber-500 shadow-md ring-2 ring-amber-200"
                      : "border-[#E5D5C5] hover:border-[#A67B5B]"
                  }`}
                >
                  {isEquipped && (
                    <div className="absolute top-0 right-0 bg-amber-500 text-white text-[9px] font-black uppercase px-2.5 py-0.5 rounded-bl-xl shadow-xs">
                      Equipado
                    </div>
                  )}

                  <div>
                    <div className="w-14 h-14 rounded-2xl bg-[#FAF6F0] border border-[#E5D5C5] flex items-center justify-center text-3xl shadow-xs mb-3">
                      {item.emoji}
                    </div>

                    <h4 className="text-sm font-black text-[#6B4423] mb-1">
                      {item.name}
                    </h4>

                    <p className="text-[11px] text-[#A67B5B] font-semibold leading-relaxed mb-4">
                      {item.description}
                    </p>
                  </div>

                  <div>
                    {isUnlocked ? (
                      <button
                        type="button"
                        onClick={() => handleEquip(item.id)}
                        disabled={isEquipped}
                        className={`w-full py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-1.5 ${
                          isEquipped
                            ? "bg-amber-100 text-amber-900 border border-amber-300 cursor-default"
                            : "bg-[#F59E0B] hover:bg-[#D97706] text-white shadow-conan-btn active:scale-95"
                        }`}
                      >
                        {isEquipped ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>En Uso</span>
                          </>
                        ) : (
                          <span>Equipar Accesorio</span>
                        )}
                      </button>
                    ) : item.isProOnly ? (
                      <button
                        type="button"
                        onClick={() => setProModalOpen(true)}
                        className="w-full py-2.5 bg-gradient-to-r from-purple-600 to-amber-600 hover:brightness-110 text-white font-black text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-transform active:scale-95"
                      >
                        <Crown className="w-3.5 h-3.5 text-yellow-200" />
                        <span>Exclusivo Conan PRO</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleBuy(item)}
                        className="w-full py-2.5 bg-white hover:bg-amber-50 text-[#6B4423] border-2 border-amber-300 hover:border-amber-400 font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-1.5 transition-all active:scale-95"
                      >
                        <Coins className="w-3.5 h-3.5 text-amber-500" />
                        <span>Desbloquear por {item.price} 🪙</span>
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
          setMsg({ text: "¡Suscripción PRO activada! Corona desbloqueada.", type: "success" });
          setTimeout(() => setMsg(null), 3000);
        }}
      />
    </div>
  );
}
