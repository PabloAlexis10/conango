"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ConanMascot from "@/components/ConanMascot";
import ProSubscriptionModal from "@/components/ProSubscriptionModal";
import { DUOLINGO_POWERUPS } from "@/lib/accessories";
import { getCurrentUser, subscribeAuth, buyPowerUp } from "@/lib/supabase";
import { UserProfile, ShopPowerUp } from "@/lib/types";
import { soundEffects } from "@/lib/soundEffects";
import { ArrowLeft, Zap, Shield, Heart, Crown, Sparkles, Check, CheckCircle2 } from "lucide-react";
import confetti from "canvas-confetti";

export default function ShopPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [proModalOpen, setProModalOpen] = useState(false);
  const [msg, setMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    const unsub = subscribeAuth((u) => setUser(u));
    return () => unsub();
  }, []);

  const gems = user?.gems ?? user?.coins ?? 100;
  const streakFreezes = user?.streakFreeze || 0;

  const handleBuy = (item: ShopPowerUp) => {
    if (item.category === "pro") {
      setProModalOpen(true);
      return;
    }

    if (!user) {
      setMsg({ text: "Debes iniciar sesión para comprar potenciadores.", type: "error" });
      setTimeout(() => setMsg(null), 3000);
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
      setMsg({ text: `¡Has adquirido ${item.name}!`, type: "success" });
      setTimeout(() => setMsg(null), 3000);
    } else {
      soundEffects.playIncorrect();
      setMsg({ text: res.error || "No tienes suficientes gemas.", type: "error" });
      setTimeout(() => setMsg(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col font-sans text-[#6B4423]">
      <Header sessionTitle="Tienda Táctica de Potenciadores" />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col">
        {/* Top Navigation */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-[#A67B5B] hover:text-[#6B4423] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>

          {/* Balance Badges */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full text-xs font-black text-blue-900 shadow-xs">
              <span className="text-sm">💎</span>
              <span>{gems} Gemas</span>
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
            className={`mb-6 p-4 rounded-2xl text-xs font-bold flex items-center gap-2 ${
              msg.type === "success"
                ? "bg-emerald-100 text-emerald-900 border border-emerald-300"
                : "bg-red-100 text-red-900 border border-red-300"
            }`}
          >
            {msg.type === "success" ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <span>⚠️</span>}
            <span>{msg.text}</span>
          </div>
        )}

        {/* Super Conan PRO Card (Estilo Super Duolingo) */}
        <div className="bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-500 rounded-3xl p-6 sm:p-8 text-white shadow-conan-card mb-8 flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-black uppercase tracking-wider mb-2">
              <Crown className="w-3.5 h-3.5 text-yellow-200" />
              <span>Super Duolingo Táctico</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Conan<span className="text-yellow-200">PRO</span>
            </h2>
            <p className="text-xs sm:text-sm text-amber-100 font-medium mt-1 leading-relaxed max-w-md">
              Vidas infinitas (∞), cero anuncios en toda la plataforma y potenciador 2x XP permanente para ascender de rango militar.
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

        {/* Powerups List */}
        <div>
          <h3 className="text-lg font-black text-[#6B4423] mb-3">
            Potenciadores Tácticos
          </h3>
          <p className="text-xs text-[#A67B5B] font-semibold mb-6">
            Usa las gemas que ganas en tus lecciones y misiones diarias para equipar ventajas.
          </p>

          <div className="space-y-4">
            {DUOLINGO_POWERUPS.filter((p) => p.category !== "pro").map((item) => {
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-2xl border-2 border-[#E5D5C5] hover:border-[#A67B5B] p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#FAF6F0] border border-[#E5D5C5] flex items-center justify-center text-3xl shadow-xs flex-shrink-0">
                      {item.emoji}
                    </div>
                    <div>
                      <h4 className="text-sm sm:text-base font-black text-[#6B4423]">
                        {item.name}
                      </h4>
                      <p className="text-xs text-[#A67B5B] font-medium mt-0.5 leading-relaxed max-w-md">
                        {item.description}
                      </p>
                      {item.id === "streak_freeze" && streakFreezes > 0 && (
                        <span className="inline-block mt-1 text-[10px] font-black text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                          Equipados: {streakFreezes}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleBuy(item)}
                    className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-xs flex items-center justify-center gap-2 transition-transform active:scale-95 flex-shrink-0"
                  >
                    <span>💎 {item.priceGems} Gemas</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <ProSubscriptionModal
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
      />
    </div>
  );
}
