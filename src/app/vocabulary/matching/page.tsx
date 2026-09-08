"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { matchingPairs, MatchingPair } from "@/lib/vocabularyData";
import ConanMascot from "@/components/ConanMascot";
import Header from "@/components/Header";
import { soundEffects } from "@/lib/soundEffects";
import { ArrowLeft, RotateCcw, Sparkles, Check, Volume2, Trophy, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface ColumnCard {
  uid: string;
  pairId: number;
  text: string;
  lang: "es" | "en";
}

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const VISIBLE_COUNT = 5;

export default function VocabularyMatchingPage() {
  const [reservePool, setReservePool] = useState<MatchingPair[]>([]);
  const [leftCards, setLeftCards] = useState<ColumnCard[]>([]);
  const [rightCards, setRightCards] = useState<ColumnCard[]>([]);

  const [selectedLeft, setSelectedLeft] = useState<ColumnCard | null>(null);
  const [selectedRight, setSelectedRight] = useState<ColumnCard | null>(null);

  const [matchedUids, setMatchedUids] = useState<string[]>([]);
  const [wrongUids, setWrongUids] = useState<string[]>([]);

  const [totalMatched, setTotalMatched] = useState(0);
  const [streak, setStreak] = useState(0);
  const [isFinished, setIsFinished] = useState(false);

  // Initialize game
  const initGame = () => {
    const shuffledBank = shuffle([...matchingPairs]);
    const initialActive = shuffledBank.slice(0, VISIBLE_COUNT);
    const initialReserve = shuffledBank.slice(VISIBLE_COUNT);

    const left: ColumnCard[] = initialActive.map((p) => ({
      uid: `${p.id}_es_${Math.random()}`,
      pairId: p.id,
      text: p.spanish,
      lang: "es",
    }));

    const right: ColumnCard[] = shuffle(
      initialActive.map((p) => ({
        uid: `${p.id}_en_${Math.random()}`,
        pairId: p.id,
        text: p.english,
        lang: "en",
      }))
    );

    setLeftCards(left);
    setRightCards(right);
    setReservePool(initialReserve);
    setSelectedLeft(null);
    setSelectedRight(null);
    setMatchedUids([]);
    setWrongUids([]);
    setTotalMatched(0);
    setStreak(0);
    setIsFinished(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  const speakEnglishWord = (word: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(word);
    u.lang = "en-US";
    u.rate = 0.95;
    window.speechSynthesis.speak(u);
  };

  // Evaluate pair when both left and right are selected
  const checkPair = (leftCard: ColumnCard, rightCard: ColumnCard) => {
    if (leftCard.pairId === rightCard.pairId) {
      // MATCH!
      soundEffects.playCorrect();
      speakEnglishWord(rightCard.text);

      const matchedPairId = leftCard.pairId;
      setMatchedUids([leftCard.uid, rightCard.uid]);
      setTotalMatched((prev) => prev + 1);
      setStreak((prev) => prev + 1);

      setTimeout(() => {
        // Remove matched pair from columns
        setLeftCards((prev) => prev.filter((c) => c.uid !== leftCard.uid));
        setRightCards((prev) => prev.filter((c) => c.uid !== rightCard.uid));

        // Pull next pair from reserve pool
        setReservePool((prevPool) => {
          if (prevPool.length > 0) {
            const nextPair = prevPool[0];
            const remainingPool = prevPool.slice(1);

            const newLeft: ColumnCard = {
              uid: `${nextPair.id}_es_${Math.random()}`,
              pairId: nextPair.id,
              text: nextPair.spanish,
              lang: "es",
            };

            const newRight: ColumnCard = {
              uid: `${nextPair.id}_en_${Math.random()}`,
              pairId: nextPair.id,
              text: nextPair.english,
              lang: "en",
            };

            setLeftCards((prev) => [...prev, newLeft]);
            // Insert new right card at random position so it's shuffled
            setRightCards((prev) => {
              const copy = [...prev];
              const randomPos = Math.floor(Math.random() * (copy.length + 1));
              copy.splice(randomPos, 0, newRight);
              return copy;
            });

            return remainingPool;
          } else {
            // Check if board is cleared
            setLeftCards((prev) => {
              if (prev.length <= 1) {
                setIsFinished(true);
                soundEffects.playLevelUp();
              }
              return prev;
            });
            return [];
          }
        });

        setSelectedLeft(null);
        setSelectedRight(null);
        setMatchedUids([]);
      }, 380);
    } else {
      // MISMATCH
      soundEffects.playIncorrect();
      setWrongUids([leftCard.uid, rightCard.uid]);
      setStreak(0);

      setTimeout(() => {
        setWrongUids([]);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 550);
    }
  };

  const handleLeftClick = (card: ColumnCard) => {
    if (matchedUids.includes(card.uid)) return;
    setSelectedLeft(card);
    setWrongUids([]);

    if (selectedRight) {
      checkPair(card, selectedRight);
    }
  };

  const handleRightClick = (card: ColumnCard) => {
    if (matchedUids.includes(card.uid)) return;
    setSelectedRight(card);
    setWrongUids([]);

    if (selectedLeft) {
      checkPair(selectedLeft, card);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col font-sans text-[#6B4423]">
      <Header sessionTitle="Vocabulario en Dos Columnas" />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-[#A67B5B] hover:text-[#6B4423] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-[#E5D5C5] shadow-xs text-xs font-black text-amber-800">
              <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Racha: {streak}</span>
            </div>

            <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-full border border-[#E5D5C5] shadow-xs text-xs font-black text-emerald-800">
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Pares: {totalMatched}</span>
            </div>

            <button
              type="button"
              onClick={initGame}
              className="p-2 text-[#A67B5B] hover:text-[#6B4423] hover:bg-white rounded-xl border border-[#E5D5C5] transition-colors"
              title="Reiniciar con nuevas cartas"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mascot & Instruction */}
        <div className="flex items-center justify-between bg-white p-4 sm:p-5 rounded-3xl border-2 border-[#E5D5C5] shadow-sm mb-6">
          <div className="flex items-center gap-3.5">
            <ConanMascot
              size="sm"
              mood={isFinished ? "celebrate" : streak > 2 ? "celebrate" : "thinking"}
            />
            <div>
              <h2 className="text-base sm:text-lg font-black text-[#6B4423]">
                Emparejamiento por Columnas
              </h2>
              <p className="text-xs sm:text-sm text-[#A67B5B] font-medium">
                Toca una palabra en <strong className="text-[#6B4423]">Español</strong> (izquierda) y su pareja en <strong className="text-[#6B4423]">Inglés</strong> (derecha). ¡Al acertar se eliminan y aparecen más!
              </p>
            </div>
          </div>
        </div>

        {!isFinished ? (
          /* TWO-COLUMN BOARD (ALWAYS SIDE-BY-SIDE) */
          <div className="grid grid-cols-2 gap-2.5 sm:gap-6">
            {/* LEFT COLUMN: SPANISH */}
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between px-1.5 pb-1 border-b border-[#E5D5C5]">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-[#A67B5B] flex items-center gap-1">
                  <span>Español</span>
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-[#A67B5B]">
                  {leftCards.length}
                </span>
              </div>

              <div className="space-y-2 sm:space-y-2.5 min-h-[300px]">
                <AnimatePresence>
                  {leftCards.map((card) => {
                    const isSelected = selectedLeft?.uid === card.uid;
                    const isMatched = matchedUids.includes(card.uid);
                    const isWrong = wrongUids.includes(card.uid);

                    let cardClass = "bg-white border-[#E5D5C5] text-[#6B4423] hover:border-[#F59E0B]";
                    if (isSelected) {
                      cardClass = "bg-amber-50 border-[#F59E0B] text-[#92400E] shadow-[0_3px_0_0_#D97706] scale-[1.02]";
                    }
                    if (isMatched) {
                      cardClass = "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-[0_3px_0_0_#10B981]";
                    }
                    if (isWrong) {
                      cardClass = "bg-red-50 border-red-500 text-red-800 shadow-[0_3px_0_0_#EF4444] animate-shake";
                    }

                    return (
                      <motion.button
                        key={card.uid}
                        layout
                        initial={{ opacity: 0, x: -15, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, x: -20 }}
                        transition={{ duration: 0.22 }}
                        type="button"
                        onClick={() => handleLeftClick(card)}
                        className={`w-full p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 font-bold text-xs sm:text-base text-left flex items-center justify-between transition-all select-none shadow-xs ${cardClass}`}
                      >
                        <span className="font-black leading-tight">{card.text}</span>
                        {isSelected && <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping" />}
                        {isMatched && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />}
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>

            {/* RIGHT COLUMN: ENGLISH */}
            <div className="space-y-2.5 sm:space-y-3">
              <div className="flex items-center justify-between px-1.5 pb-1 border-b border-[#E5D5C5]">
                <span className="text-xs sm:text-sm font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1">
                  <span>Inglés</span>
                  <span>🇺🇸</span>
                </span>
                <span className="text-[10px] sm:text-xs font-bold text-[#A67B5B]">
                  {rightCards.length}
                </span>
              </div>

              <div className="space-y-2 sm:space-y-2.5 min-h-[300px]">
                <AnimatePresence>
                  {rightCards.map((card) => {
                    const isSelected = selectedRight?.uid === card.uid;
                    const isMatched = matchedUids.includes(card.uid);
                    const isWrong = wrongUids.includes(card.uid);

                    let cardClass = "bg-white border-[#E5D5C5] text-[#4338CA] hover:border-indigo-500";
                    if (isSelected) {
                      cardClass = "bg-indigo-50 border-indigo-600 text-indigo-900 shadow-[0_3px_0_0_#4F46E5] scale-[1.02]";
                    }
                    if (isMatched) {
                      cardClass = "bg-emerald-50 border-emerald-500 text-emerald-800 shadow-[0_3px_0_0_#10B981]";
                    }
                    if (isWrong) {
                      cardClass = "bg-red-50 border-red-500 text-red-800 shadow-[0_3px_0_0_#EF4444] animate-shake";
                    }

                    return (
                      <motion.button
                        key={card.uid}
                        layout
                        initial={{ opacity: 0, x: 15, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8, x: 20 }}
                        transition={{ duration: 0.22 }}
                        type="button"
                        onClick={() => handleRightClick(card)}
                        className={`w-full p-2.5 sm:p-4 rounded-xl sm:rounded-2xl border-2 font-bold text-xs sm:text-base text-left flex items-center justify-between transition-all select-none shadow-xs ${cardClass}`}
                      >
                        <span className="font-black leading-tight">{card.text}</span>
                        <div className="flex items-center gap-1.5">
                          {isSelected && <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping" />}
                          {isMatched && <Check className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600" />}
                        </div>
                      </motion.button>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
          </div>
        ) : (
          /* VICTORY SCREEN */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border-2 border-[#A67B5B] shadow-conan-card p-8 text-center max-w-md mx-auto"
          >
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-[#F59E0B] flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-[#6B4423] mb-2">
              ¡Misión Cumplida!
            </h2>

            <p className="text-sm text-[#A67B5B] font-medium mb-6">
              ¡Completaste todos los pares de vocabulario disponibles en el banco con excelente precisión táctica!
            </p>

            <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#E5D5C5] mb-6 flex justify-around">
              <div>
                <span className="text-xs text-[#A67B5B] font-bold block">Pares logrados</span>
                <span className="text-2xl font-black text-[#6B4423]">{totalMatched}</span>
              </div>
              <div>
                <span className="text-xs text-[#A67B5B] font-bold block">Mejor racha</span>
                <span className="text-2xl font-black text-[#F59E0B]">{streak}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={initGame}
              className="w-full py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black rounded-2xl shadow-conan-btn flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Jugar otra ronda</span>
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
