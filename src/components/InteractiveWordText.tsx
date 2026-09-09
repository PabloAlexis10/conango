"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { getWordGrammarInfo, fetchWordTranslationAsync, WordGrammarInfo } from "@/lib/wordDictionary";
import { speakHumanText } from "@/lib/audioVoice";
import { Volume2, X, Sparkles, Clock, ArrowRight, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InteractiveWordTextProps {
  text: string;
  className?: string;
  interactive?: boolean;
  isExamMode?: boolean;
}

export default function InteractiveWordText({
  text,
  className = "",
  interactive = true,
  isExamMode = false,
}: InteractiveWordTextProps) {
  const [activeWordIndex, setActiveWordIndex] = useState<number | null>(null);
  const [activeInfo, setActiveInfo] = useState<WordGrammarInfo | null>(null);
  const [mounted, setMounted] = useState(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Parsear texto dividiendo palabras de signos de puntuación y espacios
  const tokens = useMemo(() => {
    if (!text) return [];
    return text.match(/([a-zA-Z0-9'’-]+|[^\sa-zA-Z0-9'’-]+|\s+)/g) || [text];
  }, [text]);

  const closePopover = () => {
    setActiveWordIndex(null);
    setActiveInfo(null);
  };

  // Cerrar con la tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        closePopover();
      }
    };
    if (activeInfo) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [activeInfo]);

  if (!interactive) {
    return <span className={className}>{text}</span>;
  }

  const handleMouseEnter = (token: string, idx: number) => {
    // En escritorio, solo abrir al pasar el ratón si no hay otra palabra activa
    if (activeWordIndex !== null) return;
    const info = getWordGrammarInfo(token);
    setActiveWordIndex(idx);
    setActiveInfo(info);

    if (info.translation === info.cleanWord) {
      fetchWordTranslationAsync(token).then((res) => {
        if (res) {
          setActiveInfo((prev) => (prev && prev.cleanWord === info.cleanWord ? { ...prev, translation: res } : prev));
        }
      });
    }
  };

  const handleClickWord = (e: React.MouseEvent | React.TouchEvent, token: string, idx: number) => {
    e.stopPropagation();
    // Prevenir que el clic se propague al botón de la opción o active la respuesta
    if (activeWordIndex === idx) {
      closePopover();
    } else {
      const info = getWordGrammarInfo(token);
      setActiveWordIndex(idx);
      setActiveInfo(info);

      if (info.translation === info.cleanWord) {
        fetchWordTranslationAsync(token).then((res) => {
          if (res) {
            setActiveInfo((prev) => (prev && prev.cleanWord === info.cleanWord ? { ...prev, translation: res } : prev));
          }
        });
      }
    }
  };

  const playPronunciation = (e: React.MouseEvent, wordToSpeak: string) => {
    e.stopPropagation();
    speakHumanText(wordToSpeak, { rate: 0.92 });
  };

  return (
    <>
      <span className={`inline leading-relaxed ${className}`}>
        {tokens.map((token, idx) => {
          const isWord = /[a-zA-Z]/i.test(token);
          if (!isWord) {
            return <React.Fragment key={idx}>{token}</React.Fragment>;
          }

          const isActive = activeWordIndex === idx;

          return (
            <span
              key={idx}
              className="relative inline-block"
              onMouseEnter={() => handleMouseEnter(token, idx)}
            >
              <span
                role="button"
                tabIndex={0}
                onClick={(e) => handleClickWord(e, token, idx)}
                onPointerDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleClickWord(e as any, token, idx);
                  }
                }}
                className={`cursor-pointer rounded px-0.5 transition-all select-none ${
                  isActive
                    ? "bg-amber-200 dark:bg-amber-900/70 text-amber-950 dark:text-amber-100 font-extrabold shadow-xs"
                    : isExamMode
                    ? "hover:bg-amber-100/60 dark:hover:bg-amber-900/30 underline decoration-dotted decoration-amber-300 dark:decoration-amber-600 underline-offset-2"
                    : "hover:bg-amber-100/80 dark:hover:bg-amber-900/40 hover:text-amber-900 dark:hover:text-amber-200 underline decoration-dotted decoration-amber-400/70 dark:decoration-amber-500/70 underline-offset-3"
                }`}
                title={
                  isExamMode
                    ? "Toca para escuchar pronunciación y tiempos en inglés (Modo Examen)"
                    : "Toca o pasa el cursor para ver traducción y tiempos verbales"
                }
              >
                {token}
              </span>
            </span>
          );
        })}
      </span>

      {/* ÚNICA VENTANA EMERGENTE EN TODA LA APLICACIÓN (React Portal a document.body)
          No altera el layout de la página ni agranda el ancho del viewport.
          Adaptada 100% para celular y escritorio en la parte inferior/central. */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {activeInfo && (
              <>
                {/* Telón de fondo oscuro translúcido */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  className="fixed inset-0 bg-black/40 backdrop-blur-2xs z-[9998] pointer-events-auto"
                  onClick={closePopover}
                />

                {/* Tarjeta Flotante Única */}
                <motion.div
                  ref={popoverRef}
                  initial={{ opacity: 0, y: 30, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 25, scale: 0.97 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  onClick={(e) => e.stopPropagation()}
                  className="fixed bottom-3 inset-x-3 sm:bottom-6 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 w-[calc(100%-24px)] sm:w-[480px] max-w-lg p-4 sm:p-5 bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-400 dark:border-amber-600 shadow-2xl z-[9999] text-left pointer-events-auto select-text text-slate-800 dark:text-slate-100 font-sans max-h-[82vh] overflow-y-auto"
                >
                  {/* Encabezado: Palabra, Fonética, Audio Humano y Botón Cerrar */}
                  <div className="flex items-center justify-between border-b border-amber-200 dark:border-slate-700 pb-2.5 mb-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-black text-lg sm:text-xl text-[#6B4423] dark:text-amber-300 truncate">
                        {activeInfo.cleanWord}
                      </span>
                      {activeInfo.phonetic && (
                        <span className="text-xs text-amber-700 dark:text-amber-400 font-mono">
                          {activeInfo.phonetic}
                        </span>
                      )}
                      <button
                        type="button"
                        title="Escuchar pronunciación con voz humana"
                        onClick={(e) => playPronunciation(e, activeInfo.cleanWord)}
                        className="p-1.5 rounded-xl bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-slate-700 transition-colors shrink-0"
                      >
                        <Volume2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60">
                        {activeInfo.partOfSpeech}
                      </span>
                      <button
                        type="button"
                        onClick={closePopover}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800 transition-colors"
                        title="Cerrar ventana"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Modo Examen Oficial o Traducción Directa */}
                  {isExamMode ? (
                    <div className="mb-3 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-900 dark:text-red-200 font-bold flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Modo Examen Oficial ALCPT: Traducción al español restringida según normativa USAF.</span>
                    </div>
                  ) : (
                    <div className="mb-3 bg-amber-50 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-amber-200 dark:border-slate-700">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 block mb-0.5">
                        Traducción en Español:
                      </span>
                      <p className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                        {activeInfo.translation}
                      </p>
                    </div>
                  )}

                  {/* Aplicación en Tiempos Verbales */}
                  <div className="space-y-2 text-xs">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#A67B5B] dark:text-slate-400 block">
                      Tiempos Verbales (Pasado, Presente, Futuro):
                    </span>

                    {/* Pasado */}
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                      <div className="flex items-center gap-1 font-bold text-indigo-700 dark:text-indigo-400 mb-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Pasado ({activeInfo.past.form}):</span>
                      </div>
                      <p className="italic text-slate-800 dark:text-slate-200 leading-snug">
                        &ldquo;{activeInfo.past.exampleEn}&rdquo;
                      </p>
                      {!isExamMode && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          &rarr; {activeInfo.past.exampleEs}
                        </p>
                      )}
                    </div>

                    {/* Presente */}
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                      <div className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 mb-0.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>Presente ({activeInfo.present.form}):</span>
                      </div>
                      <p className="italic text-slate-800 dark:text-slate-200 leading-snug">
                        &ldquo;{activeInfo.present.exampleEn}&rdquo;
                      </p>
                      {!isExamMode && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          &rarr; {activeInfo.present.exampleEs}
                        </p>
                      )}
                    </div>

                    {/* Futuro */}
                    <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                      <div className="flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400 mb-0.5">
                        <ArrowRight className="w-3.5 h-3.5" />
                        <span>Futuro ({activeInfo.future.form}):</span>
                      </div>
                      <p className="italic text-slate-800 dark:text-slate-200 leading-snug">
                        &ldquo;{activeInfo.future.exampleEn}&rdquo;
                      </p>
                      {!isExamMode && (
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                          &rarr; {activeInfo.future.exampleEs}
                        </p>
                      )}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={closePopover}
                    className="mt-3 w-full py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white font-black text-xs rounded-xl shadow-xs transition-colors"
                  >
                    Cerrar Ventana
                  </button>
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
