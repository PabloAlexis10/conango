"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { matchingPairs, MatchingPair } from "@/lib/vocabularyData";
import ConanMascot from "@/components/ConanMascot";
import Header from "@/components/Header";
import { soundEffects } from "@/lib/soundEffects";
import {
  getCurrentUser,
  hasReachedGuestLimit,
  incrementGuestUsage,
  updateUserStreak,
  addExperience,
  recordLessonProgress,
  isAdmin,
} from "@/lib/supabase";
import GuestLimitWall from "@/components/GuestLimitWall";
import AuthModal from "@/components/AuthModal";
import RewardedVideoModal from "@/components/RewardedVideoModal";
import ProSubscriptionModal from "@/components/ProSubscriptionModal";
import {
  ArrowLeft,
  RotateCcw,
  Sparkles,
  Check,
  Volume2,
  Trophy,
  Zap,
  Heart,
  Video,
  Crown,
  BookOpen,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import confetti from "canvas-confetti";
import { UserProfile } from "@/lib/types";

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
const ROUND_TARGET = 10; // Finite game limit: 10 pairs to victory!

export default function VocabularyMatchingPage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [reservePool, setReservePool] = useState<MatchingPair[]>([]);
  const [leftCards, setLeftCards] = useState<ColumnCard[]>([]);
  const [rightCards, setRightCards] = useState<ColumnCard[]>([]);

  const [selectedLeft, setSelectedLeft] = useState<ColumnCard | null>(null);
  const [selectedRight, setSelectedRight] = useState<ColumnCard | null>(null);

  const [matchedUids, setMatchedUids] = useState<string[]>([]);
  const [wrongUids, setWrongUids] = useState<string[]>([]);

  const [totalMatched, setTotalMatched] = useState(0);
  const [streak, setStreak] = useState(0);
  const [lives, setLives] = useState(3);
  const [isFinished, setIsFinished] = useState(false);
  const [isGameOver, setIsGameOver] = useState(false);
  const [limitReached, setLimitReached] = useState(false);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [proModalOpen, setProModalOpen] = useState(false);

  const isUserPro = Boolean(user?.isPro || (user && isAdmin(user)));

  // Initialize game
  const initGame = () => {
    const shuffledBank = shuffle([...matchingPairs]);
    // Take 10 pairs total for this finite round
    const sessionBank = shuffledBank.slice(0, ROUND_TARGET);
    const initialActive = sessionBank.slice(0, VISIBLE_COUNT);
    const initialReserve = sessionBank.slice(VISIBLE_COUNT);

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
    setLives(isUserPro ? 9999 : 3);
    setIsFinished(false);
    setIsGameOver(false);
  };

  useEffect(() => {
    const cur = getCurrentUser();
    setUser(cur);
    if (hasReachedGuestLimit()) {
      setLimitReached(true);
    } else {
      initGame();
    }
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

      setMatchedUids([leftCard.uid, rightCard.uid]);
      const newMatched = totalMatched + 1;
      setTotalMatched(newMatched);
      setStreak((prev) => prev + 1);

      // Check if finished (reached ROUND_TARGET)
      if (newMatched >= ROUND_TARGET) {
        setTimeout(() => {
          setIsFinished(true);
          soundEffects.playLevelUp();
          try {
            confetti({
              particleCount: 100,
              spread: 70,
              origin: { y: 0.6 },
              colors: ["#F59E0B", "#10B981", "#6366F1"],
            });
          } catch {}
          updateUserStreak();
          addExperience(50);
          recordLessonProgress(50, 100);
          if (!getCurrentUser()) {
            incrementGuestUsage();
          }
        }, 400);
        return;
      }

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
            setRightCards((prev) => {
              const copy = [...prev];
              const randomPos = Math.floor(Math.random() * (copy.length + 1));
              copy.splice(randomPos, 0, newRight);
              return copy;
            });

            return remainingPool;
          }
          return [];
        });

        setSelectedLeft(null);
        setSelectedRight(null);
        setMatchedUids([]);
      }, 380);
    } else {
      // MISMATCH - deduct life!
      soundEffects.playIncorrect();
      setWrongUids([leftCard.uid, rightCard.uid]);
      setStreak(0);

      if (!isUserPro) {
        setLives((prev) => {
          const updated = Math.max(0, prev - 1);
          if (updated === 0) {
            setTimeout(() => {
              setIsGameOver(true);
            }, 600);
          }
          return updated;
        });
      }

      setTimeout(() => {
        setWrongUids([]);
        setSelectedLeft(null);
        setSelectedRight(null);
      }, 550);
    }
  };

  const handleLeftClick = (card: ColumnCard) => {
    if (isGameOver || isFinished) return;
    if (matchedUids.includes(card.uid)) return;
    setSelectedLeft(card);
    setWrongUids([]);

    if (selectedRight) {
      checkPair(card, selectedRight);
    }
  };

  const handleRightClick = (card: ColumnCard) => {
    if (isGameOver || isFinished) return;
    if (matchedUids.includes(card.uid)) return;
    setSelectedRight(card);
    setWrongUids([]);

    if (selectedLeft) {
      checkPair(selectedLeft, card);
    }
  };

  // Called after rewarded video ad completes
  const handleAdRewarded = () => {
    setLives(3);
    setIsGameOver(false);
    setRewardModalOpen(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-[#6B4423] dark:text-slate-100 transition-colors select-none">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-4 md:py-8 flex flex-col">
        {/* Navigation & Header */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#FAF6F0] dark:bg-slate-900 border border-[#E5D5C5] dark:border-slate-800 text-xs font-black text-[#6B4423] dark:text-slate-200 hover:bg-[#F5EFEB] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Base</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Lives Display */}
            <div className="flex items-center gap-1 px-3 py-1 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 rounded-full shadow-xs">
              <Heart className="w-4 h-4 fill-red-500 text-red-500" />
              <span className="text-xs font-black text-red-700 dark:text-red-300">
                {isUserPro ? "∞" : lives}
              </span>
            </div>

            {/* Streak */}
            {streak > 1 && (
              <div className="flex items-center gap-1 px-2.5 py-1 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 rounded-full text-xs font-black text-amber-700 dark:text-amber-300">
                <Zap className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>{streak}x Combo</span>
              </div>
            )}

            <button
              type="button"
              onClick={initGame}
              className="p-1.5 rounded-xl bg-[#FAF6F0] dark:bg-slate-900 border border-[#E5D5C5] dark:border-slate-800 text-[#6B4423] dark:text-slate-300 hover:bg-[#F5EFEB]"
              title="Reiniciar ronda"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar (0 to 10 pairs) */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs font-black mb-1.5 text-[#6B4423] dark:text-slate-300">
            <span>Objetivo Táctico: 10 Pares</span>
            <span className="text-indigo-600 dark:text-indigo-400 font-black">
              {totalMatched} / {ROUND_TARGET} completados
            </span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-indigo-500 to-amber-500 h-full rounded-full transition-all duration-300"
              style={{ width: `${(totalMatched / ROUND_TARGET) * 100}%` }}
            />
          </div>
        </div>

        {/* Game Area */}
        <div className="flex-1 flex flex-col justify-center">
          <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6">
            {/* Left Column (Spanish) */}
            <div className="space-y-3">
              <div className="text-center text-xs font-black uppercase tracking-wider text-[#A67B5B] dark:text-slate-400 mb-2">
                🇪🇸 Español
              </div>
              <AnimatePresence>
                {leftCards.map((card) => {
                  const isSelected = selectedLeft?.uid === card.uid;
                  const isMatched = matchedUids.includes(card.uid);
                  const isWrong = wrongUids.includes(card.uid);

                  return (
                    <motion.button
                      key={card.uid}
                      layout
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      type="button"
                      onClick={() => handleLeftClick(card)}
                      className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 font-bold text-xs sm:text-sm text-center shadow-xs transition-all flex items-center justify-center min-h-[58px] sm:min-h-[68px] ${
                        isMatched
                          ? "bg-emerald-500 text-white border-emerald-600 shadow-md scale-98"
                          : isWrong
                          ? "bg-red-500 text-white border-red-600 shadow-md animate-shake"
                          : isSelected
                          ? "bg-amber-100 dark:bg-amber-950/70 border-amber-500 text-amber-950 dark:text-amber-100 ring-2 ring-amber-400"
                          : "bg-white dark:bg-slate-900 border-[#E5D5C5] dark:border-slate-800 text-[#6B4423] dark:text-slate-100 hover:border-amber-400"
                      }`}
                    >
                      <span>{card.text}</span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>

            {/* Right Column (English) */}
            <div className="space-y-3">
              <div className="text-center text-xs font-black uppercase tracking-wider text-[#A67B5B] dark:text-slate-400 mb-2">
                🇺🇸 English
              </div>
              <AnimatePresence>
                {rightCards.map((card) => {
                  const isSelected = selectedRight?.uid === card.uid;
                  const isMatched = matchedUids.includes(card.uid);
                  const isWrong = wrongUids.includes(card.uid);

                  return (
                    <motion.button
                      key={card.uid}
                      layout
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.7, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      type="button"
                      onClick={() => handleRightClick(card)}
                      className={`w-full p-3.5 sm:p-4 rounded-2xl border-2 font-black text-xs sm:text-sm text-center shadow-xs transition-all flex items-center justify-center min-h-[58px] sm:min-h-[68px] ${
                        isMatched
                          ? "bg-emerald-500 text-white border-emerald-600 shadow-md scale-98"
                          : isWrong
                          ? "bg-red-500 text-white border-red-600 shadow-md animate-shake"
                          : isSelected
                          ? "bg-indigo-100 dark:bg-indigo-950/70 border-indigo-500 text-indigo-950 dark:text-indigo-100 ring-2 ring-indigo-400"
                          : "bg-white dark:bg-slate-900 border-[#E5D5C5] dark:border-slate-800 text-[#6B4423] dark:text-slate-100 hover:border-indigo-400"
                      }`}
                    >
                      <span>{card.text}</span>
                    </motion.button>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Small Companion Mascot Indicator */}
        <div className="flex items-center justify-between p-3.5 rounded-2xl bg-[#FAF6F0] dark:bg-slate-900 border border-[#E5D5C5] dark:border-slate-800">
          <div className="flex items-center gap-3">
            <ConanMascot size="sm" mood={isGameOver ? "sad" : isFinished ? "celebrate" : "happy"} animate={true} />
            <span className="text-xs font-bold text-[#6B4423] dark:text-slate-300">
              {isGameOver
                ? "¡Cuidado piloto! Nos quedamos sin vidas tácticas."
                : isFinished
                ? "¡Excelente trabajo! Has completado los 10 pares."
                : "Empareja cada palabra con su traducción correcta."}
            </span>
          </div>

          <Link
            href="/vocabulary"
            className="text-xs font-black text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Ver Biblioteca</span>
          </Link>
        </div>
      </main>

      {/* 🏆 FINITE VICTORY SCREEN MODAL */}
      {isFinished && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-emerald-500 p-6 sm:p-8 max-w-md w-full text-center shadow-2xl"
          >
            <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
              🏆
            </div>
            <h2 className="text-2xl font-black text-[#6B4423] dark:text-white mb-2">
              ¡Misión Cumplida!
            </h2>
            <p className="text-xs sm:text-sm text-[#A67B5B] dark:text-slate-300 mb-6">
              Has completado con éxito la ronda táctica de <strong>10 pares de vocabulario</strong>.
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800">
                <span className="text-[10px] font-black uppercase text-amber-800 dark:text-amber-300 block">Experiencia</span>
                <span className="text-lg font-black text-amber-900 dark:text-amber-100">+50 XP ⚡</span>
              </div>
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
                <span className="text-[10px] font-black uppercase text-emerald-800 dark:text-emerald-300 block">Precisión</span>
                <span className="text-lg font-black text-emerald-900 dark:text-emerald-100">100% 🎯</span>
              </div>
            </div>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={initGame}
                className="w-full py-3 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black rounded-xl shadow-conan-btn transition-transform active:scale-95 text-xs sm:text-sm"
              >
                🎮 Jugar Siguiente Ronda (10 Pares)
              </button>

              <Link
                href="/vocabulary"
                className="w-full py-2.5 bg-[#FAF6F0] dark:bg-slate-800 text-[#6B4423] dark:text-slate-200 font-bold rounded-xl border border-[#E5D5C5] dark:border-slate-700 flex items-center justify-center gap-2 text-xs hover:bg-[#F5EFEB]"
              >
                <BookOpen className="w-4 h-4 text-amber-500" />
                <span>Explorar Biblioteca de Vocabulario</span>
              </Link>

              <Link
                href="/"
                className="block text-xs text-[#A67B5B] dark:text-slate-400 font-bold pt-1 hover:underline"
              >
                Volver a la Base de Entrenamiento
              </Link>
            </div>
          </motion.div>
        </div>
      )}

      {/* 💀 GAME OVER MODAL (OUT OF LIVES) */}
      {isGameOver && !isFinished && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-slate-900 rounded-3xl border-2 border-red-500 p-6 sm:p-8 max-w-md w-full text-center shadow-2xl"
          >
            <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center text-3xl mx-auto mb-4 shadow-sm">
              💔
            </div>
            <h2 className="text-2xl font-black text-[#6B4423] dark:text-white mb-2">
              ¡Sin Vidas Tácticas!
            </h2>
            <p className="text-xs sm:text-sm text-[#A67B5B] dark:text-slate-300 mb-6">
              Has agotado tus vidas al cometer errores en los pares. ¡Mira un video breve para recuperar tus 3 vidas y continuar la ronda exactamente donde quedaste!
            </p>

            <div className="space-y-3">
              {/* Button: Watch Video to continue */}
              <button
                type="button"
                onClick={() => setRewardModalOpen(true)}
                className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black rounded-xl shadow-lg flex items-center justify-center gap-2 text-sm transition-transform active:scale-95"
              >
                <Video className="w-4 h-4 text-white" />
                <span>Ver Video & Revivir Gratis (+3 Vidas)</span>
              </button>

              {/* Button: Conan PRO infinite lives */}
              <button
                type="button"
                onClick={() => setProModalOpen(true)}
                className="w-full py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 text-white font-black rounded-xl shadow-md flex items-center justify-center gap-2 text-xs transition-transform active:scale-95"
              >
                <Crown className="w-4 h-4" />
                <span>Desbloquear Vidas Infinitas con Conan PRO</span>
              </button>

              {/* Restart or Quit */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={initGame}
                  className="flex-1 py-2 bg-[#FAF6F0] dark:bg-slate-800 text-[#6B4423] dark:text-slate-300 font-bold rounded-xl text-xs border border-[#E5D5C5] dark:border-slate-700 hover:bg-[#F5EFEB]"
                >
                  Reiniciar Ronda
                </button>
                <Link
                  href="/"
                  className="flex-1 py-2 bg-[#FAF6F0] dark:bg-slate-800 text-[#6B4423] dark:text-slate-300 font-bold rounded-xl text-xs border border-[#E5D5C5] dark:border-slate-700 hover:bg-[#F5EFEB] text-center"
                >
                  Salir a Base
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      )}

      {/* Rewarded Video Modal */}
      <RewardedVideoModal
        isOpen={rewardModalOpen}
        onClose={() => setRewardModalOpen(false)}
        onRewarded={handleAdRewarded}
      />

      {/* Pro Modal */}
      <ProSubscriptionModal
        isOpen={proModalOpen}
        onClose={() => setProModalOpen(false)}
      />

      {/* Guest Wall */}
      {limitReached && (
        <GuestLimitWall onOpenAuth={() => setAuthModalOpen(true)} />
      )}

      {/* Auth Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
}
