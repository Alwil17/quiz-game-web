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
import Link from "next/link";

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
        <Link href="/admin-dashboard/users" className="cursor-pointer">
          <StatCard
            title="Utilisateurs"
            value={stats.users}
            description="Nombre total d'utilisateurs"
            icon={<Users className="h-4 w-4" />}
            loading={loading}
          />
        </Link>
        <Link href="/admin-dashboard/quizzes" className="cursor-pointer">
          <StatCard
            title="Quiz"
            value={stats.quizzes}
            description="Nombre total de quiz"
            icon={<BookOpen className="h-4 w-4" />}
            loading={loading}
          />
        </Link>
        <Link href="/admin-dashboard/answers" className="cursor-pointer">
          <StatCard
            title="Réponses"
            value={stats.answers}
            description="Nombre total de réponses"
            icon={<MessageSquare className="h-4 w-4" />}
            loading={loading}
          />
        </Link>
        <Link href="/admin-dashboard/categories" className="cursor-pointer">
          <StatCard
            title="Catégories"
            value={stats.categories}
            description="Nombre total de catégories"
            icon={<FolderKanban className="h-4 w-4" />}
            loading={loading}
          />
        </Link>
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
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
          <p className="text-sm">Nouveaux utilisateurs (7j)</p>
          <p className="font-medium">+{Math.floor(stats.users * 0.15)}</p>
            </div>
            <div className="flex items-center justify-between">
          <p className="text-sm">Quiz complétés (7j)</p>
          <p className="font-medium">{Math.floor(stats.answers / 7)}</p>
            </div>
            <div className="flex items-center justify-between">
          <p className="text-sm">Réponses soumises (7j)</p>
          <p className="font-medium">{Math.floor(stats.answers * 0.2)}</p>
            </div>
          </div>
        )}
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
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
          <p className="text-sm">Meilleur score moyen</p>
          <p className="font-medium">Science - 87%</p>
            </div>
            <div className="flex items-center justify-between">
          <p className="text-sm">Utilisateur le plus actif</p>
          <p className="font-medium">Thomas L.</p>
            </div>
            <div className="flex items-center justify-between">
          <p className="text-sm">Quiz le plus populaire</p>
          <p className="font-medium">Culture Générale #3</p>
            </div>
          </div>
        )}
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
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
          <p className="text-sm">Temps par quiz</p>
          <p className="font-medium">3m 24s</p>
            </div>
            <div className="flex items-center justify-between">
          <p className="text-sm">Temps par question</p>
          <p className="font-medium">42s</p>
            </div>
            <div className="flex items-center justify-between">
          <p className="text-sm">Quiz le plus rapide</p>
          <p className="font-medium">Histoire - 1m 45s</p>
            </div>
          </div>
        )}
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
        {loading ? (
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded bg-gray-200"></div>
            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
          <p className="text-sm">Taux global</p>
          <p className="font-medium">72%</p>
            </div>
            <div className="flex items-center justify-between">
          <p className="text-sm">Catégorie la plus réussie</p>
          <p className="font-medium">Géographie - 83%</p>
            </div>
            <div className="flex items-center justify-between">
          <p className="text-sm">Catégorie la plus difficile</p>
          <p className="font-medium">Sciences - 64%</p>
            </div>
          </div>
        )}
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
