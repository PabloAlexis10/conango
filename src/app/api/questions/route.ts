import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Question, SessionSize } from "@/lib/types";
import { getFormulaQuestions, cleanAudioPrompt } from "@/lib/questionBank";

// Helper: Fisher-Yates unbiased shuffle
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function cleanQuestionText(text: string): string {
  if (!text) return "";
  return text
    .replace(/\bQuestion\s*\d*:\s*/gi, "")
    .replace(/\bItem\s*\d*:\s*/gi, "")
    .replace(/\s+/g, " ")
    .trim();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get("type") || "mixed";
  const sizeParam = parseInt(searchParams.get("size") || "100", 10);
  const formulaParam = searchParams.get("formula"); // e.g. "1", "45", "random"

  const validSizes: SessionSize[] = [10, 20, 30, 40, 50, 100];
  const size: SessionSize = validSizes.includes(sizeParam as SessionSize)
    ? (sizeParam as SessionSize)
    : 100;

  try {
    // Determine chosen formula (1 to 100)
    let selectedFormulaNumber: number = 1;
    const isRandomFormula = formulaParam === "random";

    if (isRandomFormula) {
      selectedFormulaNumber = Math.floor(Math.random() * 100) + 1;
    } else if (formulaParam && !isNaN(parseInt(formulaParam, 10))) {
      selectedFormulaNumber = Math.min(100, Math.max(1, parseInt(formulaParam, 10)));
    } else {
      selectedFormulaNumber = 1;
    }

    // Check if custom static questions exist for this formula in data/
    const listeningPath = path.join(process.cwd(), "data", "listening", "formulas_listening.json");
    const readingPath = path.join(process.cwd(), "data", "reading", "formulas_reading.json");

    let customListening: Question[] = [];
    let customReading: Question[] = [];

    if (fs.existsSync(listeningPath)) {
      const raw = fs.readFileSync(listeningPath, "utf-8");
      const parsed: Question[] = JSON.parse(raw);
      customListening = parsed.filter((q) => q.formula === selectedFormulaNumber);
    }

    if (fs.existsSync(readingPath)) {
      const raw = fs.readFileSync(readingPath, "utf-8");
      const parsed: Question[] = JSON.parse(raw);
      customReading = parsed.filter((q) => q.formula === selectedFormulaNumber);
    }

    // Retrieve the complete 100 questions for this formula
    let formulaQuestions = getFormulaQuestions(selectedFormulaNumber);

    // If custom questions exist in JSON, overlay them
    if (customListening.length > 0) {
      customListening.sort((a, b) => a.id - b.id);
      customListening.forEach((cq) => {
        const idx = formulaQuestions.findIndex((q) => q.type === "listening" && q.id === cq.id);
        if (idx !== -1) {
          formulaQuestions[idx] = {
            ...cq,
            formula: selectedFormulaNumber,
            formulaName: `Fórmula ${selectedFormulaNumber}`,
            textToSpeak: cleanAudioPrompt(cq.textToSpeak || cq.question),
            question: cleanQuestionText(cq.question),
          };
        }
      });
    }

    if (customReading.length > 0) {
      customReading.sort((a, b) => a.id - b.id);
      customReading.forEach((cq) => {
        const idx = formulaQuestions.findIndex((q) => q.type === "reading" && q.id === cq.id);
        if (idx !== -1) {
          formulaQuestions[idx] = {
            ...cq,
            formula: selectedFormulaNumber,
            formulaName: `Fórmula ${selectedFormulaNumber}`,
            textToSpeak: cleanQuestionText(cq.question),
            question: cleanQuestionText(cq.question),
          };
        }
      });
    }

    // Check if user dropped custom formula files into data/formulas_personalizadas/ (PRIORIDAD MÁXIMA)
    const customDir = path.join(process.cwd(), "data", "formulas_personalizadas");
    if (fs.existsSync(customDir)) {
      const files = fs.readdirSync(customDir).filter((f) => f.endsWith(".json") && f !== "formula_ejemplo.json");
      for (const file of files) {
        try {
          const filePath = path.join(customDir, file);
          const raw = fs.readFileSync(filePath, "utf-8");
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((customQ: any) => {
              const matchesFormula =
                customQ.formula === selectedFormulaNumber ||
                file.toLowerCase().includes(`formula_${selectedFormulaNumber}.json`) ||
                file.toLowerCase().includes(`formula${selectedFormulaNumber}.json`);

              if (matchesFormula && customQ.id && customQ.question && customQ.options) {
                const idx = formulaQuestions.findIndex((q) => q.id === customQ.id);
                const cleanQ = cleanQuestionText(customQ.question);
                const cleanSpk = cleanAudioPrompt(customQ.textToSpeak || customQ.question);
                const ctx = customQ.context || cleanAudioPrompt(cleanSpk.replace(cleanQ, "").trim()) || cleanSpk;

                const enrichedQ: Question = {
                  id: customQ.id,
                  formula: selectedFormulaNumber,
                  formulaName: customQ.formulaName || `Fórmula ${selectedFormulaNumber}`,
                  type: customQ.type || (customQ.id <= 60 ? "listening" : "reading"),
                  context: ctx,
                  contextEs: customQ.contextEs || "Contexto en audio en inglés.",
                  question: cleanQ,
                  questionEs: customQ.questionEs || "¿Cuál es la respuesta correcta?",
                  textToSpeak: cleanSpk,
                  options: customQ.options,
                  correctAnswer: customQ.correctAnswer ?? 0,
                  image: customQ.image || null,
                  audioUrl: customQ.audioUrl || null,
                  explanation: customQ.explanation || "Respuesta oficial según el banco de reactivos.",
                };

                if (idx !== -1) {
                  formulaQuestions[idx] = enrichedQ;
                } else {
                  formulaQuestions.push(enrichedQ);
                }
              }
            });
          }
        } catch (e) {
          console.error("Error reading custom formula file:", file, e);
        }
      }
    }

    const listeningItems = formulaQuestions.filter((q) => q.type === "listening");
    const readingItems = formulaQuestions.filter((q) => q.type === "reading");

    let finalQuestions: Question[] = [];

    if (size === 100) {
      // EXAMEN OFICIAL: 1 a 60 Listening en orden estricto, 61 a 100 Reading en orden estricto (0 duplicados)
      const list60 = listeningItems.slice(0, 60).map((q, idx) => {
        const cleanQ = cleanQuestionText(q.question);
        const cleanSpk = cleanAudioPrompt(q.textToSpeak || q.question);
        const ctx = q.context || cleanAudioPrompt(cleanSpk.replace(cleanQ, "").trim()) || cleanSpk;
        return {
          ...q,
          id: idx + 1,
          formula: selectedFormulaNumber,
          formulaName: `Fórmula ${selectedFormulaNumber}`,
          type: "listening" as const,
          context: ctx,
          contextEs: q.contextEs || "Contexto de la situación en audio en inglés.",
          question: cleanQ,
          questionEs: q.questionEs || "¿Cuál es la respuesta correcta según el audio?",
          textToSpeak: cleanSpk,
        };
      });

      const read40 = readingItems.slice(0, 40).map((q, idx) => ({
        ...q,
        id: 60 + idx + 1,
        formula: selectedFormulaNumber,
        formulaName: `Fórmula ${selectedFormulaNumber}`,
        type: "reading" as const,
        textToSpeak: cleanQuestionText(q.question),
        question: cleanQuestionText(q.question),
      }));

      finalQuestions = [...list60, ...read40];
    } else {
      // QUIZZES (10, 20, 30, 50): 50% Listening y 50% Reading ALEATORIAS del banco de la fórmula
      // Así el usuario no ve siempre las mismas preguntas al repetir el quiz.
      const halfCount = Math.floor(size / 2);
      const readCount = size - halfCount;

      // Selección aleatoria sin repetición del pool de 60 listening
      const shuffledListening = shuffleArray(listeningItems);
      const listSlice = shuffledListening.slice(0, halfCount);

      // Selección aleatoria sin repetición del pool de 40 reading
      const shuffledReading = shuffleArray(readingItems);
      const readSlice = shuffledReading.slice(0, readCount);

      // Intercalar listening y reading (ej: 1L, 1R, 1L, 1R...) con IDs correlativos 1..size
      let lIdx = 0;
      let rIdx = 0;
      let globalId = 1;

      while (lIdx < listSlice.length || rIdx < readSlice.length) {
        if (lIdx < listSlice.length) {
          const item = listSlice[lIdx];
          const cleanQ = cleanQuestionText(item.question);
          const cleanSpk = cleanAudioPrompt(item.textToSpeak || item.question);
          const ctx = item.context || cleanAudioPrompt(cleanSpk.replace(cleanQ, "").trim()) || cleanSpk;
          finalQuestions.push({
            ...item,
            id: globalId++,
            formula: selectedFormulaNumber,
            formulaName: `Fórmula ${selectedFormulaNumber}`,
            type: "listening" as const,
            context: ctx,
            contextEs: item.contextEs || "Contexto de la situación en audio en inglés.",
            question: cleanQ,
            questionEs: item.questionEs || "¿Cuál es la respuesta correcta según el audio?",
            textToSpeak: cleanSpk,
          });
          lIdx++;
        }
        if (rIdx < readSlice.length) {
          const item = readSlice[rIdx];
          finalQuestions.push({
            ...item,
            id: globalId++,
            formula: selectedFormulaNumber,
            formulaName: `Fórmula ${selectedFormulaNumber}`,
            type: "reading" as const,
            textToSpeak: cleanQuestionText(item.question),
            question: cleanQuestionText(item.question),
          });
          rIdx++;
        }
      }
    }

    const availableFormulas = Array.from({ length: 100 }, (_, i) => i + 1);

    return NextResponse.json({
      type: typeParam,
      size,
      formula: selectedFormulaNumber,
      total: finalQuestions.length,
      questions: finalQuestions,
      availableFormulas,
    });
  } catch (error) {
    console.error("Error in questions route:", error);
    return NextResponse.json({ error: "Error loading questions" }, { status: 500 });
  }
}
