"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Lock,
  ArrowRight,
  Flame,
  Check,
  Volume2,
} from "lucide-react";
import { MistakeRecord, UserProfile } from "@/lib/types";
import { getMistakeRecords, markMistakeMastered, clearAllMistakes, getCurrentUser } from "@/lib/supabase";
import { speakHumanText } from "@/lib/audioVoice";
import { soundEffects } from "@/lib/soundEffects";

interface MistakeVaultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgradePro?: () => void;
}

export default function MistakeVaultModal({
  isOpen,
  onClose,
  onUpgradePro,
}: MistakeVaultModalProps) {
  const [mistakes, setMistakes] = useState<MistakeRecord[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [selectedMistake, setSelectedMistake] = useState<MistakeRecord | null>(null);
  const [practiceAnswer, setPracticeAnswer] = useState<number | null>(null);
  const [practiceFeedback, setPracticeFeedback] = useState<"correct" | "wrong" | null>(null);

  useEffect(() => {
    if (isOpen) {
      const records = getMistakeRecords();
      setMistakes(records);
      setCurrentUser(getCurrentUser());
      setSelectedMistake(null);
      setPracticeAnswer(null);
      setPracticeFeedback(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isPro = currentUser?.isPro || false;
  const totalMistakes = mistakes.length;
  const masteredCount = mistakes.filter((m) => m.mastered).length;
  const pendingCount = totalMistakes - masteredCount;
  const masteryPercentage = totalMistakes > 0 ? Math.round((masteredCount / totalMistakes) * 100) : 100;

  const handleSelectMistake = (m: MistakeRecord) => {
    setSelectedMistake(m);
    setPracticeAnswer(null);
    setPracticeFeedback(null);
  };

  const handleAnswerPractice = (optionIdx: number) => {
    if (!selectedMistake || practiceFeedback) return;
    setPracticeAnswer(optionIdx);

    if (optionIdx === selectedMistake.correctAnswer) {
      setPracticeFeedback("correct");
      soundEffects.playCorrect();
      markMistakeMastered(selectedMistake.questionId);
      // Actualizar estado local
      setMistakes((prev) =>
        prev.map((item) =>
          item.questionId === selectedMistake.questionId ? { ...item, mastered: true } : item
        )
      );
    } else {
      setPracticeFeedback("wrong");
      soundEffects.playIncorrect();
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white dark:bg-slate-900 border-2 border-red-500/80 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl relative text-slate-900 dark:text-slate-100 my-6 max-h-[92vh] overflow-y-auto"
      >
        {/* Botón Cerrar */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Encabezado Táctico */}
        <div className="flex items-center gap-3 mb-5 border-b border-red-200 dark:border-slate-800 pb-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 text-white flex items-center justify-center shadow-lg shadow-red-500/30 shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-slate-900 dark:text-red-400">
                Bóveda de Errores Táctica (Caja Negra)
              </h2>
              {isPro ? (
                <span className="px-2 py-0.5 bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 font-extrabold text-[10px] uppercase rounded-full border border-red-300">
                  PRO ACTIVO
                </span>
              ) : (
                <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-extrabold text-[10px] uppercase rounded-full flex items-center gap-1">
                  <Lock className="w-2.5 h-2.5" /> EXCLUSIVO PRO
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Registra y entrena exclusivamente las preguntas que has fallado hasta dominarlas al 100%.
            </p>
          </div>
        </div>

        {/* Bloque de Suscripción si el usuario no es PRO */}
        {!isPro ? (
          <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 via-red-500/10 to-amber-500/10 border-2 border-amber-400/80 text-center space-y-3">
            <div className="w-10 h-10 mx-auto rounded-full bg-amber-100 dark:bg-amber-950 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">
              Desbloquea el Entrenamiento de Caja Negra con Conan PRO
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              El 94% de los postulantes que aprueban el ALCPT en su primera oportunidad practican sus preguntas erróneas hasta eliminarlas por completo. Con Conan PRO tienes acceso ilimitado a tu Bóveda de Errores personalizada.
            </p>
            <button
              type="button"
              onClick={() => {
                onClose();
                if (onUpgradePro) onUpgradePro();
              }}
              className="px-6 py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition-all inline-flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Suscribirme a Conan PRO</span>
            </button>
          </div>
        ) : (
          <>
            {/* Estadísticas de Dominio */}
            <div className="grid grid-cols-3 gap-2 mb-4 text-center">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] font-black uppercase text-slate-400 block">Total Errores</span>
                <span className="text-base font-black text-slate-800 dark:text-white">{totalMistakes}</span>
              </div>
              <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-2xl border border-red-200 dark:border-red-800">
                <span className="text-[10px] font-black uppercase text-red-600 dark:text-red-400 block">Pendientes</span>
                <span className="text-base font-black text-red-700 dark:text-red-300">{pendingCount}</span>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] font-black uppercase text-emerald-600 dark:text-emerald-400 block">Neutralizados</span>
                <span className="text-base font-black text-emerald-700 dark:text-emerald-300">{masteredCount} ({masteryPercentage}%)</span>
              </div>
            </div>

            {/* Barra de Progreso de Dominio */}
            <div className="mb-5">
              <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1">
                <span>Nivel de Neutralización de Errores</span>
                <span>{masteryPercentage}%</span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 h-full rounded-full transition-all"
                  style={{ width: `${masteryPercentage}%` }}
                />
              </div>
            </div>

            {/* Detalle de Pregunta Seleccionada para Practicar */}
            {selectedMistake ? (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border-2 border-red-400 dark:border-red-600 mb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 rounded-md">
                    Fórmula {selectedMistake.formula}
                  </span>
                  <button
                    type="button"
                    onClick={() => setSelectedMistake(null)}
                    className="text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-white"
                  >
                    Volver a la lista
                  </button>
                </div>

                {selectedMistake.context && (
                  <p className="text-xs italic text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-900 p-2 rounded-xl">
                    &ldquo;{selectedMistake.context}&rdquo;
                  </p>
                )}

                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-black text-slate-900 dark:text-white">
                    {selectedMistake.questionText}
                  </p>
                  <button
                    type="button"
                    onClick={() => speakHumanText(selectedMistake.questionText)}
                    className="p-1.5 rounded-lg bg-amber-100 dark:bg-slate-700 text-amber-800 dark:text-amber-300 shrink-0"
                    title="Escuchar audio"
                  >
                    <Volume2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Opciones */}
                <div className="space-y-1.5 pt-1">
                  {selectedMistake.options.map((opt, oIdx) => {
                    const isSelected = practiceAnswer === oIdx;
                    const isCorrect = oIdx === selectedMistake.correctAnswer;
                    let btnStyle = "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 hover:border-amber-400";

                    if (practiceFeedback) {
                      if (isCorrect) {
                        btnStyle = "bg-emerald-50 dark:bg-emerald-950/80 border-emerald-500 text-emerald-800 dark:text-emerald-200 font-bold";
                      } else if (isSelected) {
                        btnStyle = "bg-red-50 dark:bg-red-950/80 border-red-500 text-red-800 dark:text-red-200 font-bold";
                      }
                    }

                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => handleAnswerPractice(oIdx)}
                        disabled={practiceFeedback !== null}
                        className={`w-full p-2.5 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {practiceFeedback && isCorrect && <Check className="w-4 h-4 text-emerald-500 shrink-0" />}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback Explicación */}
                {practiceFeedback && (
                  <div
                    className={`p-3 rounded-xl text-xs ${
                      practiceFeedback === "correct"
                        ? "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-200 border border-emerald-300"
                        : "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-200 border border-amber-300"
                    }`}
                  >
                    <p className="font-extrabold mb-0.5">
                      {practiceFeedback === "correct"
                        ? "¡Excelente! Error neutralizado con éxito."
                        : "Respuesta incorrecta. Revisa la explicación oficial:"}
                    </p>
                    <p className="text-[11px] leading-relaxed">{selectedMistake.explanation}</p>
                  </div>
                )}
              </div>
            ) : (
              /* Lista de Errores */
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {mistakes.length === 0 ? (
                  <div className="text-center py-8 text-slate-400">
                    <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                    <p className="text-sm font-black text-slate-700 dark:text-slate-300">
                      ¡Tu Caja Negra está limpia!
                    </p>
                    <p className="text-xs text-slate-400">
                      No tienes preguntas erróneas registradas. Sigue practicando lecciones.
                    </p>
                  </div>
                ) : (
                  mistakes.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => handleSelectMistake(m)}
                      className={`p-3 rounded-2xl border cursor-pointer transition-all flex items-center justify-between gap-3 hover:scale-[1.01] ${
                        m.mastered
                          ? "bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/40"
                          : "bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-red-400"
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                            Fórmula {m.formula}
                          </span>
                          {m.mastered ? (
                            <span className="text-[9px] font-black uppercase text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" /> Dominado
                            </span>
                          ) : (
                            <span className="text-[9px] font-black uppercase text-red-600 dark:text-red-400 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Fallado {m.failedCount}x
                            </span>
                          )}
                        </div>
                        <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate">
                          {m.questionText}
                        </p>
                      </div>

                      <button
                        type="button"
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-700 hover:bg-red-500 hover:text-white transition-colors shrink-0"
                        title="Entrenar esta pregunta"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
