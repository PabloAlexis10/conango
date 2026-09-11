"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import ConanMascot from "@/components/ConanMascot";
import { definitionCards, matchingPairs } from "@/lib/vocabularyData";
import {
  Search,
  Volume2,
  BookOpen,
  Sparkles,
  Layers,
  ArrowLeft,
  X,
  Plane,
  Shield,
  Wrench,
  Radio,
  ExternalLink,
} from "lucide-react";
import { getCurrentUser } from "@/lib/supabase";

interface UnifiedVocabItem {
  id: number;
  word: string;
  phonetic: string;
  partOfSpeech: string;
  meaningEs: string;
  definitionEn: string;
  example: string;
  category: string;
}

export default function VocabularyLibraryPage() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");
  const [playingWord, setPlayingWord] = useState<string | null>(null);

  // Combine definitionCards and matchingPairs into a rich unified dictionary
  const items: UnifiedVocabItem[] = useMemo(() => {
    const list: UnifiedVocabItem[] = [];
    const seenWords = new Set<string>();

    // 1. First add curated definitionCards
    definitionCards.forEach((c) => {
      const lower = c.word.toLowerCase();
      seenWords.add(lower);
      let cat = "General & ALCPT";
      if (lower.includes("muster") || lower.includes("sentry") || lower.includes("patrol") || lower.includes("dispatch") || lower.includes("convoy") || lower.includes("flank") || lower.includes("barracks")) {
        cat = "Militar & Táctico";
      } else if (lower.includes("runway") || lower.includes("flight") || lower.includes("takeoff") || lower.includes("altitude")) {
        cat = "Aviación & ATC";
      } else if (lower.includes("halt") || lower.includes("fall in") || lower.includes("deploy") || lower.includes("divert") || lower.includes("stow")) {
        cat = "Verbos & Comandos";
      }

      list.push({
        id: c.id,
        word: c.word,
        phonetic: c.phonetic,
        partOfSpeech: c.partOfSpeech,
        meaningEs: c.meaningEs,
        definitionEn: c.correctDefinition,
        example: c.example,
        category: cat,
      });
    });

    // 2. Add remaining pairs from matchingPairs
    matchingPairs.forEach((p, idx) => {
      const lower = p.english.toLowerCase();
      if (!seenWords.has(lower)) {
        seenWords.add(lower);
        let cat = "General & ALCPT";
        if (p.category === "Aviación") cat = "Aviación & ATC";
        else if (p.category === "Mantenimiento") cat = "Mantenimiento";
        else if (p.category === "Comandos") cat = "Verbos & Comandos";
        else if (p.category === "Clima") cat = "Aviación & ATC";

        list.push({
          id: 100 + idx,
          word: p.english,
          phonetic: `/${p.english.toLowerCase()}/`,
          partOfSpeech: p.category === "Comandos" ? "Verb / Command" : "Term / Noun",
          meaningEs: p.spanish,
          definitionEn: `Standard ALCPT tactical term: ${p.english} (${p.spanish}).`,
          example: `The flight officer noted the ${p.english.toLowerCase()} during pre-mission operations.`,
          category: cat,
        });
      }
    });

    return list;
  }, []);

  const categories = ["Todos", "Militar & Táctico", "Aviación & ATC", "Verbos & Comandos", "Mantenimiento", "General & ALCPT"];

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesCat = selectedCategory === "Todos" || item.category === selectedCategory;
      const q = search.trim().toLowerCase();
      const matchesSearch =
        !q ||
        item.word.toLowerCase().includes(q) ||
        item.meaningEs.toLowerCase().includes(q) ||
        item.definitionEn.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [items, selectedCategory, search]);

  const handleSpeak = (word: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    window.speechSynthesis.cancel();
    setPlayingWord(word);
    const u = new SpeechSynthesisUtterance(word);
    u.lang = "en-US";
    u.rate = 0.9;
    u.onend = () => setPlayingWord(null);
    u.onerror = () => setPlayingWord(null);
    window.speechSynthesis.speak(u);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-slate-950 text-[#6B4423] dark:text-slate-100 transition-colors">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 md:py-10">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#FAF6F0] dark:bg-slate-900 border border-[#E5D5C5] dark:border-slate-800 text-[#6B4423] dark:text-slate-200 text-xs font-black hover:bg-[#F5EFEB] dark:hover:bg-slate-800 transition-colors shadow-xs"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a la Base</span>
          </Link>

          {/* Quick CTA to Card Matching Game */}
          <Link
            href="/vocabulary/matching"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black transition-transform active:scale-95 shadow-xs"
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Jugar Emparejar Cartas &rarr;</span>
          </Link>
        </div>

        {/* Header Hero Banner */}
        <section className="bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent dark:from-amber-950/40 dark:via-slate-900 dark:to-slate-900 border-2 border-amber-300/80 dark:border-amber-700/60 rounded-3xl p-6 sm:p-8 shadow-conan-card mb-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-3 shadow-xs">
                <BookOpen className="w-3.5 h-3.5 text-[#F59E0B]" />
                Biblioteca Oficial ALCPT
              </div>
              <h1 className="text-2xl sm:text-4xl font-black text-[#6B4423] dark:text-white tracking-tight">
                Biblioteca de Vocabulario Táctico
              </h1>
              <p className="text-xs sm:text-sm text-[#A67B5B] dark:text-slate-300 font-semibold mt-2 max-w-xl leading-relaxed">
                Explora el glosario de términos aeronáuticos, militares y de comprensión auditiva con pronunciación en inglés nativo americano 🇺🇸, traducción directa al español y oraciones de contexto oficial.
              </p>
            </div>
            <div className="shrink-0">
              <ConanMascot size="md" mood="happy" animate={true} />
            </div>
          </div>
        </section>

        {/* Search and Category Filters */}
        <section className="mb-8 space-y-4">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-5 h-5 text-amber-600 dark:text-amber-400 absolute left-4 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar palabra en inglés o traducción en español (ej: mandatory, altitud, runway...)"
              className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-white dark:bg-slate-900 border-2 border-[#E5D5C5] dark:border-slate-800 text-sm font-bold text-[#6B4423] dark:text-white placeholder-[#A67B5B]/70 dark:placeholder-slate-500 focus:outline-none focus:border-[#F59E0B] shadow-xs transition-colors"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {categories.map((cat) => {
              const active = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-black whitespace-nowrap transition-all shadow-xs ${
                    active
                      ? "bg-[#F59E0B] text-white shadow-sm"
                      : "bg-[#FAF6F0] dark:bg-slate-900 text-[#6B4423] dark:text-slate-300 border border-[#E5D5C5] dark:border-slate-800 hover:bg-[#F5EFEB] dark:hover:bg-slate-800"
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-xs font-bold text-[#A67B5B] dark:text-slate-400 px-1">
            <span>Mostrando {filteredItems.length} de {items.length} términos</span>
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-amber-600 dark:text-amber-400 hover:underline"
              >
                Limpiar búsqueda
              </button>
            )}
          </div>
        </section>

        {/* Vocabulary Cards Grid */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10">
          {filteredItems.map((item) => {
            const isSpeaking = playingWord === item.word;
            return (
              <div
                key={item.id}
                className="bg-white dark:bg-slate-900 border-2 border-[#E5D5C5] dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 rounded-2xl p-5 shadow-conan-card transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Word, Audio, Badges */}
                  <div className="flex items-start justify-between gap-3 mb-2.5">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-black text-[#6B4423] dark:text-white group-hover:text-amber-700 dark:group-hover:text-amber-400 transition-colors">
                          {item.word}
                        </h3>
                        <button
                          type="button"
                          onClick={() => handleSpeak(item.word)}
                          className={`p-1.5 rounded-full transition-all active:scale-90 ${
                            isSpeaking
                              ? "bg-amber-500 text-white animate-pulse"
                              : "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 hover:bg-amber-200"
                          }`}
                          title="Escuchar pronunciación nativa"
                        >
                          <Volume2 className="w-4 h-4" />
                        </button>
                      </div>
                      <span className="text-xs font-mono text-[#A67B5B] dark:text-slate-400 block mt-0.5">
                        {item.phonetic}
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[10px] font-black uppercase tracking-wider">
                        {item.partOfSpeech}
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[10px] font-extrabold">
                        {item.category}
                      </span>
                    </div>
                  </div>

                  {/* Spanish Translation Pill */}
                  <div className="mb-3 px-3 py-1.5 rounded-xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 text-xs font-black text-amber-900 dark:text-amber-200">
                    🇪🇸 Trad: <span className="font-extrabold text-amber-950 dark:text-amber-100">{item.meaningEs}</span>
                  </div>

                  {/* Definition */}
                  <p className="text-xs text-[#7A5433] dark:text-slate-300 font-medium leading-relaxed mb-3">
                    <strong className="text-[#6B4423] dark:text-slate-200 font-bold">Definición:</strong> {item.definitionEn}
                  </p>
                </div>

                {/* Example sentence */}
                <div className="pt-3 border-t border-[#E5D5C5]/60 dark:border-slate-800 text-[11px] text-[#8C6B4B] dark:text-slate-400 font-medium italic bg-[#FAF6F0]/60 dark:bg-slate-950/60 -mx-5 -mb-5 p-3 rounded-b-2xl">
                  &ldquo;{item.example}&rdquo;
                </div>
              </div>
            );
          })}
        </section>

        {filteredItems.length === 0 && (
          <div className="text-center py-12 bg-[#FAF6F0] dark:bg-slate-900 rounded-3xl border-2 border-dashed border-[#E5D5C5] dark:border-slate-800 p-8">
            <ConanMascot size="md" mood="thinking" animate={true} />
            <h3 className="text-lg font-black text-[#6B4423] dark:text-white mt-3">
              No se encontraron términos para &ldquo;{search}&rdquo;
            </h3>
            <p className="text-xs text-[#A67B5B] dark:text-slate-400 mt-1">
              Prueba con otra palabra clave o restablece la categoría.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearch("");
                setSelectedCategory("Todos");
              }}
              className="mt-4 px-4 py-2 bg-[#F59E0B] hover:bg-[#D97706] text-white text-xs font-black rounded-xl shadow-xs"
            >
              Restablecer Filtros
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-[#E5D5C5] dark:border-slate-800 py-6 px-4 text-center text-xs text-[#A67B5B] dark:text-slate-400 bg-[#FAF6F0] dark:bg-slate-900 transition-colors">
        <p className="font-black text-[#6B4423] dark:text-slate-200">
          ConanGo &copy; {new Date().getFullYear()} &bull; A.L.C.P.T. (Adiestramiento Lingüístico con Conan, Perro Táctico) &bull; Inglés 🇺🇸
        </p>
      </footer>
    </div>
  );
}
