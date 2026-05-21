export type Category =
  | "mindset" | "clarity" | "habit" | "focus"
  | "productivity" | "strategy" | "creativity" | "learning"
  | "wellbeing" | "logic" | "psychology" | "success"
  | "stoicism" | "cognitive-bias" | "decision-making"
  | "business" | "mental-model" | "problem-solving"
  | "game-theory" | "resilience" | "risk" | "economics";

export interface ReactFlowNode {
  id: string;
  position: { x: number; y: number };
  data: { label: string };
  type?: string;
  style?: Record<string, string>;
}

export interface ReactFlowEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  animated?: boolean;
}

export interface Question {
  id: string;
  moduleId: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
}

export interface Module {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  content?: string;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  questions?: Question[];
  _count?: { questions: number };
  locked?: boolean;
}

export interface ModuleListItem {
  id: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  content?: string;
  isPremium: boolean;
  createdAt: string;
  updatedAt: string;
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  _count?: { questions: number };
  isFavorited?: boolean;
  isDailyFree?: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  avatar: string | null;
  subscriptionStatus?: string;
  preferredCategories?: string[];
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  moduleId: string;
  listeningProgress: number;
  readingProgress: number;
  scrollPosition: number;
  currentCharIndex: number;
  audioRate: number;
  completed: boolean;
  lastReadAt: string;
}

export interface QuizSubmitResponse {
  score: number;
  total: number;
  percentage: number;
  answers: {
    questionId: string;
    correct: boolean;
    correctAnswer: number;
    explanation: string;
  }[];
}

export interface QuizAttempt {
  id: string;
  moduleId: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  completedAt: string;
}

export interface FavoriteItem {
  id: string;
  moduleId: string;
  slug: string;
  title: string;
  description: string;
  category: string;
  content?: string;
  isPremium?: boolean;
  nodes: ReactFlowNode[];
  edges: ReactFlowEdge[];
  questionCount: number;
  createdAt: string;
}

export interface Reflection {
  id: string;
  userId: string;
  moduleId: string;
  title: string;
  content: string;
  timestamp: string;
  module?: { slug: string; title: string; category: string };
}

export interface Highlight {
  id: string;
  userId: string;
  moduleId: string;
  text: string;
  note: string;
  timestamp: string;
  module?: { slug: string; title: string; category: string };
}

export interface MatrixRow {
  id: number;
  type: string;
  label: string;
  value: any;
  options?: string[];
}

export interface ActionPlan {
  id: string;
  userId: string;
  moduleId: string;
  title: string;
  content: MatrixRow[];
  appliedAt: string;
  completed: boolean;
  module?: { slug: string; title: string; category: string };
}

export interface ProgressStats {
  totalModules: number;
  completedModules: number;
  overallProgress: number;
  listeningMinutes: number;
  readingMinutes: number;
  completedNodes: number;
  inProgressCount: number;
  highlights: number;
  historyCount: number;
  categoryBreakdown: Record<string, number>;
  listenXp: number;
  readXp: number;
  completedXp: number;
  reflectionXp: number;
  highlightXp: number;
  streakXp: number;
  totalXp: number;
  rank: string;
  rankLevel: number;
  nextRank: string | null;
  nextLevelXp: number;
  prevLevelXp: number;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
