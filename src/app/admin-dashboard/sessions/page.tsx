"use client";

import { useState, useEffect } from "react";
import {
  User as UserIcon,
  Trophy,
  Clock,
  Target,
  Users,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { ColumnDef } from "@tanstack/react-table";
import { GameSession } from "@/types/gameSession";
import { gameSessionApi, usersApi } from "@/app/api/api";
import { User } from "@/types/user";

interface PlayerStats {
  userId: number;
  username: string;
  totalGames: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  lastPlayed: string;
  sessions: GameSession[];
}

export default function GameSessionPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [users, setUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les sessions et les utilisateurs en parallèle
        const [sessionsResponse, usersResponse] = await Promise.all([
          gameSessionApi.getAll(),
          usersApi.getAll(),
        ]);

        const sessions = sessionsResponse.data;
        const users = usersResponse.data;
        setUsers(users);

        // Grouper les sessions par joueur
        const statsByPlayer = sessions.reduce((acc: { [key: number]: PlayerStats }, session) => {
          const userId = session.userId;
          if (!acc[userId]) {
            acc[userId] = {
              userId,
              username: users.find(u => u.id === userId)?.name || "Anonyme",
              totalGames: 0,
              totalScore: 0,
              averageScore: 0,
              bestScore: 0,
              lastPlayed: "",
              sessions: [],
            };
          }

          acc[userId].totalGames++;
          acc[userId].totalScore += session.score;
          acc[userId].sessions.push(session);
          
          // Mettre à jour le meilleur score
          if (session.score > acc[userId].bestScore) {
            acc[userId].bestScore = session.score;
          }

          // Mettre à jour la dernière date de jeu
          const sessionDate = new Date(session.createdAt || "");
          const lastPlayed = acc[userId].lastPlayed ? new Date(acc[userId].lastPlayed) : new Date(0);
          if (sessionDate > lastPlayed) {
            acc[userId].lastPlayed = session.createdAt || "";
          }

          return acc;
        }, {});

        // Calculer les moyennes et convertir en tableau
        const statsArray = Object.values(statsByPlayer).map(stats => ({
          ...stats,
          averageScore: stats.totalScore / stats.totalGames,
        }));

        // Trier par score moyen décroissant
        statsArray.sort((a, b) => b.averageScore - a.averageScore);
        setPlayerStats(statsArray);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données des sessions",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const columns: ColumnDef<PlayerStats>[] = [
    {
      accessorKey: "position",
      header: "Position",
      cell: ({ row }) => {
        const position = row.index + 1;
        return (
          <Badge variant={position <= 3 ? "default" : "secondary"}>
            {position}
          </Badge>
        );
      },
    },
    {
      accessorKey: "username",
      header: "Joueur",
    },
    {
      accessorKey: "totalGames",
      header: "Parties jouées",
    },
    {
      accessorKey: "averageScore",
      header: "Score moyen",
      cell: ({ row }) => Math.round(row.original.averageScore),
    },
    {
      accessorKey: "bestScore",
      header: "Meilleur score",
    },
    {
      accessorKey: "lastPlayed",
      header: "Dernière partie",
      cell: ({ row }) => new Date(row.original.lastPlayed).toLocaleDateString(),
    },
  ];

  return (
    <DashboardShell>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total des joueurs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playerStats.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meilleur score moyen</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {playerStats.length > 0 ? Math.round(playerStats[0].averageScore) : 0}
            </div>
            {playerStats.length > 0 && (
              <p className="text-xs text-muted-foreground">
                par {playerStats[0].username}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Meilleur score absolu</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {playerStats.length > 0 
                ? Math.max(...playerStats.map(p => p.bestScore)) 
                : 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Parties jouées</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {playerStats.reduce((total, player) => total + player.totalGames, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Classement des joueurs</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <p>Chargement des données...</p>
            </div>
          ) : playerStats.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <p>Aucune session de jeu trouvée</p>
            </div>
          ) : (
            <DataTable columns={columns} data={playerStats} />
          )}
        </CardContent>
      </Card>
    </DashboardShell>
  );
}
