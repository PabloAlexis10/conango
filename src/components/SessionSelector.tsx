"use client";

import React from "react";
import { SessionSize } from "@/lib/types";
import { ShieldAlert, Trophy, Zap, Award } from "lucide-react";
import { motion } from "framer-motion";

interface SessionSelectorProps {
  selectedSize?: SessionSize;
  onSelectSize?: (size: SessionSize) => void;
  className?: string;
  baseUrlPrefix?: string; // e.g., "/practice/listening" or "/practice/reading"
}

const sessions = [
  {
    size: 10 as SessionSize,
    label: "10 Preguntas",
    tag: "Rápido",
    badge: "5 Vidas",
    description: "Práctica corta. Cada fallo cuesta 1 vida.",
    icon: Zap,
    color: "from-amber-400 to-amber-500",
  },
  {
    size: 30 as SessionSize,
    label: "30 Preguntas",
    tag: "Estándar",
    badge: "5 Vidas",
    description: "Sesión recomendada para afinar precisión.",
    icon: Trophy,
    color: "from-amber-500 to-orange-500",
  },
  {
    size: 50 as SessionSize,
    label: "50 Preguntas",
    tag: "Intensivo",
    badge: "5 Vidas",
    description: "Alta exigencia con vidas limitadas.",
    icon: Award,
    color: "from-orange-500 to-amber-600",
  },
  {
    size: 100 as SessionSize,
    label: "100 Preguntas",
    tag: "Examen",
    badge: "60 Min",
    description: "Simulador oficial ALCPT con temporizador.",
    icon: ShieldAlert,
    color: "from-red-500 to-amber-600",
  },
];

export default function SessionSelector({
  selectedSize,
  onSelectSize,
  className = "",
  baseUrlPrefix,
}: SessionSelectorProps) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 ${className}`}>
      {sessions.map((item) => {
        const isSelected = selectedSize === item.size;
        const Icon = item.icon;
        const isExam = item.size === 100;

        const content = (
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex flex-col justify-between text-left h-full ${
              isSelected
                ? "border-[#F59E0B] bg-[#FFFBEB] shadow-md ring-2 ring-[#F59E0B]/30"
                : "border-[#E5D5C5] bg-white hover:border-[#A67B5B] hover:bg-[#FAF6F0] shadow-sm"
            }`}
            onClick={() => onSelectSize?.(item.size)}
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white bg-gradient-to-tr ${item.color} shadow-sm`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wider ${
                    isExam
                      ? "bg-red-100 text-red-700"
                      : "bg-[#FEF3C7] text-[#92400E]"
                  }`}
                >
                  {item.badge}
                </span>
              </div>
              <h4 className="font-extrabold text-[#6B4423] text-lg mb-1">
                {item.label}
              </h4>
              <p className="text-xs text-[#A67B5B] line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-[#E5D5C5]/60 flex items-center justify-between text-xs font-bold text-[#6B4423]">
              <span className="text-[#A67B5B]">{item.tag}</span>
              <span className="text-[#F59E0B] group-hover:translate-x-1 transition-transform">
                Comenzar &rarr;
              </span>
            </div>
          </motion.div>
        );

        if (baseUrlPrefix) {
          return (
            <a
              key={item.size}
              href={`${baseUrlPrefix}?size=${item.size}`}
              className="block group"
            >
              {content}
            </a>
          );
        }

        return <div key={item.size}>{content}</div>;
      })}
    </div>
  );
}
