"use client";

import { useCategories } from "@/hooks";
import { Button } from "@/components/ui/button";
import { useQuizzes } from "@/hooks";
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";
import {
  CreateQuizDto,
  Quiz,
  UpdateQuizDto,
  BulkQuizDto,
  QuizBulkDto,
  QuizDifficulty,
} from "@/types";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, Edit, Trash2, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { DashboardShell } from "../../../components/dashboard/dashboard-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const mockQuizzes: Quiz[] = [
  {
    id: 0,
    description: "string",
    categoryId: 0,
    authorId: 0,
    title: "string",
    difficulty: "easy",
    category: {
      id: 0,
      description: "string",
      name: "string",
      createdAt: "2025-03-20T12:15:43.233Z",
      updatedAt: "2025-03-20T12:15:43.233Z",
    },
    createdAt: "2025-03-20T12:15:43.233Z",
    updatedAt: "2025-03-20T12:15:43.233Z",
  },
];

// Create quizz content management page
export default function QuizPage() {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const {
    categories,
    createCategory,
    updateCategory,
    deleteCategory,
    fetchCategories,
  } = useCategories();
  const [selectedQuiz, setSelectedQuiz] = useState<Quiz | null>(null);
  const [formData, setFormData] = useState<CreateQuizDto | UpdateQuizDto>({
    title: "",
    description: "",
    categoryId: 0,
    authorId: 0,
    difficulty: "easy",
  });
  const [useMockData, setUseMockData] = useState(false);
  const [displayedQuizzes, setDisplayedQuizzes] = useState<Quiz[]>([]);
  const {
    quizzes,
    quiz,
    loading,
    error,
    fetchQuizzes,
    fetchQuiz,
    createQuiz,
    updateQuiz,
    deleteQuiz,
  } = useQuizzes();

  useEffect(() => {
    fetchCategories().catch(() => {
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
    if (useMockData) {
      setDisplayedQuizzes(mockQuizzes);
    } else {
      fetchQuizzes()
        .then((fetchedQuizzes) => {
          if (!fetchedQuizzes || fetchedQuizzes.length === 0) {
            toast({
              title: "Information",
              description: "Aucun quiz n'est disponible pour le moment.",
              variant: "default",
            });
          }
        })
        .catch((err) => {
          setUseMockData(true);
          toast({
            title: "Erreur",
            description:
              "Impossible de récupérer les quiz. Utilisation des données de démonstration.",
            variant: "destructive",
          });
        });
    }
  }, []);

  useEffect(() => {
    if (error) {
      toast({
        title: "Erreur",
        description: error,
        variant: "destructive",
      });
    }
  }, [error]);

  // On form change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreate = async () => {
    try {
      await createQuiz(formData as CreateQuizDto);
      toast({
        title: "Succes",
        description: "Quiz créé !",
        variant: "default",
      });
      setIsCreating(false);
      fetchQuizzes().catch(() => {
        setUseMockData(true);
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de l'ajout du quiz'.",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async () => {
    if (!selectedQuiz) return;

    try {
      if (useMockData) {
        // Update mock data
        const index = mockQuizzes.findIndex((u) => u.id === selectedQuiz.id);
        if (index !== -1) {
          mockQuizzes[index] = { ...mockQuizzes[index], ...formData };
          setDisplayedQuizzes([...mockQuizzes]);
        }
      } else {
        await updateQuiz(selectedQuiz.id, formData as UpdateQuizDto);
        toast({
          title: "Success",
          description: "Quiz updated successfully",
          variant: "default",
        });
        setIsEditing(false);
        fetchQuizzes().catch(() => {
          setUseMockData(true);
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la modification de l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  const handleDelete = async () => {
    if (!selectedQuiz) return;

    try {
      if (useMockData) {
        // Delete mock data
        const index = mockQuizzes.findIndex((u) => u.id === selectedQuiz.id);
        if (index !== -1) {
          mockQuizzes.splice(index, 1);
          setDisplayedQuizzes([...mockQuizzes]);
        }
      } else {
        await deleteQuiz(selectedQuiz.id);
        toast({
          title: "Succès",
          description: "Quiz supprimé !",
          variant: "default",
        });
        setIsDeleting(false);
        fetchQuizzes().catch(() => {
          setUseMockData(true);
        });
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la suppression du Quizz.",
        variant: "destructive",
      });
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      categoryId: 0,
      authorId: 0,
      difficulty: "easy",
    });
    setSelectedQuiz(null);
  };

  const prepareEditForm = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setFormData({
      title: quiz.title,
      description: quiz.description,
      categoryId: quiz.categoryId,
      authorId: quiz.authorId,
      difficulty: quiz.difficulty,
    });
    setIsEditing(true);
  };

  const prepareDeleteForm = (quiz: Quiz) => {
    setSelectedQuiz(quiz);
    setIsDeleting(true);
  };

  const columns: ColumnDef<Quiz>[] = [
    { header: "ID", accessorKey: "id" },
    { header: "Titre", accessorKey: "title" },
    { header: "Description", accessorKey: "description" },
    { header: "Catégorie", accessorKey: "category.name" },
    { header: "Difficulté", accessorKey: "difficulty" },
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
          <h1 className="text-3xl font-bold">Quiz Management</h1>
          <Button
            onClick={() => {
              resetForm();
              setIsCreating(true);
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            Ajouter un Quiz
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
            <CardTitle>Liste des Quizzes</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && !useMockData ? (
              <div className="flex justify-center py-10">
                <div className="h-10 w-10 animate-spin rounded-full border-2 border-primary border-r-transparent"></div>
              </div>
            ) : (
              <DataTable
                columns={columns}
                data={useMockData ? displayedQuizzes : quizzes}
                searchColumn="title"
                searchPlaceholder="Rechercher un quiz..."
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialogue de création de quizzes */}
      <Dialog open={isCreating} onOpenChange={() => setIsCreating(!isCreating)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un Quiz</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Label htmlFor="name">Titre</Label>
            <Input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Titre"
              className="input"
            />
            <Label htmlFor="description">Description</Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              className="input"
            />
            <div className="space-y-2">
              <Label htmlFor="categoryId">Catégorie</Label>
              <Select
                name="categoryId"
                value={(formData.categoryId ?? 0).toString()}
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    categoryId: parseInt(value),
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Choisir une catégorie</SelectItem>
                  {loading ? (
                    <SelectItem value="loading" disabled>
                      Chargement des catégories...
                    </SelectItem>
                  ) : categories.length > 0 ? (
                    categories.map((category) => (
                      <SelectItem
                        key={category.id}
                        value={category.id.toString()}
                      >
                        {category.name}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value="empty" disabled>
                      Aucune catégorie disponible
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulté</Label>
              <Select
                name="difficulty"
                value={formData.difficulty}
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    difficulty: value as any,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une difficulté" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Facile</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="hard">Difficile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <Button variant="ghost" onClick={() => setIsCreating(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreate}>Créer</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogue d'édition de quiz */}
      <Dialog open={isEditing} onOpenChange={() => setIsEditing(!isEditing)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier un Quiz</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <Label htmlFor="title">Titre</Label>
            <Input
              id="title"
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Titre"
              className="input"
            />
            <Label htmlFor="description">Description</Label>
            <Textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Description"
              className="input"
            />
            <div className="space-y-2">
              <Label htmlFor="categoryId">Catégorie</Label>
              <Select
                name="categoryId"
                value={(formData.categoryId ?? 0).toString()}
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    categoryId: parseInt(value),
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Choisir une catégorie</SelectItem>
                  {categories.map((category) => (
                    <SelectItem
                      key={category.id}
                      value={category.id.toString()}
                    >
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="difficulty">Difficulté</Label>
              <Select
                name="difficulty"
                value={formData.difficulty}
                onValueChange={(value) => {
                  setFormData((prev) => ({
                    ...prev,
                    difficulty: value as any,
                  }));
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choisir une difficulté" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="easy">Facile</SelectItem>
                  <SelectItem value="medium">Moyen</SelectItem>
                  <SelectItem value="hard">Difficile</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-4 mt-4">
              <Button variant="ghost" onClick={() => setIsEditing(false)}>
                Annuler
              </Button>
              <Button onClick={handleUpdate}>Mettre à jour</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogue de suppression de quiz */}
      <Dialog open={isDeleting} onOpenChange={() => setIsDeleting(!isDeleting)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Supprimer un Quiz</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col gap-4">
            <p>
              Êtes-vous sûr de vouloir supprimer ce quiz :{" "}
              <strong>{selectedQuiz?.title}</strong> ?
            </p>
            <p className="text-sm text-gray-500">
              Cette action ne pourra pas être annulée.
            </p>
            <div className="flex justify-end gap-4 mt-4">
              <Button variant="ghost" onClick={() => setIsDeleting(false)}>
                Annuler
              </Button>
              <Button variant="destructive" onClick={handleDelete}>
                Supprimer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
