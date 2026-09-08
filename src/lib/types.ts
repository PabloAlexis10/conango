export type SessionType = "listening" | "reading" | "mixed";
export type SessionSize = 10 | 30 | 50 | 100;

export interface Question {
  id: number;
  type: "listening" | "reading";
  formula: number;
  formulaName?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  image?: string | null;
  audioUrl?: string | null;
  explanation: string;
}

export interface QuestionReview {
  id: number;
  type: "listening" | "reading";
  formula: number;
  formulaName?: string;
  question: string;
  options: string[];
  correctAnswer: number;
  selectedAnswer: number;
  isCorrect: boolean;
  explanation: string;
  image?: string | null;
  audioUrl?: string | null;
}

export interface SessionResult {
  id?: string;
  user_id?: string;
  type: SessionType;
  size: SessionSize;
  correct: number;
  incorrect: number;
  percentage: number;
  created_at: string;
}

export interface ExamResult {
  id?: string;
  user_id?: string;
  type: SessionType;
  correct: number;
  incorrect: number;
  percentage: number;
  details: QuestionReview[];
  created_at: string;
}

export interface UserProfile {
  id: string;
  name?: string;
  email: string;
  password?: string;
  medals: number;
  created_at: string;
}
