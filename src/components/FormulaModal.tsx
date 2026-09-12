"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { X, BookOpen, Sparkles, Trophy, ChevronRight, Play, Search, Hash, Lock, Crown } from "lucide-react";
import { motion } from "framer-motion";
import ConanMascot from "./ConanMascot";
import { getCurrentUser } from "@/lib/supabase";
import ProSubscriptionModal from "./ProSubscriptionModal";
import { UserProfile } from "@/lib/types";

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Generate all 100 official ALCPT forms
const all100Formulas = Array.from({ length: 100 }, (_, i) => {
  const num = i + 1;
  let desc = `Cuadernillo oficial de evaluación estandarizada Form ${num}.`;
  if (num === 1) desc = "Previsión meteorológica, tiempos pasados y avisos de cuartel.";
  else if (num === 2) desc = "Instrucciones de aeropuerto, embarque y verbos de acción.";
  else if (num === 3) desc = "Horarios militares (0700), condicionales y órdenes tácticas.";
  else if (num === 4) desc = "Requisición de suministros, jerarquía militar y permisos.";
  else if (num === 5) desc = "Avisos de comisaría y preposiciones de tiempo (on, in, at).";
  else if (num === 6) desc = "Mantenimiento de equipo y antónimos de obligación (mandatory).";
  else if (num === 7) desc = "Modismos de transporte (give a lift) y concordancia sujeto-verbo.";
  else if (num === 8) desc = "Seguridad mecánica y verbos de descarte (discard, eliminate).";
  else if (num === 9) desc = "Control aéreo (divert aircraft) y orden sintáctico de adverbios.";
  else if (num === 10) desc = "Reubicación de personal y preposiciones dependientes.";
  return {
    id: num,
    name: `Fórmula ${num} (Form ${num})`,
    desc,
  };
});

type RangeFilter = "1-25" | "26-50" | "51-75" | "76-100" | "all";

