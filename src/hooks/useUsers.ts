import { useState } from 'react';
import { usersApi } from '@/app/api/api';
import { User, CreateUserDto, UpdateUserDto } from '@/types';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await usersApi.getAll();
      setUsers(response.data);
      return response.data;
    } catch (err) {
      setError('Failed to fetch users');
      console.error(err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchUser = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await usersApi.getById(id);
      setUser(response.data);
      return response.data;
    } catch (err) {
      setError(`Failed to fetch user with ID: ${id}`);
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (data: CreateUserDto) => {
    setLoading(true);
    setError(null);
    try {
      const response = await usersApi.create(data);
      setUsers(prevUsers => [...prevUsers, response.data]);
      return response.data;
    } catch (err) {
      setError('Failed to create user');
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (id: number, data: UpdateUserDto) => {
    setLoading(true);
    setError(null);
    try {
      const response = await usersApi.update(id, data);
      setUsers(prevUsers => 
        prevUsers.map(user => user.id === id ? response.data : user)
      );
      if (user && user.id === id) {
        setUser(response.data);
      }
      return response.data;
    } catch (err) {
      setError(`Failed to update user with ID: ${id}`);
      console.error(err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id: number) => {
    setLoading(true);
    setError(null);
    try {
      await usersApi.delete(id);
      setUsers(prevUsers => prevUsers.filter(user => user.id !== id));
      if (user && user.id === id) {
        setUser(null);
      }
      return true;
    } catch (err) {
      setError(`Failed to delete user with ID: ${id}`);
      console.error(err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    user,
    loading,
    error,
    fetchUsers,
    fetchUser,
    createUser,
    updateUser,
    deleteUser
  };
}; 