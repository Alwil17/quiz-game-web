import { AnswerBulkDTO } from "./answer";
import { QuizDifficulty } from "./quiz";

export type QuestionType = "MTC" | "True/False";
export interface Question {
  id: number;
  quizId: number;
  text: string;
  type: QuestionType;
  level?: QuizDifficulty;
  createdAt: string;
  updatedAt: string;
}

export interface CreateQuestionDto {
  quizId: number;
  text: string;
  type: QuestionType;
  level?: QuizDifficulty;
}

export interface UpdateQuestionDto {
  text: string;
  type: QuestionType;
  level?: QuizDifficulty;
}

export interface QuestionBulkDto {
  text: string;
  type: QuestionType;
  level?: QuizDifficulty;
  answers: AnswerBulkDTO[];
}