export default function FormulaModal({ isOpen, onClose }: FormulaModalProps) {
  const router = useRouter();
  const [selectedFormula, setSelectedFormula] = useState<number>(1);
  const [selectedMode, setSelectedMode] = useState<"exam100" | "quiz10" | "quiz20" | "quiz30" | "quiz50">("exam100");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [rangeFilter, setRangeFilter] = useState<RangeFilter>("1-25");
  const [proModalOpen, setProModalOpen] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
  }, [isOpen]);

  const isPro = !!user?.isPro;

  const filteredFormulas = useMemo(() => {
    return all100Formulas.filter((f) => {
      // Search filter
      if (searchTerm.trim() !== "") {
        const term = searchTerm.toLowerCase().trim();
        return (
          f.id.toString() === term ||
          f.name.toLowerCase().includes(term) ||
          f.desc.toLowerCase().includes(term)
        );
      }

      // Range filter
      if (rangeFilter === "1-25") return f.id >= 1 && f.id <= 25;
      if (rangeFilter === "26-50") return f.id >= 26 && f.id <= 50;
      if (rangeFilter === "51-75") return f.id >= 51 && f.id <= 75;
      if (rangeFilter === "76-100") return f.id >= 76 && f.id <= 100;
      return true;
    });
  }, [searchTerm, rangeFilter]);

  if (!isOpen) return null;

  const handleSelectFormula = (id: number) => {
    if (id > 8 && !isPro) {
      setProModalOpen(true);
      return;
    }
    setSelectedFormula(id);
  };

  const handleStart = () => {
    if (!selectedFormula) return;
    if (selectedFormula > 8 && !isPro) {
      setProModalOpen(true);
      return;
    }
    let size = 100;
    if (selectedMode === "quiz10") size = 10;
    if (selectedMode === "quiz20") size = 20;
    if (selectedMode === "quiz30") size = 30;
    if (selectedMode === "quiz50") size = 50;

    router.push(`/practice?size=${size}&formula=${selectedFormula}`);
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.94, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0 }}
          className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-[#A67B5B] dark:border-slate-700 shadow-2xl p-5 sm:p-7 max-w-2xl w-full relative max-h-[92vh] flex flex-col overflow-hidden text-[#6B4423] dark:text-slate-100"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-[#A67B5B] dark:text-slate-400 hover:text-[#6B4423] dark:hover:text-white hover:bg-[#FAF6F0] dark:hover:bg-slate-800 rounded-full transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Modal Header */}
          <div className="flex items-center gap-3 mb-4 pb-3 border-b border-[#E5D5C5] dark:border-slate-800">
            <ConanMascot size="sm" mood="happy" animate={false} />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-xl sm:text-2xl font-black text-[#6B4423] dark:text-white tracking-tight">
                  Elegir Fórmula ALCPT (1 al 100)
                </h3>
                {isPro ? (
                  <span className="px-2 py-0.5 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-black text-[10px] uppercase shadow-xs">
                    PRO Desbloqueado 👑
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[#A67B5B] dark:text-slate-300 font-bold text-[10px]">
                    1-5 Gratis &bull; 6-100 PRO
                  </span>
                )}
              </div>
              <p className="text-xs text-[#A67B5B] dark:text-slate-400 font-semibold">
                Selecciona cualquiera de los 100 cuadernillos oficiales estandarizados.
              </p>
            </div>
          </div>

          {/* Search & Range Filters */}
          <div className="space-y-2 mb-3">
            <div className="relative">
              <Search className="w-4 h-4 text-[#A67B5B] dark:text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por número (ej: 1, 15, 50, 100)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-[#FAF6F0] dark:bg-slate-800 border border-[#E5D5C5] dark:border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs sm:text-sm text-[#6B4423] dark:text-slate-100 font-semibold outline-none focus:border-[#F59E0B] focus:bg-white dark:focus:bg-slate-700 transition-all"
              />
              {searchTerm && (
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#A67B5B] dark:text-slate-400 hover:text-[#6B4423] dark:hover:text-white"
                >
                  Limpiar
                </button>
              )}
            </div>

            {/* Quick Range Tabs */}
            {!searchTerm && (
              <div className="flex gap-1 overflow-x-auto pb-1 text-[11px] font-bold text-[#A67B5B]">
                {(["1-25", "26-50", "51-75", "76-100", "all"] as RangeFilter[]).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setRangeFilter(tab)}
                    className={`px-3 py-1 rounded-lg transition-colors shrink-0 ${
                      rangeFilter === tab
                        ? "bg-[#F59E0B] text-white font-black shadow-sm"
                        : "bg-[#FAF6F0] dark:bg-slate-800 hover:bg-[#F5EFEB] dark:hover:bg-slate-700 text-[#6B4423] dark:text-slate-200 border border-[#E5D5C5] dark:border-slate-700"
                    }`}
                  >
                    {tab === "all" ? "Todas (1-100)" : `Fórmulas ${tab}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Formula Selection Grid (Scrollable) */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-1.5 mb-4 max-h-52 sm:max-h-60 border border-[#E5D5C5]/60 dark:border-slate-800 p-2 rounded-2xl bg-slate-50/50 dark:bg-slate-950/40">
            {filteredFormulas.map((f) => {
              const isSelected = selectedFormula === f.id;
              const isLocked = f.id > 8 && !isPro;
              return (
                <div
                  key={f.id}
                  onClick={() => handleSelectFormula(f.id)}
                  className={`p-2.5 rounded-xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? "border-[#F59E0B] bg-[#FFFBEB] dark:bg-amber-950/30 shadow-sm ring-1 ring-[#F59E0B]"
                      : isLocked
                      ? "border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-slate-900/60 opacity-85 hover:border-amber-400"
                      : "border-[#E5D5C5] dark:border-slate-800 hover:border-[#A67B5B] bg-white dark:bg-slate-900 hover:bg-[#FAF6F0] dark:hover:bg-slate-800"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                        isSelected
                          ? "bg-[#F59E0B] text-white shadow-sm"
                          : isLocked
                          ? "bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300"
                          : "bg-[#FAF6F0] dark:bg-slate-800 text-[#6B4423] dark:text-slate-200 border border-[#E5D5C5] dark:border-slate-700"
                      }`}
                    >
                      #{f.id}
                    </div>
                    <div className="truncate">
                      <p className="font-extrabold text-xs sm:text-sm text-[#6B4423] dark:text-slate-100 truncate">
                        {f.name}
                      </p>
                      <p className="text-[11px] text-[#A67B5B] dark:text-slate-400 truncate font-medium">
                        {f.desc}
                      </p>
                    </div>
                  </div>

                  <div className="shrink-0">
                    {isLocked ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-yellow-500 text-white shadow-xs">
                        <Lock className="w-3 h-3" />
                        <span>PRO 👑</span>
                      </span>
                    ) : (
                      <span
                        className={`text-[11px] font-black px-2 py-0.5 rounded-md ${
                          isSelected
                            ? "bg-[#F59E0B] text-white"
                            : "text-[#A67B5B] dark:text-slate-400"
                        }`}
                      >
                        {isSelected ? "Seleccionada" : "Elegir"}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Mode Selector */}
          <div className="mb-4 pt-2 border-t border-[#E5D5C5] dark:border-slate-800">
            <p className="text-xs font-black text-[#6B4423] dark:text-slate-200 uppercase tracking-wider mb-2">
              Modo para Fórmula {selectedFormula}:
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              <button
                type="button"
                onClick={() => setSelectedMode("exam100")}
                className={`p-2 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center ${
                  selectedMode === "exam100"
                    ? "border-[#F59E0B] bg-[#FFFBEB] dark:bg-amber-950/40 text-[#92400E] dark:text-amber-300 font-black shadow-sm"
                    : "border-[#E5D5C5] dark:border-slate-700 text-[#6B4423] dark:text-slate-300 hover:bg-[#FAF6F0] dark:hover:bg-slate-800 font-bold"
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-[#F59E0B] mb-0.5" />
                <span className="text-xs">Examen 100</span>
                <span className="text-[10px] text-[#A67B5B] dark:text-slate-400 font-medium">60L / 40R</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode("quiz10")}
                className={`p-2 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center ${
                  selectedMode === "quiz10"
                    ? "border-[#F59E0B] bg-[#FFFBEB] dark:bg-amber-950/40 text-[#92400E] dark:text-amber-300 font-black shadow-sm"
                    : "border-[#E5D5C5] dark:border-slate-700 text-[#6B4423] dark:text-slate-300 hover:bg-[#FAF6F0] dark:hover:bg-slate-800 font-bold"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500 mb-0.5" />
                <span className="text-xs">Quiz 10</span>
                <span className="text-[10px] text-[#A67B5B] dark:text-slate-400 font-medium">5L / 5R</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode("quiz20")}
                className={`p-2 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center ${
                  selectedMode === "quiz20"
                    ? "border-[#F59E0B] bg-[#FFFBEB] dark:bg-amber-950/40 text-[#92400E] dark:text-amber-300 font-black shadow-sm"
                    : "border-[#E5D5C5] dark:border-slate-700 text-[#6B4423] dark:text-slate-300 hover:bg-[#FAF6F0] dark:hover:bg-slate-800 font-bold"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500 mb-0.5" />
                <span className="text-xs">Quiz 20</span>
                <span className="text-[10px] text-[#A67B5B] dark:text-slate-400 font-medium">10L / 10R</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode("quiz30")}
                className={`p-2 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center ${
                  selectedMode === "quiz30"
                    ? "border-[#F59E0B] bg-[#FFFBEB] dark:bg-amber-950/40 text-[#92400E] dark:text-amber-300 font-black shadow-sm"
                    : "border-[#E5D5C5] dark:border-slate-700 text-[#6B4423] dark:text-slate-300 hover:bg-[#FAF6F0] dark:hover:bg-slate-800 font-bold"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500 mb-0.5" />
                <span className="text-xs">Quiz 30</span>
                <span className="text-[10px] text-[#A67B5B] dark:text-slate-400 font-medium">15L / 15R</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedMode("quiz50")}
                className={`p-2 rounded-xl border-2 text-center transition-all flex flex-col items-center justify-center ${
                  selectedMode === "quiz50"
                    ? "border-[#F59E0B] bg-[#FFFBEB] dark:bg-amber-950/40 text-[#92400E] dark:text-amber-300 font-black shadow-sm"
                    : "border-[#E5D5C5] dark:border-slate-700 text-[#6B4423] dark:text-slate-300 hover:bg-[#FAF6F0] dark:hover:bg-slate-800 font-bold"
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-blue-500 mb-0.5" />
                <span className="text-xs">Quiz 50</span>
                <span className="text-[10px] text-[#A67B5B] dark:text-slate-400 font-medium">25L / 25R</span>
              </button>
            </div>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={handleStart}
            className="w-full py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black rounded-2xl shadow-conan-btn flex items-center justify-center gap-2 text-sm sm:text-base transition-transform active:scale-98"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Comenzar Fórmula {selectedFormula} ({selectedMode === "exam100" ? "100 Preguntas" : selectedMode})</span>
          </button>
        </motion.div>
      </div>

      <ProSubscriptionModal
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
      />
    </>
  );
}
