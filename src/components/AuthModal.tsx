"use client";

import React, { useState, useEffect } from "react";
import { X, LogIn, UserPlus, Shield, User, Lock, Mail, CheckCircle2, AlertCircle, KeyRound, ArrowLeft, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loginAccount, registerAccount, resetPassword, getRegisteredAccounts } from "@/lib/supabase";
import { getUserRankTitle, getUserRankBadge } from "@/lib/accessories";
import { UserProfile } from "@/lib/types";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialMode?: "login" | "register" | "recover";
  preventClose?: boolean;
  forcedReason?: string;
}

export default function AuthModal({
  isOpen,
  onClose,
  onSuccess,
  initialMode = "login",
  preventClose = false,
  forcedReason,
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register" | "recover">(initialMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [savedAccounts, setSavedAccounts] = useState<UserProfile[]>([]);

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg("");
      setSuccessMsg("");
      setPassword("");
      setConfirmPassword("");
      setSavedAccounts(getRegisteredAccounts());
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  const handleSelectSavedAccount = (acc: UserProfile) => {
    setEmail(acc.email);
    if (acc.password) {
      setPassword(acc.password);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (mode === "register") {
        if (password.length < 6) {
          setErrorMsg("La contraseña debe tener al menos 6 caracteres.");
          setLoading(false);
          return;
        }

        const res = await registerAccount(name, email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          const rank = getUserRankTitle(res.user?.xp || 0);
          setSuccessMsg(`¡Cuenta creada con éxito! Rango asignado: ${rank}.`);
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 800);
        }
      } else if (mode === "recover") {
        if (password.length < 6) {
          setErrorMsg("La nueva contraseña debe tener al menos 6 caracteres.");
          setLoading(false);
          return;
        }
        if (password !== confirmPassword) {
          setErrorMsg("Las contraseñas no coinciden. Por favor verifícalas.");
          setLoading(false);
          return;
        }

        const res = await resetPassword(email, password);
        if (!res.success) {
          setErrorMsg(res.error || "No se pudo restablecer la contraseña.");
        } else {
          setSuccessMsg("¡Contraseña restablecida con éxito! Ya puedes iniciar sesión con tu nueva clave.");
          setTimeout(() => {
            setMode("login");
            setSuccessMsg("");
          }, 1400);
        }
      } else {
        const res = await loginAccount(email, password);
        if (res.error) {
          setErrorMsg(res.error);
        } else {
          const rank = getUserRankTitle(res.user?.xp || 0);
          setSuccessMsg(`¡Bienvenido de vuelta, ${rank}! Progreso sincronizado.`);
          setTimeout(() => {
            onSuccess?.();
            onClose();
          }, 700);
        }
      }
    } catch {
      setErrorMsg("Ocurrió un error inesperado al procesar la solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#A67B5B] dark:border-slate-700 shadow-2xl p-6 sm:p-8 max-w-md w-full relative overflow-hidden text-[#6B4423] dark:text-slate-100"
      >
        {!preventClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#A67B5B] dark:text-slate-400 hover:text-[#6B4423] dark:hover:text-white hover:bg-[#FAF6F0] dark:hover:bg-slate-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Forced Reason Banner */}
        {forcedReason && (
          <div className="mb-4 p-3 bg-amber-50 dark:bg-amber-950/60 border-2 border-amber-300 dark:border-amber-700 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200 font-bold">
            <Shield className="w-5 h-5 text-[#F59E0B] flex-shrink-0" />
            <span>{forcedReason}</span>
          </div>
        )}

        {/* Interactive Tactical Emoji Mascot */}
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 dark:from-amber-600 dark:to-yellow-500 flex items-center justify-center text-3xl shadow-md border-2 border-white dark:border-slate-700 mx-auto mb-2 select-none">
            {mode === "recover" ? "🐶🔐" : mode === "register" ? "🐶🪖" : "🐶✨"}
          </div>
          <h3 className="text-2xl font-black text-[#6B4423] dark:text-white tracking-tight">
            {mode === "login"
              ? "Iniciar Sesión"
              : mode === "register"
              ? "Crear Cuenta Oficial USAF"
              : "Recuperar Contraseña"}
          </h3>
          <p className="text-xs text-[#A67B5B] dark:text-slate-400 mt-1 font-semibold">
            {mode === "login"
              ? "Accede a tu historial de evaluaciones, medallas y rango militar."
              : mode === "register"
              ? "Regístrate para guardar tu rango USAF, racha y fórmulas."
              : "Ingresa tu correo registrado para restablecer tu clave de acceso."}
          </p>
        </div>

        {/* Saved Accounts on this Device */}
        {mode === "login" && savedAccounts.length > 0 && (
          <div className="mb-4 bg-[#FAF6F0] dark:bg-slate-800/70 p-3 rounded-2xl border border-[#E5D5C5] dark:border-slate-700">
            <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-[#A67B5B] dark:text-slate-400 mb-2">
              <Users className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Cuentas guardadas en este dispositivo:</span>
            </div>
            <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
              {savedAccounts.map((acc) => {
                const rankTitle = getUserRankTitle(acc.xp || 0);
                const badge = getUserRankBadge(acc.xp || 0);
                return (
                  <div
                    key={acc.id}
                    onClick={() => handleSelectSavedAccount(acc)}
                    className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-[#E5D5C5] dark:border-slate-700 hover:border-[#F59E0B] dark:hover:border-amber-500 flex items-center justify-between cursor-pointer transition-all active:scale-98 shadow-xs"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-base shrink-0">{badge}</span>
                      <div className="truncate">
                        <span className="text-xs font-black text-[#6B4423] dark:text-slate-100 block truncate">
                          {acc.name || acc.email.split("@")[0]}
                        </span>
                        <span className="text-[10px] text-[#A67B5B] dark:text-slate-400 font-semibold block truncate">
                          {rankTitle} &bull; {acc.email}
                        </span>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-[#F59E0B] px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 shrink-0">
                      Usar
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Mode Selector Tabs (only shown for login and register) */}
        {mode !== "recover" && (
          <div className="flex bg-[#FAF6F0] dark:bg-slate-800 p-1 rounded-2xl mb-4 border border-[#E5D5C5] dark:border-slate-700">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                mode === "login"
                  ? "bg-white dark:bg-slate-900 text-[#6B4423] dark:text-white shadow-sm"
                  : "text-[#A67B5B] dark:text-slate-400 hover:text-[#6B4423] dark:hover:text-white"
              }`}
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Ingresar</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("register");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                mode === "register"
                  ? "bg-white dark:bg-slate-900 text-[#6B4423] dark:text-white shadow-sm"
                  : "text-[#A67B5B] dark:text-slate-400 hover:text-[#6B4423] dark:hover:text-white"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Registrarse</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === "register" && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B4423] dark:text-slate-300 mb-1">
                Tu Nombre de Usuario
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#A67B5B] dark:text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Pablo"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E5D5C5] dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-[#F59E0B] focus:outline-none text-sm text-[#6B4423] dark:text-slate-100"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B4423] dark:text-slate-300 mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A67B5B] dark:text-slate-400 absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="usuario@conango.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E5D5C5] dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-[#F59E0B] focus:outline-none text-sm text-[#6B4423] dark:text-slate-100"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B4423] dark:text-slate-300">
                {mode === "recover" ? "Nueva Contraseña" : "Contraseña"}
              </label>
              {mode === "login" && (
                <button
                  type="button"
                  onClick={() => {
                    setMode("recover");
                    setErrorMsg("");
                    setSuccessMsg("");
                  }}
                  className="text-[11px] font-bold text-[#F59E0B] hover:text-[#D97706] hover:underline"
                >
                  ¿Olvidaste tu clave?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A67B5B] dark:text-slate-400 absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E5D5C5] dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-[#F59E0B] focus:outline-none text-sm text-[#6B4423] dark:text-slate-100"
              />
            </div>
          </div>

          {mode === "recover" && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B4423] dark:text-slate-300 mb-1">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A67B5B] dark:text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu nueva contraseña"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E5D5C5] dark:border-slate-700 bg-white dark:bg-slate-800 focus:border-[#F59E0B] focus:outline-none text-sm text-[#6B4423] dark:text-slate-100"
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl text-xs font-bold text-red-700 dark:text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-green-50 dark:bg-green-950/60 border border-green-200 dark:border-green-800 rounded-xl text-xs font-bold text-green-800 dark:text-green-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black rounded-2xl shadow-conan-btn flex items-center justify-center gap-2 text-sm transition-transform active:translate-y-1 mt-2"
          >
            {mode === "login" ? (
              <LogIn className="w-4 h-4" />
            ) : mode === "register" ? (
              <UserPlus className="w-4 h-4" />
            ) : (
              <KeyRound className="w-4 h-4" />
            )}
            <span>
              {loading
                ? "Procesando..."
                : mode === "login"
                ? "Ingresar a ConanGo"
                : mode === "register"
                ? "Crear Cuenta Oficial"
                : "Restablecer Contraseña"}
            </span>
          </button>

          {mode === "recover" && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErrorMsg("");
                  setSuccessMsg("");
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A67B5B] dark:text-slate-400 hover:text-[#6B4423] dark:hover:text-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Volver a Iniciar Sesión</span>
              </button>
            </div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
