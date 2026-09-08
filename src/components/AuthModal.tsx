"use client";

import React, { useState } from "react";
import { X, LogIn, UserPlus, Shield, User, Lock, Mail, CheckCircle2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { loginAccount, registerAccount } from "@/lib/supabase";
import ConanMascot from "./ConanMascot";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setLoading(true);

    try {
      if (mode === "register") {
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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#A67B5B] hover:text-[#6B4423] hover:bg-[#FAF6F0] rounded-full transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Mascot & Title */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-2">
            <ConanMascot size="md" mood="happy" animate={true} />
          </div>
          <h3 className="text-2xl font-black text-[#6B4423] tracking-tight">
            {mode === "login" ? "Iniciar Sesión" : "Crear Cuenta de Cadete"}
          </h3>
          <p className="text-xs text-[#A67B5B] mt-1 font-semibold">
            {mode === "login"
              ? "Guarda tus medallas, notas y progreso de exámenes ALCPT."
              : "Regístrate para mantener tu historial personalizado."}
          </p>
        </div>

        {/* Mode Selector Tabs */}
        <div className="flex bg-[#FAF6F0] p-1 rounded-2xl mb-5 border border-[#E5D5C5]">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setErrorMsg("");
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

        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === "register" && (
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B4423] mb-1">
                Nombre o Rango Militar
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
                placeholder="cadete@conango.mil"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E5D5C5] focus:border-[#F59E0B] focus:outline-none text-sm text-[#6B4423]"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-[#6B4423] mb-1">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-[#A67B5B] absolute left-3.5 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-2 border-[#E5D5C5] focus:border-[#F59E0B] focus:outline-none text-sm text-[#6B4423]"
              />
            </div>
          </div>

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
            {mode === "login" ? <LogIn className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            <span>{loading ? "Procesando..." : mode === "login" ? "Ingresar a ConanGo" : "Crear mi Cuenta"}</span>
          </button>
        </form>
      </motion.div>
    </div>
  );
}
