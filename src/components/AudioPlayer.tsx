"use client";

import React, { useState, useRef, useEffect } from "react";
import { Volume2, Play, Pause, RotateCcw } from "lucide-react";

interface AudioPlayerProps {
  audioUrl?: string | null;
  textToSpeak?: string;
  context?: string;
  questionText?: string;
  autoPlay?: boolean;
  className?: string;
}

// Find best natural American English voice available in browser
function getBestNaturalUSVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // Search hierarchy for highest-quality natural en-US voices
  const usVoices = voices.filter(
    (v) => v.lang === "en-US" || v.lang === "en_US" || v.lang.startsWith("en-US")
  );

  // 1. Look for modern neural/natural voices
  const naturalVoice = usVoices.find(
    (v) =>
      v.name.includes("Natural") ||
      v.name.includes("Google US English") ||
      v.name.includes("Jenny") ||
      v.name.includes("Guy") ||
      v.name.includes("Aria") ||
      v.name.includes("Samantha")
  );
  if (naturalVoice) return naturalVoice;

  // 2. Any en-US voice
  if (usVoices.length > 0) return usVoices[0];

  // 3. Fallback to any English voice
  const anyEnglish = voices.find((v) => v.lang.startsWith("en"));
  return anyEnglish || null;
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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pauseTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Stop everything on change
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

  const togglePlay = () => {
    if (isPlaying) {
      handleStop();
    } else {
      handlePlay();
    }
  };

  const handlePlay = () => {
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

    const bestVoice = getBestNaturalUSVoice();

    // Determine context and question parts
    let situationText = (context || "").trim();
    let qText = (questionText || "").trim();

    if (!situationText && textToSpeak) {
      // If questionText exists, strip it from textToSpeak to get context
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

    // If there is only one part (no question or no context), speak single utterance
    if (!situationText || !qText) {
      const fullText = situationText || qText;
      const utterance = new SpeechSynthesisUtterance(fullText);
      utterance.lang = "en-US";
      utterance.rate = 0.93; // Relaxed, human cadence
      utterance.pitch = 1.0;
      if (bestVoice) utterance.voice = bestVoice;

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

    // Two-stage playback: Stage 1 = Context -> Pause (1.4s) -> Stage 2 = Question
    const contextUtterance = new SpeechSynthesisUtterance(situationText);
    contextUtterance.lang = "en-US";
    contextUtterance.rate = 0.93;
    contextUtterance.pitch = 1.0;
    if (bestVoice) contextUtterance.voice = bestVoice;

    setPlaybackStage("context");

    contextUtterance.onend = () => {
      // Entering pause phase
      setPlaybackStage("pause");

      pauseTimerRef.current = setTimeout(() => {
        // Stage 2: Question
        setPlaybackStage("question");
        const questionUtterance = new SpeechSynthesisUtterance(`Question: ${qText}`);
        questionUtterance.lang = "en-US";
        questionUtterance.rate = 0.92;
        questionUtterance.pitch = 1.02; // Slight inflection for question
        if (bestVoice) questionUtterance.voice = bestVoice;

        questionUtterance.onend = () => {
          setIsPlaying(false);
          setPlaybackStage("idle");
        };
        questionUtterance.onerror = () => {
          setIsPlaying(false);
          setPlaybackStage("idle");
        };

        window.speechSynthesis.speak(questionUtterance);
      }, 1400); // 1.4-second natural pause
    };

    contextUtterance.onerror = () => {
      setIsPlaying(false);
      setPlaybackStage("idle");
    };

    window.speechSynthesis.speak(contextUtterance);
  };

  const handleStop = () => {
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

  const getStatusText = () => {
    if (!isPlaying) return "Pista de audio (Inglés Estadounidense 🇺🇸)";
    switch (playbackStage) {
      case "context":
        return "🎧 Escuchando situación...";
      case "pause":
        return "⏸️ Pausa de reflexión (1.4s)...";
      case "question":
        return "❓ Escuchando pregunta...";
      default:
        return "Reproduciendo audio...";
    }
  };

  return (
    <div
      className={`flex items-center justify-between p-3.5 bg-[#FAF6F0] rounded-2xl border-2 border-[#E5D5C5] shadow-sm ${className}`}
    >
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={togglePlay}
          className={`w-12 h-12 rounded-xl flex items-center justify-center text-white transition-all shadow-md btn-3d ${
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

        <div>
          <div className="flex items-center gap-2">
            <Volume2
              className={`w-4 h-4 ${
                isPlaying
                  ? playbackStage === "pause"
                    ? "text-amber-600 opacity-60"
                    : "text-[#F59E0B] animate-pulse"
                  : "text-[#A67B5B]"
              }`}
            />
            <span
              className={`text-xs font-bold tracking-wider ${
                playbackStage === "pause" ? "text-amber-700 animate-pulse" : "text-[#6B4423]"
              }`}
            >
              {getStatusText()}
            </span>
          </div>
          <p className="text-xs text-[#A67B5B]">
            {useSpeechFallback ? "Voz humanizada en inglés estadounidense (US)" : "Audio original grabado"}
          </p>
        </div>
      </div>

      {/* Waveform graphic bars */}
      <div className="flex items-center gap-1 px-3">
        {[40, 75, 55, 90, 60, 80, 45].map((height, i) => (
          <div
            key={i}
            className={`w-1 rounded-full transition-all duration-200 ${
              isPlaying
                ? playbackStage === "pause"
                  ? "bg-[#E5D5C5]"
                  : "bg-[#F59E0B] animate-pulse"
                : "bg-[#E5D5C5]"
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
        className="p-2 text-[#A67B5B] hover:text-[#6B4423] hover:bg-white rounded-lg transition-colors"
        title="Repetir audio"
      >
        <RotateCcw className="w-5 h-5" />
      </button>

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
    </div>
  );
}
