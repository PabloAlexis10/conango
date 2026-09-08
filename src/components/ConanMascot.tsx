"use client";

import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { Sparkles, Award } from "lucide-react";

interface ConanMascotProps {
  mood?: "happy" | "sad" | "thinking" | "celebrate" | "graduate";
  size?: "sm" | "md" | "lg" | "xl" | "hero";
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

export default function ConanMascot({
  mood = "happy",
  size = "md",
  className = "",
  animate = true,
}: ConanMascotProps) {
  const [imageError, setImageError] = useState(false);

  const isSad = mood === "sad";
  const isThinking = mood === "thinking";
  const isCelebrate = mood === "celebrate";
  const isGraduate = mood === "graduate";

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
      <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-[#E5D5C5] shadow-conan-card bg-gradient-to-b from-[#FAF6F0] to-[#E5D5C5]/40 flex items-center justify-center">
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

        {/* Dynamic Badges / Overlays */}
        {isCelebrate && (
          <div className="absolute top-1 right-1 bg-amber-400 text-amber-950 p-1.5 rounded-full shadow-md animate-bounce z-10">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
        )}

        {isGraduate && (
          <div className="absolute bottom-1 right-1 bg-[#F59E0B] text-white p-1.5 rounded-full shadow-md border-2 border-white z-10">
            <Award className="w-4 h-4" />
          </div>
        )}
      </div>
    </motion.div>
  );
}
