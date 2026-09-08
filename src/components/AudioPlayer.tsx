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

// Find high-quality conversational American English voice in browser
function getConversationalUSVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const usVoices = voices.filter(
    (v) => v.lang === "en-US" || v.lang === "en_US" || v.lang.startsWith("en-US")
  );

  // 1. Prioritize modern natural/neural conversational voices
  const naturalMale = usVoices.find(
    (v) =>
      (v.name.includes("Natural") || v.name.includes("Online") || v.name.includes("Google")) &&
      (v.name.toLowerCase().includes("guy") ||
        v.name.toLowerCase().includes("christopher") ||
        v.name.toLowerCase().includes("david") ||
        v.name.toLowerCase().includes("male") ||
        v.name.toLowerCase().includes("google us english"))
  );
  if (naturalMale) return naturalMale;

  // 2. Any natural/neural US voice (Jenny, Aria, etc. which sound remarkably human)
  const anyNatural = usVoices.find(
    (v) => v.name.includes("Natural") || v.name.includes("Online") || v.name.includes("Google")
  );
  if (anyNatural) return anyNatural;

  // 3. Known pleasant conversational voices on Windows / Apple
  const conversationalNames = ["guy", "christopher", "david", "samantha", "alex", "daniel", "tom"];
  for (const name of conversationalNames) {
    const match = usVoices.find((v) => v.name.toLowerCase().includes(name));
    if (match) return match;
  }

  // 4. Any en-US voice
  if (usVoices.length > 0) return usVoices[0];

  return voices.find((v) => v.lang.startsWith("en")) || null;
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

    const voice = getConversationalUSVoice();

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

    // Helper to configure warm, natural conversational voice
    const configureConversationalUtterance = (text: string, isQuestion = false): SpeechSynthesisUtterance => {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "en-US";
      // Natural human conversational settings
      utt.pitch = isQuestion ? 1.02 : 1.0;
      utt.rate = 0.92; // Natural, unhurried human pacing
      if (voice) utt.voice = voice;
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

    // Step 1: Speak context in natural conversational tone
    const contextUtterance = configureConversationalUtterance(situationText, false);
    setPlaybackStage("context");

    contextUtterance.onend = () => {
      setPlaybackStage("pause");

      pauseTimerRef.current = setTimeout(() => {
        // Step 2: Speak question after natural pause
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
      }, 1300); // Natural 1.3-second conversational pause
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
            {useSpeechFallback ? "Voz humana nativa conversacional (Inglés 🇺🇸)" : "Audio grabado"}
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
