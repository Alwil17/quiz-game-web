"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  BarChart2,
  Users,
  BookOpen,
  Tag,
  TrendingUp,
  Activity,
  User,
  Settings,
  LogOut,
} from "lucide-react";

// Composants
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Data fetching
import { useUsers, useQuizzes, useCategories } from "@/hooks";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { AvatarImage } from "@radix-ui/react-avatar";
import { redirect } from "next/navigation";
import Link from "next/link";

// Données de visualisation fictives (à remplacer par des données réelles)
const userActivityData = [
  { name: "Jan", users: 400, quizzes: 240 },
  { name: "Fév", users: 500, quizzes: 320 },
  { name: "Mar", users: 600, quizzes: 380 },
  { name: "Avr", users: 800, quizzes: 420 },
  { name: "Mai", users: 1200, quizzes: 560 },
  { name: "Jun", users: 1500, quizzes: 640 },
];

export default function AdminDashboard() {
  const monthLabels = [
    "Jan",
    "Fév",
    "Mar",
    "Avr",
    "Mai",
    "Jun",
    "Jul",
    "Aoû",
    "Sep",
    "Oct",
    "Nov",
    "Déc",
  ];
  interface MonthlyDataItem {
    month: number;
    year: number;
    name: string;
    users: number;
    quizzes: number;
  }

  const result: MonthlyDataItem[] = [];

  // Generate last 6 months
  const today = new Date();
  // Hooks d'authentification et d'état
  const { data: session } = useSession();

  // Hooks de données
  const { users, loading: usersLoading, fetchUsers } = useUsers();
  const { quizzes, loading: quizzesLoading, fetchQuizzes } = useQuizzes();
  const {
    categories,
    loading: categoriesLoading,
    fetchCategories,
  } = useCategories();

  const [activeTab, setActiveTab] = useState("overview");

  // Charger les données au premier rendu
  useEffect(() => {
    fetchUsers();
    fetchQuizzes();
    fetchCategories();
  }, []);

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenue, {session?.user?.name || "Administrateur"}! Voici un
            aperçu des statistiques de votre plateforme.
          </p>
        </div>

        <Tabs
          defaultValue="overview"
          className="space-y-4"
          onValueChange={setActiveTab}
        >
          <TabsList>
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="analytics">Statistiques</TabsTrigger>
            <TabsTrigger value="activity">Activité</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/admin-dashboard/users" className="cursor-pointer">
                <StatCard
                  title="Utilisateurs"
                  value={usersLoading ? "..." : users.length}
                  icon={<Users className="h-4 w-4" />}
                  loading={usersLoading}
                  trend={{ value: 12, isPositive: true }}
                />
              </Link>
              <Link href="/admin-dashboard/quizzes" className="cursor-pointer">
                <StatCard
                  title="Quiz"
                  value={quizzesLoading ? "..." : quizzes.length}
                  icon={<BookOpen className="h-4 w-4" />}
                  loading={quizzesLoading}
                  trend={{ value: 8, isPositive: true }}
                />
              </Link>
              <Link
                href="/admin-dashboard/categories"
                className="cursor-pointer"
              >
                <StatCard
                  title="Catégories"
                  value={categoriesLoading ? "..." : categories.length}
                  icon={<Tag className="h-4 w-4" />}
                  loading={categoriesLoading}
                />
              </Link>
              <Link href="/admin-dashboard/stats" className="cursor-pointer">
                <StatCard
                  title="Activité"
                  value={
                    quizzesLoading || usersLoading
                      ? "..."
                      : `${quizzes.length + users.length} actions`
                  }
                  icon={<Activity className="h-4 w-4" />}
                  loading={quizzesLoading || usersLoading}
                  description="Total des quiz et utilisateurs"
                />
              </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              {/* Process monthly data from actual users and quizzes */}
              {(() => {
                // Calculate data for the last 6 months
                const processMonthlyData = () => {
                  for (let i = 5; i >= 0; i--) {
                    const d = new Date(
                      today.getFullYear(),
                      today.getMonth() - i,
                      1
                    );
                    result.push({
                      month: d.getMonth(),
                      year: d.getFullYear(),
                      name: monthLabels[d.getMonth()],
                      users: 0,
                      quizzes: 0,
                    });
                  }

                  // Count users per month
                  users.forEach((user) => {
                    if (!user.createdAt) return;
                    const created = new Date(user.createdAt);
                    const item = result.find(
                      (m) =>
                        m.month === created.getMonth() &&
                        m.year === created.getFullYear()
                    );
                    if (item) item.users++;
                  });

                  // Count quizzes per month
                  quizzes.forEach((quiz) => {
                    if (!quiz.createdAt) return;
                    const created = new Date(quiz.createdAt);
                    const item = result.find(
                      (m) =>
                        m.month === created.getMonth() &&
                        m.year === created.getFullYear()
                    );
                    if (item) item.quizzes++;
                  });

                  return result;
                };

                const monthlyData =
                  !usersLoading && !quizzesLoading ? processMonthlyData() : [];

                return (
                  <>
                    <Card className="col-span-4 p-6">
                      <div className="flex flex-col space-y-2">
                        <h3 className="text-lg font-medium">
                          Évolution des utilisateurs
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Nombre de nouveaux utilisateurs sur les 6 derniers
                          mois
                        </p>
                      </div>
                      <div className="h-[300px]">
                        {usersLoading ? (
                          <div className="flex h-full items-center justify-center">
                            Chargement des données...
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar
                                dataKey="users"
                                name="Utilisateurs"
                                fill="#6366f1"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </Card>

                    <Card className="col-span-3 p-6">
                      <div className="flex flex-col space-y-2">
                        <h3 className="text-lg font-medium">
                          Activité des quiz
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Nombre de quiz créés par mois
                        </p>
                      </div>
                      <div className="h-[300px]">
                        {quizzesLoading ? (
                          <div className="flex h-full items-center justify-center">
                            Chargement des données...
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData}>
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Line
                                type="monotone"
                                dataKey="quizzes"
                                stroke="#6366f1"
                                strokeWidth={2}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </Card>
                  </>
                );
              })()}
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {/* Process monthly data from actual users and quizzes */}
              {(() => {
                // Calculate data for the last 6 months
                const processMonthlyData = () => {
                  for (let i = 5; i >= 0; i--) {
                    const d = new Date(
                      today.getFullYear(),
                      today.getMonth() - i,
                      1
                    );
                    result.push({
                      month: d.getMonth(),
                      year: d.getFullYear(),
                      name: monthLabels[d.getMonth()],
                      users: 0,
                      quizzes: 0,
                    });
                  }

                  // Count users per month
                  users.forEach((user) => {
                    if (!user.createdAt) return;
                    const created = new Date(user.createdAt);
                    const item = result.find(
                      (m) =>
                        m.month === created.getMonth() &&
                        m.year === created.getFullYear()
                    );
                    if (item) item.users++;
                  });

                  // Count quizzes per month
                  quizzes.forEach((quiz) => {
                    if (!quiz.createdAt) return;
                    const created = new Date(quiz.createdAt);
                    const item = result.find(
                      (m) =>
                        m.month === created.getMonth() &&
                        m.year === created.getFullYear()
                    );
                    if (item) item.quizzes++;
                  });

                  return result;
                };

                const monthlyData =
                  !usersLoading && !quizzesLoading ? processMonthlyData() : [];

                return (
                  <>
                    <Card className="col-span-4 p-6">
                      <div className="flex flex-col space-y-2">
                        <h3 className="text-lg font-medium">
                          Évolution des utilisateurs
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Nombre de nouveaux utilisateurs sur les 6 derniers
                          mois
                        </p>
                      </div>
                      <div className="h-[300px]">
                        {usersLoading ? (
                          <div className="flex h-full items-center justify-center">
                            Chargement des données...
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyData}>
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Bar
                                dataKey="users"
                                name="Utilisateurs"
                                fill="#6366f1"
                              />
                            </BarChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </Card>

                    <Card className="col-span-3 p-6">
                      <div className="flex flex-col space-y-2">
                        <h3 className="text-lg font-medium">
                          Activité des quiz
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          Nombre de quiz créés par mois
                        </p>
                      </div>
                      <div className="h-[300px]">
                        {quizzesLoading ? (
                          <div className="flex h-full items-center justify-center">
                            Chargement des données...
                          </div>
                        ) : (
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={monthlyData}>
                              <XAxis dataKey="name" />
                              <YAxis />
                              <Tooltip />
                              <Line
                                type="monotone"
                                dataKey="quizzes"
                                stroke="#6366f1"
                                strokeWidth={2}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        )}
                      </div>
                    </Card>
                  </>
                );
              })()}

              <Card className="p-6">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-lg font-medium">Statistiques rapides</h3>
                  <p className="text-sm text-muted-foreground">
                    Résumé des performances récentes
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Utilisateurs actifs
                    </span>
                    <span className="text-sm font-bold">
                      {usersLoading ? "..." : users.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quiz populaires</span>
                    <span className="text-sm font-bold">
                      {quizzesLoading ? "..." : quizzes.length}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Taux de complétion
                    </span>
                    <span className="text-sm font-bold">76%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">
                      Temps de réponse moyen
                    </span>
                    <span className="text-sm font-bold">1.2 min</span>
                  </div>
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="activity" className="space-y-4">
            <Card className="p-6">
              <div className="flex flex-col space-y-2">
                <h3 className="text-lg font-medium">Activité récente</h3>
                <p className="text-sm text-muted-foreground">
                  Les activités les plus récentes sur la plateforme
                </p>
              </div>
              <div className="mt-4 space-y-4">
                {/* User registrations */}
                {users.slice(0, 2).map((user, i) => (
                  <div
                    key={`user-${i}`}
                    className="flex items-center gap-4 border-b pb-4 last:border-0"
                  >
                    <div className="rounded-full bg-primary/10 p-2">
                      <User className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Nouvel utilisateur inscrit
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {user.name || "Utilisateur"} -{" "}
                        {new Date(
                          user.createdAt || Date.now()
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Quiz creations */}
                {quizzes.slice(0, 2).map((quiz, i) => (
                  <div
                    key={`quiz-${i}`}
                    className="flex items-center gap-4 border-b pb-4 last:border-0"
                  >
                    <div className="rounded-full bg-primary/10 p-2">
                      <BookOpen className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Quiz créé</p>
                      <p className="text-xs text-muted-foreground">
                        {quiz.title || "Quiz sans titre"} -{" "}
                        {new Date(
                          quiz.createdAt || Date.now()
                        ).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Quiz completions (simulated) */}
                {[...Array(2)].map((_, i) => (
                  <div
                    key={`completion-${i}`}
                    className="flex items-center gap-4 border-b pb-4 last:border-0"
                  >
                    <div className="rounded-full bg-green-100 p-2">
                      <TrendingUp className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">Quiz complété</p>
                      <p className="text-xs text-muted-foreground">
                        {quizzes[i]?.title || "Quiz populaire"} -{" "}
                        {new Date(Date.now() - 86400000 * i).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Category updates (simulated) */}
                {categories.slice(0, 1).map((category, i) => (
                  <div
                    key={`category-${i}`}
                    className="flex items-center gap-4 border-b pb-4 last:border-0"
                  >
                    <div className="rounded-full bg-blue-100 p-2">
                      <Tag className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        Catégorie mise à jour
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {category.name || "Catégorie"} -{" "}
                        {new Date(Date.now() - 172800000).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}

                {usersLoading || quizzesLoading || categoriesLoading ? (
                  <div className="text-center py-4">
                    Chargement des activités...
                  </div>
                ) : users.length === 0 &&
                  quizzes.length === 0 &&
                  categories.length === 0 ? (
                  <div className="text-center py-4">
                    Aucune activité récente
                  </div>
                ) : null}
              </div>
              <div className="mt-4 flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => redirect("/admin-dashboard/stats")}
                >
                  Voir les statistiques détaillées
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}
