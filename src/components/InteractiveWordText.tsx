"use client";

import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { speakHumanText } from "@/lib/audioVoice";
import { Volume2, X, Languages, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface InteractiveWordTextProps {
  text: string;
  className?: string;
  interactive?: boolean;
  isExamMode?: boolean;
}

// Caché en memoria para traducciones de oraciones completas
const SENTENCE_CACHE = new Map<string, string>();

// Frases y estructuras recurrentes oficiales de exámenes ALCPT
const PRESET_SENTENCE_TRANSLATIONS: Record<string, string> = {
  "what did the student mean?": "¿Qué quiso decir el estudiante?",
  "what did the man say?": "¿Qué dijo el hombre?",
  "what did the woman say?": "¿Qué dijo la mujer?",
  "what did the speaker say?": "¿Qué dijo el hablante?",
  "what does the speaker mean?": "¿Qué quiere decir el hablante?",
  "what are they talking about?": "¿De qué están hablando?",
  "where are they going?": "¿A dónde van?",
  "what will happen next?": "¿Qué sucederá a continuación?",
  "what will they do?": "¿Qué harán ellos?",
  "choose the correct sentence.": "Elige la oración gramaticalmente correcta.",
  "select the best answer.": "Selecciona la mejor respuesta.",
  "which sentence is correct?": "¿Cuál oración es correcta?",
  "listen to the audio and answer the question.": "Escucha el audio y responde la pregunta.",
  "what is the main idea?": "¿Cuál es la idea principal?",
  "he will go": "Él irá.",
  "he can't go": "Él no puede ir.",
  "he finished his studies": "Él terminó sus estudios.",
  "he likes to study": "A él le gusta estudiar.",
  "they will fly": "Ellos volarán.",
  "at the barracks": "En el cuartel / barracas.",
  "any time after 6:00": "En cualquier momento después de las 6:00.",
  "the most courageously": "Con el mayor valor / el más valientemente.",
  "a kind of fruit": "Un tipo de fruta (dátil).",
  "a social engagement": "Un compromiso social / una cita.",
  "walk": "Caminar.",
  "walking": "Caminar / el acto de caminar.",
  "i must stay here": "Debo quedarme aquí.",
  "i'll stay here": "Me quedaré aquí.",
  "the slowest of the three": "El más lento de los tres.",
  "cultivated": "Cultivado / trabajado.",
  "where they belong": "Donde corresponden.",
  "when they belong": "Cuando corresponden.",
  "was saw": "Fue visto.",
  "was seen": "Fue visto.",
  "cleaned and pressed": "Limpio y planchado.",
  "to clean and to press": "Limpiar y planchar.",
};

// Generar una clave segura para localStorage
function getSentenceHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return `trans_sent_${Math.abs(hash)}`;
}

