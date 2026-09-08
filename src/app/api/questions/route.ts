import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Question, SessionSize } from "@/lib/types";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get("type") || "mixed";
  const sizeParam = parseInt(searchParams.get("size") || "100", 10);
  const formulaParam = searchParams.get("formula"); // e.g. "1", "2", "random"

  const validSizes: SessionSize[] = [10, 30, 50, 100];
  const size: SessionSize = validSizes.includes(sizeParam as SessionSize)
    ? (sizeParam as SessionSize)
    : 100;

  try {
    const listeningPath = path.join(process.cwd(), "data", "listening", "formulas_listening.json");
    const readingPath = path.join(process.cwd(), "data", "reading", "formulas_reading.json");

    const rawListening = fs.existsSync(listeningPath) ? fs.readFileSync(listeningPath, "utf-8") : "[]";
    const rawReading = fs.existsSync(readingPath) ? fs.readFileSync(readingPath, "utf-8") : "[]";

    const allListening: Question[] = JSON.parse(rawListening);
    const allReading: Question[] = JSON.parse(rawReading);

    // Get list of distinct formulas available
    const availableFormulas = Array.from(
      new Set([...allListening.map((q) => q.formula), ...allReading.map((q) => q.formula)])
    ).sort((a, b) => a - b);

    // Determine chosen formula
    let selectedFormulaNumber: number = 1;
    if (formulaParam === "random") {
      selectedFormulaNumber = availableFormulas[Math.floor(Math.random() * availableFormulas.length)] || 1;
    } else if (formulaParam && !isNaN(parseInt(formulaParam, 10))) {
      selectedFormulaNumber = parseInt(formulaParam, 10);
    } else {
      selectedFormulaNumber = 1;
    }

    // Filter questions for the selected formula
    let formulaListening = allListening.filter((q) => q.formula === selectedFormulaNumber);
    let formulaReading = allReading.filter((q) => q.formula === selectedFormulaNumber);

    // Fallback if formula not found in bank
    if (formulaListening.length === 0) formulaListening = allListening.filter((q) => q.formula === 1);
    if (formulaReading.length === 0) formulaReading = allReading.filter((q) => q.formula === 1);

    // Sort in their natural sequential order (1..60 for listening, 61..100 for reading)
    formulaListening.sort((a, b) => a.id - b.id);
    formulaReading.sort((a, b) => a.id - b.id);

    let finalQuestions: Question[] = [];

    if (size === 100) {
      // EXAMEN OFICIAL (100 PREGUNTAS EN ORDEN ESTRICTO):
      // Parte 1: 1 a 60 Listening
      // Parte 2: 61 a 100 Reading
      const list60 = formulaListening.slice(0, 60).map((q, idx) => ({
        ...q,
        id: idx + 1,
        formula: selectedFormulaNumber,
        formulaName: `Fórmula ${selectedFormulaNumber}`,
        type: "listening" as const,
      }));

      const read40 = formulaReading.slice(0, 40).map((q, idx) => ({
        ...q,
        id: 60 + idx + 1,
        formula: selectedFormulaNumber,
        formulaName: `Fórmula ${selectedFormulaNumber}`,
        type: "reading" as const,
      }));

      finalQuestions = [...list60, ...read40];
    } else {
      // QUIZZES DE PRÁCTICA (10, 30, 50):
      // Mitad Listening y Mitad Reading, todas distintas y en orden intercalado
      const halfCount = Math.floor(size / 2);
      const listSlice = formulaListening.slice(0, halfCount);
      const readSlice = formulaReading.slice(0, size - halfCount);

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
