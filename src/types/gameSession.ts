import { Quiz } from "./quiz";
import { User } from "./user";

export interface GameSession {
    id: string;
    score: number;
    userId: number;
    quizId: number;
    user?: User;
    quiz?: Quiz;
    sessionDate: string;
    createdAt: string;
    updatedAt: string;
}

export interface GameSessionGrouped {
    avgScore?: number;
    totalScore: number;
    user: User;
    games: GameSession[];
}

export interface CreateGameDto {
    score: number;
    userId: number;
    quizId: number;
}

export interface UpdateGameDto {
    id: number;
    score?: number;
}