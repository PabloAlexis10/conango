"use client";

import { getCurrentUser } from "./supabase";
import { getUserRankTitle } from "./accessories";

export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) return "denied";
  return Notification.permission;
}

export async function requestNotificationPermission(): Promise<boolean> {
  if (!isNotificationSupported()) return false;
  try {
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      sendInstantWelcomeNotification();
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

export function sendInstantWelcomeNotification(): void {
  if (!isNotificationSupported() || Notification.permission !== "granted") return;

  try {
    new Notification("🐾 ¡Comando Conan Conectado!", {
      body: "Notificaciones tácticas activadas. Te recordaremos proteger tu racha diaria antes de que acabe el día.",
      icon: "/conan-mascot.png",
      badge: "/conan-mascot.png",
      tag: "conango-welcome",
    });
  } catch (err) {
    console.warn("Could not dispatch notification:", err);
  }
}

export function checkAndSendStreakReminder(): void {
  if (!isNotificationSupported() || Notification.permission !== "granted") return;

  const user = getCurrentUser();
  if (!user) return;

  const today = new Date().toISOString().split("T")[0];
  if (user.lastStreakDate === today) {
    // Already studied today
    return;
  }

  const streakDays = user.streakDays || 1;

  try {
    const rankTitle = getUserRankTitle(user.xp || 0);
    new Notification(`🔥 ¡${rankTitle}! Conan te espera para la guardia`, {
      body: `No dejes morir tu racha de ${streakDays} días en ConanGO. ¡Rinde una lección de 5 minutos antes de la medianoche!`,
      icon: "/conan-mascot.png",
      badge: "/conan-mascot.png",
      tag: "conango-streak-reminder",
    });
  } catch (err) {
    console.warn("Could not dispatch streak reminder:", err);
  }
}
