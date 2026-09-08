"use client";

import React, { Suspense } from "react";
import PracticeView from "@/components/PracticeView";
import ConanMascot from "@/components/ConanMascot";

export default function ListeningPracticePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-4">
          <ConanMascot size="lg" mood="thinking" animate={true} />
          <p className="mt-4 font-bold text-[#6B4423]">Cargando sesión de Listening...</p>
        </div>
      }
    >
      <PracticeView type="listening" />
    </Suspense>
  );
}
