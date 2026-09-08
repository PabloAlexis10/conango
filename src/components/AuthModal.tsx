"use client";

import React, { useState, useEffect } from "react";
import { X, LogIn, UserPlus, Shield, User, Lock, Mail, CheckCircle2, AlertCircle, KeyRound, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loginAccount, registerAccount, resetPassword } from "@/lib/supabase";
import ConanMascot from "./ConanMascot";

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

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setErrorMsg("");
      setSuccessMsg("");
      setPassword("");
      setConfirmPassword("");
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

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
          setSuccessMsg("¡Cuenta creada exitosamente! Sesión iniciada.");
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
          setSuccessMsg("¡Bienvenido de vuelta, cadete!");
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
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="bg-white rounded-3xl border-2 border-[#A67B5B] shadow-2xl p-6 sm:p-8 max-w-md w-full relative overflow-hidden"
      >
        {!preventClose && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#A67B5B] hover:text-[#6B4423] hover:bg-[#FAF6F0] rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Forced Reason Banner */}
        {forcedReason && (
          <div className="mb-4 p-3 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-center gap-2.5 text-xs text-amber-900 font-bold">
            <Shield className="w-5 h-5 text-[#F59E0B] flex-shrink-0" />
            <span>{forcedReason}</span>
          </div>
        )}

        {/* Mascot & Title */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <ConanMascot
              size="md"
              mood={mode === "recover" ? "thinking" : "happy"}
              animate={true}
            />
          </div>
          <h3 className="text-2xl font-black text-[#6B4423] tracking-tight">
            {mode === "login"
              ? "Iniciar Sesión"
              : mode === "register"
              ? "Crear Cuenta de Cadete"
              : "Recuperar Contraseña"}
          </h3>
          <p className="text-xs text-[#A67B5B] mt-1 font-semibold">
            {mode === "login"
              ? "Guarda tus medallas, notas y progreso ilimitado de exámenes."
              : mode === "register"
              ? "Regístrate gratis para mantener tu historial personalizado."
              : "Ingresa tu correo registrado para restablecer tu clave de acceso."}
          </p>
        </div>

        {/* Mode Selector Tabs (only shown for login and register) */}
        {mode !== "recover" && (
          <div className="flex bg-[#FAF6F0] p-1 rounded-2xl mb-5 border border-[#E5D5C5]">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setErrorMsg("");
                setSuccessMsg("");
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 ${
                mode === "login"
                  ? "bg-white text-[#6B4423] shadow-sm"
                  : "text-[#A67B5B] hover:text-[#6B4423]"
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
                  ? "bg-white text-[#6B4423] shadow-sm"
                  : "text-[#A67B5B] hover:text-[#6B4423]"
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Registrarse</span>
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "register" && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B4423] mb-1">
                Nombre o Rango
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#A67B5B] absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ej: Cadete Ramírez"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E5D5C5] focus:border-[#F59E0B] focus:outline-none text-sm text-[#6B4423]"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B4423] mb-1">
              Correo Electrónico
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-[#A67B5B] absolute left-3.5 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cadete@conango.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E5D5C5] focus:border-[#F59E0B] focus:outline-none text-sm text-[#6B4423]"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[11px] font-bold uppercase tracking-wider text-[#6B4423]">
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
              <Lock className="w-4 h-4 text-[#A67B5B] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mínimo 6 caracteres"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E5D5C5] focus:border-[#F59E0B] focus:outline-none text-sm text-[#6B4423]"
              />
            </div>
          </div>

          {mode === "recover" && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B4423] mb-1">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-[#A67B5B] absolute left-3.5 top-3" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu nueva contraseña"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E5D5C5] focus:border-[#F59E0B] focus:outline-none text-sm text-[#6B4423]"
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs font-bold text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-xs font-bold text-green-800 flex items-center gap-2">
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
                ? "Crear mi Cuenta"
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
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#A67B5B] hover:text-[#6B4423]"
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
