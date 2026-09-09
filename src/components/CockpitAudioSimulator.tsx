"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Radio, Plane, ShieldCheck, Lock, Sparkles, Volume2 } from "lucide-react";

interface CockpitAudioSimulatorProps {
  isPro: boolean;
  isActive: boolean;
  onToggle: () => void;
  onLockedClick?: () => void;
  isPlaying?: boolean;
}

// Generador de Efectos Sonoros de Radio ATC Militar USAF con Web Audio API
export class TacticalRadioAudioEngine {
  private static audioCtx: AudioContext | null = null;

  private static getContext(): AudioContext | null {
    if (typeof window === "undefined") return null;
    if (!this.audioCtx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.audioCtx = new AudioContextClass();
      }
    }
    if (this.audioCtx && this.audioCtx.state === "suspended") {
      this.audioCtx.resume();
    }
    return this.audioCtx;
  }

  // Squawk / Clic de micrófono militar al iniciar la transmisión
  public static playMicClickStart() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Burst corto de ruido blanco (radio keying)
      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.15;
      }
      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = "bandpass";
      filter.frequency.setValueAtTime(2400, now);
      filter.Q.setValueAtTime(4.0, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.04);

      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      whiteNoise.start(now);

      // Beep agudo de enlace satelital UHF
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(1400, now);
      oscGain.gain.setValueAtTime(0.12, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch {}
  }

  // Clic de liberación de PTT (Push-To-Talk) al terminar transmisión
  public static playMicClickEnd() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(950, now);
      oscGain.gain.setValueAtTime(0.14, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } catch {}
  }
}

export default function CockpitAudioSimulator({
  isPro,
  isActive,
  onToggle,
  onLockedClick,
  isPlaying = false,
}: CockpitAudioSimulatorProps) {
  useEffect(() => {
    if (isActive && isPlaying) {
      TacticalRadioAudioEngine.playMicClickStart();
      return () => {
        TacticalRadioAudioEngine.playMicClickEnd();
      };
    }
  }, [isActive, isPlaying]);

  const handleClick = () => {
    if (!isPro) {
      if (onLockedClick) onLockedClick();
    } else {
      onToggle();
    }
  };

  return (
    <div className="w-full">
      {/* Botón de Activación de Modo Cabina */}
      <div className="flex items-center justify-between gap-2 p-2 rounded-2xl bg-slate-900 border border-emerald-500/40 text-emerald-400 text-xs shadow-lg">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-1.5 rounded-xl ${isActive ? "bg-emerald-500 text-slate-950 animate-pulse" : "bg-slate-800 text-emerald-400"}`}>
            <Radio className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="font-mono font-black text-xs tracking-wider uppercase text-white">
                Radio Cabina F-22 (ATC)
              </span>
              {isPro ? (
                <span className="px-1.5 py-0.2 bg-emerald-500/20 text-emerald-300 font-extrabold text-[9px] rounded uppercase border border-emerald-500/40">
                  PRO
                </span>
              ) : (
                <span className="px-1.5 py-0.2 bg-amber-500/20 text-amber-300 font-extrabold text-[9px] rounded uppercase flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> PRO
                </span>
              )}
            </div>
            <p className="text-[10px] text-emerald-300/70 truncate">
              {isActive
                ? "🎙️ Audio táctico con filtro VHF militar y tono de torre de control activo"
                : "Simula el audio de radio militar real de la Torre de Control"}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleClick}
          className={`px-3 py-1.5 rounded-xl font-mono text-xs font-black uppercase tracking-wider transition-all shrink-0 ${
            isActive
              ? "bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/30"
              : isPro
              ? "bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/40"
              : "bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40"
          }`}
        >
          {isActive ? "ON • ACTIVO" : isPro ? "ACTIVAR" : "DESBLOQUEAR"}
        </button>
      </div>

      {/* Visual HUD Overlay de Caza Militar (Si está activo) */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mt-2 p-3 bg-slate-950/90 rounded-2xl border border-emerald-500/60 font-mono text-emerald-400 text-[11px] relative overflow-hidden shadow-inner"
        >
          {/* Scanline Effect */}
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-emerald-500/5 to-transparent pointer-events-none animate-pulse" />

          <div className="flex items-center justify-between text-[10px] border-b border-emerald-500/30 pb-1.5 mb-2 text-emerald-300">
            <span className="flex items-center gap-1">
              <Plane className="w-3.5 h-3.5 text-emerald-400" />
              HUD USAF F-22 RAPTOR
            </span>
            <span className="animate-pulse text-emerald-400 font-bold">
              ● FREQ: 305.000 MHz [ATC TOWER]
            </span>
            <span>HDG: 285° | ALT: 14,200 FT</span>
          </div>

          <div className="flex items-center justify-around py-1 text-center">
            <div>
              <span className="text-[9px] text-emerald-500/70 block uppercase">Canal Militar</span>
              <span className="font-bold text-white">VHF AIR TACTICAL</span>
            </div>
            <div className="h-6 w-px bg-emerald-500/30" />
            <div>
              <span className="text-[9px] text-emerald-500/70 block uppercase">Filtro de Ruido</span>
              <span className="font-bold text-white">MIL-SPEC 300-3400Hz</span>
            </div>
            <div className="h-6 w-px bg-emerald-500/30" />
            <div>
              <span className="text-[9px] text-emerald-500/70 block uppercase">Transmisión</span>
              <span className={`font-bold ${isPlaying ? "text-emerald-300 animate-pulse" : "text-slate-500"}`}>
                {isPlaying ? "TRANSMITIENDO..." : "EN ESPERA (STANDBY)"}
              </span>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
