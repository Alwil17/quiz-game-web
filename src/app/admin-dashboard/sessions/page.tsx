"use client";

import { useState, useEffect } from "react";
import {
  User as UserIcon,
  Trophy,
  Clock,
  Target,
  Users,
  ChevronDown,
  ChevronUp,
  Calendar,
  BookOpen,
  Award,
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
import { gameSessionApi, usersApi, quizzesApi } from "@/app/api/api";
import { User } from "@/types/user";
import { Quiz } from "@/types/quiz";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Interface étendue pour les sessions enrichies avec le titre du quiz
interface EnrichedGameSession extends GameSession {
  quizTitle: string;
}

interface PlayerStats {
  userId: number;
  username: string;
  totalGames: number;
  totalScore: number;
  averageScore: number;
  bestScore: number;
  lastPlayed: string;
  sessions: EnrichedGameSession[];
}

export default function GameSessionPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [playerStats, setPlayerStats] = useState<PlayerStats[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<PlayerStats | null>(
    null
  );
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Récupérer les sessions, utilisateurs et quiz en parallèle
        const [sessionsResponse, usersResponse, quizzesResponse] =
          await Promise.all([
            gameSessionApi.getAll(),
            usersApi.getAll(),
            quizzesApi.getAll(),
          ]);

        const sessions = sessionsResponse.data;
        const users = usersResponse.data;
        const quizzes = quizzesResponse.data;

        setUsers(users);
        setQuizzes(quizzes);

        // Grouper les sessions par joueur
        const statsByPlayer = sessions.reduce(
          (acc: { [key: number]: PlayerStats }, session) => {
            const userId = session.userId;
            if (!acc[userId]) {
              acc[userId] = {
                userId,
                username: users.find((u) => u.id === userId)?.name || "Anonyme",
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

            // Enrichir la session avec le titre du quiz
            const enrichedSession: EnrichedGameSession = {
              ...session,
              quizTitle:
                quizzes.find((q) => q.id === session.quizId)?.title ||
                "Quiz inconnu",
            };

            acc[userId].sessions.push(enrichedSession);

            // Mettre à jour le meilleur score
            if (session.score > acc[userId].bestScore) {
              acc[userId].bestScore = session.score;
            }

            // Mettre à jour la dernière date de jeu
            const sessionDate = new Date(session.createdAt || "");
            const lastPlayed = acc[userId].lastPlayed
              ? new Date(acc[userId].lastPlayed)
              : new Date(0);
            if (sessionDate > lastPlayed) {
              acc[userId].lastPlayed = session.createdAt || "";
            }

            return acc;
          },
          {}
        );

        // Calculer les moyennes et convertir en tableau
        const statsArray = Object.values(statsByPlayer).map((stats) => ({
          ...stats,
          averageScore: stats.totalScore / stats.totalGames,
          // Trier les sessions par date (plus récente en premier)
          sessions: stats.sessions.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          ),
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

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const showPlayerDetails = (player: PlayerStats) => {
    setSelectedPlayer(player);
    setIsDetailsOpen(true);
  };

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
      cell: ({ row }) => (
        <Button
          variant="link"
          onClick={() => showPlayerDetails(row.original)}
          className="p-0 h-auto font-medium text-blue-600 hover:underline"
        >
          {row.original.username}
        </Button>
      ),
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
    {
      id: "actions",
      cell: ({ row }) => (
        <Button
          variant="outline"
          size="sm"
          onClick={() => showPlayerDetails(row.original)}
        >
          Détails
        </Button>
      ),
    },
  ];

  return (
    <DashboardShell>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total des joueurs
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{playerStats.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Meilleur score moyen
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {playerStats.length > 0
                ? Math.round(playerStats[0].averageScore)
                : 0}
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
            <CardTitle className="text-sm font-medium">
              Meilleur score absolu
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {playerStats.length > 0
                ? Math.max(...playerStats.map((p) => p.bestScore))
                : 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Parties jouées
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {playerStats.reduce(
                (total, player) => total + player.totalGames,
                0
              )}
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
            <div className="flex justify-center py-10">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
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
      {/* Dialogue des détails des sessions d'un joueur */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-background z-10 pb-2">
            <DialogTitle className="text-xl flex items-center ">
              <UserIcon className="mr-2 h-5 w-5" />
              Sessions de {selectedPlayer?.username}
            </DialogTitle>
          </DialogHeader>

          {selectedPlayer && (
            <div className="space-y-6">
              {/* Carte de résumé */}
              <div className="grid gap-4 md:grid-cols-4">
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm">Sessions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">
                      {selectedPlayer.totalGames}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm">Score moyen</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">
                      {Math.round(selectedPlayer.averageScore)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm">Meilleur score</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">
                      {selectedPlayer.bestScore}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="py-2">
                    <CardTitle className="text-sm">Total points</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-bold">
                      {selectedPlayer.totalScore}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Liste des sessions */}
              <div className="border rounded-md">
                <div className="max-h-[40vh] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-background z-10">
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Quiz</TableHead>
                        <TableHead>Score</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selectedPlayer.sessions.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center">
                            Aucune session trouvée
                          </TableCell>
                        </TableRow>
                      ) : (
                        selectedPlayer.sessions.map((session) => (
                          <TableRow key={session.id}>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="font-medium">
                                  {formatDateTime(session.createdAt)}
                                </span>
                                <span className="text-xs text-gray-500">
                                  ID: {session.id}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>{session.quizTitle}</TableCell>
                            <TableCell>
                              <Badge
                                variant={
                                  session.score === selectedPlayer.bestScore
                                    ? "default"
                                    : "outline"
                                }
                              >
                                {session.score} pts
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button variant="ghost" size="sm">
                                Détails
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>

              {/* Statistiques sur les 5 dernières sessions */}
              {selectedPlayer.sessions.length >= 5 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-md">Évolution récente</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-1">
                      {selectedPlayer.sessions
                        .slice(0, 5)
                        .map((session, index) => (
                          <div
                            key={session.id}
                            className="flex items-center justify-between"
                          >
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-500">
                                {new Date(
                                  session.createdAt
                                ).toLocaleDateString()}
                              </span>
                              <span className="text-sm font-medium truncate max-w-[200px]">
                                {session.quizTitle}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">
                                {session.score} pts
                              </span>
                              {index > 0 && (
                                <Badge
                                  variant={
                                    session.score >
                                    selectedPlayer.sessions[index - 1].score
                                      ? "default"
                                      : session.score <
                                        selectedPlayer.sessions[index - 1].score
                                      ? "destructive"
                                      : "outline"
                                  }
                                >
                                  {session.score >
                                  selectedPlayer.sessions[index - 1].score
                                    ? "+" +
                                      (session.score -
                                        selectedPlayer.sessions[index - 1]
                                          .score)
                                    : session.score <
                                      selectedPlayer.sessions[index - 1].score
                                    ? session.score -
                                      selectedPlayer.sessions[index - 1].score
                                    : "="}
                                </Badge>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          <DialogFooter className="sticky bottom-0 bg-background pt-2">
            <Button onClick={() => setIsDetailsOpen(false)}>Fermer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
