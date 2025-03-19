"use client";

import { useState, useEffect } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { redirect } from "next/navigation";

// Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { 
  Home, 
  BarChart2, 
  Users, 
  Settings, 
  LogOut, 
  Activity, 
  TrendingUp, 
  Layers,
  Ban,
  Edit,
  Eye,
  Trash2
} from "lucide-react";

// Recharts for visualization
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from "recharts";

import { fetchCategoriesCount, fetchQuizzesCount, fetchUsersCount } from "../api/api";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

// Add this interface definition near the top of your file, after imports
interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  registeredAt: string;
  quizzesTaken: number;
  avatar: string;
}

// Mock data
const mockUsers = [
  {
    id: "1",
    name: "John Doe",
    email: "john.doe@example.com",
    role: "user",
    status: "active",
    registeredAt: "2023-01-15",
    quizzesTaken: 24,
    avatar: ""
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane.smith@example.com", 
    role: "admin",
    status: "active",
    registeredAt: "2022-11-20",
    quizzesTaken: 42,
    avatar: ""
  },
  {
    id: "3",
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    role: "user",
    status: "suspended",
    registeredAt: "2023-03-10",
    quizzesTaken: 12,
    avatar: ""
  }
];

// Mock data (replace with actual API calls)
const userGrowthData = [
  { name: "Jan", users: 400, newUsers: 100 },
  { name: "Feb", users: 800, newUsers: 250 },
  { name: "Mar", users: 1500, newUsers: 450 },
  { name: "Apr", users: 2000, newUsers: 600 },
  { name: "May", users: 2500, newUsers: 750 },
];

const quizActivityData = [
  { name: "Jan", quizzes: 200, completions: 150 },
  { name: "Feb", quizzes: 350, completions: 280 },
  { name: "Mar", quizzes: 500, completions: 400 },
  { name: "Apr", quizzes: 700, completions: 550 },
  { name: "May", quizzes: 900, completions: 720 },
];

