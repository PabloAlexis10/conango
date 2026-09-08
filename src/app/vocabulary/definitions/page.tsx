"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { definitionCards, DefinitionCard } from "@/lib/vocabularyData";
import ConanMascot from "@/components/ConanMascot";
import Header from "@/components/Header";
import { soundEffects } from "@/lib/soundEffects";
import {
  ArrowLeft,
  Mic,
  MicOff,
  Volume2,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  ArrowRight,
  Trophy,
  Sparkles,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper: Levenshtein distance for fuzzy pronunciation similarity
function levenshteinDistance(s1: string, s2: string): number {
  const m = s1.length;
  const n = s2.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;
      dp[i][j] = Math.min(
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
        dp[i - 1][j - 1] + cost
      );
    }
  }
  return dp[m][n];
}

function cleanText(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-zA-Z0-9 ]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function calculateSimilarity(heard: string, target: string): number {
  const h = cleanText(heard);
  const t = cleanText(target);

  if (h === t) return 1.0;
  if (h.includes(t) || t.includes(h)) return 0.92;

  const maxLen = Math.max(h.length, t.length);
  if (maxLen === 0) return 1.0;

  const dist = levenshteinDistance(h, t);
  return Math.max(0, 1 - dist / maxLen);
}

export default function VocabularyPronunciationPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState<string>("");
  const [similarityScore, setSimilarityScore] = useState<number | null>(null);
  const [status, setStatus] = useState<"idle" | "listening" | "success" | "retry">("idle");
  const [speechSupported, setSpeechSupported] = useState(true);
  const [score, setScore] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  const recognitionRef = useRef<any>(null);
  const advanceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const currentCard: DefinitionCard = definitionCards[currentIndex];

  // Initialize Web Speech Recognition
  useEffect(() => {
    if (typeof window === "undefined") return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 5;

    recognition.onstart = () => {
      setIsListening(true);
      setStatus("listening");
      setTranscript("");
      setSimilarityScore(null);
    };

    recognition.onresult = (event: any) => {
      setIsListening(false);
      const targetWord = currentCard.word;

      // Extract all alternatives
      const alternatives: string[] = [];
      for (let i = 0; i < event.results[0].length; i++) {
        alternatives.push(event.results[0][i].transcript);
      }

      // Calculate best similarity across alternatives
      let bestSim = 0;
      let bestTranscript = alternatives[0] || "";

      for (const alt of alternatives) {
        const sim = calculateSimilarity(alt, targetWord);
        if (sim > bestSim) {
          bestSim = sim;
          bestTranscript = alt;
        }
      }

      setTranscript(bestTranscript);
      setSimilarityScore(Math.round(bestSim * 100));

      // Margen de error mínimo: 78% de similitud
      if (bestSim >= 0.78) {
        setStatus("success");
        soundEffects.playCorrect();
        setScore((prev) => prev + 1);

        // Auto-advance after 1.8 seconds
        advanceTimerRef.current = setTimeout(() => {
          handleNextWord();
        }, 1800);
      } else {
        setStatus("retry");
        soundEffects.playIncorrect();

        // Automatically speak the correct pronunciation for corrective reinforcement
        setTimeout(() => {
          speakWord(targetWord);
        }, 600);
      }
    };

    recognition.onerror = (event: any) => {
      setIsListening(false);
      if (status === "listening") {
        setStatus("idle");
      }
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {}
      }
      if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    };
  }, [currentIndex, currentCard]);

  const startListening = () => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    if (!recognitionRef.current) return;

    try {
      recognitionRef.current.start();
    } catch (e) {
      // If already started, restart
      recognitionRef.current.stop();
      setTimeout(() => {
        try {
          recognitionRef.current.start();
        } catch {}
      }, 150);
    }
  };

  const stopListening = () => {
    if (!recognitionRef.current) return;
    try {
      recognitionRef.current.stop();
    } catch {}
  };

  const speakWord = (wordToSpeak: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(wordToSpeak);
    u.lang = "en-US";
    u.rate = 0.88; // Clear cadence for listening and learning
    u.pitch = 1.0;

    // Pick natural voice if possible
    const voices = window.speechSynthesis.getVoices();
    const usVoice = voices.find(
      (v) => (v.lang === "en-US" || v.lang === "en_US") && (v.name.includes("Natural") || v.name.includes("Google"))
    );
    if (usVoice) u.voice = usVoice;

    window.speechSynthesis.speak(u);
  };

  const handleNextWord = () => {
    if (advanceTimerRef.current) clearTimeout(advanceTimerRef.current);
    setStatus("idle");
    setTranscript("");
    setSimilarityScore(null);

    if (currentIndex + 1 < definitionCards.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsCompleted(true);
      soundEffects.playLevelUp();
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setScore(0);
    setStatus("idle");
    setTranscript("");
    setSimilarityScore(null);
    setIsCompleted(false);
  };

  return (
    <div className="min-h-screen bg-[#FAF6F0] flex flex-col font-sans text-[#6B4423]">
      <Header sessionTitle="Reto de Pronunciación" />

      <main className="flex-1 max-w-2xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-xs font-bold text-[#A67B5B] hover:text-[#6B4423] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className="text-xs font-black px-3.5 py-1 bg-white rounded-full border border-[#E5D5C5] shadow-xs text-[#F59E0B] flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Aciertos: {score} / {definitionCards.length}</span>
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
              transition={{ duration: 0.25 }}
              className="bg-white rounded-3xl border-2 border-[#A67B5B] shadow-conan-card p-6 sm:p-8"
            >
              {/* Card Header: Mascot + Category badge */}
              <div className="flex items-center justify-between border-b border-[#E5D5C5] pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2.5 py-1 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                    Palabra #{currentIndex + 1}
                  </span>
                  <span className="text-xs font-bold text-[#A67B5B] bg-[#FAF6F0] px-2.5 py-1 rounded-full border border-[#E5D5C5]">
                    {currentCard.partOfSpeech}
                  </span>
                </div>

                <ConanMascot
                  size="sm"
                  mood={status === "success" ? "celebrate" : status === "retry" ? "thinking" : "happy"}
                />
              </div>

              {/* Main Word & Pronunciation */}
              <div className="text-center mb-6">
                <h2 className="text-3xl sm:text-4xl font-black text-[#6B4423] tracking-tight mb-2">
                  {currentCard.word}
                </h2>

                <div className="flex items-center justify-center gap-2 mb-3">
                  <span className="text-sm font-mono font-bold text-[#A67B5B] bg-[#FAF6F0] px-3 py-1 rounded-xl border border-[#E5D5C5]">
                    {currentCard.phonetic}
                  </span>

                  <button
                    type="button"
                    onClick={() => speakWord(currentCard.word)}
                    className="p-2 bg-amber-100 hover:bg-amber-200 text-[#92400E] rounded-xl transition-colors shadow-xs"
                    title="Escuchar pronunciación nativa (US)"
                  >
                    <Volume2 className="w-5 h-5" />
                  </button>
                </div>

                <p className="text-sm font-black text-amber-800">
                  {currentCard.meaningEs}
                </p>
              </div>

              {/* English Definition & Example */}
              <div className="bg-[#FAF6F0] rounded-2xl border-2 border-[#E5D5C5] p-4 mb-6 text-left space-y-2">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#A67B5B] block">
                    Definición en Inglés:
                  </span>
                  <p className="text-xs sm:text-sm font-bold text-[#6B4423]">
                    {currentCard.correctDefinition}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#E5D5C5]/60">
                  <span className="text-[11px] font-black uppercase tracking-wider text-[#A67B5B] block">
                    Ejemplo en Contexto:
                  </span>
                  <p className="text-xs sm:text-sm italic text-[#8C6B4B]">
                    &ldquo;{currentCard.example}&rdquo;
                  </p>
                </div>
              </div>

              {/* Speech Recognition Feedback Area */}
              {status === "listening" && (
                <div className="p-4 rounded-2xl bg-amber-50 border-2 border-amber-300 text-center mb-6 animate-pulse">
                  <p className="text-sm font-black text-amber-900 flex items-center justify-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
                    <span>Escuchando tu voz... ¡Pronuncia la palabra ahora!</span>
                  </p>
                </div>
              )}

              {status === "success" && (
                <div className="p-4 rounded-2xl bg-emerald-50 border-2 border-emerald-400 text-center mb-6">
                  <p className="text-sm font-black text-emerald-900 flex items-center justify-center gap-2 mb-1">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    <span>¡Excelente pronunciación! 🎯</span>
                  </p>
                  <p className="text-xs text-emerald-800 font-semibold">
                    Dijiste: &ldquo;<strong className="text-emerald-950">{transcript}</strong>&rdquo; &bull; Coincidencia: {similarityScore}%
                  </p>
                </div>
              )}

              {status === "retry" && (
                <div className="p-4 rounded-2xl bg-red-50 border-2 border-red-300 text-center mb-6">
                  <p className="text-sm font-black text-red-900 flex items-center justify-center gap-2 mb-1">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                    <span>Necesita corrección</span>
                  </p>
                  <p className="text-xs text-red-800 font-semibold mb-2">
                    Escuchamos: &ldquo;<strong className="text-red-950">{transcript || "(no detectado)"}</strong>&rdquo; &bull; Similitud: {similarityScore || 0}% (mínimo 78%)
                  </p>
                  <p className="text-xs text-[#8C6B4B] bg-white p-2 rounded-xl border border-red-200">
                    Escucha la pronunciación correcta arriba e inténtalo de nuevo con el micrófono.
                  </p>
                </div>
              )}

              {/* Interactive Big Mic Button */}
              {speechSupported ? (
                <div className="flex flex-col items-center gap-3">
                  <button
                    type="button"
                    onClick={isListening ? stopListening : startListening}
                    className={`w-20 h-20 rounded-3xl flex items-center justify-center text-white transition-all shadow-lg active:scale-95 ${
                      isListening
                        ? "bg-red-500 hover:bg-red-600 shadow-[0_4px_0_0_#DC2626] animate-pulse"
                        : "bg-[#F59E0B] hover:bg-[#D97706] shadow-[0_5px_0_0_#D97706]"
                    }`}
                    title={isListening ? "Detener grabación" : "Presiona para hablar"}
                  >
                    {isListening ? (
                      <MicOff className="w-10 h-10 animate-bounce" />
                    ) : (
                      <Mic className="w-10 h-10" />
                    )}
                  </button>

                  <span className="text-xs font-bold text-[#A67B5B]">
                    {isListening
                      ? "Presiona para detener"
                      : "Presiona el micrófono y pronuncia en inglés"}
                  </span>
                </div>
              ) : (
                /* Fallback if browser does not support Web Speech API */
                <div className="p-4 bg-amber-50 rounded-2xl border border-amber-300 text-center mb-4">
                  <p className="text-xs font-bold text-amber-900 mb-2">
                    Tu navegador no soporta captura directa de voz. Te recomendamos usar Google Chrome en Android o PC.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      soundEffects.playCorrect();
                      setScore((prev) => prev + 1);
                      handleNextWord();
                    }}
                    className="px-4 py-2 bg-[#F59E0B] text-white font-bold text-xs rounded-xl shadow-xs"
                  >
                    Marcar como practicada y avanzar
                  </button>
                </div>
              )}

              {/* Bottom Skip/Next button */}
              <div className="flex justify-end mt-6 pt-4 border-t border-[#E5D5C5]">
                <button
                  type="button"
                  onClick={handleNextWord}
                  className="flex items-center gap-1.5 text-xs font-bold text-[#A67B5B] hover:text-[#6B4423] transition-colors"
                >
                  <span>Saltar palabra</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        ) : (
          /* VICTORY / COMPLETION SCREEN */
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl border-2 border-[#A67B5B] shadow-conan-card p-8 text-center max-w-md mx-auto"
          >
            <div className="w-16 h-16 rounded-3xl bg-amber-100 text-[#F59E0B] flex items-center justify-center mx-auto mb-4">
              <Trophy className="w-8 h-8" />
            </div>

            <h2 className="text-2xl font-black text-[#6B4423] mb-2">
              ¡Entrenamiento de Pronunciación Finalizado!
            </h2>

            <p className="text-sm text-[#A67B5B] font-medium mb-6">
              Has practicado la pronunciación y entonación de todo el vocabulario técnico en inglés 🇺🇸.
            </p>

            <div className="p-4 bg-[#FAF6F0] rounded-2xl border border-[#E5D5C5] mb-6">
              <span className="text-xs text-[#A67B5B] font-bold block">Puntaje de Pronunciación</span>
              <span className="text-3xl font-black text-[#F59E0B]">{score} / {definitionCards.length}</span>
            </div>

            <button
              type="button"
              onClick={handleRestart}
              className="w-full py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black rounded-2xl shadow-conan-btn flex items-center justify-center gap-2 transition-transform active:scale-98"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Practicar de nuevo</span>
            </button>
          </motion.div>
        )}
      </main>
    </div>
  );
}
