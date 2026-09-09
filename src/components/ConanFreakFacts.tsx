"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Volume2,
  Lightbulb,
  Shield,
  Plane,
  Languages,
} from "lucide-react";
import { soundEffects } from "@/lib/soundEffects";

export interface FreakFact {
  id: string;
  category: string;
  icon: string;
  titleEn: string;
  titleEs: string;
  textEn: string;
  textEs: string;
  recommendation?: string;
  tag: string;
}

export const FREAK_FACTS: FreakFact[] = [
  {
    id: "dog_smell",
    category: "Curiosidad Canina K9",
    icon: "🐾",
    titleEn: "Super Canine Sense of Smell",
    titleEs: "El Superolfato de los Perros K9",
    textEn:
      "A dog's sense of smell is up to 100,000 times stronger than a human's. Military K9s can detect a single droplet of scent in an Olympic swimming pool!",
    textEs:
      "¡El olfato de un perro es hasta 100.000 veces más potente que el humano! Un perro militar K9 puede detectar una sola gota de olor en una piscina olímpica.",
    recommendation: "Tip táctico: Mantén tus sentidos alerta como Conan en cada pregunta de audio.",
    tag: "🐾 K9 Fact",
  },
  {
    id: "idiom_bullet",
    category: "Modismo Nativo Estadounidense",
    icon: "🇺🇸",
    titleEn: "Bite the Bullet",
    titleEs: "Apretar los dientes y ser valiente",
    textEn:
      "'Bite the bullet' means facing a difficult situation with courage. It originated when wounded soldiers bit lead bullets during surgery before anesthesia!",
    textEs:
      "'Bite the bullet' significa enfrentar con coraje una situación difícil. Nació cuando los soldados heridos mordían balas de plomo en cirugías de guerra antes de la anestesia.",
    recommendation: "Uso real: 'The exam is tough, but I gotta bite the bullet!'",
    tag: "🇺🇸 Idiom",
  },
  {
    id: "k9_rank",
    category: "Dato Táctico US Army",
    icon: "🪖",
    titleEn: "Canine Superior Rank Tradition",
    titleEs: "Rango Militar Superior del Perro",
    textEn:
      "In the US Armed Forces, every Military Working Dog (MWD) is officially ranked one grade higher than their handler to enforce respectful treatment and care.",
    textEs:
      "¡En las Fuerzas de EE.UU., todo perro de servicio militar (MWD) tiene por tradición un grado más que su guía humano para garantizar un trato con máximo respeto!",
    recommendation: "Dato oficial: Por eso el Comandante Conan tiene grado de General K9.",
    tag: "🪖 US Army",
  },
  {
    id: "spaced_rep",
    category: "Tip de Estudio Científico",
    icon: "💡",
    titleEn: "Spaced Repetition Power",
    titleEs: "El Poder de la Repetición Espaciada",
    textEn:
      "Practicing 10 minutes every single day is 5 times more effective than cramming 2 hours on Sunday. Consistency permanently locks vocabulary into long-term memory.",
    textEs:
      "Practicar 10 minutos cada día es 5 veces más efectivo que estudiar 2 horas de golpe el domingo. La consistencia graba las fórmulas en la memoria a largo plazo.",
    recommendation: "Regla de oro: ¡Mantén viva tu racha diaria en ConanGO!",
    tag: "💡 Hack",
  },
  {
    id: "idiom_roger",
    category: "Comunicaciones & Radio",
    icon: "📻",
    titleEn: "Origin of 'Roger That'",
    titleEs: "El Origen de 'Roger That'",
    textEn:
      "'Roger that' comes from the early US military phonetic alphabet where 'R' stood for 'Received'. Today native speakers use it casually to mean 'Understood!'",
    textEs:
      "'Roger that' proviene de cuando la letra 'R' significaba 'Recibido' en radiofonía militar. Hoy los hablantes nativos lo usan cotidianamente para decir '¡Entendido!'.",
    recommendation: "Frase táctica: 'Can you finish this report?' — 'Roger that, sir!'",
    tag: "📻 Radio",
  },
  {
    id: "mach_speed",
    category: "Aviación & Barrera del Sonido",
    icon: "✈️",
    titleEn: "Breaking the Sound Barrier",
    titleEs: "Rompiendo la Barrera del Sonido",
    textEn:
      "Mach 1 is the speed of sound (~767 mph / 1,235 km/h). Chuck Yeager first broke the sound barrier on October 14, 1947, flying the rocket Bell X-1.",
    textEs:
      "Mach 1 es la velocidad del sonido (~1.235 km/h). Chuck Yeager rompió por primera vez la barrera del sonido en 1947 a bordo del Bell X-1 propulsado por cohete.",
    recommendation: "Vocabulario: 'Sonic boom' es el estampido sónico que se escucha al quebrar Mach 1.",
    tag: "✈️ Aviación",
  },
  {
    id: "flap_t",
    category: "Pronunciación Nativa",
    icon: "🗣️",
    titleEn: "The American Flap 'T'",
    titleEs: "El Secreto del 'Flap T' Estadounidense",
    textEn:
      "In American English, a 't' between two vowels is pronounced like a soft 'd' or tapped 'r'. 'Water' sounds like 'wader', and 'better' sounds like 'bedder'.",
    textEs:
      "En inglés americano, la 't' entre dos vocales no suena dura: suena como una 'd' o 'r' suave ('water' suena 'uóder', 'better' suena 'béder').",
    recommendation: "Práctica: Di rápido 'Butter' -> 'Bád-er'. ¡Sonarás como nativo de EE.UU.!",
    tag: "🗣️ Acento",
  },
  {
    id: "dog_ears",
    category: "Curiosidad Canina K9",
    icon: "🐕",
    titleEn: "Radar Ears with 18 Muscles",
    titleEs: "Orejas de Radar con 18 Músculos",
    textEn:
      "Dogs have over 18 independent muscles in each ear, allowing them to tilt, swivel, and detect sounds four times farther away than human ears can reach.",
    textEs:
      "Los perros tienen más de 18 músculos en cada oreja, permitiéndoles girarlas como antenas parabólicas y captar sonidos a distancias 4 veces mayores.",
    recommendation: "Dato K9: Por eso Conan detecta cambios de entonación al instante.",
    tag: "🐾 K9 Fact",
  },
  {
    id: "idiom_cake",
    category: "Modismo Nativo",
    icon: "🍰",
    titleEn: "Piece of Cake & Walk in the Park",
    titleEs: "Pan Comido y Muy Fácil",
    textEn:
      "Native speakers rarely say 'It is very easy'. Instead, they say 'It's a piece of cake!', 'It's a walk in the park!', or 'It's a breeze!'.",
    textEs:
      "Los nativos rara vez dicen 'it is very easy'. En su lugar usan 'It's a piece of cake!', 'a walk in the park!' o 'it's a breeze!' para decir que es pan comido.",
    recommendation: "Ejemplo: 'Don't worry about the 100 questions, it's a piece of cake!'",
    tag: "🇺🇸 Idiom",
  },
  {
    id: "active_recall",
    category: "Estrategia de Aprendizaje",
    icon: "🧠",
    titleEn: "Active Recall Over Passive Reading",
    titleEs: "Recuerdo Activo vs. Lectura Pasiva",
    textEn:
      "Testing yourself before looking at the correct answer forces neural pathways to strengthen, resulting in 50% higher retention than passive reading.",
    textEs:
      "Ponerte a prueba con preguntas antes de revisar la respuesta obliga al cerebro a consolidar la memoria, logrando un 50% más de retención duradera.",
    recommendation: "Tip táctico: Rinde un quiz de 10 preguntas antes de dormir.",
    tag: "🧠 Neurociencia",
  },
  {
    id: "nato_alphabet",
    category: "Dato Militar Internacional",
    icon: "🛡️",
    titleEn: "The NATO Phonetic Alphabet",
    titleEs: "El Alfabeto Fonético de la OTAN",
    textEn:
      "Created so pilots and military units never confuse letters across noisy radio static: Alpha, Bravo, Charlie, Delta, Echo, Foxtrot, Golf, Hotel...",
    textEs:
      "Creado para que pilotos y unidades tácticas nunca confundan letras bajo interferencia de radio: Alpha, Bravo, Charlie, Delta, Echo, Foxtrot...",
    recommendation: "Práctica: Deletrea tu nombre usando el alfabeto OTAN.",
    tag: "🛡️ Táctico",
  },
  {
    id: "gotta_wanna",
    category: "Inglés Cotidiano de EE.UU.",
    icon: "🇺🇸",
    titleEn: "Gotta, Wanna & Gonna",
    titleEs: "Las Contracciones Diarias de EE.UU.",
    textEn:
      "'I gotta go' (I have got to go = I must leave), 'I wanna fly' (want to), 'I'm gonna win' (going to). These contractions are universal in casual US speech.",
    textEs:
      "'I gotta go' (tengo que irme), 'wanna' (querer), 'gonna' (voy a). Estas contracciones no son vulgares: son la forma estándar de hablar en EE.UU.",
    recommendation: "Úsalo así: 'I gotta practice my English right now!'",
    tag: "🇺🇸 Slang",
  },
  {
    id: "husky_coat",
    category: "Curiosidad Canina K9",
    icon: "❄️",
    titleEn: "Husky Extreme Cold Armor",
    titleEs: "La Armadura Térmica del Husky",
    textEn:
      "Huskies like Conan possess a dense double coat that withstands temperatures as frigid as -60°F (-51°C)! Their fur traps warm air directly against their skin.",
    textEs:
      "¡Los huskies como Conan poseen un pelaje de doble capa que soporta hasta -51°C! Su pelaje inferior atrapa aire caliente aislándolo del hielo extremo.",
    recommendation: "Curiosidad: Duermen enrollados tapándose la nariz con su cola para calentar el aire.",
    tag: "🐾 K9 Fact",
  },
  {
    id: "black_box",
    category: "Curiosidad de Aviación",
    icon: "🟠",
    titleEn: "The 'Black Box' is Bright Orange",
    titleEs: "La 'Caja Negra' en Realidad es Naranja",
    textEn:
      "An airplane's flight data recorder is called a 'black box', but it is actually painted bright fluorescent orange with reflective strips so it can be located quickly.",
    textEs:
      "Aunque se le llama 'caja negra', la grabadora de vuelo de los aviones siempre está pintada de color naranja brillante con cintas reflectantes para rescate rápido.",
    recommendation: "Vocabulario: 'FDR' = Flight Data Recorder; 'CVR' = Cockpit Voice Recorder.",
    tag: "✈️ Aviación",
  },
];

