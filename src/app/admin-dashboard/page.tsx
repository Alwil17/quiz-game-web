"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  BarChart2,
  Users,
  BookOpen,
  Tag,
  TrendingUp,
  Activity
} from "lucide-react";

// Composants
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatCard } from "@/components/dashboard/stat-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

// Data fetching 
import { useUsers, useQuizzes, useCategories } from "@/hooks";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

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
  // Hooks d'authentification et d'état
  const { data: session } = useSession();
  
  // Hooks de données
  const { users, loading: usersLoading, fetchUsers } = useUsers();
  const { quizzes, loading: quizzesLoading, fetchQuizzes } = useQuizzes();
  const { categories, loading: categoriesLoading, fetchCategories } = useCategories();
  
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
          <h1 className="text-3xl font-bold">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Bienvenue, {session?.user?.name || "Administrateur"}! Voici un aperçu des statistiques de votre plateforme.
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-4" onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="overview">Aperçu</TabsTrigger>
            <TabsTrigger value="analytics">Statistiques</TabsTrigger>
            <TabsTrigger value="activity">Activité</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <StatCard 
                title="Utilisateurs" 
                value={usersLoading ? "..." : users.length}
                icon={<Users className="h-4 w-4" />}
                loading={usersLoading}
                trend={{ value: 12, isPositive: true }}
              />
              <StatCard
                title="Quiz"
                value={quizzesLoading ? "..." : quizzes.length}
                icon={<BookOpen className="h-4 w-4" />}
                loading={quizzesLoading}
                trend={{ value: 8, isPositive: true }}
              />
              <StatCard
                title="Catégories"
                value={categoriesLoading ? "..." : categories.length}
                icon={<Tag className="h-4 w-4" />}
                loading={categoriesLoading}
              />
              <StatCard
                title="Activité"
                value={quizzesLoading || usersLoading ? "..." : `${quizzes.length + users.length} actions`}
                icon={<Activity className="h-4 w-4" />}
                loading={quizzesLoading || usersLoading}
                description="Total des quiz et utilisateurs"
              />
            </div>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
              <Card className="col-span-4 p-6">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-lg font-medium">Évolution des utilisateurs</h3>
                  <p className="text-sm text-muted-foreground">
                    Nombre de nouveaux utilisateurs sur les 6 derniers mois
                  </p>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userActivityData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" name="Utilisateurs" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              
              <Card className="col-span-3 p-6">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-lg font-medium">Activité des quiz</h3>
                  <p className="text-sm text-muted-foreground">
                    Nombre de quiz créés par mois
                  </p>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={userActivityData}>
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
                </div>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="analytics" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="col-span-2 p-6">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-lg font-medium">Utilisateurs par mois</h3>
                  <p className="text-sm text-muted-foreground">
                    Croissance des utilisateurs au fil du temps
                  </p>
                </div>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={userActivityData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" name="Utilisateurs" fill="#6366f1" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
              
              <Card className="p-6">
                <div className="flex flex-col space-y-2">
                  <h3 className="text-lg font-medium">Statistiques rapides</h3>
                  <p className="text-sm text-muted-foreground">
                    Résumé des performances récentes
                  </p>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Utilisateurs actifs</span>
                    <span className="text-sm font-bold">{usersLoading ? "..." : users.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Quiz populaires</span>
                    <span className="text-sm font-bold">{quizzesLoading ? "..." : quizzes.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Taux de complétion</span>
                    <span className="text-sm font-bold">76%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Temps de réponse moyen</span>
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
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4 border-b pb-4 last:border-0">
                    <div className="rounded-full bg-primary/10 p-2">
                      <Activity className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {["Quiz créé", "Nouvel utilisateur", "Quiz terminé", "Catégorie ajoutée", "Utilisateur modifié"][i]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {["Il y a 5 minutes", "Il y a 10 minutes", "Il y a 25 minutes", "Il y a 35 minutes", "Il y a 45 minutes"][i]}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex justify-center">
                <Button variant="outline">Voir toutes les activités</Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardShell>
  );
}