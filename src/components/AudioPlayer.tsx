"use client";

import React, { useState, useRef, useEffect } from "react";
import { Volume2, Play, Pause, RotateCcw, Radio } from "lucide-react";

interface AudioPlayerProps {
  audioUrl?: string | null;
  textToSpeak?: string;
  context?: string;
  questionText?: string;
  autoPlay?: boolean;
  className?: string;
}

// Find native American English male voice in browser
function getRoboticUSMaleVoice(): SpeechSynthesisVoice | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;
  const voices = window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  const usVoices = voices.filter(
    (v) => v.lang === "en-US" || v.lang === "en_US" || v.lang.startsWith("en-US")
  );

  // 1. Search for known native US male voices (David is the standard Windows robotic male voice)
  const maleKeywords = ["david", "guy", "christopher", "mark", "george", "james", "eric", "male", "google us english"];
  const usMale = usVoices.find((v) => {
    const nameLower = v.name.toLowerCase();
    return maleKeywords.some((k) => nameLower.includes(k));
  });
  if (usMale) return usMale;

  // 2. Any voice containing "David"
  const david = voices.find((v) => v.name.toLowerCase().includes("david"));
  if (david) return david;

  // 3. Fallback to any en-US voice
  if (usVoices.length > 0) return usVoices[0];

  return voices.find((v) => v.lang.startsWith("en")) || null;
}

// Synthesize short tactical radio mic-click / squelch sound
function playRadioChirp(type: "start" | "end") {
  try {
    if (typeof window === "undefined") return;
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    if (type === "start") {
      // Short dual-tone radio transmission click
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.exponentialRampToValueAtTime(1760, now + 0.04);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.12, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.06);
    } else {
      // Roger squelch burst
      osc.type = "triangle";
      osc.frequency.setValueAtTime(1400, now);
      osc.frequency.exponentialRampToValueAtTime(700, now + 0.05);

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.1, now + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    }
  } catch {}
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

    const maleVoice = getRoboticUSMaleVoice();

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

    // Initial radio transmission chirp
    playRadioChirp("start");

    // Helper to configure robotic US male voice
    const configureRoboticUtterance = (text: string): SpeechSynthesisUtterance => {
      const utt = new SpeechSynthesisUtterance(text);
      utt.lang = "en-US";
      // Slightly lower, flat pitch for robotic cadence
      utt.pitch = 0.82;
      utt.rate = 0.94;
      if (maleVoice) utt.voice = maleVoice;
      return utt;
    };

    if (!situationText || !qText) {
      const fullText = situationText || qText;
      const utterance = configureRoboticUtterance(fullText);

      setPlaybackStage("context");
      utterance.onstart = () => setIsPlaying(true);
      utterance.onend = () => {
        playRadioChirp("end");
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

    // Step 1: Speak context
    const contextUtterance = configureRoboticUtterance(situationText);
    setPlaybackStage("context");

    contextUtterance.onend = () => {
      playRadioChirp("end");
      setPlaybackStage("pause");

      pauseTimerRef.current = setTimeout(() => {
        // Step 2: Speak question after pause
        playRadioChirp("start");
        setPlaybackStage("question");
        const questionUtterance = configureRoboticUtterance(`Question: ${qText}`);

        questionUtterance.onend = () => {
          playRadioChirp("end");
          setIsPlaying(false);
          setPlaybackStage("idle");
        };
        questionUtterance.onerror = () => {
          setIsPlaying(false);
          setPlaybackStage("idle");
        };

        window.speechSynthesis.speak(questionUtterance);
      }, 1400); // 1.4-second pause
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
        return "🎧 Transmisión de situación...";
      case "pause":
        return "⏸️ Pausa de reflexión (1.4s)...";
      case "question":
        return "❓ Pregunta...";
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
            {useSpeechFallback ? "Voz masculina nativa robotizada (Inglés 🇺🇸)" : "Audio grabado"}
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
