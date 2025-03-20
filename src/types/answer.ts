export interface Answer {
    id: number;
    questionId: number;
    text: string;
    isCorrect: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface CreateAnswerDto {
    questionId: number;
    text: string;
    isCorrect: boolean;
}

export interface UpdateAnswerDto {
    text?: string;
    isCorrect?: boolean;
}

export interface AnswerBulkDTO {
    id: number;
    text: string;
    isCorrect: boolean;
}