export default function InteractiveWordText({
  text,
  className = "",
  interactive = true,
  isExamMode = false,
}: InteractiveWordTextProps) {
  const [isHovered, setIsHovered] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [translation, setTranslation] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const cleanText = (text || "").trim();

  // En modo examen real, devolver texto puro sin traducción ni tooltips
  if (!interactive || isExamMode || !cleanText) {
    return <span className={className}>{text}</span>;
  }

  const lookupTranslation = async (sentence: string) => {
    const lower = sentence.toLowerCase().trim();

    // 1. Diccionario ALCPT predeterminado
    if (PRESET_SENTENCE_TRANSLATIONS[lower]) {
      setTranslation(PRESET_SENTENCE_TRANSLATIONS[lower]);
      return;
    }

    // 2. Caché en memoria
    if (SENTENCE_CACHE.has(lower)) {
      setTranslation(SENTENCE_CACHE.get(lower)!);
      return;
    }

    // 3. Caché en localStorage
    if (typeof window !== "undefined") {
      const cached = localStorage.getItem(getSentenceHash(lower));
      if (cached) {
        SENTENCE_CACHE.set(lower, cached);
        setTranslation(cached);
        return;
      }
    }

    // 4. Consulta a Google Translate GTX (alta velocidad)
    setLoading(true);
    try {
      const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=es&dt=t&q=${encodeURIComponent(
        sentence
      )}`;
      const res = await fetch(gtxUrl, { signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && Array.isArray(data[0])) {
          const trans = data[0].map((c: any) => c[0]).join("").trim();
          if (trans && trans.toLowerCase() !== lower) {
            SENTENCE_CACHE.set(lower, trans);
            if (typeof window !== "undefined") {
              localStorage.setItem(getSentenceHash(lower), trans);
            }
            setTranslation(trans);
            setLoading(false);
            return;
          }
        }
      }
    } catch {
      // Fallback a MyMemory
    }

    // 5. Fallback con MyMemory
    try {
      const myMemoryUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        sentence
      )}&langpair=en|es`;
      const res = await fetch(myMemoryUrl, { signal: AbortSignal.timeout(3500) });
      if (res.ok) {
        const data = await res.json();
        const trans = data.responseData?.translatedText;
        if (trans && trans.toLowerCase() !== lower) {
          SENTENCE_CACHE.set(lower, trans);
          if (typeof window !== "undefined") {
            localStorage.setItem(getSentenceHash(lower), trans);
          }
          setTranslation(trans);
          setLoading(false);
          return;
        }
      }
    } catch {}

    setLoading(false);
    setTranslation(sentence);
  };

  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
    lookupTranslation(cleanText);
  };

  const handleMouseLeave = () => {
    hoverTimeoutRef.current = setTimeout(() => {
      setIsHovered(false);
    }, 250);
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen((prev) => !prev);
    if (!isOpen) {
      lookupTranslation(cleanText);
    }
  };

  const handleSpeak = (e: React.MouseEvent) => {
    e.stopPropagation();
    speakHumanText(cleanText, { rate: 0.9 });
  };

  const showCard = (isHovered || isOpen) && !isExamMode;

  return (
    <>
      <span
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
        className={`inline cursor-help transition-all rounded px-0.5 select-text hover:bg-amber-100/70 dark:hover:bg-amber-950/40 underline decoration-dotted decoration-amber-400/80 dark:decoration-amber-500/80 underline-offset-4 ${className}`}
        title="Pasa el cursor o toca para ver la traducción de la oración completa"
      >
        {text}
      </span>

      {/* Tarjeta Flotante con la Traducción Contextual Completa */}
      {mounted &&
        typeof document !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {showCard && (
              <motion.div
                initial={{ opacity: 0, y: 12, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.96 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                onMouseEnter={() => {
                  if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
                  setIsHovered(true);
                }}
                onMouseLeave={handleMouseLeave}
                onClick={(e) => e.stopPropagation()}
                className="fixed bottom-5 inset-x-4 sm:bottom-6 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 w-auto sm:min-w-[340px] max-w-lg p-3.5 sm:p-4 bg-white dark:bg-slate-900 rounded-2xl border-2 border-amber-400 dark:border-amber-600 shadow-2xl z-[9999] text-left pointer-events-auto select-text text-slate-800 dark:text-slate-100 font-sans"
              >
                {/* Cabecera Táctica del Tooltip */}
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="flex items-center gap-1.5 text-xs font-black uppercase tracking-wider text-amber-800 dark:text-amber-400">
                    <Languages className="w-4 h-4 text-amber-500" />
                    <span>Traducción Contextual (Oración Completa)</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={handleSpeak}
                      title="Escuchar pronunciación en inglés"
                      className="p-1 rounded-lg bg-amber-100 dark:bg-slate-800 text-amber-800 dark:text-amber-300 hover:bg-amber-200 dark:hover:bg-slate-700 transition-colors"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsOpen(false);
                        setIsHovered(false);
                      }}
                      title="Cerrar traducción"
                      className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Frase Original en Inglés */}
                <div className="text-xs text-slate-500 dark:text-slate-400 italic mb-1.5 line-clamp-2">
                  &ldquo;{cleanText}&rdquo;
                </div>

                {/* Traducción al Español */}
                <div className="pt-2 border-t border-amber-200/80 dark:border-slate-800 flex items-start gap-2">
                  <span className="text-sm shrink-0">🇪🇸</span>
                  {loading ? (
                    <span className="text-xs font-bold text-amber-700 dark:text-amber-300 animate-pulse flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      Traduciendo oración completa...
                    </span>
                  ) : (
                    <p className="text-sm sm:text-base font-black text-slate-900 dark:text-white leading-snug">
                      {translation || cleanText}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </>
  );
}

// Exportar alias para consistencia
export { InteractiveWordText as InteractiveSentenceText };

