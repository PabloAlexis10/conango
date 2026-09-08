"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ConanMascot from "@/components/ConanMascot";
import { getCurrentUser, saveFriendChallenge, getFriendChallenges } from "@/lib/supabase";
import { UserProfile, FriendChallenge } from "@/lib/types";
import { ArrowLeft, Swords, Share2, Copy, CheckCircle2, Trophy, Sparkles, ChevronRight } from "lucide-react";
import { soundEffects } from "@/lib/soundEffects";

export default function ChallengePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [formula, setFormula] = useState(1);
  const [size, setSize] = useState<10 | 20>(10);
  const [challenges, setChallenges] = useState<FriendChallenge[]>([]);
  const [createdUrl, setCreatedUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setUser(getCurrentUser());
    setChallenges(getFriendChallenges());
  }, []);

  const handleCreateChallenge = () => {
    const id = `duel_${Date.now().toString(36)}`;
    const creatorName = user?.name || "Cadete Desafiante";
    const origin = typeof window !== "undefined" ? window.location.origin : "https://conango.vercel.app";
    const url = `${origin}/practice?formula=${formula}&size=${size}&challenge=${id}`;

    const newChallenge: FriendChallenge = {
      id,
      creatorName,
      formula,
      size,
      creatorScore: 0,
      creatorPercentage: 0,
      createdAt: new Date().toISOString(),
    };

    saveFriendChallenge(newChallenge);
    setChallenges(getFriendChallenges());
    setCreatedUrl(url);
    soundEffects.playCorrect();
  };

  const handleCopy = () => {
    if (createdUrl && typeof window !== "undefined") {
      navigator.clipboard.writeText(createdUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col font-sans text-[#6B4423]">
      <Header sessionTitle="Duelo de Cadetes y Desafíos" />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col justify-start">
        {/* Top bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-[#A67B5B] hover:text-[#6B4423] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>
        </div>

        {/* Hero banner */}
        <div className="bg-gradient-to-tr from-[#6B4423] to-[#8C5D35] text-white p-6 sm:p-8 rounded-3xl shadow-conan-card mb-8 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-400/20 text-amber-200 rounded-full text-xs font-black uppercase tracking-wider mb-3">
              <Swords className="w-3.5 h-3.5 text-amber-300" />
              <span>Duelo Amistoso ALCPT 🇺🇸</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white mb-2">
              ¡Reta a un amigo a un Duelo!
            </h2>

            <p className="text-xs sm:text-sm text-[#E5D5C5] font-medium leading-relaxed max-w-md">
              Crea un reto con las preguntas oficiales, envíale el link a tu amigo por WhatsApp y compitan por quién obtiene la mayor cantidad de aciertos. ¡El ganador gana 100 🪙 y medallas de honor!
            </p>
          </div>

          <div className="flex-shrink-0">
            <ConanMascot size="lg" mood="celebrate" animate={true} />
          </div>
        </div>

        {/* Challenge Creator Card */}
        <div className="bg-white rounded-3xl border-2 border-[#E5D5C5] shadow-conan-card p-6 sm:p-8 mb-8">
          <h3 className="text-lg font-black text-[#6B4423] mb-4">
            Configurar Nuevo Desafío
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#A67B5B] mb-2">
                Fórmula de Evaluación (1 al 100)
              </label>
              <select
                value={formula}
                onChange={(e) => setFormula(parseInt(e.target.value, 10))}
                className="w-full p-3.5 rounded-xl border-2 border-[#E5D5C5] bg-[#FAF6F0] font-black text-sm text-[#6B4423] focus:outline-none focus:border-[#F59E0B]"
              >
                {Array.from({ length: 100 }, (_, i) => i + 1).map((f) => (
                  <option key={f} value={f}>
                    Fórmula {f} (Oficial)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-[#A67B5B] mb-2">
                Cantidad de Preguntas
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSize(10)}
                  className={`py-3 rounded-xl font-black text-xs border-2 transition-all ${
                    size === 10
                      ? "border-amber-500 bg-amber-50 text-amber-900 shadow-xs"
                      : "border-[#E5D5C5] bg-[#FAF6F0] text-[#6B4423]"
                  }`}
                >
                  10 Preguntas (Rápido)
                </button>
                <button
                  type="button"
                  onClick={() => setSize(20)}
                  className={`py-3 rounded-xl font-black text-xs border-2 transition-all ${
                    size === 20
                      ? "border-amber-500 bg-amber-50 text-amber-900 shadow-xs"
                      : "border-[#E5D5C5] bg-[#FAF6F0] text-[#6B4423]"
                  }`}
                >
                  20 Preguntas (Duelo)
                </button>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleCreateChallenge}
            className="w-full py-4 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black rounded-2xl shadow-conan-btn flex items-center justify-center gap-2 text-sm uppercase tracking-wider transition-transform active:scale-98"
          >
            <Swords className="w-4 h-4" />
            <span>Generar Enlace de Desafío</span>
          </button>

          {/* Shareable Link Output */}
          {createdUrl && (
            <div className="mt-6 p-4 rounded-2xl bg-[#FAF6F0] border-2 border-amber-300">
              <span className="text-xs font-black text-[#6B4423] block mb-2">
                ¡Enlace de Duelo Listo para Compartir! 🎯
              </span>
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  readOnly
                  value={createdUrl}
                  className="flex-1 p-2.5 rounded-xl border border-[#E5D5C5] bg-white text-xs font-bold text-[#6B4423]"
                />
                <button
                  type="button"
                  onClick={handleCopy}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black rounded-xl shadow-xs flex items-center gap-1.5 transition-transform active:scale-95 flex-shrink-0"
                >
                  {copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "¡Copiado!" : "Copiar"}</span>
                </button>
              </div>
              <p className="text-[11px] text-[#A67B5B] font-semibold mt-2">
                Envíale este enlace a tu compañero. Cuando lo abra en su celular rendirá exactamente la misma fórmula que tú.
              </p>
            </div>
          )}
        </div>

        {/* History / Previous Challenges */}
        {challenges.length > 0 && (
          <div className="bg-white rounded-3xl border-2 border-[#E5D5C5] p-6 shadow-sm">
            <h4 className="text-base font-black text-[#6B4423] mb-3 flex items-center gap-2">
              <Trophy className="w-4 h-4 text-amber-500" />
              <span>Desafíos Recientes</span>
            </h4>

            <div className="space-y-2">
              {challenges.slice(0, 5).map((c) => (
                <div
                  key={c.id}
                  className="flex items-center justify-between p-3 rounded-xl bg-[#FAF6F0] border border-[#E5D5C5] text-xs font-bold text-[#6B4423]"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-500" />
                    <span>Fórmula {c.formula} ({c.size} preguntas)</span>
                  </div>
                  <Link
                    href={`/practice?formula=${c.formula}&size=${c.size}&challenge=${c.id}`}
                    className="text-amber-700 font-black hover:underline flex items-center gap-1"
                  >
                    <span>Rendir Desafío</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
