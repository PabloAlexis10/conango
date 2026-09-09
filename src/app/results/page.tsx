"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import ConanMascot from "@/components/ConanMascot";
import AdBanner from "@/components/AdBanner";
import AudioPlayer from "@/components/AudioPlayer";
import TacticalCertificateModal from "@/components/TacticalCertificateModal";
import ConanResultVideoScene from "@/components/ConanResultVideoScene";
import { getCurrentUser } from "@/lib/supabase";
import { QuestionReview } from "@/lib/types";
import {
  Trophy,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Home,
  Lightbulb,
  Award,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Volume2,
  BookOpen,
} from "lucide-react";
import confetti from "canvas-confetti";

function ResultsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const type = searchParams.get("type") || "mixed";
  const size = parseInt(searchParams.get("size") || "10", 10);
  const correct = parseInt(searchParams.get("correct") || "0", 10);
  const incorrect = parseInt(searchParams.get("incorrect") || "0", 10);
  const total = Math.max(1, correct + incorrect);
  const percentage = Math.round((correct / total) * 100);

  const [reviews, setReviews] = useState<QuestionReview[]>([]);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [certModalOpen, setCertModalOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const saved = sessionStorage.getItem("conango_last_reviews");
        if (saved) {
          setReviews(JSON.parse(saved));
        }
      } catch (err) {
        console.error("Error reading saved reviews:", err);
      }
    }

    if (percentage >= 70) {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ["#F59E0B", "#FBBF24", "#6B4423", "#22C55E"],
      });
    }
  }, [percentage]);

  const getLevelInfo = (pct: number) => {
    if (pct >= 90) {
      return {
        level: "Nivel Avanzado (Superior)",
        desc: "¡Excelente dominio! Tu comprensión y precisión gramatical están a nivel operativo completo.",
        color: "text-green-700 bg-green-100 border-green-300",
        mood: "graduate" as const,
      };
    }
    if (pct >= 70) {
      return {
        level: "Nivel Intermedio Alto",
        desc: "Muy buen desempeño. Cumples con la mayoría de estándares requeridos en el ALCPT.",
        color: "text-blue-700 bg-blue-100 border-blue-300",
        mood: "celebrate" as const,
      };
    }
    if (pct >= 50) {
      return {
        level: "Nivel Intermedio",
        desc: "Progreso notable. Te recomendamos reforzar vocabulario y estructuras verbales pasadas.",
        color: "text-amber-700 bg-amber-100 border-amber-300",
        mood: "happy" as const,
      };
    }
    return {
      level: "Nivel Básico – sigue practicando",
      desc: "Estás comenzando tu camino. Continúa entrenando diariamente con quizzes de 10 o 30 preguntas.",
      color: "text-red-700 bg-red-100 border-red-300",
      mood: "thinking" as const,
    };
  };

  const levelInfo = getLevelInfo(percentage);
  let typeTitle = "ALCPT Mixto";
  if (type === "listening") typeTitle = "Listening";
  if (type === "reading") typeTitle = "Reading";

  const optionLetters = ["A", "B", "C", "D"];

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-[#6B4423] dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8 sm:py-12">
        {/* Animated Conan Victory / Support Scene */}
        <ConanResultVideoScene
          percentage={percentage}
          correct={correct}
          incorrect={incorrect}
        />

        {/* Results Hero Header */}
        <div className="bg-gradient-to-b from-[#FAF6F0] to-white dark:from-slate-900 dark:to-slate-900 rounded-3xl border-2 border-[#E5D5C5] dark:border-slate-800 shadow-conan-card p-6 sm:p-10 text-center mb-10 relative overflow-hidden">
          <div className="flex justify-center mb-4">
            <ConanMascot size="lg" mood={levelInfo.mood} animate={true} />
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-[#6B4423] mb-2 tracking-tight">
            Resultados – {typeTitle}
          </h1>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-sm font-black uppercase tracking-wider mb-6 shadow-sm bg-amber-50 border-amber-300 text-amber-900">
            <Award className="w-4 h-4 text-[#F59E0B]" />
            <span>{levelInfo.level}</span>
          </div>

          <p className="text-sm sm:text-base text-[#A67B5B] max-w-lg mx-auto leading-relaxed mb-8 font-medium">
            {levelInfo.desc}
          </p>

          {/* Key Score Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl mx-auto">
            <div className="bg-white p-4 rounded-2xl border-2 border-[#E5D5C5] shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A67B5B] block mb-1">
                Correctas
              </span>
              <div className="flex items-center justify-center gap-2 text-2xl sm:text-3xl font-black text-green-600">
                <CheckCircle2 className="w-6 h-6" />
                <span>{correct}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-[#E5D5C5] shadow-sm">
              <span className="text-xs font-bold uppercase tracking-wider text-[#A67B5B] block mb-1">
                Incorrectas
              </span>
              <div className="flex items-center justify-center gap-2 text-2xl sm:text-3xl font-black text-red-600">
                <XCircle className="w-6 h-6" />
                <span>{incorrect}</span>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border-2 border-[#F59E0B] shadow-sm bg-gradient-to-tr from-[#FFFBEB] to-white">
              <span className="text-xs font-bold uppercase tracking-wider text-[#B45309] block mb-1">
                Porcentaje de Inglés
              </span>
              <div className="flex items-center justify-center gap-1.5 text-2xl sm:text-3xl font-black text-[#F59E0B]">
                <Trophy className="w-6 h-6 text-[#F59E0B]" />
                <span>{percentage}%</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
            <button
              type="button"
              onClick={() => router.push(`/practice?size=${size}&type=${type}`)}
              className="px-6 py-3 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black rounded-2xl shadow-conan-btn flex items-center gap-2 text-sm sm:text-base transition-transform active:translate-y-1"
            >
              <RotateCcw className="w-5 h-5" />
              <span>Practicar de nuevo</span>
            </button>

            {/* Tactical Diploma Button */}
            <button
              type="button"
              onClick={() => setCertModalOpen(true)}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white font-black rounded-2xl shadow-conan-btn flex items-center gap-2 text-sm sm:text-base transition-transform active:translate-y-1"
            >
              <Award className="w-5 h-5 text-yellow-100" />
              <span>Ver Diploma Oficial ALCPT</span>
            </button>

            <button
              type="button"
              onClick={() => router.push("/")}
              className="px-6 py-3 bg-[#FAF6F0] hover:bg-[#F5EFEB] text-[#6B4423] font-bold rounded-2xl border border-[#E5D5C5] flex items-center gap-2 text-sm sm:text-base transition-colors"
            >
              <Home className="w-5 h-5 text-[#A67B5B]" />
              <span>Volver al inicio</span>
            </button>
          </div>
        </div>

        {/* Google Ads Placement after Exam */}
        <AdBanner
          className="my-6"
          slotId="2345678901"
          sponsorTitle="Plan de Refuerzo Personalizado según tus Fallos 📊"
          sponsorDescription="Recibe un diagnóstico detallado de tus puntos débiles en gramática y listening para tu próximo intento."
          sponsorCta="Obtener Plan de Estudio"
        />

        {/* Section: Review Wrong Questions */}
        <section className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-black text-[#6B4423] tracking-tight">
                Revisar preguntas incorrectas por fórmula
              </h2>
              <p className="text-xs sm:text-sm text-[#A67B5B] font-semibold">
                {reviews.length === 0
                  ? "¡Puntaje perfecto! No tuviste preguntas incorrectas en esta sesión."
                  : `Tienes ${reviews.length} pregunta(s) con retroalimentación y fórmulas detalladas.`}
              </p>
            </div>
          </div>

          {reviews.length > 0 ? (
            <div className="space-y-4">
              {reviews.map((rev, index) => {
                const isExpanded = expandedIndex === index;
                const isListening = rev.type === "listening";

                return (
                  <div
                    key={index}
                    className="bg-white rounded-2xl border-2 border-[#E5D5C5] shadow-sm p-5 transition-all"
                  >
                    <div
                      className="flex items-start justify-between gap-3 cursor-pointer"
                      onClick={() =>
                        setExpandedIndex(isExpanded ? null : index)
                      }
                    >
                      <div className="flex items-start gap-3 flex-1">
                        <span className="w-7 h-7 rounded-lg bg-red-100 text-red-700 font-black text-xs flex items-center justify-center flex-shrink-0 mt-0.5">
                          #{index + 1}
                        </span>
                        <div className="flex-1">
                          {/* Formula & Type Badges */}
                          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                            <span className="text-[11px] font-black uppercase px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-md flex items-center gap-1">
                              <Sparkles className="w-3 h-3 text-[#F59E0B]" />
                              Fórmula {rev.formula || 1}
                            </span>
                            <span className="text-[10px] font-bold uppercase px-2 py-0.5 bg-orange-50 text-orange-800 border border-orange-200 rounded-md">
                              {isListening ? "Listening" : "Reading"}
                            </span>
                          </div>

                          <h4 className="text-base font-bold text-[#6B4423] leading-snug">
                            {rev.question}
                          </h4>
                          <span className="text-xs text-red-600 font-semibold mt-1 inline-block">
                            Tu respuesta: {rev.options[rev.selectedAnswer] || "No respondida"}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        className="p-1 text-[#A67B5B] hover:text-[#6B4423]"
                      >
                        {isExpanded ? (
                          <ChevronUp className="w-5 h-5" />
                        ) : (
                          <ChevronDown className="w-5 h-5" />
                        )}
                      </button>
                    </div>

                    {/* Audio or Image player if available */}
                    {isListening && (
                      <div className="mt-3 pt-3 border-t border-[#E5D5C5]/60 space-y-2.5">
                        <AudioPlayer
                          audioUrl={rev.audioUrl}
                          textToSpeak={rev.textToSpeak || rev.question}
                        />

                        <div className="bg-[#FAF6F0] rounded-xl border border-[#E5D5C5] p-3 text-xs">
                          <div className="bg-white p-2.5 rounded-lg border border-[#E5D5C5]/60">
                            <span className="font-bold text-[#6B4423] block mb-0.5 flex items-center gap-1">
                              <span>Audio Transcript (Inglés 🇺🇸):</span>
                            </span>
                            <p className="text-[#4A3319] font-medium leading-relaxed">
                              &ldquo;{rev.context || (rev.textToSpeak ? rev.textToSpeak.replace(rev.question, "").trim() : "") || rev.question}&rdquo;
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {rev.image && (
                      <div className="mt-3 rounded-xl overflow-hidden max-h-48 flex justify-center bg-[#FAF6F0]">
                        <img
                          src={rev.image}
                          alt="Pregunta"
                          className="max-h-48 object-contain"
                        />
                      </div>
                    )}

                    {/* Expanded details */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-[#E5D5C5] space-y-2">
                        <div className="space-y-1.5">
                          {rev.options.map((opt, optIdx) => {
                            const isCorrectOpt = optIdx === rev.correctAnswer;
                            const isSelectedOpt = optIdx === rev.selectedAnswer;

                            return (
                              <div
                                key={optIdx}
                                className={`p-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-between border ${
                                  isCorrectOpt
                                    ? "bg-green-50 border-green-300 text-green-800"
                                    : isSelectedOpt
                                    ? "bg-red-50 border-red-300 text-red-800"
                                    : "bg-[#FAF6F0] border-transparent text-[#6B4423]"
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <strong className="font-bold">
                                    {optionLetters[optIdx]})
                                  </strong>{" "}
                                  {opt}
                                </span>
                                {isCorrectOpt && (
                                  <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-green-600 text-white rounded-md">
                                    Correcta
                                  </span>
                                )}
                                {isSelectedOpt && !isCorrectOpt && (
                                  <span className="text-[10px] uppercase font-black px-2 py-0.5 bg-red-600 text-white rounded-md">
                                    Tu selección
                                  </span>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {rev.explanation && (
                          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-900 flex items-start gap-2">
                            <Lightbulb className="w-4 h-4 text-[#F59E0B] flex-shrink-0 mt-0.5" />
                            <div>
                              <strong className="font-bold">Explicación ({rev.formulaName || `Fórmula ${rev.formula}`}):</strong>{" "}
                              {rev.explanation}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center bg-[#FAF6F0] rounded-2xl border border-[#E5D5C5]">
              <Trophy className="w-10 h-10 text-[#F59E0B] mx-auto mb-2" />
              <p className="font-bold text-[#6B4423]">
                ¡Puntaje perfecto! No hay respuestas incorrectas para revisar.
              </p>
            </div>
          )}
        </section>

        <TacticalCertificateModal
          isOpen={certModalOpen}
          onClose={() => setCertModalOpen(false)}
          cadetName={getCurrentUser()?.name || getCurrentUser()?.email?.split("@")[0] || "Cadete de Honor"}
          percentage={percentage}
          correctAnswers={correct}
          formulaNumber={searchParams.get("formula") || "Mixta"}
        />
      </main>
    </div>
  );
}

export default function ResultsPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
          <ConanMascot size="lg" mood="thinking" animate={true} />
          <p className="mt-4 font-bold text-[#6B4423]">Cargando resultados...</p>
        </div>
      }
    >
      <ResultsContent />
    </Suspense>
  );
}
