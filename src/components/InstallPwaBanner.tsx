"use client";

import React, { useState, useEffect } from "react";
import {
  Download,
  Smartphone,
  X,
  Share2,
  PlusSquare,
  QrCode,
  CheckCircle2,
  HelpCircle,
  Copy,
  Package,
  Layers
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export default function InstallPwaBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [currentUrl, setCurrentUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"pwa" | "apk">("pwa");

  useEffect(() => {
    if (typeof window === "undefined") return;

    setCurrentUrl(window.location.origin);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(standalone);

    const ua = window.navigator.userAgent;
    const isApple = /iPad|iPhone|iPod/.test(ua) && !(window as any).MSStream;
    setIsIOS(isApple);

    const mobileCheck = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua);
    setIsMobile(mobileCheck);

    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    const handleOpenModal = () => setShowModal(true);
    window.addEventListener("open-install-modal", handleOpenModal);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("open-install-modal", handleOpenModal);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") {
          setDeferredPrompt(null);
          setIsDismissed(true);
        }
      } catch (err) {
        console.error("Error al disparar instalacion:", err);
      }
    } else {
      setShowModal(true);
    }
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(currentUrl || "http://192.168.1.61:3000");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    currentUrl || "http://192.168.1.61:3000"
  )}`;

  return (
    <>
      {/* Banner Superior Flotante */}
      {!isStandalone && !isDismissed && (
        <div className="w-full bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white shadow-md border-b border-blue-500/30">
          <div className="max-w-6xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2 text-xs sm:text-sm">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
                <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
              </div>
              <div className="truncate">
                <span className="font-extrabold tracking-tight">App ConanGo Móvil</span>
                <span className="hidden md:inline text-blue-100 ml-1.5 font-medium">
                  Instálala en tu celular: pantalla completa y modo offline.
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                onClick={handleInstallClick}
                className="bg-white text-blue-700 hover:bg-blue-50 font-black px-3 py-1.5 rounded-full text-xs flex items-center gap-1 shadow-sm transition-transform active:scale-95"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{deferredPrompt ? "Instalar App" : "Descargar App"}</span>
              </button>

              <button
                type="button"
                onClick={() => setShowModal(true)}
                title="Ver guía de instalación"
                className="p-1.5 text-blue-200 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => setIsDismissed(true)}
                aria-label="Cerrar aviso"
                className="p-1.5 text-blue-200 hover:text-white rounded-full hover:bg-white/10 transition-colors"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Instructivo para Instalar en Celular */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 text-slate-800 overflow-hidden relative my-6"
            >
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {/* Encabezado */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 shadow-sm">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 leading-tight">
                    Descargar ConanGo en Celular
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    Disponible para teléfonos Android e iOS (iPhone)
                  </p>
                </div>
              </div>

              {/* Tabs: PWA Directa vs APK Nativo */}
              <div className="flex rounded-2xl bg-slate-100 p-1 mb-5 border border-slate-200 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab("pwa")}
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === "pwa"
                      ? "bg-white text-blue-600 shadow-sm font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>1 Toque (PWA Recomendada)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("apk")}
                  className={`flex-1 py-2 rounded-xl flex items-center justify-center gap-1.5 transition-all ${
                    activeTab === "apk"
                      ? "bg-white text-blue-600 shadow-sm font-black"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Package className="w-3.5 h-3.5" />
                  <span>Paquete APK (Capacitor)</span>
                </button>
              </div>

              {/* Tab 1: PWA Directa */}
              {activeTab === "pwa" && (
                <div className="space-y-4">
                  {isIOS ? (
                    <div className="space-y-3">
                      <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-800 flex items-center gap-2">
                        <span className="text-base">🍎</span>
                        <span>Instalación en <strong>iPhone / Safari</strong> (3 pasos):</span>
                      </div>

                      <div className="space-y-2.5 text-xs sm:text-sm">
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                            1
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">Toca el botón Compartir</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              En la barra inferior de Safari, presiona el icono <Share2 className="w-3.5 h-3.5 text-blue-600 inline" />
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                            2
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">Selecciona "Agregar a inicio"</p>
                            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                              Baja en el menú y toca <PlusSquare className="w-3.5 h-3.5 text-blue-600 inline" /> <strong>Agregar a pantalla de inicio</strong>.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                          <div className="w-6 h-6 rounded-full bg-blue-600 text-white font-black text-xs flex items-center justify-center shrink-0 mt-0.5">
                            3
                          </div>
                          <div>
                            <p className="font-bold text-slate-800">Presiona "Agregar"</p>
                            <p className="text-xs text-slate-500">
                              En la esquina superior. ConanGo se abrirá a pantalla completa sin barra web.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-800 flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block text-slate-900 mb-0.5">En Android (Chrome / Edge / Brave):</strong>
                          Pulsa en el menú (tres puntos ⋮ en la esquina superior) y selecciona{" "}
                          <strong>&ldquo;Instalar aplicación&rdquo;</strong> o <strong>&ldquo;Agregar a pantalla principal&rdquo;</strong>.
                        </div>
                      </div>

                      {/* Si está en PC, mostrar QR y botón de compartir */}
                      {!isMobile && (
                        <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center text-center">
                          <p className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
                            <QrCode className="w-4 h-4 text-blue-600" />
                            Escanea con la cámara de tu celular para abrirla:
                          </p>
                          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-200 mb-2.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={qrUrl}
                              alt="Código QR ConanGo"
                              className="w-36 h-36 object-contain"
                              onError={(e) => {
                                (e.target as any).style.display = 'none';
                              }}
                            />
                          </div>
                          <div className="flex items-center gap-2 w-full max-w-xs">
                            <input
                              type="text"
                              readOnly
                              value={currentUrl || "http://192.168.1.61:3000"}
                              className="flex-1 bg-white border border-slate-300 rounded-xl px-2.5 py-1.5 text-[11px] text-slate-600 font-mono outline-none"
                            />
                            <button
                              type="button"
                              onClick={handleCopyLink}
                              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                              <span>{copied ? "Copiado" : "Copiar"}</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* Tab 2: Paquete APK Nativo */}
              {activeTab === "apk" && (
                <div className="space-y-3 text-xs sm:text-sm">
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 flex items-start gap-2.5">
                    <Package className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block mb-0.5">Soporte Nativo con Capacitor</strong>
                      El proyecto ya cuenta con <code className="bg-emerald-100 px-1 py-0.5 rounded text-[11px]">capacitor.config.json</code> configurado para compilar un archivo <strong>.apk</strong> tradicional instalable en cualquier Android.
                    </div>
                  </div>

                  <div className="bg-slate-900 text-slate-100 p-3.5 rounded-2xl font-mono text-[11px] space-y-1 overflow-x-auto shadow-inner">
                    <p className="text-slate-400"># 1. Compilar aplicación web</p>
                    <p className="text-emerald-400">npm run build</p>
                    <p className="text-slate-400 mt-2"># 2. Sincronizar y generar APK en Android Studio</p>
                    <p className="text-emerald-400">npx cap add android</p>
                    <p className="text-emerald-400">npx cap open android</p>
                  </div>

                  <p className="text-slate-500 text-xs leading-relaxed">
                    💡 <strong>Consejo Práctico:</strong> La opción PWA (1 Toque) es 100% idéntica en funciones a un APK, no requiere instalar Android Studio ni habilitar fuentes desconocidas en el teléfono del alumno.
                  </p>
                </div>
              )}

              {/* Botones de acción */}
              <div className="mt-5 flex gap-2">
                {deferredPrompt && activeTab === "pwa" && (
                  <button
                    type="button"
                    onClick={handleInstallClick}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Instalar Ahora en Celular</span>
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl text-xs sm:text-sm transition-colors"
                >
                  Entendido
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
