"use client";

import React, { useState } from "react";
import Link from "next/link";
import { definitionCards } from "@/lib/vocabularyData";
import ConanMascot from "@/components/ConanMascot";
import Header from "@/components/Header";
import { soundEffects } from "@/lib/soundEffects";
import { ArrowLeft, CheckCircle2, XCircle, ArrowRight, RotateCcw, Sparkles, BookOpen, Volume2, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function VocabularyDefinitionsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [hasAnswered, setHasAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const currentCard = definitionCards[currentIndex];

  const handleSpeakWord = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentCard.word);
    utterance.lang = "en-US";
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  const handleSelect = (idx: number) => {
    if (hasAnswered) return;
    setSelectedOption(idx);
    setHasAnswered(true);

    const isCorrect = currentCard.options[idx] === currentCard.correctDefinition;
    if (isCorrect) {
      soundEffects.playCorrect();
      setScore((prev) => prev + 1);
    } else {
      soundEffects.playIncorrect();
    }
  };

  const handleNext = () => {
    if (currentIndex + 1 < definitionCards.length) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setHasAnswered(false);
    } else {
      setIsCompleted(true);
      soundEffects.playLevelUp();
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setHasAnswered(false);
    setScore(0);
    setIsCompleted(false);
  };

  const isCurrentCorrect = selectedOption !== null && currentCard.options[selectedOption] === currentCard.correctDefinition;

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col font-sans text-[#6B4423]">
      <Header sessionTitle="Vocabulario en Inglés" />

      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {/* Top Navigation */}
        <div className="flex items-center justify-between mb-4">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-[#A67B5B] hover:text-[#6B4423] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black px-3 py-1 bg-white rounded-full border border-[#E5D5C5] shadow-xs text-[#F59E0B]">
              Aciertos: {score} / {definitionCards.length}
            </span>
          </div>
        </div>

        {!isCompleted ? (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentCard.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="bg-white rounded-3xl border-2 border-[#A67B5B] shadow-conan-card p-6 sm:p-8"
            >
              {/* Card Header */}
              <div className="flex items-center justify-between border-b border-[#E5D5C5] pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#FEF3C7] text-[#92400E] flex items-center justify-center font-black text-xs">
                    #{currentIndex + 1}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#A67B5B] uppercase tracking-wider">
                      Tarjeta {currentIndex + 1} de {definitionCards.length}
                    </span>
                  </div>
                </div>

                <ConanMascot
                  size="sm"
                  mood={!hasAnswered ? "thinking" : isCurrentCorrect ? "celebrate" : "sad"}
                  animate={true}
                />
              </div>

              {/* Target Word Display */}
              <div className="text-center mb-8 bg-[#FAF6F0] p-6 rounded-2xl border-2 border-[#E5D5C5] relative">
                <button
                  type="button"
                  onClick={handleSpeakWord}
                  className="absolute top-3 right-3 p-2 bg-white rounded-xl border border-[#E5D5C5] text-[#F59E0B] hover:bg-[#FEF3C7] transition-colors shadow-xs"
                  title="Escuchar pronunciación (Inglés US)"
                >
                  <Volume2 className="w-4 h-4" />
                </button>

                <span className="text-xs font-black uppercase tracking-widest text-[#A67B5B] block mb-1">
                  Target Word (American English 🇺🇸)
                </span>
                <h2 className="text-3xl sm:text-4xl font-black text-[#6B4423] tracking-tight mb-1">
                  {currentCard.word}
                </h2>
                <div className="flex items-center justify-center gap-3 text-xs text-[#A67B5B] font-semibold">
                  <span>{currentCard.phonetic}</span>
                  <span>•</span>
                  <span>{currentCard.partOfSpeech}</span>
                </div>
              </div>

              {/* Instruction */}
              <p className="text-xs sm:text-sm font-extrabold text-[#6B4423] uppercase tracking-wider mb-3">
                Selecciona la definición correcta en inglés:
              </p>

              {/* Options */}
              <div className="space-y-3 mb-6">
                {currentCard.options.map((option, idx) => {
                  const isSelected = selectedOption === idx;
                  const isCorrectOpt = option === currentCard.correctDefinition;

                  let btnStyle = "border-[#E5D5C5] bg-white hover:border-[#A67B5B] hover:bg-[#FAF6F0] text-[#6B4423]";
                  if (hasAnswered) {
                    if (isCorrectOpt) {
                      btnStyle = "border-green-500 bg-green-50 text-green-800 shadow-[0_3px_0_0_#22C55E]";
                    } else if (isSelected) {
                      btnStyle = "border-red-500 bg-red-50 text-red-800 shadow-[0_3px_0_0_#EF4444]";
                    } else {
                      btnStyle = "border-[#E5D5C5] opacity-50 bg-gray-50 text-[#A67B5B]";
                    }
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={hasAnswered}
                      onClick={() => handleSelect(idx)}
                      className={`w-full p-4 rounded-2xl border-2 text-left font-bold text-sm sm:text-base transition-all flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {hasAnswered && isCorrectOpt && (
                        <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 ml-2" />
                      )}
                      {hasAnswered && isSelected && !isCorrectOpt && (
                        <XCircle className="w-5 h-5 text-red-600 shrink-0 ml-2" />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback and Next Action */}
              {hasAnswered && (
                <div className="pt-4 border-t border-[#E5D5C5] space-y-4">
                  <div className="p-3 bg-[#FAF6F0] rounded-xl border border-[#E5D5C5] text-xs">
                    <span className="font-black text-[#6B4423] block mb-0.5">Ejemplo de uso:</span>
                    <p className="italic text-[#4A3319]">&ldquo;{currentCard.example}&rdquo;</p>
                  </div>

                  <button
                    type="button"
                    onClick={handleNext}
                    className="w-full py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black rounded-2xl shadow-conan-btn flex items-center justify-center gap-2 text-base transition-transform active:scale-98"
                  >
                    <span>{currentIndex + 1 < definitionCards.length ? "Siguiente Tarjeta" : "Ver Resultados"}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-[#A67B5B] shadow-conan-card p-8 text-center">
            <ConanMascot size="hero" mood="celebrate" animate={true} />
            <h2 className="text-3xl font-black text-[#6B4423] mt-4 mb-2">
              ¡Sesión de Vocabulario Completada!
            </h2>
            <p className="text-sm text-[#A67B5B] font-medium mb-6">
              Has practicado las {definitionCards.length} tarjetas de vocabulario táctico.
            </p>

            <div className="max-w-xs mx-auto p-4 bg-[#FAF6F0] rounded-2xl border border-[#E5D5C5] mb-6">
              <span className="text-xs font-bold text-[#A67B5B] uppercase tracking-wider block mb-1">
                Puntuación Final
              </span>
              <span className="text-3xl font-black text-[#F59E0B]">
                {score} / {definitionCards.length}
              </span>
              <span className="text-xs font-bold text-[#6B4423] block mt-1">
                ({Math.round((score / definitionCards.length) * 100)}% de precisión)
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleRestart}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black rounded-2xl shadow-conan-btn flex items-center justify-center gap-2 text-sm transition-transform active:scale-98"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Practicar de Nuevo</span>
              </button>

              <Link
                href="/vocabulary/matching"
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-[#FAF6F0] text-[#6B4423] border-2 border-[#E5D5C5] font-black rounded-2xl flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                <Sparkles className="w-4 h-4 text-[#F59E0B]" />
                <span>Jugar Cartas de Emparejar</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
