"use client";

import { useState, useEffect } from "react";
import { useUsers } from "@/hooks";
import {
  User as UserIcon,
  Edit,
  Trash2,
  Plus,
  MoreHorizontal,
  Ban,
} from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { User, CreateUserDto, UpdateUserDto } from "@/types/user";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/components/ui/use-toast";
import { ColumnDef } from "@tanstack/react-table";

// Mock data to use if API fails
const mockUsers: User[] = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "admin",
    createdAt: new Date().toISOString(),
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "user",
    createdAt: new Date().toISOString(),
  },
  {
    id: 3,
    name: "Michael Brown",
    email: "michael@example.com",
    role: "player",
    createdAt: new Date().toISOString(),
  },
];

export default function UsersPage() {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<CreateUserDto | UpdateUserDto>({
    name: "",
    email: "",
    password: "",
    role: "user",
  });
  const [useMockData, setUseMockData] = useState(false);
  const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);

  const {
    users,
    loading,
    error,
    fetchUsers,
    createUser,
    updateUser,
    deleteUser,
  } = useUsers();

  useEffect(() => {
    fetchUsers().catch(() => {
      setUseMockData(true);
      toast({
        title: "Utilisation de données factices",
        description:
          "Impossible de récupérer les données. Utilisation de données factices.",
        variant: "destructive",
      });
    });
  }, []);

  useEffect(() => {
    if (error || useMockData) {
      setDisplayedUsers(mockUsers);
    } else {
      setDisplayedUsers(users);
    }
  }, [users, error, useMockData]);

  // Mise à jour du formulaire
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Actions utilisateur
  const handleCreate = async () => {
    try {
      if (useMockData) {
        // Add to mock data
        const newUser: User = {
          id: mockUsers.length + 1,
          ...(formData as CreateUserDto),
          createdAt: new Date().toISOString(),
        };
        mockUsers.push(newUser);
        setDisplayedUsers([...mockUsers]);
      } else {
        await createUser(formData as CreateUserDto);
      }
      toast({
        title: "Utilisateur créé",
        description: "L'utilisateur a été créé avec succès.",
      });
      setIsCreating(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la création de l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedUser) return;

    try {
      if (useMockData) {
        // Update mock data
        const index = mockUsers.findIndex((u) => u.id === selectedUser.id);
        if (index !== -1) {
          mockUsers[index] = { ...mockUsers[index], ...formData };
          setDisplayedUsers([...mockUsers]);
        }
      } else {
        await updateUser(selectedUser.id, formData);
      }

      toast({
        title: "Utilisateur mis à jour",
        description: "L'utilisateur a été mis à jour avec succès.",
      });
      setIsEditing(false);
      resetForm();
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la mise à jour de l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedUser) return;

    try {
      await deleteUser(selectedUser.id);
      toast({
        title: "Utilisateur supprimé",
        description: "L'utilisateur a été supprimé avec succès.",
      });
      setIsDeleting(false);
      setSelectedUser(null);
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la suppression de l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "user",
    });
    setSelectedUser(null);
  };

  const prepareEditForm = (user: User) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
    });
    setIsEditing(true);
  };

  const prepareDeleteForm = (user: User) => {
    setSelectedUser(user);
    setIsDeleting(true);
  };

  // Définition des colonnes pour le tableau de données
  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "id",
      header: "ID",
    },
    {
      accessorKey: "name",
      header: "Nom",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "role",
      header: "Rôle",
      cell: ({ row }) => (
        <Badge variant={row.original.role === "admin" ? "default" : "outline"}>
          {row.original.role}
        </Badge>
      ),
    },
    {
      accessorKey: "createdAt",
      header: "Date de création",
      cell: ({ row }) => new Date(row.original.createdAt).toLocaleDateString(),
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => prepareEditForm(row.original)}>
              <Edit className="mr-2 h-4 w-4" />
              Modifier
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => prepareDeleteForm(row.original)}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Supprimer
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <DashboardShell>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Gestion des utilisateurs</h1>
          <Button
            onClick={() => {
              resetForm();
              setIsCreating(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Nouvel utilisateur
          </Button>
        </div>

        {useMockData && (
          <div className="bg-amber-100 border-l-4 border-amber-500 text-amber-700 p-4 mb-4 rounded">
            <p className="font-medium">Mode démonstration</p>
            <p className="text-sm">
              Utilisation de données fictives. Les modifications ne seront pas
              persistantes.
            </p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Utilisateurs</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && !useMockData ? (
              <div className="flex justify-center py-10">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={displayedUsers}
                searchColumn="name"
                searchPlaceholder="Rechercher un utilisateur..."

                // <!--             {loading ? (
                //               <div className="flex justify-center py-10">
                //                 <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
                //               </div>
                //             ) : error ? (
                //               <div className="py-10 text-center text-red-500">
                //                 Une erreur est survenue lors du chargement des utilisateurs.
                //               </div>
                //             ) : (
                //               <DataTable
                //                 columns={columns}
                //                 data={users}
                //                 searchColumn="name"
                //                 searchPlaceholder="Rechercher un utilisateur..."  -->
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogue de création d'utilisateur */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouvel utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nom</Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                placeholder="Nom de l'utilisateur"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                placeholder="Email de l'utilisateur"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={(formData as CreateUserDto).password || ""}
                onChange={handleInputChange}
                placeholder="Mot de passe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Rôle</Label>
              <Select
                value={formData.role || "user"}
                onValueChange={(value) => handleSelectChange("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="player">Joueur</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleCreate}>Créer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue d'édition d'utilisateur */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier l'utilisateur</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nom</Label>
              <Input
                id="edit-name"
                name="name"
                value={formData.name || ""}
                onChange={handleInputChange}
                placeholder="Nom de l'utilisateur"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                name="email"
                type="email"
                value={formData.email || ""}
                onChange={handleInputChange}
                placeholder="Email de l'utilisateur"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Rôle</Label>
              <Select
                value={formData.role || "user"}
                onValueChange={(value) => handleSelectChange("role", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un rôle" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="user">Utilisateur</SelectItem>
                    <SelectItem value="admin">Administrateur</SelectItem>
                    <SelectItem value="player">Joueur</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button onClick={handleUpdate}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialogue de suppression d'utilisateur */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer l'utilisateur</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>
              Êtes-vous sûr de vouloir supprimer l'utilisateur "
              {selectedUser?.name}" ? Cette action est irréversible
            </p>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Annuler</Button>
            </DialogClose>
            <Button variant="destructive" onClick={handleDelete}>
              Supprimer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
