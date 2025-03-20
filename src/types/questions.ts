import { AnswerBulkDTO } from "./answer";
import { QuizDifficulty } from "./quiz";

export enum QuestionType {
  MULTIPLE_CHOICE = "MULTIPLE_CHOICE",
  TRUE_FALSE = "TRUE_FALSE",
}

export interface Question {
  id: number;
  quizId: string;
  text: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  points: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateQuestionDto {
  quizId: string;
  text: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  points: number;
}

export interface UpdateQuestionDto {
  text?: string;
  type?: QuestionType;
  options?: string[];
  correctAnswer?: string;
  points?: number;
}

export interface QuestionBulkItem {
  text: string;
  type: QuestionType;
  options: string[];
  correctAnswer: string;
  quizId: string;
  points: number;
}

export interface QuestionBulkDto {
  questions: QuestionBulkItem[];
  quizId: string;
}
