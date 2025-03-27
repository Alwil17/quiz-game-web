import { useState } from 'react';
import { categoriesApi } from '@/app/api/api';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '@/types';

export const useCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoriesApi.getAll();
      setCategories(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to fetch categories');
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchCategory = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoriesApi.getById(id);
      setCategory(response.data);
      return response.data;
    } catch (err) {
      setError(`Failed to fetch category with ID: ${id}`);
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createCategory = async (data: CreateCategoryDto) => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoriesApi.create(data);
      setCategories(prevCategories => [...prevCategories, response.data]);
      return response.data;
    } catch (err) {
      setError('Failed to create category');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateCategory = async (id: number, data: UpdateCategoryDto) => {
    setLoading(true);
    setError(null);
    try {
      const response = await categoriesApi.update(id, data);
      setCategories(prevCategories => 
        prevCategories.map(category => category.id === id ? response.data : category)
      );
      if (category && category.id === id) {
        setCategory(response.data);
      }
      return response.data;
    } catch (err) {
      setError(`Failed to update category with ID: ${id}`);
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteCategory = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await categoriesApi.delete(id);
      setCategories(prevCategories => prevCategories.filter(category => category.id !== id));
      if (category && category.id === id) {
        setCategory(null);
      }
      return true;
    } catch (err) {
      setError(`Failed to delete category with ID: ${id}`);
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    category,
    loading,
    error,
    fetchCategories,
    fetchCategory,
    createCategory,
    updateCategory,
    deleteCategory
  };
}; 