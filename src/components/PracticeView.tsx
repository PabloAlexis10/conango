"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import ProgressBar from "@/components/ProgressBar";
import QuestionCard from "@/components/QuestionCard";
import ConanMascot from "@/components/ConanMascot";
import { Question, QuestionReview, SessionSize, SessionType } from "@/lib/types";
import { soundEffects } from "@/lib/soundEffects";
import { saveSessionResult, saveExamResult, getCurrentUser, updateUserMedals, hasReachedGuestLimit, incrementGuestUsage } from "@/lib/supabase";
import GuestLimitWall from "@/components/GuestLimitWall";
import AuthModal from "@/components/AuthModal";
import { RotateCcw, Home, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PracticeViewProps {
  type?: SessionType;
}

export default function PracticeView({ type: defaultType = "mixed" }: PracticeViewProps) {
  const searchParams = useSearchParams();
  const router = useRouter();

  const typeParam = (searchParams.get("type") || defaultType) as SessionType;
  const rawSize = parseInt(searchParams.get("size") || "100", 10);
  const formulaParam = searchParams.get("formula"); // "random" or "1", "2", etc.
  const size: SessionSize = [10, 30, 50, 100].includes(rawSize as SessionSize)
    ? (rawSize as SessionSize)
    : 100;

  const isExamMode = size === 100;

  // Session states
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [medals, setMedals] = useState<number>(5);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [incorrectCount, setIncorrectCount] = useState<number>(0);
  const [reviews, setReviews] = useState<QuestionReview[]>([]);
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [activeFormula, setActiveFormula] = useState<number | null>(null);
  const [limitReached, setLimitReached] = useState<boolean>(false);
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);

  // Fetch questions
  const loadQuestions = useCallback(async () => {
    if (hasReachedGuestLimit()) {
      setLimitReached(true);
      setIsLoading(false);
      return;
    }
    setLimitReached(false);
    setIsLoading(true);
    setIsGameOver(false);
    setMedals(5);
    setCurrentIndex(0);
    setCorrectCount(0);
    setIncorrectCount(0);
    setReviews([]);

    try {
      let url = `/api/questions?type=${typeParam}&size=${size}`;
      if (formulaParam) {
        url += `&formula=${formulaParam}`;
      }
      const res = await fetch(url);
      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        setQuestions(data.questions);
        if (data.formula) {
          setActiveFormula(data.formula);
        }
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
    } finally {
      setIsLoading(false);
    }
  }, [typeParam, size, formulaParam]);

  useEffect(() => {
    loadQuestions();
  }, [loadQuestions]);

  // Handle answering an option
  const handleAnswer = (selectedIndex: number, isCorrect: boolean) => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    if (isCorrect) {
      soundEffects.playCorrect();
      setCorrectCount((prev) => prev + 1);
    } else {
      soundEffects.playIncorrect();
      setIncorrectCount((prev) => prev + 1);

      // Save question review record
      setReviews((prev) => [
        ...prev,
        {
          id: currentQ.id,
          type: currentQ.type,
          formula: currentQ.formula,
          formulaName: currentQ.formulaName,
          context: currentQ.context,
          contextEs: currentQ.contextEs,
          question: currentQ.question,
          questionEs: currentQ.questionEs,
          options: currentQ.options,
          correctAnswer: currentQ.correctAnswer,
          selectedAnswer: selectedIndex,
          isCorrect: false,
          explanation: currentQ.explanation,
          image: currentQ.image,
          audioUrl: currentQ.audioUrl,
          textToSpeak: currentQ.textToSpeak,
        },
      ]);

      // If lives mode (10, 30, 50), subtract 1 medal
      if (!isExamMode) {
        setMedals((prev) => {
          const newMedals = prev - 1;
          if (newMedals <= 0) {
            setTimeout(() => {
              setIsGameOver(true);
            }, 600);
            return 0;
          }
          return newMedals;
        });
      }
    }
  };

  // Complete session or exam
  const handleFinish = useCallback(
    async (finalCorrect: number, finalIncorrect: number, finalReviews: QuestionReview[]) => {
      setIsSaving(true);
      const totalAnswered = finalCorrect + finalIncorrect;
      const percentage = Math.round((finalCorrect / Math.max(1, totalAnswered)) * 100);

      // Store reviews in sessionStorage for results page
      if (typeof window !== "undefined") {
        sessionStorage.setItem("conango_last_reviews", JSON.stringify(finalReviews));
      }

      if (isExamMode) {
        await saveExamResult({
          type: typeParam,
          correct: finalCorrect,
          incorrect: finalIncorrect,
          percentage,
          details: finalReviews,
          created_at: new Date().toISOString(),
        });
      } else {
        await saveSessionResult({
          type: typeParam,
          size,
          correct: finalCorrect,
          incorrect: finalIncorrect,
          percentage,
          created_at: new Date().toISOString(),
        });

        updateUserMedals(2);
      }

      if (!getCurrentUser()) {
        incrementGuestUsage();
      }

      // Navigate to /results
      router.push(
        `/results?type=${typeParam}&size=${size}&correct=${finalCorrect}&incorrect=${finalIncorrect}&mode=${
          isExamMode ? "exam" : "session"
        }${activeFormula ? `&formula=${activeFormula}` : ""}`
      );
    },
    [isExamMode, typeParam, size, activeFormula, router]
  );

  const handleNext = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      handleFinish(correctCount, incorrectCount, reviews);
    }
  };

  const handleTimerExpire = () => {
    handleFinish(correctCount, incorrectCount, reviews);
  };

  // Title for Header
  let sessionHeaderTitle = "";
  if (isExamMode) {
    sessionHeaderTitle = activeFormula
      ? `Examen Fórmula ${activeFormula} – 100 preguntas (60L / 40R)`
      : `Examen Final Aleatorio – 100 preguntas (60L / 40R)`;
  } else {
    sessionHeaderTitle = activeFormula
      ? `Quiz Fórmula ${activeFormula} – ${size} preguntas`
      : `Quiz ALCPT – ${size} preguntas`;
  }

  if (limitReached) {
    return (
      <div className="min-h-screen bg-[#FAF6F0] flex flex-col justify-center items-center p-4">
        <GuestLimitWall onOpenAuth={() => setAuthModalOpen(true)} />
        <AuthModal
          isOpen={authModalOpen}
          onClose={() => setAuthModalOpen(false)}
          initialMode="register"
          preventClose={true}
          forcedReason="Llegaste al límite de 2 lecciones de prueba gratuita. Inicia sesión o regístrate gratis para continuar practicando sin límites."
          onSuccess={() => {
            setAuthModalOpen(false);
            setLimitReached(false);
            loadQuestions();
          }}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
        <ConanMascot size="lg" mood="thinking" animate={true} />
        <div className="flex items-center gap-2 mt-4 text-[#6B4423] font-bold">
          <Loader2 className="w-5 h-5 animate-spin text-[#F59E0B]" />
          <span>Cargando reactivos de {sessionHeaderTitle}...</span>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header
        sessionTitle={sessionHeaderTitle}
        sessionType={typeParam}
        sessionSize={size}
        medals={medals}
        showTimer={isExamMode}
        onTimerExpire={handleTimerExpire}
      />

      <main className="flex-1 max-w-3xl w-full mx-auto px-4 py-6 sm:py-8 flex flex-col justify-start">
        <div className="mb-6">
          <ProgressBar current={currentIndex + 1} total={questions.length} />
        </div>

        {currentQuestion && !isGameOver && (
          <QuestionCard
            question={currentQuestion}
            currentIndex={currentIndex + 1}
            totalQuestions={questions.length}
            onAnswer={handleAnswer}
            onNext={handleNext}
            disabled={isGameOver || isSaving}
          />
        )}

        <AnimatePresence>
          {isGameOver && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
              <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-3xl border-4 border-red-300 shadow-2xl p-6 sm:p-8 max-w-md w-full text-center"
              >
                <div className="flex justify-center mb-4">
                  <ConanMascot size="lg" mood="sad" animate={true} />
                </div>

                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full font-black text-xs uppercase tracking-wider mb-2">
                  <AlertCircle className="w-4 h-4" />
                  Sesión Fallida
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-[#6B4423] mb-2">
                  ¡Te quedaste sin medallas!
                </h2>

                <p className="text-sm text-[#A67B5B] font-medium leading-relaxed mb-6">
                  Perdiste tus 5 vidas. Debes comenzar de nuevo esta sesión desde la primera pregunta.
                </p>

                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={loadQuestions}
                    className="w-full py-3.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black rounded-2xl shadow-conan-btn flex items-center justify-center gap-2 text-base transition-transform active:translate-y-1"
                  >
                    <RotateCcw className="w-5 h-5" />
                    <span>Reintentar sesión</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => router.push("/")}
                    className="w-full py-3 bg-[#FAF6F0] hover:bg-[#F5EFEB] text-[#6B4423] font-bold rounded-2xl border border-[#E5D5C5] flex items-center justify-center gap-2 text-sm transition-colors"
                  >
                    <Home className="w-4 h-4 text-[#A67B5B]" />
                    <span>Volver al inicio</span>
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
