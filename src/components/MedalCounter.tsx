"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface MedalCounterProps {
  medals: number;
  maxMedals?: number;
  className?: string;
  showText?: boolean;
}

export default function MedalCounter({
  medals,
  maxMedals = 5,
  className = "",
  showText = true,
}: MedalCounterProps) {
  const [shaking, setShaking] = useState(false);
  const [prevMedals, setPrevMedals] = useState(medals);

  useEffect(() => {
    if (medals < prevMedals) {
      setShaking(true);
      const timer = setTimeout(() => setShaking(false), 600);
      return () => clearTimeout(timer);
    }
    setPrevMedals(medals);
  }, [medals, prevMedals]);

  return (
    <motion.div
      className={`inline-flex items-center gap-2 bg-[#FAF6F0] border-2 border-[#A67B5B] px-3.5 py-1.5 rounded-full shadow-sm select-none ${
        shaking ? "animate-shake border-red-400 bg-red-50" : ""
      } ${className}`}
      animate={shaking ? { scale: [1, 1.15, 0.95, 1.05, 1] } : { scale: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="relative w-7 h-7 flex-shrink-0">
        <Image
          src="/medal-icon.svg"
          alt="Medalla"
          fill
          className="object-contain drop-shadow-sm"
        />
      </div>

      <div className="flex items-baseline gap-1 font-bold">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={medals}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 10, opacity: 0 }}
            className={`text-lg font-black ${
              medals <= 1
                ? "text-red-600 animate-pulse"
                : medals <= 2
                ? "text-orange-600"
                : "text-[#6B4423]"
            }`}
          >
            {medals}
          </motion.span>
        </AnimatePresence>
        {maxMedals && (
          <span className="text-xs text-[#A67B5B] font-semibold">/{maxMedals}</span>
        )}
      </div>

      {showText && (
        <span className="text-xs font-semibold uppercase tracking-wider text-[#A67B5B] ml-0.5 hidden sm:inline">
          {medals === 1 ? "vida" : "vidas"}
        </span>
      )}
    </motion.div>
  );
}
