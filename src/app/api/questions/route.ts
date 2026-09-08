import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Question, SessionSize } from "@/lib/types";
import { getFormulaQuestions } from "@/lib/questionBank";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get("type") || "mixed";
  const sizeParam = parseInt(searchParams.get("size") || "100", 10);
  const formulaParam = searchParams.get("formula"); // e.g. "1", "45", "random"

  const validSizes: SessionSize[] = [10, 30, 50, 100];
  const size: SessionSize = validSizes.includes(sizeParam as SessionSize)
    ? (sizeParam as SessionSize)
    : 100;

  try {
    // Determine chosen formula (1 to 100)
    let selectedFormulaNumber: number = 1;
    if (formulaParam === "random") {
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
            textToSpeak: cq.textToSpeak || cq.question,
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
          };
        }
      });
    }

    const listeningItems = formulaQuestions.filter((q) => q.type === "listening");
    const readingItems = formulaQuestions.filter((q) => q.type === "reading");

    let finalQuestions: Question[] = [];

    if (size === 100) {
      // EXAMEN OFICIAL: 1 a 60 Listening en orden estricto, 61 a 100 Reading en orden estricto
      const list60 = listeningItems.slice(0, 60).map((q, idx) => ({
        ...q,
        id: idx + 1,
        formula: selectedFormulaNumber,
        formulaName: `Fórmula ${selectedFormulaNumber}`,
        type: "listening" as const,
      }));

      const read40 = readingItems.slice(0, 40).map((q, idx) => ({
        ...q,
        id: 60 + idx + 1,
        formula: selectedFormulaNumber,
        formulaName: `Fórmula ${selectedFormulaNumber}`,
        type: "reading" as const,
      }));

      finalQuestions = [...list60, ...read40];
    } else {
      // QUIZZES (10, 30, 50): Mitad listening, mitad reading sin repeticiones
      const halfCount = Math.floor(size / 2);
      const listSlice = listeningItems.slice(0, halfCount);
      const readSlice = readingItems.slice(0, size - halfCount);

      let lIdx = 0;
      let rIdx = 0;
      let globalId = 1;

      while (lIdx < listSlice.length || rIdx < readSlice.length) {
        if (lIdx < listSlice.length) {
          finalQuestions.push({
            ...listSlice[lIdx],
            id: globalId++,
            formula: selectedFormulaNumber,
            formulaName: `Fórmula ${selectedFormulaNumber}`,
            type: "listening" as const,
          });
          lIdx++;
        }
        if (rIdx < readSlice.length) {
          finalQuestions.push({
            ...readSlice[rIdx],
            id: globalId++,
            formula: selectedFormulaNumber,
            formulaName: `Fórmula ${selectedFormulaNumber}`,
            type: "reading" as const,
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