export default function ModernDashboard() {
  const { data: session, status } = useSession({
    required: true,
    onUnauthenticated() {
      redirect('/auth/signin');
    },
  });

  const [activeTab, setActiveTab] = useState("overview");
  const [userCount, setUserCount] = useState(0);
  const [user, setUser] = useState(0);
  const [users, setUsers] = useState<User[]>(mockUsers);
  const [quizCount, setQuizCount] = useState(0);
  const [categoryCount, setCategoryCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogType, setDialogType] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [users, quizzes, categories] = await Promise.all([
          fetchUsersCount(),
          fetchQuizzesCount(),
          fetchCategoriesCount()
        ]);
        
        setUserCount(users);
        setUser(users);
        setUsers(users);
        setQuizCount(quizzes);
        setCategoryCount(categories);
      } catch (err) {
        console.error("Erreur lors de la récupération des données:", err);
        setError("Impossible de charger les données. Veuillez réessayer plus tard.");
        // Valeurs de repli pour développement
        setUserCount(125);
        setQuizCount(42);
        setCategoryCount(8);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleUserAction = (action: 'view' | 'edit' | 'suspend' | 'delete', user: any) => {
    switch(action) {
      case 'view':
        setSelectedUser(user);
        setDialogType('view');
        break;
      case 'edit':
        setSelectedUser(user);
        setDialogType('edit');
        break;
      case 'suspend':
        const updatedUsers = users.map(u => 
          u.id === user.id 
            ? {...u, status: u.status === 'suspended' ? 'active' : 'suspended'}
            : u
        );
        setUsers(updatedUsers);
        break;
      case 'delete':
        setSelectedUser(user);
        setDialogType('delete');
        break;
    }
  };

  const confirmDelete = () => {
    if (selectedUser) {
      const filteredUsers = users.filter(u => u.id !== selectedUser.id);
      setUsers(filteredUsers);
      setDialogType(null);
      setSelectedUser(null);
    }
  };


  if (status === "loading" || isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-blue-500"></div>
      </div>
    );
  }

  if (!session) return null;

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r shadow-lg p-6 flex flex-col">
        <div className="flex items-center mb-8">
          <Avatar className="mr-4">
            <AvatarImage 
              src={session.user?.image || "/default-avatar.png"} 
              alt="User avatar" 
            />
            <AvatarFallback>
              {session.user?.name ? session.user.name.charAt(0) : 'U'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-xl font-semibold">{session.user?.name || 'Admin'}</h2>
            <p className="text-sm text-gray-500">Administrator</p>
          </div>
        </div>
       

        <div className="mt-auto mb-6">
          <Button 
            variant="destructive" 
            className="w-full"
            onClick={() => signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" /> Sign Out
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-y-auto">
      <Tabs 
          defaultValue="overview" 
          className="w-full"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="overview">
              <Home className="mr-2 h-4 w-4" /> Overview
            </TabsTrigger>
            <TabsTrigger value="analytics">
              <BarChart2 className="mr-2 h-4 w-4" /> Analytics
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="mr-2 h-4 w-4" /> Users
            </TabsTrigger>
          </TabsList>
        </Tabs>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{error}</p>
          </div>
        )}

        {activeTab === "overview" && (
          <div>
            <h1 className="text-3xl font-bold mb-6">Dashboard Overview</h1>
            
            <div className="grid grid-cols-3 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{userCount}</div>
                  <p className="text-xs text-green-500">+20.1% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Active Quizzes</CardTitle>
                  <Activity className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{quizCount}</div>
                  <p className="text-xs text-green-500">+15.3% from last month</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Categories</CardTitle>
                  <Layers className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{categoryCount}</div>
                  <p className="text-xs text-green-500">+5.2% from last month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-2 gap-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>User Growth</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={userGrowthData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="users" fill="#8884d8" />
                      <Bar dataKey="newUsers" fill="#82ca9d" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Quiz Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={quizActivityData}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="quizzes" 
                        stroke="#8884d8" 
                        strokeWidth={2}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="completions" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === "analytics" && (
          <div>
          <h1 className="text-3xl font-bold mb-6">Detailed Analytics</h1>
          
          <div className="grid grid-cols-2 gap-6 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>User Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Cette section affichera la répartition des utilisateurs par rôle (user, admin, player).</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Quiz par Catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Cette section affichera le nombre de quiz par catégorie.</p>
              </CardContent>
            </Card>
          </div>

          <Card>
              <CardHeader>
                <CardTitle>Quiz par Difficulté</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-500">Cette section affichera le nombre de quiz par niveau de difficulté (easy, medium, hard).</p>
              </CardContent>
            </Card>
          </div>
        )}

{activeTab === "users" && (
          <div>
            <h1 className="text-3xl font-bold mb-6">User Management</h1>
            
            <Card>
              <CardHeader>
                <CardTitle>Users List</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Quizzes Taken</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>
                          <div className="flex items-center">
                            <Avatar className="mr-3">
                              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            {user.name}
                          </div>
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.role === 'admin' ? 'default' : 'secondary'}
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.status === 'active' ? 'outline' : 'destructive'}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{user.quizzesTaken}</TableCell>
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent>
                              <DropdownMenuItem 
                                onClick={() => handleUserAction('view', user)}
                              >
                                <Eye className="mr-2 h-4 w-4" /> View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUserAction('edit', user)}
                              >
                                <Edit className="mr-2 h-4 w-4" /> Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUserAction('suspend', user)}
                              >
                                <Ban className="mr-2 h-4 w-4" /> 
                                {user.status === 'suspended' ? 'Activate' : 'Suspend'}
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => handleUserAction('delete', user)}
                                className="text-red-600"
                              >
                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Details Dialog */}
        <Dialog 
          open={dialogType === 'view' || dialogType === 'edit' || dialogType === 'delete'} 
          onOpenChange={() => setDialogType(null)}
        >
          <DialogContent>
            {dialogType === 'view' && selectedUser && (
              <>
                <DialogHeader>
                  <DialogTitle>User Details</DialogTitle>
                  <DialogDescription>
                    Detailed information about the selected user
                  </DialogDescription>
                </DialogHeader>
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback>{selectedUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p><strong>Name:</strong> {selectedUser.name}</p>
                    <p><strong>Email:</strong> {selectedUser.email}</p>
                    <p><strong>Role:</strong> {selectedUser.role}</p>
                    <p><strong>Status:</strong> {selectedUser.status}</p>
                    <p><strong>Registered:</strong> {selectedUser.registeredAt}</p>
                    <p><strong>Quizzes Taken:</strong> {selectedUser.quizzesTaken}</p>
                  </div>
                </div>
              </>
            )}

            {dialogType === 'delete' && selectedUser && (
              <>
                <DialogHeader>
                  <DialogTitle>Delete User</DialogTitle>
                  <DialogDescription>
                    Are you sure you want to delete this user?
                  </DialogDescription>
                </DialogHeader>
                <Alert variant="destructive">
                  <AlertTitle>Confirm Deletion</AlertTitle>
                  <AlertDescription>
                    User {selectedUser.name} will be permanently removed from the system.
                  </AlertDescription>
                </Alert>
                <div className="flex justify-end space-x-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setDialogType(null)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    variant="destructive" 
                    onClick={confirmDelete}
                  >
                    Confirm Delete
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}