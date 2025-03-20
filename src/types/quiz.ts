import { Category } from "./category";
import { QuestionBulkDto } from "./questions";

export type QuizDifficulty = "easy" | "medium" | "hard";

export interface Quiz {
  id: number;
  title: string;
  description?: string;
  categoryId: number;
  authorId: number;
  difficulty: QuizDifficulty;
  category?: Category;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuizDto {
  title: string;
  description?: string;
  categoryId: number;
  authorId?: number;
  difficulty: QuizDifficulty;
}

export interface UpdateQuizDto {
  title?: string;
  description?: string;
  categoryId?: number;
  authorId?: number;
  difficulty?: QuizDifficulty;
} 

export interface BulkQuizDto {
  name: string;
  description?: string;
  quizzes: CreateQuizDto[];
}

export interface QuizBulkDto {
  title: string;
  difficulty: QuizDifficulty;
  questions: QuestionBulkDto[];
}