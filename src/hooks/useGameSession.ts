import { useState } from "react";
import { gameSessionApi } from "@/app/api/api";
import { CreateGameDto, GameSession, UpdateGameDto } from "@/types/gameSession";

export const useGameSession = () => {
    const [gameSession, setGameSession] = useState<GameSession| null>(null);
    const [gameSessionGrouped, setGameSessionGrouped] = useState<GameSession[]>([]);
    const [gameSessionFilter, setGameSessionFilter] = useState("");
    const [gameSessions, setGameSessions] = useState<GameSession[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGameSessions = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await gameSessionApi.getAll();
            setGameSessions(response.data);
            return response.data;
        } catch (err) {
            setError("Failed to fetch game sessions");
        } finally {
            setLoading(false);
        }
    };

    const fetchGameSession = async (id: number) => {
        setLoading(true);
        setError(null);
        try {
            const response = await gameSessionApi.getById(id);
            setGameSession(response.data);
            return response.data;
        } catch (err) {
            setError(`Failed to fetch game session with ID: ${id}`);
        } finally {
            setLoading(false);
        }
    };

    const fetchGameSessionGrouped = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await gameSessionApi.getGroupedGames();
            setGameSessionGrouped(response.data);
            return response.data;
        } catch (err) {
            setError("Failed to fetch game sessions grouped");
        } finally {
            setLoading(false);
        }
    };

    const createGameSession = async (gameSessionDto: CreateGameDto) => {
        setLoading(true);
        setError(null);
        try {
            const response = await gameSessionApi.create(gameSessionDto);
            setGameSessions([...gameSessions, response.data]);
            return response.data;
        } catch (err) {
            setError("Failed to create game session");
        } finally {
            setLoading(false);
        }
    };

    

    
    return {
        gameSession,
        gameSessionGrouped,
        gameSessionFilter,
        gameSessions,
        loading,
        error,
        fetchGameSessions,
        fetchGameSession,
        fetchGameSessionGrouped,
        createGameSession,
    };
};