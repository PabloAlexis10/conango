"use client";

import React, { useEffect } from "react";
import { Sparkles, ExternalLink, ShieldCheck, Info } from "lucide-react";
import { getCurrentUser } from "@/lib/supabase";

interface AdBannerProps {
  slotId?: string;
  format?: "auto" | "rectangle" | "horizontal";
  className?: string;
  sponsorTitle?: string;
  sponsorDescription?: string;
  sponsorCta?: string;
  sponsorLink?: string;
}

declare global {
  interface Window {
    adsbygoogle?: any[];
  }
}

export default function AdBanner({
  slotId,
  format = "auto",
  className = "",
  sponsorTitle = "Curso Intensivo Oficial ALCPT • Inglés 🇺🇸",
  sponsorDescription = "Simulacros con las 100 fórmulas oficiales, audio de listening nativo y asesoría personalizada para superar el 85% requerido.",
  sponsorCta = "Ver Cursos y Material",
  sponsorLink = "https://wa.me/?text=Hola%2C+quiero+información+sobre+los+cursos+y+preparación+ALCPT",
}: AdBannerProps) {
  const user = getCurrentUser();
  const adClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID || "ca-pub-4340035809584049";

  useEffect(() => {
    if (user?.isPro) return;
    if (typeof window !== "undefined") {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        // Suppress uninitialized ad slot warnings
      }
    }
  }, [user]);

  // PRO USERS SEE ZERO ADS
  if (user?.isPro) {
    return null;
  }

  return (
    <div className={`my-6 w-full rounded-2xl bg-white border border-[#E5D5C5] shadow-xs overflow-hidden ${className}`}>
      {/* Google Ads Label Bar */}
      <div className="bg-[#FAF6F0] px-4 py-1.5 border-b border-[#E5D5C5] flex items-center justify-between text-[10px] font-bold text-[#A67B5B]">
        <div className="flex items-center gap-1.5">
          <span className="bg-slate-200 text-slate-700 px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider">
            Anuncio
          </span>
          <span>Google AdSense • Anuncios Google</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-blue-600 hover:underline cursor-pointer">
          <Info className="w-3 h-3" />
          <span>AdChoices</span>
        </div>
      </div>

      {/* Official Google Ad Unit Ins */}
      <div className="p-3 sm:p-4 text-center min-h-[90px] flex flex-col items-center justify-center relative bg-gradient-to-b from-white to-[#FAF6F0]/30">
        <ins
          className="adsbygoogle"
          style={{ display: "block", minHeight: "90px", width: "100%" }}
          data-ad-client={adClientId}
          data-ad-slot={slotId || "1234567890"}
          data-ad-format={format}
          data-full-width-responsive="true"
        />

        {/* High-visibility responsive ad banner content */}
        <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 py-1">
          <div className="text-left flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black text-[#6B4423]">
                {sponsorTitle}
              </span>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-black px-2 py-0.2 rounded-full border border-emerald-300">
                Verificado
              </span>
            </div>
            <p className="text-xs text-[#A67B5B] font-medium leading-relaxed max-w-xl">
              {sponsorDescription}
            </p>
          </div>

          <a
            href={sponsorLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-black rounded-xl shadow-conan-btn flex items-center justify-center gap-1.5 transition-transform active:scale-95 flex-shrink-0"
          >
            <span>{sponsorCta}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>
    </div>
  );
}
