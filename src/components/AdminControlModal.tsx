"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShieldCheck,
  Tag,
  Gift,
  Clock,
  Sparkles,
  Copy,
  Check,
  Trash2,
  Power,
  PlusCircle,
  Users,
  Percent,
  Infinity,
  AlertCircle,
} from "lucide-react";
import { PromoCode, UserProfile } from "@/lib/types";
import {
  getPromoCodes,
  createPromoCode,
  togglePromoCodeActive,
  deletePromoCode,
} from "@/lib/adminCodes";
import { getCurrentUser, toggleAdminMode, saveCurrentUserProfile } from "@/lib/supabase";

interface AdminControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function AdminControlModal({
  isOpen,
  onClose,
  onSuccess,
}: AdminControlModalProps) {
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  // Form State
  const [newCodeName, setNewCodeName] = useState("");
  const [newCodeType, setNewCodeType] = useState<"discount" | "gift" | "pro_trial">("discount");
  const [newCodeValue, setNewCodeValue] = useState<number>(50);
  const [newCodeDesc, setNewCodeDesc] = useState("");
  const [newCodeMaxUses, setNewCodeMaxUses] = useState<number>(500);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (isOpen) {
      refreshData();
    }
  }, [isOpen]);

  const refreshData = () => {
    setCodes(getPromoCodes());
    setCurrentUser(getCurrentUser());
  };

  if (!isOpen) return null;

  const handleCopy = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const handleToggleCode = (id: string) => {
    togglePromoCodeActive(id);
    refreshData();
  };

  const handleDeleteCode = (id: string) => {
    if (confirm("¿Estás seguro de eliminar este código promocional permanentemente?")) {
      deletePromoCode(id);
      refreshData();
    }
  };

  const handleCreateCode = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedbackMsg(null);

    let rewardDetail: any = {};
    if (newCodeType === "discount") {
      rewardDetail = { discountPercent: Number(newCodeValue) };
    } else if (newCodeType === "gift") {
      rewardDetail = { gems: Number(newCodeValue) };
    } else if (newCodeType === "pro_trial") {
      rewardDetail = { proDays: Number(newCodeValue) };
    }

    const res = createPromoCode({
      code: newCodeName,
      type: newCodeType,
      value: Number(newCodeValue),
      description: newCodeDesc || `Código especial de ${newCodeType}`,
      maxUses: Number(newCodeMaxUses),
      rewardDetail,
    });

    if (res.success) {
      setFeedbackMsg({ type: "success", text: `¡Código ${res.code?.code} creado y activado exitosamente!` });
      setNewCodeName("");
      setNewCodeDesc("");
      refreshData();
      setTimeout(() => setFeedbackMsg(null), 3500);
    } else {
      setFeedbackMsg({ type: "error", text: res.error || "Error al crear el código." });
    }
  };

  const handleRefillResources = () => {
    const user = getCurrentUser();
    if (user) {
      user.medals = 9999;
      user.gems = 9999;
      user.coins = 9999;
      user.isPro = true;
      user.role = "admin";
      saveCurrentUserProfile(user);
      refreshData();
      alert("¡Recursos recargados! 9999 Medallas/Vidas y 9999 Diamantes.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 border-2 border-amber-500/80 rounded-3xl max-w-2xl w-full p-4 sm:p-6 shadow-2xl relative text-slate-900 dark:text-slate-100 my-8 max-h-[92vh] overflow-y-auto"
      >
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado Militar Oficial */}
        <div className="flex items-center gap-3 mb-5 border-b border-amber-200 dark:border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-amber-400">
                Comandancia General USAF
              </h2>
              <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-extrabold text-[10px] uppercase rounded-full border border-amber-300 dark:border-amber-700">
                ADMIN
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Panel de control de códigos promocionales, regalos y gestión de privilegios.
            </p>
          </div>
        </div>

        {/* Estatus del Administrador */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-6 text-center">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800">
            <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-300 block">
              Membresía PRO
            </span>
            <span className="text-sm font-black text-amber-900 dark:text-amber-200 flex items-center justify-center gap-1 mt-0.5">
              <Infinity className="w-4 h-4 text-amber-500" /> Vitalicia
            </span>
          </div>

          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 block">
              Vidas / Medallas
            </span>
            <span className="text-sm font-black text-emerald-900 dark:text-emerald-200 mt-0.5 block">
              ∞ Infinitas
            </span>
          </div>

          <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 rounded-2xl border border-cyan-200 dark:border-cyan-800">
            <span className="text-[10px] font-black uppercase text-cyan-800 dark:text-cyan-300 block">
              Diamantes
            </span>
            <span className="text-sm font-black text-cyan-900 dark:text-cyan-200 mt-0.5 block">
              💎 {currentUser?.gems ?? 9999}
            </span>
          </div>

          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800">
            <span className="text-[10px] font-black uppercase text-indigo-800 dark:text-indigo-300 block">
              Anuncios
            </span>
            <span className="text-sm font-black text-indigo-900 dark:text-indigo-200 mt-0.5 block">
              🛡️ 0 (Desactivados)
            </span>
          </div>
        </div>

        {/* Creador de Nuevos Códigos */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-2xl p-4 border border-slate-200 dark:border-slate-700 mb-6">
          <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2 mb-3">
            <PlusCircle className="w-4 h-4 text-amber-500" />
            Crear Nuevo Código Táctico
          </h3>

          <form onSubmit={handleCreateCode} className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Código */}
              <div>
                <label className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                  Código (Ej: PILOTOPRO)
                </label>
                <input
                  type="text"
                  required
                  value={newCodeName}
                  onChange={(e) => setNewCodeName(e.target.value.toUpperCase())}
                  placeholder="CODIGO2026"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-black tracking-wider uppercase text-amber-600 dark:text-amber-400"
                />
              </div>

              {/* Tipo */}
              <div>
                <label className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                  Tipo de Código
                </label>
                <select
                  value={newCodeType}
                  onChange={(e) => {
                    const t = e.target.value as any;
                    setNewCodeType(t);
                    if (t === "discount") setNewCodeValue(50);
                    if (t === "gift") setNewCodeValue(500);
                    if (t === "pro_trial") setNewCodeValue(7);
                  }}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                >
                  <option value="discount">🏷️ Descuento (%)</option>
                  <option value="gift">🎁 Regalo (Diamantes)</option>
                  <option value="pro_trial">⭐ Prueba Gratuita PRO (Días)</option>
                </select>
              </div>

              {/* Valor */}
              <div>
                <label className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                  {newCodeType === "discount"
                    ? "% Descuento"
                    : newCodeType === "gift"
                    ? "Diamantes de Regalo"
                    : "Días de PRO Gratis"}
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  max={newCodeType === "discount" ? 100 : 99999}
                  value={newCodeValue}
                  onChange={(e) => setNewCodeValue(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-black"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {/* Descripción */}
              <div className="sm:col-span-2">
                <label className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                  Descripción pública para el cadete
                </label>
                <input
                  type="text"
                  value={newCodeDesc}
                  onChange={(e) => setNewCodeDesc(e.target.value)}
                  placeholder="Ej: Descuento oficial Escuela de Vuelo"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              {/* Límite de Usos */}
              <div>
                <label className="text-[11px] font-extrabold uppercase text-slate-500 dark:text-slate-400 block mb-1">
                  Límite de Canjes
                </label>
                <input
                  type="number"
                  min={1}
                  value={newCodeMaxUses}
                  onChange={(e) => setNewCodeMaxUses(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold"
                />
              </div>
            </div>

            {feedbackMsg && (
              <div
                className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                  feedbackMsg.type === "success"
                    ? "bg-emerald-50 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300"
                    : "bg-red-50 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300"
                }`}
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{feedbackMsg.text}</span>
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2"
            >
              <Tag className="w-4 h-4" />
              <span>Generar y Publicar Código Oficial</span>
            </button>
          </form>
        </div>

        {/* Lista de Códigos Activos */}
        <div className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
              Códigos Registrados en el Sistema ({codes.length})
            </h3>
            <button
              type="button"
              onClick={handleRefillResources}
              className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 hover:underline"
            >
              ⚡ Recargar Recursos Administrador
            </button>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
            {codes.map((c) => (
              <div
                key={c.id}
                className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-2 transition-all ${
                  c.active
                    ? "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700"
                    : "bg-slate-100 dark:bg-slate-900/60 border-slate-300 dark:border-slate-800 opacity-60"
                }`}
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-slate-900 dark:text-white px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-lg">
                      {c.code}
                    </span>
                    <span
                      className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full border ${
                        c.type === "discount"
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 border-indigo-200"
                          : c.type === "gift"
                          ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-200"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950 dark:text-amber-300 border-amber-200"
                      }`}
                    >
                      {c.type === "discount"
                        ? `${c.value}% OFF`
                        : c.type === "gift"
                        ? `+${c.value} Diamantes`
                        : `${c.value} Días PRO`}
                    </span>
                    {!c.active && (
                      <span className="text-[9px] font-bold text-red-500 uppercase">
                        (Inactivo)
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 truncate">
                    {c.description}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Canjes: <span className="font-bold text-slate-700 dark:text-slate-300">{c.usedCount}</span> / {c.maxUses || "∞"}
                  </p>
                </div>

                <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                  {/* Copiar */}
                  <button
                    type="button"
                    onClick={() => handleCopy(c.code)}
                    className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-slate-700 dark:text-slate-200 transition-colors"
                    title="Copiar código"
                  >
                    {copiedCode === c.code ? (
                      <Check className="w-4 h-4 text-emerald-500" />
                    ) : (
                      <Copy className="w-4 h-4" />
                    )}
                  </button>

                  {/* Activar / Desactivar */}
                  <button
                    type="button"
                    onClick={() => handleToggleCode(c.id)}
                    className={`p-1.5 rounded-xl transition-colors ${
                      c.active
                        ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-200"
                        : "bg-slate-200 dark:bg-slate-700 text-slate-500 hover:bg-slate-300"
                    }`}
                    title={c.active ? "Desactivar código" : "Activar código"}
                  >
                    <Power className="w-4 h-4" />
                  </button>

                  {/* Eliminar */}
                  <button
                    type="button"
                    onClick={() => handleDeleteCode(c.id)}
                    className="p-1.5 rounded-xl bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400 hover:bg-red-100 transition-colors"
                    title="Eliminar código"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
