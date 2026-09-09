"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { getWordGrammarInfo, WordGrammarInfo } from "@/lib/wordDictionary";
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
  const [isPinned, setIsPinned] = useState<boolean>(false);
  const popoverRef = useRef<HTMLDivElement | null>(null);
  const mobileSheetRef = useRef<HTMLDivElement | null>(null);
  const leaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Parsear texto dividiendo palabras de signos de puntuación y espacios
  const tokens = useMemo(() => {
    if (!text) return [];
    return text.match(/([a-zA-Z0-9'’-]+|[^\sa-zA-Z0-9'’-]+|\s+)/g) || [text];
  }, [text]);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleDocumentClick = (e: MouseEvent | TouchEvent) => {
      const targetNode = e.target as Node;
      if (
        (popoverRef.current && popoverRef.current.contains(targetNode)) ||
        (mobileSheetRef.current && mobileSheetRef.current.contains(targetNode))
      ) {
        return;
      }
      setActiveWordIndex(null);
      setActiveInfo(null);
      setIsPinned(false);
    };

    if (activeWordIndex !== null) {
      document.addEventListener("mousedown", handleDocumentClick);
      document.addEventListener("touchstart", handleDocumentClick);
    }

    return () => {
      document.removeEventListener("mousedown", handleDocumentClick);
      document.removeEventListener("touchstart", handleDocumentClick);
    };
  }, [activeWordIndex]);

  if (!interactive) {
    return <span className={className}>{text}</span>;
  }

  const handleMouseEnter = (token: string, idx: number) => {
    if (leaveTimerRef.current) {
      clearTimeout(leaveTimerRef.current);
      leaveTimerRef.current = null;
    }
    if (isPinned && activeWordIndex !== idx) return;
    const info = getWordGrammarInfo(token);
    setActiveWordIndex(idx);
    setActiveInfo(info);
  };

  const handleMouseLeave = () => {
    if (isPinned) return;
    leaveTimerRef.current = setTimeout(() => {
      setActiveWordIndex(null);
      setActiveInfo(null);
    }, 250);
  };

  const handleClickWord = (e: React.MouseEvent, token: string, idx: number) => {
    e.stopPropagation();
    if (activeWordIndex === idx && isPinned) {
      setActiveWordIndex(null);
      setActiveInfo(null);
      setIsPinned(false);
    } else {
      const info = getWordGrammarInfo(token);
      setActiveWordIndex(idx);
      setActiveInfo(info);
      setIsPinned(true);
    }
  };

  const playPronunciation = (e: React.MouseEvent, wordToSpeak: string) => {
    e.stopPropagation();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(wordToSpeak);
      utterance.lang = "en-US";
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  };

  const closePopover = () => {
    setActiveWordIndex(null);
    setActiveInfo(null);
    setIsPinned(false);
  };

  return (
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
            onMouseLeave={handleMouseLeave}
          >
            <span
              onClick={(e) => handleClickWord(e, token, idx)}
              className={`cursor-pointer rounded px-0.5 transition-all select-none ${
                isActive
                  ? "bg-amber-200 dark:bg-amber-900/70 text-amber-950 dark:text-amber-100 font-extrabold shadow-xs"
                  : isExamMode
                  ? "hover:bg-amber-100/60 dark:hover:bg-amber-900/30 underline decoration-dotted decoration-amber-300 dark:decoration-amber-600 underline-offset-2"
                  : "hover:bg-amber-100/80 dark:hover:bg-amber-900/40 hover:text-amber-900 dark:hover:text-amber-200 underline decoration-dotted decoration-amber-400/70 dark:decoration-amber-500/70 underline-offset-3"
              }`}
              title={
                isExamMode
                  ? "Toca para escuchar pronunciación y tiempos en inglés (Modo Examen Oficial)"
                  : "Pasa el puntero o toca para ver traducción y tiempos (Pasado, Presente, Futuro)"
              }
            >
              {token}
            </span>

            {/* 1. VERSIÓN ESCRITORIO (>= 640px): POPUP FLOTANTE ENCIMA DE LA PALABRA */}
            <AnimatePresence>
              {isActive && activeInfo && (
                <motion.div
                  ref={popoverRef}
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  onClick={(e) => e.stopPropagation()}
                  className="hidden sm:block absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-[300px] sm:w-[330px] p-3.5 bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-400 dark:border-amber-600 shadow-2xl z-50 text-left cursor-default pointer-events-auto select-text text-slate-800 dark:text-slate-100 font-sans"
                >
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-white dark:bg-slate-900 border-r-2 border-b-2 border-amber-400 dark:border-amber-600" />

                  {/* Header */}
                  <div className="flex items-center justify-between border-b border-amber-200 dark:border-slate-700 pb-2 mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-black text-base text-[#6B4423] dark:text-amber-300 truncate">
                        {token}
                      </span>
                      {activeInfo.phonetic && (
                        <span className="text-[11px] text-amber-700 dark:text-amber-400/80 font-mono">
                          {activeInfo.phonetic}
                        </span>
                      )}
                      <button
                        type="button"
                        title="Escuchar pronunciación"
                        onClick={(e) => playPronunciation(e, token)}
                        className="p-1 rounded-lg bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-slate-700 transition-colors shrink-0"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60">
                        {activeInfo.partOfSpeech}
                      </span>
                      <button
                        type="button"
                        onClick={closePopover}
                        className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Si está en MODO EXAMEN: Prohibido Español */}
                  {isExamMode ? (
                    <div className="mb-2 p-2 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-[11px] text-red-900 dark:text-red-200 font-bold flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                      <span>Modo Examen Oficial ALCPT: Traducción al español deshabilitada según norma USAF.</span>
                    </div>
                  ) : (
                    /* Traducción al Español */
                    <div className="mb-2.5 bg-amber-50 dark:bg-slate-800/80 p-2 rounded-xl border border-amber-200 dark:border-slate-700">
                      <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 block mb-0.5">
                        Traducción al Español:
                      </span>
                      <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-snug">
                        {activeInfo.translation}
                      </p>
                    </div>
                  )}

                  {/* Tiempos Verbales */}
                  <div className="space-y-1.5 text-[11px]">
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#A67B5B] dark:text-slate-400 block">
                      Aplicación en Tiempos Verbales:
                    </span>

                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                      <div className="flex items-center gap-1 font-bold text-indigo-700 dark:text-indigo-400 mb-0.5">
                        <Clock className="w-3 h-3" />
                        <span>Past ({activeInfo.past.form}):</span>
                      </div>
                      <p className="italic text-slate-800 dark:text-slate-200 leading-tight">
                        &ldquo;{activeInfo.past.exampleEn}&rdquo;
                      </p>
                      {!isExamMode && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          &rarr; {activeInfo.past.exampleEs}
                        </p>
                      )}
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                      <div className="flex items-center gap-1 font-bold text-emerald-700 dark:text-emerald-400 mb-0.5">
                        <Sparkles className="w-3 h-3" />
                        <span>Present ({activeInfo.present.form}):</span>
                      </div>
                      <p className="italic text-slate-800 dark:text-slate-200 leading-tight">
                        &ldquo;{activeInfo.present.exampleEn}&rdquo;
                      </p>
                      {!isExamMode && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          &rarr; {activeInfo.present.exampleEs}
                        </p>
                      )}
                    </div>

                    <div className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60">
                      <div className="flex items-center gap-1 font-bold text-amber-700 dark:text-amber-400 mb-0.5">
                        <ArrowRight className="w-3 h-3" />
                        <span>Future ({activeInfo.future.form}):</span>
                      </div>
                      <p className="italic text-slate-800 dark:text-slate-200 leading-tight">
                        &ldquo;{activeInfo.future.exampleEn}&rdquo;
                      </p>
                      {!isExamMode && (
                        <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                          &rarr; {activeInfo.future.exampleEs}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-2 text-[9px] text-center text-slate-400 dark:text-slate-500">
                    {isPinned ? "Toca fuera o la X para cerrar" : "Haz clic para fijar la ventana"}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 2. VERSIÓN CELULAR (< 640px): TARJETA FLOTANTE INFERIOR 100% ENCASILLADA EN PANTALLA */}
            <AnimatePresence>
              {isActive && activeInfo && (
                <>
                  <div
                    className="sm:hidden fixed inset-0 bg-black/40 backdrop-blur-xs z-50 pointer-events-auto"
                    onClick={closePopover}
                  />
                  <motion.div
                    ref={mobileSheetRef}
                    initial={{ opacity: 0, y: 50 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 50 }}
                    transition={{ duration: 0.2 }}
                    onClick={(e) => e.stopPropagation()}
                    className="sm:hidden fixed bottom-3 inset-x-3 max-w-sm mx-auto p-4 bg-white dark:bg-slate-900 rounded-3xl border-2 border-amber-400 dark:border-amber-600 shadow-2xl z-50 text-left pointer-events-auto select-text text-slate-800 dark:text-slate-100 font-sans max-h-[75vh] overflow-y-auto"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-amber-200 dark:border-slate-700 pb-2.5 mb-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="font-black text-lg text-[#6B4423] dark:text-amber-300 truncate">
                          {token}
                        </span>
                        {activeInfo.phonetic && (
                          <span className="text-xs text-amber-700 dark:text-amber-400/80 font-mono">
                            {activeInfo.phonetic}
                          </span>
                        )}
                        <button
                          type="button"
                          title="Escuchar pronunciación"
                          onClick={(e) => playPronunciation(e, token)}
                          className="p-1.5 rounded-lg bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 shrink-0"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60">
                          {activeInfo.partOfSpeech}
                        </span>
                        <button
                          type="button"
                          onClick={closePopover}
                          className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full bg-slate-100 dark:bg-slate-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Modo Examen o Traducción */}
                    {isExamMode ? (
                      <div className="mb-3 p-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800 text-xs text-red-900 dark:text-red-200 font-bold flex items-center gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                        <span>Modo Examen Oficial ALCPT: Traducción al español deshabilitada según norma USAF.</span>
                      </div>
                    ) : (
                      <div className="mb-3 bg-amber-50 dark:bg-slate-800/80 p-2.5 rounded-2xl border border-amber-200 dark:border-slate-700">
                        <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-400 block mb-0.5">
                          Traducción al Español:
                        </span>
                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                          {activeInfo.translation}
                        </p>
                      </div>
                    )}

                    {/* Tiempos Verbales */}
                    <div className="space-y-2 text-xs">
                      <span className="text-[10px] font-black uppercase tracking-wider text-[#A67B5B] dark:text-slate-400 block">
                        Tiempos Verbales (Pasado, Presente, Futuro):
                      </span>

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
                      className="mt-3 w-full py-2 bg-amber-500 hover:bg-amber-600 text-white font-black text-xs rounded-xl shadow-xs"
                    >
                      Cerrar Ventana
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </span>
        );
      })}
    </span>
  );
}
