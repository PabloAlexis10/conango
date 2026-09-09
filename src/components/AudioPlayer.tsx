"use client";

import React, { useState, useRef, useEffect } from "react";
import { Volume2, Play, Pause, RotateCcw, Mic, ChevronDown } from "lucide-react";
import { getAvailableHumanVoices, getBestHumanVoice, HumanVoiceOption } from "@/lib/audioVoice";
import CockpitAudioSimulator, { TacticalRadioAudioEngine } from "./CockpitAudioSimulator";
import ProSubscriptionModal from "./ProSubscriptionModal";
import { getCurrentUser, subscribeAuth } from "@/lib/supabase";
import { UserProfile } from "@/lib/types";

interface AudioPlayerProps {
  audioUrl?: string | null;
  textToSpeak?: string;
  context?: string;
  questionText?: string;
  autoPlay?: boolean;
  className?: string;
}

export default function AudioPlayer({
  audioUrl,
  textToSpeak,
  context,
  questionText,
  autoPlay = false,
  className = "",
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackStage, setPlaybackStage] = useState<"idle" | "context" | "pause" | "question">("idle");
  const [useSpeechFallback, setUseSpeechFallback] = useState(!audioUrl || audioUrl.trim() === "");
  const [availableVoices, setAvailableVoices] = useState<HumanVoiceOption[]>([]);
  const [selectedVoiceUri, setSelectedVoiceUri] = useState<string>("");
  const [showVoiceMenu, setShowVoiceMenu] = useState<boolean>(false);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isCockpitActive, setIsCockpitActive] = useState<boolean>(false);
  const [showProModal, setShowProModal] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setUser(getCurrentUser());
    const unsub = subscribeAuth((u) => setUser(u));
    if (typeof window !== "undefined") {
      setIsCockpitActive(localStorage.getItem("conango_cockpit_audio") === "true");
    }
    return () => unsub();
  }, []);

  const handleToggleCockpit = () => {
    const next = !isCockpitActive;
    setIsCockpitActive(next);
    if (typeof window !== "undefined") {
      localStorage.setItem("conango_cockpit_audio", next ? "true" : "false");
    }
    if (next) {
      TacticalRadioAudioEngine.playMicClickStart();
    }
  };

  // Cargar y descubrir voces humanas disponibles en el navegador
  useEffect(() => {
    const refreshVoices = () => {
      const list = getAvailableHumanVoices();
      setAvailableVoices(list);

      const saved = typeof window !== "undefined" ? localStorage.getItem("conango_preferred_voice") : null;
      if (saved && list.some((item) => item.voice.voiceURI === saved)) {
        setSelectedVoiceUri(saved);
      } else if (list.length > 0) {
        setSelectedVoiceUri(list[0].voice.voiceURI);
      }
    };

    refreshVoices();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.onvoiceschanged = refreshVoices;
    }
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    handleStop();
    if (!audioUrl || audioUrl.trim() === "") {
      setUseSpeechFallback(true);
    } else {
      setUseSpeechFallback(false);
    }
    return () => {
      handleStop();
    };
  }, [audioUrl, textToSpeak, context, questionText]);

  const handleSelectVoice = (uri: string) => {
    setSelectedVoiceUri(uri);
    setShowVoiceMenu(false);
    if (typeof window !== "undefined") {
      localStorage.setItem("conango_preferred_voice", uri);
      // Breve confirmación hablada para que el usuario escuche la calidad de la voz seleccionada
      if ("speechSynthesis" in window) {
        window.speechSynthesis.cancel();
        const testUtt = new SpeechSynthesisUtterance("Voice active. Ready for briefing.");
        const matched = availableVoices.find((v) => v.voice.voiceURI === uri);
        if (matched) testUtt.voice = matched.voice;
        testUtt.lang = "en-US";
        testUtt.rate = 0.96;
        window.speechSynthesis.speak(testUtt);
      }
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      handleStop();
    } else {
      handlePlay();
    }
  };

  const handlePlay = () => {
    if (isCockpitActive) {
      TacticalRadioAudioEngine.playMicClickStart();
    }
    if (!useSpeechFallback && audioUrl && audioRef.current) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
          setPlaybackStage("context");
        })
        .catch(() => {
          setUseSpeechFallback(true);
          playSpeechFallback();
        });
    } else {
      playSpeechFallback();
    }
  };

  const playSpeechFallback = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    if (pauseTimerRef.current) clearTimeout(pauseTimerRef.current);

    const activeVoice = getBestHumanVoice(selectedVoiceUri);

    let situationText = (context || "").trim();
    let qText = (questionText || "").trim();

    if (!situationText && textToSpeak) {
      if (qText && textToSpeak.includes(qText)) {
        situationText = textToSpeak.replace(qText, "").trim();
      } else {
        situationText = textToSpeak.trim();
      }
    }

    if (!qText && !situationText) {
      situationText = "Please listen carefully to the conversation.";
    }

    setIsPlaying(true);

    // Configuración de cadencia y modulación humana
    const configureConversationalUtterance = (text: string, isQuestion = false): SpeechSynthesisUtterance => {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "en-US";
      // Entonación humana natural: 1.02 en preguntas, velocidad 0.96 para dicción clara y fluida
      utt.pitch = isQuestion ? 1.02 : 1.0;
      utt.rate = 0.96;
      if (activeVoice) utt.voice = activeVoice;
      return utt;
    };

    if (!situationText || !qText) {
      const fullText = situationText || qText;
      const utterance = configureConversationalUtterance(fullText, false);

      setPlaybackStage("context");
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => {
        setIsPlaying(false);
        setPlaybackStage("idle");
      };
      utterance.onerror = () => {
        setIsPlaying(false);
        setPlaybackStage("idle");
      };
      window.speechSynthesis.speak(utterance);
      return;
    }

    // Paso 1: Escenario / Situación
    const contextUtterance = configureConversationalUtterance(situationText, false);
    setPlaybackStage("context");

    contextUtterance.onend = () => {
      setPlaybackStage("pause");

      pauseTimerRef.current = setTimeout(() => {
        // Paso 2: Pregunta
        setPlaybackStage("question");
        const questionUtterance = configureConversationalUtterance(`Question: ${qText}`, true);

        questionUtterance.onend = () => {
          setIsPlaying(false);
          setPlaybackStage("idle");
        };
        questionUtterance.onerror = () => {
          setIsPlaying(false);
          setPlaybackStage("idle");
        };

        window.speechSynthesis.speak(questionUtterance);
      }, 1200); // Pausa de respiración natural de 1.2s
    };

    contextUtterance.onerror = () => {
      setIsPlaying(false);
      setPlaybackStage("idle");
    };

    window.speechSynthesis.speak(contextUtterance);
  };

  const handleStop = () => {
    if (isCockpitActive && isPlaying) {
      TacticalRadioAudioEngine.playMicClickEnd();
    }
    if (pauseTimerRef.current) {
      clearTimeout(pauseTimerRef.current);
      pauseTimerRef.current = null;
    }
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
    setPlaybackStage("idle");
  };

  const handleReplay = () => {
    handleStop();
    setTimeout(() => handlePlay(), 180);
  };

  const currentVoiceOption = availableVoices.find((v) => v.voice.voiceURI === selectedVoiceUri) || availableVoices[0];
  const activeVoiceName = currentVoiceOption ? currentVoiceOption.displayName : "Voz Humana USAF";

  const getStatusText = () => {
    if (!isPlaying) return "Pista de audio (Inglés 🇺🇸)";
    switch (playbackStage) {
      case "context":
        return "🎧 Escuchando situación...";
      case "pause":
        return "⏸️ Pausa de reflexión...";
      case "question":
        return "❓ Escuchando pregunta...";
      default:
        return "Reproduciendo audio...";
    }
  };

  return (
    <div
      className={`p-3.5 bg-[#FAF6F0] dark:bg-slate-800/90 rounded-2xl border-2 border-[#E5D5C5] dark:border-slate-700 shadow-sm transition-all ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={togglePlay}
            className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all shadow-md btn-3d shrink-0 ${
              isPlaying
                ? playbackStage === "pause"
                  ? "bg-amber-600 shadow-[0_3px_0_0_#92400E]"
                  : "bg-[#D97706] shadow-[0_3px_0_0_#B45309]"
                : "bg-[#F59E0B] hover:bg-[#D97706] shadow-[0_4px_0_0_#D97706]"
            }`}
            title={isPlaying ? "Pausar audio" : "Reproducir audio"}
          >
            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Volume2
                className={`w-4 h-4 shrink-0 ${
                  isPlaying
                    ? playbackStage === "pause"
                      ? "text-amber-600 opacity-60"
                      : "text-[#F59E0B] animate-pulse"
                    : "text-[#A67B5B]"
                }`}
              />
              <span
                className={`text-xs font-bold tracking-wider truncate ${
                  playbackStage === "pause" ? "text-amber-700 animate-pulse" : "text-[#6B4423] dark:text-slate-200"
                }`}
              >
                {getStatusText()}
              </span>
            </div>
            <p className="text-[11px] text-[#A67B5B] dark:text-slate-400 truncate">
              {useSpeechFallback ? "Narración con voz humana natural (USAF)" : "Pista de audio grabada"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {/* Waveform visualizer */}
          <div className="hidden sm:flex items-center gap-1 px-2">
            {[40, 75, 55, 90, 60, 80, 45].map((height, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-all duration-200 ${
                  isPlaying
                    ? playbackStage === "pause"
                      ? "bg-[#E5D5C5] dark:bg-slate-700"
                      : "bg-[#F59E0B] animate-pulse"
                    : "bg-[#E5D5C5] dark:bg-slate-700"
                }`}
                style={{
                  height:
                    isPlaying && playbackStage !== "pause"
                      ? `${Math.max(12, height * (0.4 + ((i % 3) * 0.2)))}px`
                      : "12px",
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>

          <button
            type="button"
            onClick={handleReplay}
            className="p-2 text-[#A67B5B] hover:text-[#6B4423] dark:hover:text-slate-200 hover:bg-white dark:hover:bg-slate-700 rounded-lg transition-colors"
            title="Repetir audio"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Selector de Voz Humana */}
      {useSpeechFallback && availableVoices.length > 0 && (
        <div className="mt-2.5 pt-2.5 border-t border-[#E5D5C5]/70 dark:border-slate-700 flex items-center justify-between relative">
          <div className="flex items-center gap-1.5 text-[11px] text-[#8C6239] dark:text-slate-300 font-bold">
            <Mic className="w-3.5 h-3.5 text-[#F59E0B]" />
            <span>Voz del Instructor:</span>
          </div>

          <div className="relative">
            <button
              type="button"
              onClick={() => setShowVoiceMenu(!showVoiceMenu)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-white dark:bg-slate-900 border border-[#E5D5C5] dark:border-slate-700 rounded-xl text-[11px] font-extrabold text-[#6B4423] dark:text-amber-400 hover:border-[#F59E0B] shadow-2xs transition-colors"
              title="Cambiar voz humana"
            >
              <span className="truncate max-w-[180px]">{activeVoiceName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#A67B5B]" />
            </button>

            {showVoiceMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowVoiceMenu(false)}
                />
                <div className="absolute right-0 bottom-full mb-1.5 w-64 bg-white dark:bg-slate-900 border-2 border-amber-400 dark:border-amber-600 rounded-2xl shadow-xl z-50 p-1.5 max-h-48 overflow-y-auto">
                  <div className="text-[10px] font-black uppercase px-2 py-1 text-amber-800 dark:text-amber-400 border-b border-amber-100 dark:border-slate-800 mb-1">
                    Selecciona Voz Humana Natural:
                  </div>
                  {availableVoices.slice(0, 8).map((hv) => {
                    const isSelected = hv.voice.voiceURI === selectedVoiceUri;
                    return (
                      <button
                        key={hv.voice.voiceURI}
                        type="button"
                        onClick={() => handleSelectVoice(hv.voice.voiceURI)}
                        className={`w-full text-left px-2 py-1.5 rounded-lg text-[11px] font-semibold flex items-center justify-between transition-colors ${
                          isSelected
                            ? "bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 font-bold"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200"
                        }`}
                      >
                        <span className="truncate pr-1">{hv.displayName}</span>
                        {hv.isNeural && (
                          <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 rounded font-black shrink-0">
                            Neural
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Simulador de Radio Táctica de Cabina F-22 (Exclusivo PRO) */}
      <div className="mt-3">
        <CockpitAudioSimulator
          isPro={user?.isPro || false}
          isActive={isCockpitActive}
          onToggle={handleToggleCockpit}
          onLockedClick={() => setShowProModal(true)}
          isPlaying={isPlaying}
        />
      </div>

      {audioUrl && !useSpeechFallback && (
        <audio
          ref={audioRef}
          src={audioUrl}
          onEnded={() => {
            setIsPlaying(false);
            setPlaybackStage("idle");
          }}
          onError={() => setUseSpeechFallback(true)}
        />
      )}

      {/* Modal de Suscripción PRO si el cadete toca una función bloqueada */}
      <ProSubscriptionModal
        isOpen={showProModal}
        onClose={() => setShowProModal(false)}
        onSuccess={() => {
          setShowProModal(false);
          setUser(getCurrentUser());
        }}
      />
    </div>
  );
}
