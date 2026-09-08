"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { X, BookOpen, Sparkles, Trophy, ChevronRight, Play } from "lucide-react";
import { motion } from "framer-motion";
import ConanMascot from "./ConanMascot";

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const formulasList = [
  { id: 1, name: "Fórmula 1 (Form 1)", desc: "Previsión meteorológica, tiempos pasados y avisos generales." },
  { id: 2, name: "Fórmula 2 (Form 2)", desc: "Instrucciones de aeropuerto, embarque y verbos de acción." },
  { id: 3, name: "Fórmula 3 (Form 3)", desc: "Horarios militares (0800), condicionales y órdenes tácticas." },
  { id: 4, name: "Fórmula 4 (Form 4)", desc: "Requisición de suministros, jerarquía militar y permisos." },
  { id: 5, name: "Fórmula 5 (Form 5)", desc: "Avisos de comisaría y preposiciones de tiempo (on, in, at)." },
  { id: 6, name: "Fórmula 6 (Form 6)", desc: "Mantenimiento de equipo y antónimos de obligación (mandatory)." },
  { id: 7, name: "Fórmula 7 (Form 7)", desc: "Modismos de transporte (give a lift) y concordancia sujeto-verbo." },
  { id: 8, name: "Fórmula 8 (Form 8)", desc: "Seguridad mecánica y verbos de descarte (discard, eliminate)." },
  { id: 9, name: "Fórmula 9 (Form 9)", desc: "Control aéreo (divert aircraft) y orden sintáctico de adverbios." },
  { id: 10, name: "Fórmula 10 (Form 10)", desc: "Reubicación de personal y preposiciones dependientes (unfamiliar with)." },
  { id: 11, name: "Fórmula 11 (Form 11)", desc: "Calibración de radar técnico y vocabulario de velocidad (rapid, swift)." },
  { id: 12, name: "Fórmula 12 (Form 12)", desc: "Instrucción física militar y futuro perfecto (will have finished)." },
  { id: 13, name: "Fórmula 13 (Form 13)", desc: "Movilización de convoy al amanecer (at dawn) y niveles de combustible." },
  { id: 14, name: "Fórmula 14 (Form 14)", desc: "Sanidad militar (prescripción médica) y voz pasiva en presente." },
  { id: 15, name: "Fórmula 15 (Form 15)", desc: "Requisiciones de emergencia y comparativos de adverbios." },
];

export default function FormulaModal({ isOpen, onClose }: FormulaModalProps) {
  const router = useRouter();
  const [selectedFormula, setSelectedFormula] = useState<number | null>(1);
  const [selectedMode, setSelectedMode] = useState<"exam100" | "quiz10" | "quiz30" | "quiz50">("exam100");

  if (!isOpen) return null;

  const handleStart = () => {
    if (!selectedFormula) return;
    let size = 100;
    if (selectedMode === "quiz10") size = 10;
    if (selectedMode === "quiz30") size = 30;
    if (selectedMode === "quiz50") size = 50;

    router.push(`/practice?size=${size}&formula=${selectedFormula}`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="bg-white rounded-3xl border-2 border-[#A67B5B] shadow-2xl p-6 sm:p-8 max-w-2xl w-full relative max-h-[90vh] flex flex-col overflow-hidden"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#A67B5B] hover:text-[#6B4423] hover:bg-[#FAF6F0] rounded-full transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3.5 mb-5 pb-4 border-b border-[#E5D5C5]">
          <ConanMascot size="sm" mood="happy" animate={false} />
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-[#6B4423] tracking-tight">
              Elegir Cuadernillo / Fórmula ALCPT
            </h3>
            <p className="text-xs text-[#A67B5B] font-semibold">
              Selecciona la fórmula específica que deseas rendir o practicar.
            </p>
          </div>
        </div>

        {/* Formula Selection Grid */}
        <div className="flex-1 overflow-y-auto pr-1 space-y-2 mb-5 max-h-60 sm:max-h-72">
          {formulasList.map((f) => {
            const isSelected = selectedFormula === f.id;
            return (
              <div
                key={f.id}
                onClick={() => setSelectedFormula(f.id)}
                className={`p-3.5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? "border-[#F59E0B] bg-[#FFFBEB] shadow-sm ring-1 ring-[#F59E0B]"
                    : "border-[#E5D5C5] hover:border-[#A67B5B] hover:bg-[#FAF6F0]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs ${
                      isSelected
                        ? "bg-[#F59E0B] text-white"
                        : "bg-[#FAF6F0] text-[#6B4423] border border-[#E5D5C5]"
                    }`}
                  >
                    #{f.id}
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-[#6B4423] leading-snug">
                      {f.name}
                    </h4>
                    <p className="text-xs text-[#A67B5B] line-clamp-1">{f.desc}</p>
                  </div>
                </div>

                <ChevronRight
                  className={`w-4 h-4 transition-transform ${
                    isSelected ? "text-[#F59E0B] translate-x-0.5" : "text-[#E5D5C5]"
                  }`}
                />
              </div>
            );
          })}
        </div>

        {/* Mode Selector for chosen formula */}
        <div className="pt-4 border-t border-[#E5D5C5]">
          <span className="text-xs font-black uppercase tracking-wider text-[#6B4423] block mb-2">
            Modalidad para la Fórmula {selectedFormula}:
          </span>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
            <button
              type="button"
              onClick={() => setSelectedMode("exam100")}
              className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                selectedMode === "exam100"
                  ? "border-[#F59E0B] bg-[#FEF3C7] text-[#92400E] font-black"
                  : "border-[#E5D5C5] text-[#6B4423] font-bold hover:bg-[#FAF6F0]"
              }`}
            >
              <div className="text-xs font-black">Examen 100 Qs</div>
              <div className="text-[10px] text-[#A67B5B]">60L / 40R • 60 min</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMode("quiz30")}
              className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                selectedMode === "quiz30"
                  ? "border-[#F59E0B] bg-[#FEF3C7] text-[#92400E] font-black"
                  : "border-[#E5D5C5] text-[#6B4423] font-bold hover:bg-[#FAF6F0]"
              }`}
            >
              <div className="text-xs font-black">Quiz 30 Qs</div>
              <div className="text-[10px] text-[#A67B5B]">15L / 15R • 5 vidas</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMode("quiz10")}
              className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                selectedMode === "quiz10"
                  ? "border-[#F59E0B] bg-[#FEF3C7] text-[#92400E] font-black"
                  : "border-[#E5D5C5] text-[#6B4423] font-bold hover:bg-[#FAF6F0]"
              }`}
            >
              <div className="text-xs font-black">Quiz 10 Qs</div>
              <div className="text-[10px] text-[#A67B5B]">5L / 5R • 5 vidas</div>
            </button>

            <button
              type="button"
              onClick={() => setSelectedMode("quiz50")}
              className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                selectedMode === "quiz50"
                  ? "border-[#F59E0B] bg-[#FEF3C7] text-[#92400E] font-black"
                  : "border-[#E5D5C5] text-[#6B4423] font-bold hover:bg-[#FAF6F0]"
              }`}
            >
              <div className="text-xs font-black">Quiz 50 Qs</div>
              <div className="text-[10px] text-[#A67B5B]">25L / 25R • 5 vidas</div>
            </button>
          </div>

          <button
            type="button"
            onClick={handleStart}
            className="w-full py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black rounded-2xl shadow-conan-btn flex items-center justify-center gap-2 text-sm sm:text-base transition-transform active:translate-y-1"
          >
            <Play className="w-5 h-5 fill-current" />
            <span>Comenzar Fórmula {selectedFormula}</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
}
