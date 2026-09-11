"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function DefinitionsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/vocabulary");
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-slate-950 text-[#6B4423] dark:text-slate-200">
      <p className="text-sm font-bold">Redirigiendo a la Biblioteca de Vocabulario...</p>
    </div>
  );
}