export default function ConanFreakFacts() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const DURATION_MS = 20000; // 20 segundos para lectura cómoda bilingüe
  const STEP_MS = 50;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentFact = FREAK_FACTS[currentIndex];

  const handleNext = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev + 1) % FREAK_FACTS.length);
  };

  const handlePrev = () => {
    setProgress(0);
    setCurrentIndex((prev) => (prev - 1 + FREAK_FACTS.length) % FREAK_FACTS.length);
  };

  // 13-second auto-advancing timer
  useEffect(() => {
    if (isPaused) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + (STEP_MS / DURATION_MS) * 100;
      });
    }, STEP_MS);

    timerRef.current = interval;

    return () => clearInterval(interval);
  }, [isPaused, currentIndex]);

  const speakFact = () => {
    soundEffects.playClick();
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(currentFact.textEn);
      utterance.lang = "en-US";
      utterance.rate = 0.95;
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div
      className="w-full bg-gradient-to-br from-[#FAF6F0] via-white to-amber-50/50 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800 rounded-3xl border-2 border-[#E5D5C5] dark:border-slate-700 shadow-conan-card overflow-hidden my-6 transition-all"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 13-second Progress Bar */}
      <div className="w-full bg-amber-100/70 dark:bg-slate-800 h-1.5 overflow-hidden">
        <div
          className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 h-full transition-all duration-75 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Header bar */}
      <div className="px-5 py-3 border-b border-[#E5D5C5] dark:border-slate-700 flex items-center justify-between bg-white/80 dark:bg-slate-800/80 backdrop-blur-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950 flex items-center justify-center text-lg shadow-xs">
            {currentFact.icon}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-[#A67B5B] dark:text-slate-400">
                {currentFact.category}
              </span>
              <span className="text-[9px] font-black px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                {currentFact.tag}
              </span>
            </div>
            <h3 className="text-xs sm:text-sm font-black text-[#6B4423] dark:text-white">
              Curiosidades & Tips Tácticos de Inglés 🇺🇸
            </h3>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={speakFact}
            title="Escuchar pronunciación nativa en inglés"
            className="p-1.5 rounded-xl text-[#A67B5B] hover:text-[#6B4423] hover:bg-amber-100/80 transition-colors"
          >
            <Volume2 className="w-4 h-4 text-amber-600" />
          </button>

          <button
            type="button"
            onClick={() => setIsPaused(!isPaused)}
            title={isPaused ? "Reanudar auto-avance" : "Pausar auto-avance"}
            className="p-1.5 rounded-xl text-[#A67B5B] hover:text-[#6B4423] hover:bg-amber-100/80 transition-colors"
          >
            {isPaused ? (
              <Play className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Pause className="w-3.5 h-3.5 text-amber-700" />
            )}
          </button>

          <button
            type="button"
            onClick={handlePrev}
            title="Anterior"
            className="p-1.5 rounded-xl text-[#A67B5B] hover:text-[#6B4423] hover:bg-amber-100/80 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-[10px] font-mono font-bold text-[#A67B5B] px-1">
            {currentIndex + 1}/{FREAK_FACTS.length}
          </span>

          <button
            type="button"
            onClick={handleNext}
            title="Siguiente"
            className="p-1.5 rounded-xl text-[#A67B5B] hover:text-[#6B4423] hover:bg-amber-100/80 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Area with Animation */}
      <div className="p-5 sm:p-6 relative min-h-[160px] flex flex-col justify-between">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentFact.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {/* English Section */}
            <div className="flex items-start gap-2.5">
              <span className="text-base flex-shrink-0 mt-0.5">🇺🇸</span>
              <div>
                <h4 className="text-sm sm:text-base font-black text-[#6B4423] dark:text-amber-400 leading-snug">
                  {currentFact.titleEn}
                </h4>
                <p className="text-xs sm:text-sm text-slate-900 dark:text-slate-50 font-semibold mt-1 leading-relaxed">
                  &ldquo;{currentFact.textEn}&rdquo;
                </p>
              </div>
            </div>

            {/* Spanish Translation Section */}
            <div className="flex items-start gap-2.5 pt-2 border-t border-amber-100/80 dark:border-slate-800">
              <span className="text-base flex-shrink-0 mt-0.5">🇨🇱</span>
              <div>
                <p className="text-xs sm:text-sm text-[#A67B5B] dark:text-slate-300 font-medium leading-relaxed">
                  <strong className="text-[#6B4423] dark:text-amber-300">{currentFact.titleEs}:</strong>{" "}
                  {currentFact.textEs}
                </p>
              </div>
            </div>

            {/* Tactical Recommendation / Tip */}
            {currentFact.recommendation && (
              <div className="mt-2 flex items-center gap-2 px-3 py-1.5 bg-amber-50 dark:bg-amber-950/50 rounded-xl border border-amber-200/70 dark:border-amber-800 text-[11px] font-bold text-amber-900 dark:text-amber-200">
                <Lightbulb className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <span>{currentFact.recommendation}</span>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Footer info: Clean tag & dots */}
        <div className="flex items-center justify-between pt-4 mt-2 border-t border-[#E5D5C5]/60 dark:border-slate-700/60 text-[10px] text-[#A67B5B] dark:text-slate-400 font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              {isPaused ? "Pausado para lectura" : "ConanGO • Tips Oficiales & Modismos 🇺🇸"}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {FREAK_FACTS.map((fact, idx) => (
              <button
                key={fact.id}
                type="button"
                onClick={() => {
                  setProgress(0);
                  setCurrentIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  idx === currentIndex
                    ? "w-4 bg-[#F59E0B]"
                    : "w-1.5 bg-[#E5D5C5] dark:bg-slate-700 hover:bg-[#A67B5B] dark:hover:bg-slate-500"
                }`}
                title={`Ver dato ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
