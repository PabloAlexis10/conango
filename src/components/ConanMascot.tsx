"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Award } from "lucide-react";
import { getCurrentUser, subscribeAuth } from "@/lib/supabase";

interface ConanMascotProps {
  mood?: "happy" | "sad" | "thinking" | "celebrate" | "graduate";
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  accessory?: string | null; // e.g. "sunglasses", "crown", "beret", "grad_hat", "headphones", "scarf", "pilot_goggles"
  className?: string;
  animate?: boolean;
}

const sizeMap = {
  sm: "w-10 h-10",
  md: "w-16 h-16",
  lg: "w-28 h-28",
  xl: "w-40 h-40",
  hero: "w-56 h-56 md:w-64 md:h-64",
};

const emojiSizeMap = {
  sm: "text-xs",
  md: "text-base",
  lg: "text-2xl",
  xl: "text-3xl",
  hero: "text-5xl",
};

export default function ConanMascot({
  mood = "happy",
  size = "md",
  accessory,
  className = "",
  animate = true,
}: ConanMascotProps) {
  const [imageError, setImageError] = useState(false);
  const [equippedAccessory, setEquippedAccessory] = useState<string | null>(accessory ?? null);

  useEffect(() => {
    if (accessory !== undefined) {
      setEquippedAccessory(accessory);
      return;
    }
    const cur = getCurrentUser();
    setEquippedAccessory(cur?.activeAccessory || null);

    const unsubscribe = subscribeAuth((u) => {
      if (accessory === undefined) {
        setEquippedAccessory(u?.activeAccessory || null);
      }
    });
    return () => unsubscribe();
  }, [accessory]);

  const isSad = mood === "sad";
  const isThinking = mood === "thinking";
  const isCelebrate = mood === "celebrate";
  const isGraduate = mood === "graduate";

  const emSize = emojiSizeMap[size] || "text-base";

  return (
    <motion.div
      className={`relative inline-block select-none ${sizeMap[size]} ${className}`}
      animate={
        animate
          ? isCelebrate
            ? { y: [0, -10, 0, -6, 0], scale: [1, 1.04, 1] }
            : isSad
            ? { y: [0, 3, 0], rotate: [-2, 1, -2] }
            : isThinking
            ? { rotate: [-3, 3, -3] }
            : { y: [0, -4, 0] }
          : undefined
      }
      transition={{
        duration: isCelebrate ? 1.4 : 3.2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    >
      <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#E5D5C5] shadow-conan-card bg-gradient-to-b from-[#FAF6F0] to-white flex items-center justify-center">
        {!imageError ? (
          <Image
            src="/conan-mascot.png"
            alt="Conan el Husky Siberiano"
            fill
            sizes="(max-width: 768px) 100vw, 300px"
            className={`object-cover object-top transition-all duration-300 ${
              isSad ? "grayscale-[35%] brightness-90" : "brightness-100"
            }`}
            onError={() => setImageError(true)}
            priority
          />
        ) : (
          /* Fallback SVG if image is loading or fails */
          <svg viewBox="0 0 240 240" fill="none" className="w-full h-full p-1">
            <circle cx="120" cy="120" r="100" fill="#FAF6F0" />
            <path d="M65 110 L45 35 Q85 45 95 90 Z" fill="#B38054" stroke="#6B4423" strokeWidth="4" />
            <path d="M175 110 L195 35 Q155 45 145 90 Z" fill="#B38054" stroke="#6B4423" strokeWidth="4" />
            <path d="M55 130 C50 85 70 65 120 65 C170 65 190 85 185 130 C180 170 160 185 120 185 C80 185 60 170 55 130 Z" fill="#C49A6C" stroke="#6B4423" strokeWidth="4" />
            <path d="M120 75 Q100 100 80 115 C70 125 75 160 95 170 C105 175 135 175 145 170 C165 160 170 125 160 115 Q140 100 120 75 Z" fill="#FFFFFF" />
            <ellipse cx="98" cy="122" rx="10" ry="12" fill="#3B2314" />
            <ellipse cx="142" cy="122" rx="10" ry="12" fill="#3B2314" />
            <path d="M106 142 Q120 136 134 142 Q120 156 106 142 Z" fill="#3B2314" />
          </svg>
        )}

        {/* ACCESSORY OVERLAYS */}
        {equippedAccessory === "sunglasses" && (
          <span className={`absolute top-[32%] left-1/2 -translate-x-1/2 ${emSize} filter drop-shadow-md select-none pointer-events-none`}>
            🕶️
          </span>
        )}
        {equippedAccessory === "crown" && (
          <span className={`absolute -top-1 left-1/2 -translate-x-1/2 ${emSize} filter drop-shadow-md select-none pointer-events-none animate-bounce`}>
            👑
          </span>
        )}
        {equippedAccessory === "beret" && (
          <span className={`absolute -top-0.5 left-[34%] -translate-x-1/2 ${emSize} filter drop-shadow-md select-none pointer-events-none rotate-[-12deg]`}>
            🎖️
          </span>
        )}
        {equippedAccessory === "grad_hat" && (
          <span className={`absolute -top-1 left-1/2 -translate-x-1/2 ${emSize} filter drop-shadow-md select-none pointer-events-none`}>
            🎓
          </span>
        )}
        {equippedAccessory === "headphones" && (
          <span className={`absolute top-[24%] left-1/2 -translate-x-1/2 ${emSize} filter drop-shadow-md select-none pointer-events-none scale-110`}>
            🎧
          </span>
        )}
        {equippedAccessory === "scarf" && (
          <span className={`absolute bottom-[4%] left-1/2 -translate-x-1/2 ${emSize} filter drop-shadow-md select-none pointer-events-none`}>
            🧣
          </span>
        )}
        {equippedAccessory === "pilot_goggles" && (
          <span className={`absolute top-[16%] left-1/2 -translate-x-1/2 ${emSize} filter drop-shadow-md select-none pointer-events-none`}>
            🥽
          </span>
        )}

        {/* Dynamic Badges / Overlays */}
        {isCelebrate && (
          <div className="absolute top-1 right-1 bg-amber-400 text-amber-950 p-1 rounded-full shadow-md animate-bounce">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        )}

        {isGraduate && (
          <div className="absolute bottom-1 right-1 bg-[#F59E0B] text-white p-1 rounded-full shadow-md border-2 border-white">
            <Award className="w-4 h-4" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
