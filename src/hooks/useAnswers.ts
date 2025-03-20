import { useState } from "react";
import { answersApi } from "@/app/api/api";
import { Answer, CreateAnswerDto, UpdateAnswerDto, AnswerBulkDTO  } from "@/types/answer";
import { fetchAnswersCount } from '../app/api/api';

export const useAnswers = () => {
    const [answers, setAnswers] = useState<Answer[]>([]);
    const [answer, setAnswer] = useState<Answer | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchAnswers = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await answersApi.getAll();
            setAnswers(response.data);
            return response.data;
        } catch (err) {
            setError("Failed to fetch answers");
            console.error(err);
            return [];
        } finally {
            setLoading(false);
        }
    }

    const fetchAnswer = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await answersApi.getById(id);
            setAnswer(response.data);
            return response.data;
        } catch (err) {
            setError(`Failed to fetch answer with ID: ${id}`);
            console.error(err);
            return null;
        } finally {
            setLoading(false);
        }
    }

    const createAnswer = async (data: CreateAnswerDto) => {
        setLoading(true);
        setError(null);
        try {
            const response = await answersApi.create(data);
            setAnswers(prevAnswers => [...prevAnswers, response.data]);
            return response.data;
        } catch (err) {
            setError("Failed to create answer");
            console.error(err);
            return null;
        } finally {
            setLoading(false);
        }
    }

    const updateAnswer = async (id: number, data: UpdateAnswerDto) => {
        setLoading(true);
        setError(null);
        try {
            const response = await answersApi.update(id, data);
            setAnswers(prevAnswers => prevAnswers.map(a => a.id === id ? response.data : a));
            return response.data;
        } catch (err) {
            setError(`Failed to update answer with ID: ${id}`);
            console.error(err);
            return null;
        } finally {
            setLoading(false);
        }
    }

    const deleteAnswer = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            await answersApi.delete(id);
            setAnswers(prevAnswers => prevAnswers.filter(a => a.id !== id));
        } catch (err) {
            setError(`Failed to delete answer with ID: ${id}`);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return {
        answers,
        answer,
        loading,
        error,
        fetchAnswers,
        fetchAnswer,
        createAnswer,
        updateAnswer,
        deleteAnswer
    };
}