"use client";

import React, { useState, useRef, useEffect } from "react";
import { Volume2, VolumeX, Play, Pause, RotateCcw } from "lucide-react";

interface AudioPlayerProps {
  audioUrl?: string | null;
  textToSpeak?: string;
  autoPlay?: boolean;
  className?: string;
}

export default function AudioPlayer({
  audioUrl,
  textToSpeak,
  autoPlay = false,
  className = "",
}: AudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [useSpeechFallback, setUseSpeechFallback] = useState(!audioUrl || audioUrl.trim() === "");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setIsPlaying(false);
    if (!audioUrl || audioUrl.trim() === "") {
      setUseSpeechFallback(true);
    } else {
      setUseSpeechFallback(false);
    }
  }, [audioUrl, textToSpeak]);

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
        .then(() => setIsPlaying(true))
        .catch(() => {
          // If network audio fails, gracefully fallback to browser SpeechSynthesis
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

    const utteranceText = textToSpeak || "Please listen carefully to the question options.";
    const utterance = new SpeechSynthesisUtterance(utteranceText);
    utterance.lang = "en-US";
    utterance.rate = 0.92; // Clear military ALCPT pace

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
    }
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlaying(false);
  };

  const handleReplay = () => {
    handleStop();
    setTimeout(() => handlePlay(), 150);
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
              ? "bg-[#D97706] shadow-[0_3px_0_0_#B45309]"
              : "bg-[#F59E0B] hover:bg-[#D97706] shadow-[0_4px_0_0_#D97706]"
          }`}
          title={isPlaying ? "Pausar audio" : "Reproducir audio"}
        >
          {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
        </button>

        <div>
          <div className="flex items-center gap-2">
            <Volume2 className={`w-4 h-4 ${isPlaying ? "text-[#F59E0B] animate-pulse" : "text-[#A67B5B]"}`} />
            <span className="text-xs font-bold uppercase tracking-wider text-[#6B4423]">
              {isPlaying ? "Reproduciendo audio..." : "Pista de audio (ALCPT)"}
            </span>
          </div>
          <p className="text-xs text-[#A67B5B]">
            {useSpeechFallback ? "Voz digital en inglés (US)" : "Audio original grabado"}
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
                ? "bg-[#F59E0B] animate-pulse"
                : "bg-[#E5D5C5]"
            }`}
            style={{
              height: isPlaying ? `${Math.max(12, height * (0.4 + ((i % 3) * 0.2)))}px` : "12px",
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
          onEnded={() => setIsPlaying(false)}
          onError={() => setUseSpeechFallback(true)}
        />
      )}
    </div>
  );
}
