"use client";

import React, { useEffect } from "react";
import { Sparkles, ExternalLink, ShieldCheck } from "lucide-react";

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
  sponsorTitle = "¿Quieres acelerar tu preparación para el ALCPT?",
  sponsorDescription = "Simulacros intensivos, guías de estudio y asesoría especializada en inglés 🇺🇸 para alcanzar el puntaje que necesitas.",
  sponsorCta = "Consultar Información",
  sponsorLink = "https://wa.me/?text=Hola%2C+quiero+información+sobre+los+cursos+y+preparación+ALCPT",
}: AdBannerProps) {
  const adClientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

  useEffect(() => {
    if (adClientId && slotId && typeof window !== "undefined") {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      } catch (e) {
        console.error("AdSense push error:", e);
      }
    }
  }, [adClientId, slotId]);

  // If Google AdSense is fully configured with an ID and slot
  if (adClientId && slotId) {
    return (
      <div className={`w-full overflow-hidden my-6 text-center ${className}`}>
        <span className="block text-[10px] font-bold uppercase tracking-widest text-[#A67B5B]/70 mb-1">
          Publicidad
        </span>
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client={adClientId}
          data-ad-slot={slotId}
          data-ad-format={format}
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  // Fallback / High-Converting Tactical Sponsor Banner
  return (
    <div
      className={`my-6 w-full rounded-2xl bg-gradient-to-r from-[#FAF6F0] via-white to-[#FAF6F0] border-2 border-dashed border-[#E5D5C5] p-4 sm:p-5 relative overflow-hidden shadow-xs hover:border-[#F59E0B] transition-colors ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-[#A67B5B] bg-[#FAF6F0] px-2.5 py-0.5 rounded-full border border-[#E5D5C5]">
          <Sparkles className="w-3 h-3 text-[#F59E0B]" />
          Anuncio Patrocinado
        </span>
        <span className="text-[10px] font-bold text-[#A67B5B]/80 flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-emerald-600" />
          Espacio Publicitario
        </span>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 pr-2">
          <h4 className="text-sm sm:text-base font-black text-[#6B4423] leading-snug">
            {sponsorTitle}
          </h4>
          <p className="text-xs text-[#A67B5B] font-semibold mt-1 leading-relaxed">
            {sponsorDescription}
          </p>
        </div>

        <a
          href={sponsorLink}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full sm:w-auto px-4 py-2.5 bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-black rounded-xl shadow-conan-btn flex items-center justify-center gap-1.5 transition-transform active:scale-95 flex-shrink-0"
        >
          <span>{sponsorCta}</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
