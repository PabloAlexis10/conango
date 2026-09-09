"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Gift, Sparkles, CheckCircle2, AlertCircle, ArrowRight, Tag } from "lucide-react";
import { redeemCode } from "@/lib/adminCodes";
import { soundEffects } from "@/lib/soundEffects";
import confetti from "canvas-confetti";

interface RedeemCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function RedeemCodeModal({
  isOpen,
  onClose,
  onSuccess,
}: RedeemCodeModalProps) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    setResult(null);

    setTimeout(() => {
      const res = redeemCode(code);
      setLoading(false);
      setResult(res);

      if (res.success) {
        soundEffects.playLevelUp();
        try {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 },
            colors: ["#F59E0B", "#10B981", "#3B82F6"],
          });
        } catch {}

        if (onSuccess) onSuccess();
        setTimeout(() => {
          onClose();
          setCode("");
          setResult(null);
        }, 2800);
      } else {
        soundEffects.playIncorrect();
      }
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-md flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-600 rounded-3xl max-w-md w-full p-5 sm:p-6 shadow-2xl relative text-slate-900 dark:text-slate-100"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-white flex items-center justify-center shadow-lg shadow-amber-400/30 mb-3">
            <Gift className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-black text-[#6B4423] dark:text-amber-300">
            Canjear Código Táctico
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Ingresa tu cupón de descuento, pase de prueba PRO o código de diamantes de regalo.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="relative">
              <input
                type="text"
                autoFocus
                value={code}
                onChange={(e) => {
                  setCode(e.target.value.toUpperCase());
                  if (result) setResult(null);
                }}
                placeholder="EJ: CONANPRO7"
                className="w-full px-4 py-3.5 bg-slate-50 dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-2xl text-center font-mono font-black text-lg tracking-widest uppercase text-amber-600 dark:text-amber-400 placeholder:text-slate-400 focus:border-amber-500 focus:outline-none transition-all shadow-inner"
              />
              <Tag className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <p className="text-[10px] text-slate-400 text-center mt-1.5">
              Los códigos son autorizados por la Comandancia y no distinguen mayúsculas.
            </p>
          </div>

          {result && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className={`p-3 rounded-2xl text-xs font-bold flex items-start gap-2.5 ${
                result.success
                  ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700"
                  : "bg-red-50 dark:bg-red-950/60 text-red-800 dark:text-red-200 border border-red-300 dark:border-red-700"
              }`}
            >
              {result.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 leading-snug">{result.message}</div>
            </motion.div>
          )}

          <button
            type="submit"
            disabled={loading || !code.trim()}
            className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span>Verificando con la Comandancia...</span>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Canjear Recompensa</span>
              </>
            )}
          </button>
        </form>

        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
          <span className="text-[11px] text-slate-400">
            ¿Buscas códigos? Prueba con <code className="text-amber-600 dark:text-amber-400 font-bold">CONANPRO7</code> o <code className="text-amber-600 dark:text-amber-400 font-bold">DIAMANTESVIP</code>.
          </span>
        </div>
      </motion.div>
    </div>
  );
}
