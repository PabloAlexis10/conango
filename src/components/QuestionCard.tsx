"use client";

import React, { useState, useEffect } from "react";
import { Question } from "@/lib/types";
import { CheckCircle2, XCircle, ArrowRight, Lightbulb, Sparkles, Volume2, BookOpen, Headphones, Languages } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AudioPlayer from "./AudioPlayer";
import { getCurrentUser } from "@/lib/supabase";
import { getUserRankTitle } from "@/lib/accessories";

interface QuestionCardProps {
  question: Question;
  currentIndex: number;
  totalQuestions: number;
  onAnswer: (selectedIndex: number, isCorrect: boolean) => void;
  onNext: () => void;
  disabled?: boolean;
}

const optionLetters = ["A", "B", "C", "D"];

export default function QuestionCard({
  question,
  currentIndex,
  totalQuestions,
  onAnswer,
  onNext,
  disabled = false,
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const currentUser = getCurrentUser();
  const playerRank = getUserRankTitle(currentUser?.xp || 0);

  useEffect(() => {
    setSelectedOption(null);
    setHasAnswered(false);
  }, [question.id, currentIndex]);

  const handleSelect = (index: number) => {
    if (hasAnswered || disabled) return;
    setSelectedOption(index);
    setHasAnswered(true);
    const isCorrect = index === question.correctAnswer;
    onAnswer(index, isCorrect);
  };

  const isCorrect = selectedOption === question.correctAnswer;
  const isListening = question.type === "listening";

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Question Card Box */}
      <motion.div
        key={question.id + "_" + currentIndex}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-3xl border-2 border-[#A67B5B] shadow-conan-card p-5 sm:p-7 relative overflow-hidden"
      >
        {/* Card Top Header: Formula Badge & Question Count */}
        <div className="flex flex-wrap items-center justify-between gap-2 mb-4 border-b border-[#E5D5C5] pb-3.5">
          <div className="flex items-center gap-2 flex-wrap">
            {/* FORMULA BADGE (REQUIRED BY USER: Formula 1, Formula 5...) */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] text-[#92400E] border-2 border-[#F59E0B]/40 rounded-full shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span className="text-xs font-black tracking-wide uppercase">
                Fórmula {question.formula || 1}
              </span>
            </div>

            {/* Type Indicator: Listening or Reading */}
            <div
              className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border ${
                isListening
                  ? "bg-amber-50 border-amber-200 text-amber-800"
                  : "bg-orange-50 border-orange-200 text-orange-900"
              }`}
            >
              {isListening ? (
                <>
                  <Volume2 className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Listening</span>
                </>
              ) : (
                <>
                  <BookOpen className="w-3.5 h-3.5 text-[#A67B5B]" />
                  <span>Reading</span>
                </>
              )}
            </div>

            <span className="text-xs font-bold text-[#A67B5B] ml-1">
              Pregunta {currentIndex} de {totalQuestions}
            </span>
          </div>

          <button
            type="button"
            title="Conan Táctico (Haz clic para escuchar)"
            onClick={() => {
              if (typeof window !== "undefined" && "speechSynthesis" in window) {
                const utter = new SpeechSynthesisUtterance(
                  !hasAnswered
                    ? `¡Concentración, ${playerRank}! Lee con atención antes de marcar.`
                    : isCorrect
                    ? `¡Excelente impacto táctico, ${playerRank}!`
                    : `¡Mantén la guardia alta, ${playerRank}! Repasemos la regla.`
                );
                utter.lang = "es-ES";
                window.speechSynthesis.speak(utter);
              }
            }}
            className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-300 dark:from-amber-600 dark:to-yellow-500 flex items-center justify-center text-xl shadow-xs border-2 border-white dark:border-slate-700 select-none hover:scale-110 active:scale-90 transition-transform cursor-pointer"
          >
            {!hasAnswered ? "🐶⚡" : isCorrect ? "🐶🎯" : "🐶🛡️"}
          </button>
        </div>

        {/* Audio Player (Only rendered for Listening questions) */}
        {isListening && (
          <div className="mb-4">
            <AudioPlayer
              audioUrl={question.audioUrl}
              context={question.context}
              questionText={question.question}
              textToSpeak={question.textToSpeak || question.question}
            />
          </div>
        )}

        {/* Subtítulo del Contexto del Audio en Inglés (Listening) */}
        {isListening && (
          <div className="mb-6 bg-[#FAF6F0] rounded-2xl border-2 border-[#E5D5C5] p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2.5">
              <span className="text-xs font-black uppercase tracking-wider text-[#92400E] flex items-center gap-1.5">
                <Headphones className="w-4 h-4 text-[#F59E0B]" />
                Audio Transcript
              </span>
              <span className="text-[11px] font-bold text-[#6B4423] bg-white px-2.5 py-0.5 rounded-full border border-[#E5D5C5] shadow-xs flex items-center gap-1">
                <span>Inglés</span>
                <span>🇺🇸</span>
              </span>
            </div>

            {/* Subtítulo en Inglés */}
            <div className="bg-white/95 p-3.5 rounded-xl border border-[#E5D5C5]">
              <p className="text-sm sm:text-base text-[#4A3319] font-bold leading-relaxed">
                &ldquo;{question.context || (question.textToSpeak ? question.textToSpeak.replace(question.question, "").trim() : "") || question.question}&rdquo;
              </p>
            </div>
          </div>
        )}

        {/* Optional Image */}
        {question.image && (
          <div className="mb-4 rounded-2xl overflow-hidden border border-[#E5D5C5] max-h-60 flex items-center justify-center bg-[#FAF6F0]">
            <img
              src={question.image}
              alt="Contexto de la pregunta"
              className="object-contain max-h-60 w-full"
            />
          </div>
        )}

        {/* Question Prompt */}
        <div className="mb-6">
          <span className="text-xs font-black uppercase tracking-wider text-[#A67B5B] block mb-1">
            Question:
          </span>
          <h3 className="text-lg sm:text-xl font-extrabold text-[#6B4423] leading-snug">
            {question.question}
          </h3>
        </div>

        {/* Options List */}
        <div className="space-y-3">
          {question.options.map((option, idx) => {
            const isThisSelected = selectedOption === idx;
            const isThisCorrect = idx === question.correctAnswer;

            let buttonStyle = "border-[#E5D5C5] bg-white hover:border-[#A67B5B] hover:bg-[#FAF6F0]";
            let badgeStyle = "bg-[#FAF6F0] text-[#6B4423] border-[#E5D5C5]";

            if (hasAnswered) {
              if (isThisCorrect) {
                buttonStyle = "border-green-500 bg-green-50 text-green-800 shadow-[0_4px_0_0_#22C55E]";
                badgeStyle = "bg-green-500 text-white border-green-500";
              } else if (isThisSelected) {
                buttonStyle = "border-red-500 bg-red-50 text-red-800 shadow-[0_4px_0_0_#EF4444]";
                badgeStyle = "bg-red-500 text-white border-red-500";
              } else {
                buttonStyle = "border-[#E5D5C5] opacity-50 bg-gray-50";
                badgeStyle = "bg-gray-100 text-gray-400 border-gray-200";
              }
            }

            return (
              <motion.button
                key={idx}
                type="button"
                whileTap={!hasAnswered ? { scale: 0.98 } : undefined}
                disabled={hasAnswered || disabled}
                onClick={() => handleSelect(idx)}
                className={`w-full text-left p-3.5 sm:p-4 rounded-2xl border-2 font-medium flex items-center justify-between transition-all select-none option-btn ${buttonStyle}`}
              >
                <div className="flex items-center gap-3.5 flex-1 pr-2">
                  <span
                    className={`w-8 h-8 rounded-xl font-bold flex items-center justify-center text-sm border-2 flex-shrink-0 transition-colors ${badgeStyle}`}
                  >
                    {optionLetters[idx]}
                  </span>
                  <span className="text-sm sm:text-base text-[#6B4423] font-semibold leading-snug">
                    {option}
                  </span>
                </div>

                {hasAnswered && isThisCorrect && (
                  <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0" />
                )}
                {hasAnswered && isThisSelected && !isThisCorrect && (
                  <XCircle className="w-6 h-6 text-red-600 flex-shrink-0" />
                )}
              </motion.button>
            );
          })}
        </div>

        {/* Feedback & Explanation Popover */}
        <AnimatePresence>
          {hasAnswered && (
            <motion.div
              initial={{ opacity: 0, height: 0, marginTop: 0 }}
              animate={{ opacity: 1, height: "auto", marginTop: 24 }}
              exit={{ opacity: 0, height: 0, marginTop: 0 }}
              className={`p-4 sm:p-5 rounded-2xl border-2 ${
                isCorrect
                  ? "bg-green-50 border-green-300 text-green-900"
                  : "bg-red-50 border-red-300 text-red-900"
              }`}
            >
              <div className="flex items-center gap-3 mb-3 bg-white/95 dark:bg-slate-800/95 p-3 rounded-2xl border border-current/20 shadow-xs">
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl shadow-sm border-2 flex-shrink-0 transition-transform active:scale-95 select-none ${
                    isCorrect
                      ? "bg-gradient-to-tr from-emerald-400 to-green-300 border-emerald-200 dark:border-emerald-600 shadow-emerald-500/30 animate-bounce"
                      : "bg-gradient-to-tr from-amber-400 to-yellow-300 border-amber-200 dark:border-amber-600 shadow-amber-500/30"
                  }`}
                >
                  {isCorrect ? "🐶🎯" : "🐶🛡️"}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 font-black text-sm sm:text-base">
                    {isCorrect ? (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                        <span className="text-green-950 dark:text-green-200">¡Excelente impacto, {playerRank}! +10 XP 🎯</span>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                        <span className="text-red-950 dark:text-red-200">¡Atención, {playerRank}! Repasa la regla 🛡️</span>
                      </>
                    )}
                  </div>
                  <p className="text-xs font-semibold opacity-90 mt-0.5 text-slate-800 dark:text-slate-200">
                    {isCorrect
                      ? "Conan celebra tu precisión en el entrenamiento de la USAF."
                      : "No te desanimes. Analiza la explicación para dominar esta fórmula."}
                  </p>
                </div>
              </div>

              {/* Explanation Text */}
              {question.explanation && (
                <div className="mt-2 text-xs sm:text-sm bg-white/80 p-3 rounded-xl border border-current/20 flex items-start gap-2">
                  <Lightbulb className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong className="font-bold">Explicación ({question.formulaName || `Fórmula ${question.formula}`}):</strong>{" "}
                    {question.explanation}
                  </p>
                </div>
              )}

              {/* Next Question Button */}
              <div className="mt-4 flex justify-end">
                <button
                  type="button"
                  onClick={onNext}
                  className="px-6 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black rounded-xl shadow-conan-btn flex items-center gap-2 transition-transform active:translate-y-1"
                >
                  <span>{currentIndex === totalQuestions ? "Ver Resultados" : "Siguiente"}</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
