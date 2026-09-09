"use client";

import React, { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { getWordGrammarInfo, fetchWordTranslationAsync, WordGrammarInfo } from "@/lib/wordDictionary";
import { speakHumanText } from "@/lib/audioVoice";
import { Volume2, X, ShieldAlert } from "lucide-react";
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

                {/* Tarjeta Flotante Única y Ultra Compacta */}
                <motion.div
                  ref={popoverRef}
                  initial={{ opacity: 0, y: 15, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: "easeOut" }}
                  onClick={(e) => e.stopPropagation()}
                  className="fixed bottom-4 inset-x-4 sm:bottom-6 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 w-auto sm:min-w-[280px] max-w-sm px-4 py-3 bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-400 dark:border-amber-600 shadow-2xl z-[9999] text-left pointer-events-auto select-text text-slate-800 dark:text-slate-100 font-sans"
                >
                  {/* Encabezado: Palabra, Fonética, Audio y Botón Cerrar */}
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-black text-base sm:text-lg text-[#6B4423] dark:text-amber-300 truncate">
                        {activeInfo.cleanWord}
                      </span>
                      {activeInfo.phonetic && (
                        <span className="text-xs text-amber-700 dark:text-amber-400 font-mono">
                          {activeInfo.phonetic}
                        </span>
                      )}
                      <button
                        type="button"
                        title="Escuchar pronunciación"
                        onClick={(e) => playPronunciation(e, activeInfo.cleanWord)}
                        className="p-1 rounded-lg bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-slate-700 transition-colors shrink-0"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {activeInfo.partOfSpeech && (
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-300 border border-amber-300/60 dark:border-amber-700/60">
                          {activeInfo.partOfSpeech}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={closePopover}
                        className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        title="Cerrar"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Traducción al Español (Directa, limpia y sin textos largos) */}
                  {isExamMode ? (
                    <div className="mt-2 text-xs text-red-600 dark:text-red-400 font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
                      <span>Modo Examen: Traducción bloqueada según normativa USAF.</span>
                    </div>
                  ) : (
                    <div className="mt-2 pt-2 border-t border-amber-200/70 dark:border-slate-800 flex items-baseline gap-2">
                      <span className="text-[10px] font-black tracking-wider text-amber-800 dark:text-amber-400 uppercase">
                        Traducción:
                      </span>
                      <span className="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                        {activeInfo.translation}
                      </span>
                    </div>
                  )}
                </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}
