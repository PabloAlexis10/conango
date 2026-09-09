// Motor de Selección de Voz Humana Conversacional
// Prioriza voces neuronales de alta fidelidad (Microsoft Natural, Google US, Apple Enhanced)
// y descarta totalmente sintetizadores mecánicos o robóticos obsoletos como David Desktop o SAPI5.

export interface HumanVoiceOption {
  voice: SpeechSynthesisVoice;
  displayName: string;
  isNeural: boolean;
  accent: string;
}

// Voces conocidas robóticas o sintéticas obsoletas que DEBEN evitarse
const ROBOTIC_VOICE_NAMES = [
  "desktop",
  "sapi",
  "microsoft david desktop",
  "microsoft zira desktop",
  "microsoft mark desktop",
  "sample tts voice",
];

export function isRoboticVoice(voice: SpeechSynthesisVoice): boolean {
  const name = voice.name.toLowerCase();
  return ROBOTIC_VOICE_NAMES.some((r) => name.includes(r));
}

// Obtener todas las voces en inglés disponibles en el navegador ordenadas por calidad humana
export function getAvailableHumanVoices(): HumanVoiceOption[] {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return [];

  const rawVoices = window.speechSynthesis.getVoices() || [];
  if (rawVoices.length === 0) return [];

  const enVoices = rawVoices.filter(
    (v) =>
      v.lang.toLowerCase().startsWith("en-us") ||
      v.lang.toLowerCase().startsWith("en_us") ||
      v.lang.toLowerCase().startsWith("en-") ||
      v.lang.toLowerCase().startsWith("en")
  );

  const scoredVoices = enVoices.map((v) => {
    const nameLower = v.name.toLowerCase();
    let score = 0;
    let isNeural = false;
    let displayName = v.name;

    // Prioridad 1: Voces Humanas / Naturales de Microsoft Edge (Calidad Estudio Azure)
    if (nameLower.includes("christopher") && nameLower.includes("natural")) {
      score += 100;
      isNeural = true;
      displayName = "Christopher (USAF Humana Natural)";
    } else if (nameLower.includes("guy") && nameLower.includes("natural")) {
      score += 95;
      isNeural = true;
      displayName = "Guy (Humana Natural)";
    } else if (nameLower.includes("jenny") && nameLower.includes("natural")) {
      score += 90;
      isNeural = true;
      displayName = "Jenny (Humana Natural)";
    } else if (nameLower.includes("aria") && nameLower.includes("natural")) {
      score += 88;
      isNeural = true;
      displayName = "Aria (Humana Natural)";
    } else if (nameLower.includes("eric") && nameLower.includes("natural")) {
      score += 87;
      isNeural = true;
      displayName = "Eric (Humana Natural)";
    } else if (nameLower.includes("natural") || nameLower.includes("neural")) {
      score += 80;
      isNeural = true;
      displayName = `${v.name.replace(/Online \(Natural\) - English \(United States\)/gi, "").trim()} (Natural)`;
    }
    // Prioridad 2: Voces de Google (Chrome)
    else if (nameLower.includes("google us english") || nameLower.includes("google english")) {
      score += 75;
      isNeural = true;
      displayName = "Google US English (Humana)";
    } else if (nameLower.includes("google uk english male")) {
      score += 74;
      isNeural = true;
      displayName = "Google UK Male (Humana)";
    }
    // Prioridad 3: Voces de Apple Enhanced / Siri
    else if (nameLower.includes("enhanced") || nameLower.includes("premium")) {
      score += 70;
      isNeural = true;
      displayName = `${v.name} (Mejorada)`;
    } else if (["alex", "samantha", "daniel", "tom", "ava", "allison", "karen"].some((n) => nameLower.includes(n))) {
      score += 50;
      displayName = `${v.name}`;
    }

    // Penalizaciones severas a voces robóticas / mecánicas de escritorio antiguas
    if (isRoboticVoice(v)) {
      score -= 200;
    }

    return {
      voice: v,
      displayName,
      isNeural,
      score,
      accent: v.lang,
    };
  });

  // Ordenar de mayor a menor calidad
  scoredVoices.sort((a, b) => b.score - a.score);

  return scoredVoices.map((s) => ({
    voice: s.voice,
    displayName: s.displayName,
    isNeural: s.isNeural,
    accent: s.accent,
  }));
}

// Seleccionar la mejor voz humana absoluta
export function getBestHumanVoice(preferredUri?: string): SpeechSynthesisVoice | null {
  const humanVoices = getAvailableHumanVoices();
  if (humanVoices.length === 0) return null;

  // 1. Si hay preferencia guardada y coincide con una voz no robótica
  if (preferredUri) {
    const matched = humanVoices.find((hv) => hv.voice.voiceURI === preferredUri);
    if (matched) return matched.voice;
  }

  // 2. Primera voz de alta calidad (filtrada y calificada)
  const nonRobotic = humanVoices.filter((hv) => !isRoboticVoice(hv.voice));
  if (nonRobotic.length > 0) {
    return nonRobotic[0].voice;
  }

  return humanVoices[0]?.voice || null;
}

// Pronunciar texto con cadencia humana natural (evita monotonía y robotización)
export function speakHumanText(
  text: string,
  options?: {
    voice?: SpeechSynthesisVoice | null;
    rate?: number;
    pitch?: number;
    onStart?: () => void;
    onEnd?: () => void;
    onError?: () => void;
  }
): SpeechSynthesisUtterance | null {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return null;

  window.speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(text);
  const voice = options?.voice || getBestHumanVoice();
  if (voice) {
    utterance.voice = voice;
  }

  utterance.lang = "en-US";
  // Cadencia conversacional humana suave y natural
  utterance.rate = options?.rate ?? 0.96;
  utterance.pitch = options?.pitch ?? 1.0;

  if (options?.onStart) utterance.onstart = options.onStart;
  if (options?.onEnd) utterance.onend = options.onEnd;
  if (options?.onError) utterance.onerror = options.onError;

  window.speechSynthesis.speak(utterance);
  return utterance;
}
