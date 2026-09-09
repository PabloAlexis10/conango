"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  X,
  Award,
  Download,
  Printer,
  Share2,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import ConanMascot from "./ConanMascot";

interface TacticalCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  cadetName: string;
  percentage: number;
  correctAnswers: number;
  formulaNumber?: number | string;
  dateStr?: string;
}

export default function TacticalCertificateModal({
  isOpen,
  onClose,
  cadetName,
  percentage,
  correctAnswers,
  formulaNumber = "Aleatoria",
  dateStr,
}: TacticalCertificateModalProps) {
  const [downloading, setDownloading] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const issueDate = dateStr || new Date().toLocaleDateString("es-CL", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const certId = `ALCPT-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

  const getRankDistinction = (pct: number) => {
    if (pct >= 90) return { title: "DISTINCIÓN MÁXIMA • EXPERTO TÁCTICO", color: "text-amber-800" };
    if (pct >= 80) return { title: "APROBADO CON HONORES • LÍDER TÁCTICO", color: "text-emerald-800" };
    if (pct >= 70) return { title: "APROBADO REGLAMENTARIO • APTO PARA EL SERVICIO", color: "text-blue-900" };
    return { title: "CERTIFICADO DE PARTICIPACIÓN Y ENTRENAMIENTO", color: "text-slate-800" };
  };

  const distinction = getRankDistinction(percentage);

  const handlePrint = () => {
    window.print();
  };

  const handleShareWhatsApp = () => {
    const text = encodeURIComponent(
      `🎖️ ¡He completado el Examen Oficial ALCPT de 100 preguntas en ConanGO con un ${percentage}% de acierto (${correctAnswers}/100)! Obtuve el grado de ${distinction.title}. Prepárate tú también en https://conango.vercel.app`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  // Canvas-based image export (pure browser-native, works on iOS, Android & Desktop)
  const handleDownloadImage = () => {
    setDownloading(true);
    const canvas = document.createElement("canvas");
    canvas.width = 1200;
    canvas.height = 850;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      setDownloading(false);
      return;
    }

    // Background parchment
    ctx.fillStyle = "#FAF6F0";
    ctx.fillRect(0, 0, 1200, 850);

    // Decorative Borders
    ctx.strokeStyle = "#D97706";
    ctx.lineWidth = 14;
    ctx.strokeRect(20, 20, 1160, 810);

    ctx.strokeStyle = "#6B4423";
    ctx.lineWidth = 4;
    ctx.strokeRect(36, 36, 1128, 778);

    // Gold Corner Accents
    ctx.fillStyle = "#F59E0B";
    const cornerSize = 40;
    ctx.fillRect(36, 36, cornerSize, 6);
    ctx.fillRect(36, 36, 6, cornerSize);
    ctx.fillRect(1164 - cornerSize, 36, cornerSize, 6);
    ctx.fillRect(1164, 36, 6, cornerSize);
    ctx.fillRect(36, 814 - cornerSize, 6, cornerSize);
    ctx.fillRect(36, 814, cornerSize, 6);
    ctx.fillRect(1164 - cornerSize, 814, cornerSize, 6);
    ctx.fillRect(1164, 814 - cornerSize, 6, cornerSize);

    // Header text
    ctx.textAlign = "center";
    ctx.fillStyle = "#8C5D35";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("UNITED STATES AIR FORCE • A.L.C.P.T. TRAINING SQUADRON 🇺🇸", 600, 95);

    ctx.fillStyle = "#6B4423";
    ctx.font = "900 36px sans-serif";
    ctx.fillText("DIPLOMA DE COMPETENCIA LINGÜÍSTICA TÁCTICA", 600, 145);

    ctx.fillStyle = "#A67B5B";
    ctx.font = "bold 16px sans-serif";
    ctx.fillText("POR CUANTO SE RECONOCE Y CERTIFICA OFICIALMENTE QUE EL CADETE:", 600, 195);

    // Cadet Name
    ctx.fillStyle = "#6B4423";
    ctx.font = "900 42px sans-serif";
    ctx.fillText(cadetName.toUpperCase() || "CADETE DE HONOR", 600, 260);

    // Underline
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(300, 280);
    ctx.lineTo(900, 280);
    ctx.stroke();

    // Body description
    ctx.fillStyle = "#4A3319";
    ctx.font = "500 18px sans-serif";
    ctx.fillText(
      `Ha rendido satisfactoriamente la evaluación oficial correlativa de 100 reactivos (Fórmula: ${formulaNumber})`,
      600,
      330
    );
    ctx.fillText(
      `demostrando alto rigor en comprensión auditiva táctica (Listening) y estructuras gramaticales (Reading).`,
      600,
      360
    );

    // Score Badge Box
    ctx.fillStyle = "#FEF3C7";
    ctx.strokeStyle = "#F59E0B";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(400, 405, 400, 120, 20);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = "#92400E";
    ctx.font = "900 16px sans-serif";
    ctx.fillText("RESULTADO OFICIAL OBTENIDO", 600, 440);

    ctx.fillStyle = "#B45309";
    ctx.font = "900 48px sans-serif";
    ctx.fillText(`${percentage}%`, 600, 495);

    ctx.fillStyle = "#78350F";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(`(${correctAnswers} reactivos correctos de 100 preguntas)`, 600, 515);

    // Distinction
    ctx.fillStyle = "#6B4423";
    ctx.font = "900 20px sans-serif";
    ctx.fillText(distinction.title, 600, 580);

    // Signatures and Seals
    ctx.textAlign = "left";
    ctx.fillStyle = "#6B4423";
    ctx.font = "bold 14px sans-serif";
    ctx.fillText(`Emisión: ${issueDate}`, 120, 680);
    ctx.fillText(`Registro: #${certId}`, 120, 705);
    ctx.fillText("Validación: https://conango.vercel.app", 120, 730);

    // Signature on the right
    ctx.textAlign = "right";
    ctx.font = "italic 22px serif";
    ctx.fillText("General Conan 🐾", 1080, 675);
    ctx.font = "bold 13px sans-serif";
    ctx.fillText("Comandante de Entrenamiento • US Air Force", 1080, 700);
    ctx.fillStyle = "#10B981";
    ctx.font = "900 13px sans-serif";
    ctx.fillText("SELLO OFICIALMENTE REGISTRADO ✓", 1080, 725);

    // Trigger download
    const link = document.createElement("a");
    link.download = `Certificado-ALCPT-${cadetName.replace(/\s+/g, "_")}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setDownloading(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto print:p-0 print:bg-white">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.92, opacity: 0 }}
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full overflow-hidden border-4 border-amber-300 relative my-auto print:border-none print:shadow-none"
      >
        {/* Modal close */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-black/10 hover:bg-black/20 text-[#6B4423] z-20 transition-colors print:hidden"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Action Toolbar */}
        <div className="bg-[#FAF6F0] px-6 py-3.5 border-b border-[#E5D5C5] flex flex-wrap items-center justify-between gap-3 print:hidden">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#F59E0B]" />
            <span className="text-xs font-black uppercase tracking-wider text-[#6B4423]">
              Diploma Oficial de Rendimiento ALCPT
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadImage}
              disabled={downloading}
              className="px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-white rounded-xl text-xs font-black shadow-xs flex items-center gap-1.5 transition-transform active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? "Generando..." : "Descargar Imagen HD"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="px-3.5 py-2 bg-white hover:bg-slate-50 text-[#6B4423] border border-[#E5D5C5] rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir PDF</span>
            </button>

            <button
              type="button"
              onClick={handleShareWhatsApp}
              className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Compartir</span>
            </button>
          </div>
        </div>

        {/* CERTIFICATE BODY (PRINTABLE / VIEWABLE) */}
        <div
          ref={certRef}
          className="p-8 sm:p-12 bg-gradient-to-b from-[#FAF6F0] via-white to-[#FAF6F0] relative text-center border-8 border-double border-amber-600/60 m-3 rounded-2xl shadow-inner print:m-0 print:border-8 print:p-8"
        >
          {/* Watermark Conan */}
          <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
            <ConanMascot size="hero" mood="graduate" animate={false} />
          </div>

          <div className="relative z-10 space-y-4">
            {/* Top insignia */}
            <div className="flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest text-[#8C5D35]">
              <span>★</span>
              <span>United States Air Force • Training Squadron</span>
              <span>★</span>
            </div>

            <div className="text-[11px] font-mono font-bold text-[#A67B5B] uppercase tracking-widest">
              A.L.C.P.T. CORPS &bull; INGLÉS 🇺🇸 &bull; REGISTRO OFICIAL
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-[#6B4423] tracking-tight font-serif pt-2">
              Diploma de Competencia Lingüística
            </h1>

            <p className="text-xs sm:text-sm text-[#A67B5B] font-semibold max-w-lg mx-auto">
              Por cuanto se certifica que el cadete ha completado satisfactoriamente la evaluación oficial de 100 reactivos:
            </p>

            {/* Cadet Name */}
            <div className="py-2">
              <h2 className="text-3xl sm:text-4xl font-black text-[#6B4423] uppercase tracking-wide font-serif">
                {cadetName || "Cadete de Honor"}
              </h2>
              <div className="w-64 h-1 bg-gradient-to-r from-transparent via-amber-500 to-transparent mx-auto mt-2" />
            </div>

            <p className="text-xs text-slate-700 max-w-xl mx-auto leading-relaxed font-medium">
              Demostrando temple, disciplina y competencia técnica en las modalidades de <strong>Comprensión Auditiva (Listening)</strong> y <strong>Lectura y Estructuras Gramaticales (Reading)</strong> en la <strong>Fórmula Oficial {formulaNumber}</strong>.
            </p>

            {/* Score box */}
            <div className="inline-block px-8 py-4 bg-gradient-to-br from-amber-50 to-yellow-50 rounded-2xl border-2 border-amber-400 shadow-sm my-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block mb-1">
                Calificación Alcanzada
              </span>
              <div className="text-4xl sm:text-5xl font-black text-amber-800 tracking-tight">
                {percentage}%
              </div>
              <span className="text-xs font-bold text-[#6B4423] block mt-1">
                {correctAnswers} de 100 Respuestas Correctas
              </span>
            </div>

            {/* Distinction */}
            <div>
              <span className={`text-xs sm:text-sm font-black uppercase tracking-wider block ${distinction.color}`}>
                ★ {distinction.title} ★
              </span>
            </div>

            {/* Signature & Verification Seal footer */}
            <div className="pt-8 border-t border-[#E5D5C5] flex flex-col sm:flex-row items-center justify-between gap-6 text-left">
              <div className="text-xs text-[#A67B5B] space-y-1">
                <div><strong>Fecha de Emisión:</strong> {issueDate}</div>
                <div><strong>Registro Único:</strong> <span className="font-mono text-[#6B4423]">#{certId}</span></div>
                <div className="flex items-center gap-1 text-emerald-700 font-bold text-[11px]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Documento Oficial Certificado por ConanGO</span>
                </div>
              </div>

              {/* Signature */}
              <div className="text-center sm:text-right">
                <div className="font-serif italic text-xl font-bold text-[#6B4423] mb-0.5">
                  General Conan 🐾
                </div>
                <div className="w-44 h-0.5 bg-[#6B4423] ml-auto mb-1" />
                <span className="text-[11px] font-black uppercase text-[#6B4423] block">
                  Comandante Supremo K9
                </span>
                <span className="text-[10px] text-[#A67B5B] font-semibold block">
                  US Army Military Working Dog Service
                </span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
