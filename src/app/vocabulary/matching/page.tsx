"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { matchingPairs, MatchingPair } from "@/lib/vocabularyData";
import ConanMascot from "@/components/ConanMascot";
import Header from "@/components/Header";
import { soundEffects } from "@/lib/soundEffects";
import { ArrowLeft, RotateCcw, Sparkles, Check, Volume2, Trophy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface CardItem {
  uid: string; // unique ID for card
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

export default function VocabularyMatchingPage() {
  const [round, setRound] = useState(1);
  const [cards, setCards] = useState<CardItem[]>([]);
  const [selectedCard, setSelectedCard] = useState<CardItem | null>(null);
  const [matchedPairIds, setMatchedPairIds] = useState<number[]>([]);
  const [wrongPairUids, setWrongPairUids] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [isRoundFinished, setIsRoundFinished] = useState(false);

  // Setup round with 6 pairs
  const startRound = (roundNum: number) => {
    const startIndex = ((roundNum - 1) * 6) % matchingPairs.length;
    let chosen: MatchingPair[] = [];
    for (let i = 0; i < 6; i++) {
      chosen.push(matchingPairs[(startIndex + i) % matchingPairs.length]);
    }

    const cardItems: CardItem[] = [];
    chosen.forEach((pair) => {
      cardItems.push({
        uid: `${pair.id}_es`,
        pairId: pair.id,
        text: pair.spanish,
        lang: "es",
      });
      cardItems.push({
        uid: `${pair.id}_en`,
        pairId: pair.id,
        text: pair.english,
        lang: "en",
      });
    });

    setCards(shuffle(cardItems));
    setSelectedCard(null);
    setMatchedPairIds([]);
    setWrongPairUids([]);
    setMoves(0);
    setIsRoundFinished(false);
  };

  useEffect(() => {
    startRound(round);
  }, [round]);

  const handleCardClick = (card: CardItem) => {
    if (matchedPairIds.includes(card.pairId)) return;
    if (selectedCard && selectedCard.uid === card.uid) return;

    if (!selectedCard) {
      setSelectedCard(card);
      setWrongPairUids([]);
      return;
    }

    // A second card was selected
    setMoves((prev) => prev + 1);

    if (selectedCard.pairId === card.pairId && selectedCard.lang !== card.lang) {
      // MATCH!
      soundEffects.playCorrect();
      const newMatched = [...matchedPairIds, card.pairId];
      setMatchedPairIds(newMatched);
      setSelectedCard(null);
      setWrongPairUids([]);

      // If word in English, speak it
      const enWord = card.lang === "en" ? card.text : selectedCard.text;
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const u = new SpeechSynthesisUtterance(enWord);
        u.lang = "en-US";
        u.rate = 0.95;
        window.speechSynthesis.speak(u);
      }

      // Check if all pairs matched
      if (newMatched.length === 6) {
        setTimeout(() => {
          setIsRoundFinished(true);
          soundEffects.playLevelUp();
        }, 500);
      }
    } else {
      // MISMATCH!
      soundEffects.playIncorrect();
      setWrongPairUids([selectedCard.uid, card.uid]);
      setTimeout(() => {
        setSelectedCard(null);
        setWrongPairUids([]);
      }, 700);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col font-sans text-[#6B4423]">
      <Header sessionTitle="Emparejamiento de Cartas" />

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {/* Top Header */}
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
              Ronda {round} • Movimientos: {moves}
            </span>
          </div>
        </div>

        {!isRoundFinished ? (
          <div className="bg-white rounded-3xl border-2 border-[#A67B5B] shadow-conan-card p-6 sm:p-8">
            {/* Title & Instructions */}
            <div className="flex items-center justify-between border-b border-[#E5D5C5] pb-4 mb-6">
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-[#6B4423] tracking-tight">
                  Empareja las Cartas
                </h2>
                <p className="text-xs sm:text-sm text-[#A67B5B] font-semibold mt-0.5">
                  Toca una carta en español y su pareja en inglés (ejemplo: <em>Rojo ↔ Red</em>).
                </p>
              </div>

              <ConanMascot
                size="sm"
                mood={matchedPairIds.length > 0 ? "happy" : "thinking"}
                animate={true}
              />
            </div>

            {/* Grid of 12 Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
              {cards.map((card) => {
                const isMatched = matchedPairIds.includes(card.pairId);
                const isSelected = selectedCard?.uid === card.uid;
                const isWrong = wrongPairUids.includes(card.uid);

                let cardStyle = "border-[#E5D5C5] bg-white text-[#6B4423] hover:border-[#A67B5B] hover:bg-[#FAF6F0] shadow-sm";

                if (isMatched) {
                  cardStyle = "border-green-500 bg-green-50 text-green-800 opacity-80 cursor-default shadow-none";
                } else if (isWrong) {
                  cardStyle = "border-red-500 bg-red-50 text-red-800 animate-shake shadow-md";
                } else if (isSelected) {
                  cardStyle = "border-[#F59E0B] bg-[#FFFBEB] text-[#92400E] shadow-md scale-102 ring-2 ring-[#F59E0B]";
                }

                return (
                  <motion.button
                    key={card.uid}
                    type="button"
                    whileTap={!isMatched ? { scale: 0.96 } : {}}
                    onClick={() => handleCardClick(card)}
                    disabled={isMatched}
                    className={`h-24 sm:h-28 rounded-2xl border-2 p-3 text-center flex flex-col items-center justify-center transition-all font-extrabold relative select-none ${cardStyle}`}
                  >
                    {/* Language Badge */}
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#A67B5B] mb-1">
                      {card.lang === "es" ? "🇪🇸 Español" : "🇺🇸 English"}
                    </span>

                    {/* Word text */}
                    <span className="text-sm sm:text-base leading-snug">
                      {card.text}
                    </span>

                    {/* Matched check icon */}
                    {isMatched && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 text-white flex items-center justify-center">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </div>
                    )}
                  </motion.button>
                );
              })}
            </div>

            {/* Progress Bar */}
            <div className="flex items-center justify-between text-xs font-bold text-[#A67B5B] pt-2 border-t border-[#E5D5C5]">
              <span>Parejas completadas: {matchedPairIds.length} de 6</span>
              <div className="w-32 bg-[#FAF6F0] h-2.5 rounded-full overflow-hidden border border-[#E5D5C5]">
                <div
                  className="bg-green-500 h-full transition-all duration-300 rounded-full"
                  style={{ width: `${(matchedPairIds.length / 6) * 100}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border-2 border-[#A67B5B] shadow-conan-card p-8 text-center">
            <ConanMascot size="hero" mood="celebrate" animate={true} />
            <h2 className="text-3xl font-black text-[#6B4423] mt-4 mb-2">
              ¡Ronda {round} Superada con Éxito!
            </h2>
            <p className="text-sm text-[#A67B5B] font-medium mb-6">
              ¡Completaste las 6 parejas de vocabulario en {moves} movimientos!
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => setRound((prev) => prev + 1)}
                className="w-full sm:w-auto px-6 py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black rounded-2xl shadow-conan-btn flex items-center justify-center gap-2 text-sm transition-transform active:scale-98"
              >
                <Sparkles className="w-4 h-4" />
                <span>Siguiente Ronda (Nuevas Palabras)</span>
              </button>

              <button
                type="button"
                onClick={() => startRound(round)}
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-[#FAF6F0] text-[#6B4423] border-2 border-[#E5D5C5] font-black rounded-2xl flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Repetir Ronda {round}</span>
              </button>

              <Link
                href="/vocabulary/definitions"
                className="w-full sm:w-auto px-6 py-3.5 bg-white hover:bg-[#FAF6F0] text-[#6B4423] border-2 border-[#E5D5C5] font-black rounded-2xl flex items-center justify-center gap-2 text-sm shadow-sm"
              >
                <span>Ir a Definiciones en Inglés</span>
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
