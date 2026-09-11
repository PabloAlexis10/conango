export type SessionType = "listening" | "reading" | "mixed";
export type SessionSize = 10 | 20 | 30 | 40 | 50 | 100;

export interface Question {
  id: number;
  type: "listening" | "reading";
  formula: number;
  formulaName?: string;
  context?: string;
  contextEs?: string;
  question: string;
  questionEs?: string;
  options: string[];
  correctAnswer: number;
  image?: string | null;
  audioUrl?: string | null;
  textToSpeak?: string;
  explanation: string;
}

export interface QuestionReview {
  id: number;
  type: "listening" | "reading";
  formula: number;
  formulaName?: string;
  context?: string;
  contextEs?: string;
  question: string;
  questionEs?: string;
  options: string[];
  correctAnswer: number;
  selectedAnswer: number;
  isCorrect: boolean;
  explanation: string;
  image?: string | null;
  audioUrl?: string | null;
  textToSpeak?: string;
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
  mascotName?: string;
  avatar?: string;
  email: string;
  password?: string;
  medals: number;
  isPro?: boolean;
  hearts?: number;
  maxHearts?: number;
  streakDays?: number;
  streak?: number;
  lastStreakDate?: string;
  lastActiveDate?: string;
  streakFreeze?: number; // Congelador de racha estilo Duolingo
  xp?: number;
  level?: number;
  rankName?: string;
  doubleXpExpiresAt?: string | null;
  gems?: number; // Gemas azules estilo Duolingo
  coins?: number;
  dailyQuestsDate?: string;
  dailyXpEarned?: number;
  dailyLessonsCompleted?: number;
  dailyBestScore?: number;
  claimedQuests?: string[];
  role?: "admin" | "cadet";
  created_at: string;
}

export interface PromoCode {
  id: string;
  code: string;
  type: "discount" | "gift" | "pro_trial";
  value: number;
  description: string;
  rewardDetail?: {
    gems?: number;
    streakFreeze?: number;
    discountPercent?: number;
    proDays?: number;
  };
  expiresAt?: string;
  maxUses?: number;
  usedCount: number;
  active: boolean;
  createdAt: string;
  createdBy?: string;
}

export interface MistakeRecord {
  id: string;
  questionId: number;
  questionText: string;
  context?: string;
  options: string[];
  correctAnswer: number;
  selectedAnswer: number;
  explanation: string;
  formula: number;
  failedCount: number;
  mastered: boolean;
  lastAttemptAt: string;
}

export interface ShopPowerUp {
  id: string;
  name: string;
  emoji: string;
  description: string;
  priceGems: number;
  priceClp?: number;
  category: "booster" | "streak" | "hearts" | "pro";
}

export interface DiamondPack {
  id: string;
  name: string;
  emoji: string;
  gemsCount: number;
  bonusText?: string;
  priceClp: number;
  description: string;
  popular?: boolean;
}

export interface DailyQuest {
  id: string;
  title: string;
  emoji: string;
  description: string;
  target: number;
  current: number;
  rewardType: "double_xp" | "gems";
  rewardValue: number;
  completed: boolean;
  claimed: boolean;
}

export interface FriendChallenge {
  id: string;
  creatorName: string;
  formula: number;
  size: number;
  creatorScore: number;
  creatorPercentage: number;
  createdAt: string;
}
