import { useState } from 'react';
import { quizzesApi } from '@/app/api/api';
import { Quiz, CreateQuizDto, UpdateQuizDto } from '@/types';

export const useQuizzes = () => {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuizzes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await quizzesApi.getAll();
      setQuizzes(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to fetch quizzes');
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchQuiz = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await quizzesApi.getById(id);
      setQuiz(response.data);
      return response.data;
    } catch (err) {
      setError(`Failed to fetch quiz with ID: ${id}`);
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createQuiz = async (data: CreateQuizDto) => {
    setLoading(true);
    setError(null);
    try {
      const response = await quizzesApi.create(data);
      setQuizzes(prevQuizzes => [...prevQuizzes, response.data]);
      return response.data;
    } catch (err) {
      setError('Failed to create quiz');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateQuiz = async (id: number, data: UpdateQuizDto) => {
    setLoading(true);
    setError(null);
    try {
      const response = await quizzesApi.update(id, data);
      setQuizzes(prevQuizzes => 
        prevQuizzes.map(quiz => quiz.id === id ? response.data : quiz)
      );
      if (quiz && quiz.id === id) {
        setQuiz(response.data);
      }
      return response.data;
    } catch (err) {
      setError(`Failed to update quiz with ID: ${id}`);
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteQuiz = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await quizzesApi.delete(id);
      setQuizzes(prevQuizzes => prevQuizzes.filter(quiz => quiz.id !== id));
      if (quiz && quiz.id === id) {
        setQuiz(null);
      }
      return true;
    } catch (err) {
      setError(`Failed to delete quiz with ID: ${id}`);
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    quizzes,
    quiz,
    loading,
    error,
    fetchQuizzes,
    fetchQuiz,
    createQuiz,
    updateQuiz,
    deleteQuiz
  };
}; 