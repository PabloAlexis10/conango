"use client";

import React from "react";
import { motion } from "framer-motion";

interface ProgressBarProps {
  current: number;
  total: number;
  className?: string;
  showText?: boolean;
}

export default function ProgressBar({
  current,
  total,
  className = "",
  showText = true,
}: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (current / Math.max(1, total)) * 100));

  return (
    <div className={`w-full ${className}`}>
      {showText && (
        <div className="flex justify-between items-center text-xs sm:text-sm font-bold text-[#A67B5B] mb-1.5">
          <span>
            Pregunta <span className="text-[#6B4423] font-black">{current}</span> de{" "}
            <span>{total}</span>
          </span>
          <span>{Math.round(percentage)}%</span>
        </div>
      )}
      <div className="w-full bg-[#E5D5C5] h-3.5 rounded-full overflow-hidden p-0.5 border border-[#A67B5B]/30">
        <motion.div
          className="h-full bg-gradient-to-r from-[#F59E0B] to-[#FBBF24] rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          {/* Subtle shine highlight */}
          <div className="absolute top-0 left-0 right-0 h-1/2 bg-white/30 rounded-t-full" />
        </motion.div>
      </div>
    </div>
  );
}
