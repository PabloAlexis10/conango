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
  RotateCw,
  UserCheck,
  UserX,
  Crown,
  Calendar,
  FileText,
  Share2,
} from "lucide-react";
import { PromoCode, UserProfile, CodeRedemption } from "@/lib/types";
import {
  fetchServerCodes,
  createPromoCode,
  togglePromoCodeActive,
  deletePromoCode,
  revokeRedemption,
  generateUniversalTacticalCode,
} from "@/lib/adminCodes";
import { getCurrentUser, saveCurrentUserProfile, getRegisteredAccounts } from "@/lib/supabase";

interface AdminControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AdminTab = "codes" | "redemptions" | "pro_users";

export default function AdminControlModal({
  isOpen,
  onClose,
  onSuccess,
}: AdminControlModalProps) {
  const [activeTab, setActiveTab] = useState<AdminTab>("codes");
  const [codes, setCodes] = useState<PromoCode[]>([]);
  const [redemptions, setRedemptions] = useState<CodeRedemption[]>([]);
  const [proUsers, setProUsers] = useState<UserProfile[]>([]);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncingForms, setSyncingForms] = useState(false);

  // Form State for creating new code
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

  const refreshData = async () => {
    setLoading(true);
    setCurrentUser(getCurrentUser());

    try {
      // 1. Fetch server codes & redemptions
      const serverData = await fetchServerCodes();
      setCodes(serverData.codes);
      setRedemptions(serverData.redemptions);

      // 2. Sync local accounts to server & fetch PRO / registered users
      const localAccounts = getRegisteredAccounts();
      if (localAccounts.length > 0) {
        await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "sync", usersSync: localAccounts }),
        });
      }

      const usersRes = await fetch("/api/admin/users");
      const usersData = await usersRes.json();
      if (usersData.success && Array.isArray(usersData.users)) {
        setProUsers(usersData.users);
      } else {
        setProUsers(localAccounts);
      }
    } catch (err) {
      console.error("[Admin refreshData Error]:", err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleCopy = (code: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    }
  };

  const handleCopyShare = (code: string, description?: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      const shareMessage = `¡Hola! Aquí tienes tu código para ConanGo: ${code}\nIngresa a https://conango.vercel.app y canjéalo tocando el ícono de regalo 🎁 para activar tus beneficios militares.`;
      navigator.clipboard.writeText(shareMessage);
      setCopiedCode(code);
      setFeedbackMsg({ type: "success", text: `¡Mensaje con código ${code} copiado al portapapeles para WhatsApp!` });
      setTimeout(() => {
        setCopiedCode(null);
        setFeedbackMsg(null);
      }, 3000);
    }
  };

  const handleCreateQuickPreset = async (preset: "pro_30d" | "pro_lifetime" | "gems_500" | "desc_50") => {
    setFeedbackMsg(null);
    let type: "pro_trial" | "gift" | "discount" = "pro_trial";
    let val = 30;
    let desc = "Pase Conan PRO Táctico (30 Días)";
    let detail: any = { proDays: 30 };

    if (preset === "pro_30d") {
      type = "pro_trial";
      val = 30;
      desc = "Pase Conan PRO Táctico (30 Días)";
      detail = { proDays: 30 };
    } else if (preset === "pro_lifetime") {
      type = "pro_trial";
      val = 9999;
      desc = "Pase Conan PRO Vitalicio de la Comandancia";
      detail = { proDays: 9999 };
    } else if (preset === "gems_500") {
      type = "gift";
      val = 500;
      desc = "Bolsa Militar de 500 Diamantes";
      detail = { gems: 500, streakFreeze: 1 };
    } else if (preset === "desc_50") {
      type = "discount";
      val = 50;
      desc = "Descuento Táctico 50% en Conan PRO";
      detail = { discountPercent: 50 };
    }

    const generatedCode = generateUniversalTacticalCode(type, val);
    const res = await createPromoCode({
      code: generatedCode,
      type,
      value: val,
      description: desc,
      maxUses: 999,
      rewardDetail: detail,
    });

    if (res.success && res.code) {
      setFeedbackMsg({ type: "success", text: `¡Código universal ${res.code.code} generado listo para enviar!` });
      handleCopyShare(res.code.code, desc);
      refreshData();
    }
  };

  const handleToggleCode = async (id: string) => {
    await togglePromoCodeActive(id);
    refreshData();
  };

  const handleDeleteCode = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este código promocional permanentemente?")) {
      await deletePromoCode(id);
      refreshData();
    }
  };

  const handleCreateCode = async (e: React.FormEvent) => {
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

    const res = await createPromoCode({
      code: newCodeName,
      type: newCodeType,
      value: Number(newCodeValue),
      description: newCodeDesc || `Código oficial de ${newCodeType}`,
      maxUses: Number(newCodeMaxUses),
      rewardDetail,
    });

    if (res.success) {
      setFeedbackMsg({ type: "success", text: `¡Código ${res.code?.code} creado y publicado universalmente!` });
      setNewCodeName("");
      setNewCodeDesc("");
      refreshData();
      setTimeout(() => setFeedbackMsg(null), 3500);
    } else {
      setFeedbackMsg({ type: "error", text: res.error || "Error al crear el código." });
    }
  };

  const handleRevokeRedemption = async (redemptionId: string, userName: string, code: string) => {
    if (confirm(`¿Deseas revocar el beneficio del código "${code}" a ${userName}? Esto cancelará sus privilegios o diamantes.`)) {
      const res = await revokeRedemption(redemptionId);
      if (res.success) {
        alert(res.message || "Canje revocado exitosamente.");
        refreshData();
      } else {
        alert(res.error || "Error al revocar el canje.");
      }
    }
  };

  const handleGrantPro = async (user: UserProfile, days?: number) => {
    const actionText = days ? `por ${days} días` : "de forma VITALICIA";
    if (confirm(`¿Conceder membresía PRO ${actionText} a ${user.name} (${user.email})?`)) {
      try {
        await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "grant_pro",
            userId: user.id,
            userEmail: user.email,
            userName: user.name,
            proDays: days,
          }),
        });
        refreshData();
      } catch (err) {
        alert("Error al conceder PRO.");
      }
    }
  };

  const handleRevokePro = async (user: UserProfile) => {
    if (confirm(`¿Estás seguro de revocar la membresía PRO de ${user.name} (${user.email})? Pasará a ser cadete estándar.`)) {
      try {
        await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action: "revoke_pro",
            userId: user.id,
            userEmail: user.email,
          }),
        });
        refreshData();
      } catch (err) {
        alert("Error al revocar PRO.");
      }
    }
  };

  const handleSyncWordForms = async () => {
    setSyncingForms(true);
    try {
      const res = await fetch("/api/admin/ingest", { method: "POST" });
      const data = await res.json();
      if (data.success) {
        alert(`¡Sincronización Exitosa!\nSe procesaron ${data.processedCount} Formas Word desde form3_docx.\nTotal Listening: ${data.totalListening}\nTotal Reading: ${data.totalReading}`);
      } else {
        alert(`Error al sincronizar formas: ${data.error}`);
      }
    } catch (err: any) {
      alert(`Error en el servidor: ${err.message}`);
    } finally {
      setSyncingForms(false);
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
        className="bg-white dark:bg-slate-900 border-2 border-amber-500/80 rounded-3xl max-w-3xl w-full p-4 sm:p-6 shadow-2xl relative text-slate-900 dark:text-slate-100 my-8 max-h-[92vh] overflow-y-auto"
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
        <div className="flex items-center justify-between gap-3 mb-4 border-b border-amber-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
              <ShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-black text-slate-900 dark:text-amber-400">
                  Comandancia General USAF
                </h2>
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 font-extrabold text-[10px] uppercase rounded-full border border-amber-300 dark:border-amber-700">
                  ADMINISTRADOR
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Control central de códigos oficiales, auditoría de canjes y gestión de usuarios PRO.
              </p>
            </div>
          </div>

          {/* Sincronizador de Formas Word */}
          <button
            type="button"
            onClick={handleSyncWordForms}
            disabled={syncingForms}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-300 text-xs font-black hover:bg-amber-100 transition-colors shrink-0 disabled:opacity-50"
            title="Sincronizar archivos Word desde form3_docx"
          >
            <RotateCw className={`w-3.5 h-3.5 ${syncingForms ? "animate-spin text-amber-600" : ""}`} />
            <span>{syncingForms ? "Sincronizando..." : "Sincronizar Word (1-100)"}</span>
          </button>
        </div>

        {/* Estatus del Administrador */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 text-center">
          <div className="p-2.5 bg-amber-50 dark:bg-amber-950/40 rounded-2xl border border-amber-200 dark:border-amber-800">
            <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-300 block">
              Membresía PRO
            </span>
            <span className="text-sm font-black text-amber-900 dark:text-amber-200 flex items-center justify-center gap-1 mt-0.5">
              <Infinity className="w-4 h-4 text-amber-500" /> Vitalicia
            </span>
          </div>

          <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
            <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 block">
              Vidas / Medallas
            </span>
            <span className="text-sm font-black text-emerald-900 dark:text-emerald-200 mt-0.5 block">
              ∞ Infinitas
            </span>
          </div>

          <div className="p-2.5 bg-cyan-50 dark:bg-cyan-950/40 rounded-2xl border border-cyan-200 dark:border-cyan-800">
            <span className="text-[10px] font-black uppercase text-cyan-800 dark:text-cyan-300 block">
              Diamantes
            </span>
            <span className="text-sm font-black text-cyan-900 dark:text-cyan-200 mt-0.5 block">
              💎 {currentUser?.gems ?? 9999}
            </span>
          </div>

          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 rounded-2xl border border-indigo-200 dark:border-indigo-800">
            <span className="text-[10px] font-black uppercase text-indigo-800 dark:text-indigo-300 block">
              Anuncios
            </span>
            <span className="text-sm font-black text-indigo-900 dark:text-indigo-200 mt-0.5 block">
              🛡️ 0 (Desactivados)
            </span>
          </div>
        </div>

        {/* Pestañas de Navegación del Administrador */}
        <div className="flex border-b border-slate-200 dark:border-slate-700 mb-4 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("codes")}
            className={`px-4 py-2.5 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "codes"
                ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Tag className="w-3.5 h-3.5" />
            <span>Códigos Tácticos ({codes.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("redemptions")}
            className={`px-4 py-2.5 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "redemptions"
                ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Auditoría de Canjes ({redemptions.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("pro_users")}
            className={`px-4 py-2.5 text-xs font-black border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === "pro_users"
                ? "border-amber-500 text-amber-600 dark:text-amber-400 bg-amber-50/50 dark:bg-amber-950/20 rounded-t-xl"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            }`}
          >
            <Crown className="w-3.5 h-3.5" />
            <span>Usuarios PRO ({proUsers.filter(u => u.isPro).length})</span>
          </button>
        </div>

        {/* TAB 1: CÓDIGOS TÁCTICOS */}
        {activeTab === "codes" && (
          <div className="space-y-4">
            {/* Creador de Nuevos Códigos */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                <h3 className="text-sm font-black text-slate-800 dark:text-white flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-amber-500" />
                  Crear Código Táctico Universal (Infalible)
                </h3>
              </div>

              {/* Botones de 1 Clic para Crear y Copiar al instante */}
              <div className="mb-4 bg-amber-50/60 dark:bg-amber-950/30 p-3 rounded-xl border border-amber-200 dark:border-amber-800">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 block mb-2">
                  ⚡ Generación Rápida de 1 Clic (Se genera y copia para WhatsApp):
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => handleCreateQuickPreset("pro_30d")}
                    className="px-2.5 py-2 bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-700 rounded-xl text-xs font-black text-amber-900 dark:text-amber-200 shadow-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>⭐ PRO 30 Días</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateQuickPreset("pro_lifetime")}
                    className="px-2.5 py-2 bg-white dark:bg-slate-800 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-700 rounded-xl text-xs font-black text-amber-900 dark:text-amber-200 shadow-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>👑 PRO Vitalicio</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateQuickPreset("gems_500")}
                    className="px-2.5 py-2 bg-white dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-300 dark:border-emerald-700 rounded-xl text-xs font-black text-emerald-900 dark:text-emerald-200 shadow-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>💎 500 Gemas</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCreateQuickPreset("desc_50")}
                    className="px-2.5 py-2 bg-white dark:bg-slate-800 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-300 dark:border-indigo-700 rounded-xl text-xs font-black text-indigo-900 dark:text-indigo-200 shadow-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <span>🏷️ 50% OFF</span>
                  </button>
                </div>
              </div>

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
                      Descripción para el usuario
                    </label>
                    <input
                      type="text"
                      value={newCodeDesc}
                      onChange={(e) => setNewCodeDesc(e.target.value)}
                      placeholder="Ej: Beca militar otorgada por Comandancia"
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
                  <span>Publicar Código Universal</span>
                </button>
              </form>
            </div>

            {/* Lista de Códigos Activos */}
            <div className="space-y-2">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xs font-black uppercase text-slate-500 dark:text-slate-400 tracking-wider">
                  Códigos Registrados en el Servidor ({codes.length})
                </h3>
                <button
                  type="button"
                  onClick={handleRefillResources}
                  className="text-[11px] font-extrabold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  ⚡ Recargar Recursos Administrador
                </button>
              </div>

              {codes.length === 0 ? (
                <div className="text-center py-6 border border-dashed rounded-2xl border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
                  No hay códigos creados actualmente. Crea el primer código arriba.
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
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
                          Canjes realizados: <span className="font-bold text-slate-700 dark:text-slate-300">{c.usedCount || 0}</span> / {c.maxUses || "∞"}
                        </p>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                        {/* Copiar Sólo Código */}
                        <button
                          type="button"
                          onClick={() => handleCopy(c.code)}
                          className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 text-slate-700 dark:text-slate-200 transition-colors"
                          title="Copiar sólo código"
                        >
                          {copiedCode === c.code ? (
                            <Check className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Copy className="w-4 h-4" />
                          )}
                        </button>

                        {/* Copiar para WhatsApp */}
                        <button
                          type="button"
                          onClick={() => handleCopyShare(c.code, c.description)}
                          className="px-2 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 text-[11px] font-black transition-colors flex items-center gap-1 shadow-xs"
                          title="Copiar mensaje listo para WhatsApp"
                        >
                          <Share2 className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
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
              )}
            </div>
          </div>
        )}

        {/* TAB 2: AUDITORÍA DE CANJES Y REVOCACIÓN */}
        {activeTab === "redemptions" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Historial de personas que han canjeado códigos. Puedes revocar el beneficio en caso de suplantación o abuso.
              </p>
              <button
                type="button"
                onClick={refreshData}
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <RotateCw className="w-3 h-3" /> Actualizar
              </button>
            </div>

            {redemptions.length === 0 ? (
              <div className="text-center py-10 border border-dashed rounded-2xl border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
                No hay canjes registrados en el sistema todavía.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {redemptions.map((r) => (
                  <div
                    key={r.id}
                    className={`p-3 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      r.revoked
                        ? "bg-slate-100 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 opacity-60"
                        : "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-2xs"
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-extrabold text-xs text-slate-900 dark:text-white">
                          {r.userName}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          ({r.userEmail})
                        </span>
                        <span className="px-2 py-0.5 rounded-md font-mono text-[10px] font-black bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                          {r.code}
                        </span>
                        {r.revoked ? (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300">
                            REVOCADO
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300">
                            ACTIVO
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        <span>
                          Beneficio:{" "}
                          <strong className="text-slate-700 dark:text-slate-200">
                            {r.type === "discount"
                              ? `${r.value}% Descuento`
                              : r.type === "gift"
                              ? `+${r.value} Diamantes`
                              : `${r.value} Días PRO`}
                          </strong>
                        </span>
                        <span>&bull;</span>
                        <span>{new Date(r.redeemedAt).toLocaleString()}</span>
                      </div>
                    </div>

                    {!r.revoked ? (
                      <button
                        type="button"
                        onClick={() => handleRevokeRedemption(r.id, r.userName, r.code)}
                        className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-bold transition-all shrink-0 self-end sm:self-center flex items-center gap-1"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        <span>Revocar Beneficio</span>
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 italic">
                        Beneficio anulado
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: ADMINISTRACIÓN DE USUARIOS PRO */}
        {activeTab === "pro_users" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Directorio de cadetes y pilotos. Administra permisos PRO o revoca accesos en tiempo real.
              </p>
              <button
                type="button"
                onClick={refreshData}
                className="text-[11px] font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
              >
                <RotateCw className="w-3 h-3" /> Actualizar
              </button>
            </div>

            {proUsers.length === 0 ? (
              <div className="text-center py-10 border border-dashed rounded-2xl border-slate-200 dark:border-slate-700 text-slate-400 text-xs">
                No hay usuarios registrados aún en el directorio.
              </div>
            ) : (
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {proUsers.map((u) => {
                  const isUserPro = Boolean(u.isPro);
                  return (
                    <div
                      key={u.id || u.email}
                      className="p-3.5 rounded-2xl border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-sm text-slate-900 dark:text-white">
                            {u.name || "Cadete"}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-slate-400">
                            {u.email}
                          </span>
                          {isUserPro ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 flex items-center gap-1 shadow-2xs">
                              <Crown className="w-3 h-3 text-slate-900" /> PRO
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                              Estándar
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                          <span>XP: <strong>{u.xp || 0}</strong></span>
                          <span>&bull;</span>
                          <span>Medallas: <strong>{u.medals ?? 15}</strong></span>
                          <span>&bull;</span>
                          <span>Diamantes: <strong>{u.gems ?? 100}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        {isUserPro ? (
                          <button
                            type="button"
                            onClick={() => handleRevokePro(u)}
                            className="px-3 py-1.5 rounded-xl bg-red-50 dark:bg-red-950/60 hover:bg-red-100 dark:hover:bg-red-900/60 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-300 text-xs font-bold transition-all flex items-center gap-1"
                          >
                            <UserX className="w-3.5 h-3.5" />
                            <span>Revocar PRO</span>
                          </button>
                        ) : (
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleGrantPro(u, 30)}
                              className="px-2.5 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 hover:bg-amber-100 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <Calendar className="w-3 h-3" />
                              <span>+30 Días</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => handleGrantPro(u)}
                              className="px-2.5 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 border border-emerald-300 dark:border-emerald-700 text-emerald-900 dark:text-emerald-200 text-xs font-bold transition-all flex items-center gap-1"
                            >
                              <Crown className="w-3 h-3" />
                              <span>Vitalicio</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}

