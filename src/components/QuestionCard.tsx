"use client";

import React, { useState, useEffect } from "react";
import { Question } from "@/lib/types";
import { CheckCircle2, XCircle, ArrowRight, Lightbulb, Sparkles, Volume2, BookOpen, Headphones, Languages } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AudioPlayer from "./AudioPlayer";
import ConanMascot from "./ConanMascot";

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

          <ConanMascot
            size="sm"
            mood={!hasAnswered ? "thinking" : isCorrect ? "celebrate" : "sad"}
            animate={true}
          />
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
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 font-bold text-base sm:text-lg">
                  {isCorrect ? (
                    <>
                      <CheckCircle2 className="w-6 h-6 text-green-600" />
                      <span>¡Excelente! Respuesta correcta</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-6 h-6 text-red-600" />
                      <span>Respuesta incorrecta</span>
                    </>
                  )}
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
