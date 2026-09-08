"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Award } from "lucide-react";
import { getCurrentUser, subscribeAuth } from "@/lib/supabase";

interface ConanMascotProps {
  mood?: "happy" | "sad" | "thinking" | "celebrate" | "graduate";
  size?: "sm" | "md" | "lg" | "xl" | "hero";
  accessory?: string | null;
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
            ? { y: [0, -8, 0, -5, 0], scale: [1, 1.03, 1] }
            : isSad
            ? { y: [0, 3, 0], rotate: [-1, 1, -1] }
            : isThinking
            ? { rotate: [-2, 2, -2] }
            : { y: [0, -3, 0] }
          : undefined
      }
      transition={{
        duration: isCelebrate ? 1.4 : 3.2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut",
      }}
    >
      {/* Outer wrapper allowing hats/crowns to protrude naturally */}
      <div className="relative w-full h-full">
        {/* Circular portrait frame with realistic husky */}
        <div className="w-full h-full rounded-full overflow-hidden border-4 border-[#E5D5C5] shadow-conan-card bg-gradient-to-b from-[#FAF6F0] to-[#E5D5C5]/40 flex items-center justify-center">
          {!imageError ? (
            <Image
              src="/conan-mascot.png"
              alt="Conan el Husky Militar"
              fill
              sizes="(max-width: 768px) 100vw, 350px"
              className={`object-cover object-center transition-all duration-300 ${
                isSad ? "grayscale-[30%] brightness-90" : "brightness-100"
              }`}
              onError={() => setImageError(true)}
              priority
            />
          ) : (
            <div className="text-4xl">🐺</div>
          )}
        </div>

        {/* ACCESSORY OVERLAYS (Positioned precisely over realistic facial features) */}
        {equippedAccessory === "sunglasses" && (
          <span className={`absolute top-[34%] left-1/2 -translate-x-1/2 ${emSize} filter drop-shadow-lg select-none pointer-events-none z-20`}>
            🕶️
          </span>
        )}
        {equippedAccessory === "crown" && (
          <span className={`absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2 ${emSize} filter drop-shadow-lg select-none pointer-events-none animate-bounce z-20`}>
            👑
          </span>
        )}
        {equippedAccessory === "beret" && (
          <span className={`absolute -top-1 sm:-top-2 left-[30%] -translate-x-1/2 ${emSize} filter drop-shadow-lg select-none pointer-events-none rotate-[-15deg] z-20`}>
            🎖️
          </span>
        )}
        {equippedAccessory === "grad_hat" && (
          <span className={`absolute -top-2.5 sm:-top-3.5 left-1/2 -translate-x-1/2 ${emSize} filter drop-shadow-lg select-none pointer-events-none z-20`}>
            🎓
          </span>
        )}
        {equippedAccessory === "headphones" && (
          <span className={`absolute top-[18%] left-1/2 -translate-x-1/2 ${emSize} filter drop-shadow-lg select-none pointer-events-none scale-125 z-20`}>
            🎧
          </span>
        )}
        {equippedAccessory === "scarf" && (
          <span className={`absolute bottom-[4%] left-1/2 -translate-x-1/2 ${emSize} filter drop-shadow-lg select-none pointer-events-none z-20`}>
            🧣
          </span>
        )}
        {equippedAccessory === "pilot_goggles" && (
          <span className={`absolute top-[20%] left-1/2 -translate-x-1/2 ${emSize} filter drop-shadow-lg select-none pointer-events-none z-20`}>
            🥽
          </span>
        )}

        {/* Dynamic Badges / Overlays */}
        {isCelebrate && (
          <div className="absolute top-0 right-0 bg-amber-400 text-amber-950 p-1.5 rounded-full shadow-md animate-bounce z-20">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        )}

        {isGraduate && (
          <div className="absolute bottom-0 right-0 bg-[#F59E0B] text-white p-1.5 rounded-full shadow-md border-2 border-white z-20">
            <Award className="w-4 h-4" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
