import { useState } from "react";
import { questionsApi } from "@/app/api/api";
import {
  Question,
  CreateQuestionDto,
  UpdateQuestionDto,
  QuestionBulkDto,
} from "@/types/questions";

export const useQuestions = () => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [question, setQuestion] = useState<Question | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await questionsApi.getAll();
      setQuestions(response.data);
      return response.data;
    } catch (err) {
      setError("Failed to fetch questions");
    } finally {
      setLoading(false);
    }
  };

  const fetchQuestion = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await questionsApi.getById(id);
      setQuestion(response.data);
      return response.data;
    } catch (err) {
      setError(`Failed to fetch question with ID: ${id}`);
    } finally {
      setLoading(false);
    }
  };

  const createQuestion = async (questionDto: CreateQuestionDto) => {
    setLoading(true);
    setError(null);
    try {
      const response = await questionsApi.create(questionDto);
      setQuestions([...questions, response.data]);
      return response.data;
    } catch (err) {
      setError("Failed to create question");
    } finally {
      setLoading(false);
    }
  };

  const updateQuestion = async (id: number, questionDto: UpdateQuestionDto) => {
    setLoading(true);
    setError(null);
    try {
      const response = await questionsApi.update(id, questionDto);
      setQuestions(questions.map((q) => (q.id === id ? response.data : q)));
      return response.data;
    } catch (err) {
      setError(`Failed to update question with ID: ${id}`);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await questionsApi.delete(id);
      setQuestions(questions.filter((q) => q.id !== id));
    } catch (err) {
      setError(`Failed to delete question with ID: ${id}`);
    } finally {
      setLoading(false);
    }
  };

  // bulk create questions
  const bulkCreateQuestions = async (questionsDto: QuestionBulkDto) => {
    setLoading(true);
    setError(null);
    try {
      const response = await questionsApi.createBulk(questionsDto);
      setQuestions([...questions, ...response.data]);
      return response.data;
    } catch (err) {
      setError("Failed to create questions");
    } finally {
      setLoading(false);
    }
  };

  return {
    questions,
    question,
    loading,
    error,
    fetchQuestions,
    fetchQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    bulkCreateQuestions,
  };
};
