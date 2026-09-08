"use client";

import React, { useEffect, useState } from "react";
import { Clock, AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface TimerProps {
  initialSeconds?: number;
  onExpire?: () => void;
  isRunning?: boolean;
  className?: string;
}

export default function Timer({
  initialSeconds = 3600, // 60 minutes
  onExpire,
  isRunning = true,
  className = "",
}: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);

  useEffect(() => {
    if (!isRunning) return;
    if (timeLeft <= 0) {
      onExpire?.();
      return;
    }

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onExpire?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft, onExpire]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const isLowTime = timeLeft < 300; // less than 5 minutes

  const formattedTime = `${String(minutes).padStart(2, "0")}:${String(
    seconds
  ).padStart(2, "0")}`;

  return (
    <motion.div
      className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border-2 font-mono font-bold select-none ${
        isLowTime
          ? "bg-red-50 border-red-400 text-red-700 shadow-sm"
          : "bg-[#FAF6F0] border-[#A67B5B] text-[#6B4423] shadow-sm"
      } ${className}`}
      animate={
        isLowTime
          ? { scale: [1, 1.04, 1], transition: { repeat: Infinity, duration: 1 } }
          : undefined
      }
    >
      {isLowTime ? (
        <AlertTriangle className="w-4 h-4 text-red-500 animate-bounce" />
      ) : (
        <Clock className="w-4 h-4 text-[#A67B5B]" />
      )}
      <span className="text-base tracking-wider">{formattedTime}</span>
    </motion.div>
  );
}
