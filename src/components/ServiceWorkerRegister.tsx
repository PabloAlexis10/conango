"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("[ConanGo] Service Worker registrado con Ã©xito:", registration.scope);
          })
          .catch((error) => {
            console.error("[ConanGo] Error al registrar Service Worker:", error);
          });
      });
    }
  }, []);

  return null;
}