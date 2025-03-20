"use client";

import { useState, useEffect } from "react";
import {
  Users,
  BookOpen,
  MessageSquare,
  FolderKanban,
  Activity,
  Award,
  Clock,
  BarChart3,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  fetchUsersCount,
  fetchQuizzesCount,
  fetchAnswersCount,
  fetchCategoriesCount,
} from "@/app/api/api";

export default function StatsPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    users: 0,
    quizzes: 0,
    answers: 0,
    categories: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [users, quizzes, answers, categories] = await Promise.all([
          fetchUsersCount(),
          fetchQuizzesCount(),
          fetchAnswersCount(),
          fetchCategoriesCount(),
        ]);

        setStats({
          users,
          quizzes,
          answers,
          categories,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <DashboardShell>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Utilisateurs"
          value={stats.users}
          description="Nombre total d'utilisateurs"
          icon={<Users className="h-4 w-4" />}
          loading={loading}
        />
        <StatCard
          title="Quiz"
          value={stats.quizzes}
          description="Nombre total de quiz"
          icon={<BookOpen className="h-4 w-4" />}
          loading={loading}
        />
        <StatCard
          title="Réponses"
          value={stats.answers}
          description="Nombre total de réponses"
          icon={<MessageSquare className="h-4 w-4" />}
          loading={loading}
        />
        <StatCard
          title="Catégories"
          value={stats.categories}
          description="Nombre total de catégories"
          icon={<FolderKanban className="h-4 w-4" />}
          loading={loading}
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Activité récente
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Les statistiques d'activité seront bientôt disponibles.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Les statistiques de performance seront bientôt disponibles.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Temps moyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Les statistiques de temps moyen seront bientôt disponibles.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Taux de réussite
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Les statistiques de taux de réussite seront bientôt disponibles.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}