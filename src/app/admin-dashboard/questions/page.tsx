"use client";

import { Button } from "@/components/ui/button";
import { useQuizzes } from "@/hooks";
import { useToast } from "@/hooks/use-toast";
import {
  CreateQuestionDto,
  Question,
  QuestionBulkDto,
  QuestionType,
} from "@/types/questions";
// Define QuestionType as a value if it's not already defined as such in the imported file
const QuestionTypeValues = {
  MULTIPLE_CHOICE: "MULTIPLE_CHOICE",
  TRUE_FALSE: "TRUE_FALSE",
} as const;
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
import { useQuestions } from "@/hooks/useQuestions";

export default function QuestionPage() {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<Question | null>(null);
  const [bulkDialogOpen, setBulkDialogOpen] = useState(false);
  const [bulkQuestions, setBulkQuestions] = useState<string>("");
  const [selectedQuizId, setSelectedQuizId] = useState<string>("");
  const [importType, setImportType] = useState<"text" | "json">("text");
  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [newQuestion, setNewQuestion] = useState<CreateQuestionDto>({
    text: "",
    type: QuestionType.MULTIPLE_CHOICE,
    correctAnswer: "",
    options: ["", "", "", ""],
    quizId: "",
    points: 1,
  });
  
  const {
    questions,
    question,
    loading,
    error,
    fetchQuestions,
    fetchQuestion,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    bulkCreateQuestions,
  } = useQuestions();
  const { quizzes, quiz, fetchQuizzes, fetchQuiz, updateQuiz } = useQuizzes();

  useEffect(() => {
    fetchQuestions();
    fetchQuizzes();
  }, []);

  const columns: ColumnDef<Question>[] = [
    {
      accessorKey: "text",
      header: "Question",
      cell: ({ row }) => <div className="max-w-[500px] truncate">{row.getValue("text")}</div>,
    },
    {
      accessorKey: "type",
      header: "Type",
    },
    {
      accessorKey: "points",
      header: "Points",
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const question = row.original;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleEdit(question)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleDelete(question)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  const handleCreate = () => {
    setIsCreating(true);
    setNewQuestion({
      text: "",
      type: QuestionType.MULTIPLE_CHOICE,
      correctAnswer: "",
      options: ["", "", "", ""],
      quizId: quizzes.length > 0 ? quizzes[0].id.toString() : "",
      points: 1,
    });
  };

  const handleEdit = (question: Question) => {
    setSelectedQuestion(question);
    setIsEditing(true);
  };

  const handleDelete = (question: Question) => {
    setSelectedQuestion(question);
    setIsDeleting(true);
  };

  const handleSaveQuestion = async () => {
    try {
      await createQuestion(newQuestion);
      setIsCreating(false);
      toast({
        title: "Question créée",
        description: "La question a été créée avec succès",
      });
      fetchQuestions();
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de créer la question",
        variant: "destructive",
      });
    }
  };

  const handleUpdateQuestion = async () => {
    if (!selectedQuestion) return;
    try {
      await updateQuestion(selectedQuestion.id, selectedQuestion);
      setIsEditing(false);
      toast({
        title: "Question mise à jour",
        description: "La question a été mise à jour avec succès",
      });
      fetchQuestions();
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la question",
        variant: "destructive",
      });
    }
  };

  const handleDeleteQuestion = async () => {
    if (!selectedQuestion) return;
    try {
      console.log("Suppression de la question ID:", selectedQuestion.id);
      await deleteQuestion(selectedQuestion.id);
      setIsDeleting(false);
      toast({
        title: "Question supprimée",
        description: "La question a été supprimée avec succès",
      });
      await fetchQuestions();
      setSelectedQuestion(null);
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer la question",
        variant: "destructive",
      });
    }
  };

  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setJsonFile(file);
    }
  };

  const handleSaveBulkQuestions = async () => {
    try {
      if (importType === "json" && jsonFile) {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const jsonData = JSON.parse(e.target?.result as string);
            const parsedQuestions: QuestionBulkDto = {
              questions: jsonData.map((q: any) => ({
                text: q.text,
                type: q.type,
                options: q.options,
                correctAnswer: q.correctAnswer,
                quizId: selectedQuizId,
                points: q.points || 1,
              })),
              quizId: selectedQuizId
            };
            
            await bulkCreateQuestions(parsedQuestions);
            toast({
              title: "Questions importées",
              description: "Les questions ont été importées avec succès",
            });
            fetchQuestions();
          } catch (error) {
            toast({
              title: "Erreur",
              description: "Le format du fichier JSON est invalide",
              variant: "destructive",
            });
          }
        };
        reader.readAsText(jsonFile);
      } else {
        // Format texte existant
        const parsedQuestions: QuestionBulkDto = {
          questions: bulkQuestions.split('\n\n').map(q => {
            const lines = q.split('\n');
            const text = lines[0];
            const type = lines[1].includes('TRUE_FALSE') ? QuestionType.TRUE_FALSE : QuestionType.MULTIPLE_CHOICE;
            const options = type === QuestionType.MULTIPLE_CHOICE 
              ? lines.slice(2, lines.length - 1) 
              : ["True", "False"];
            const correctAnswer = lines[lines.length - 1].replace('Correct: ', '');
            
            return {
              text,
              type,
              options,
              correctAnswer,
              quizId: selectedQuizId,
              points: 1,
            };
          }),
          quizId: selectedQuizId
        };
        
        await bulkCreateQuestions(parsedQuestions);
        toast({
          title: "Questions importées",
          description: "Les questions ont été importées avec succès",
        });
        fetchQuestions();
      }
      setBulkDialogOpen(false);
      setBulkQuestions("");
      setJsonFile(null);
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible d'importer les questions",
        variant: "destructive",
      });
    }
  };

  return (
    <DashboardShell>
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Questions</CardTitle>
          <div className="flex space-x-2">
            <Button onClick={() => setBulkDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Import en masse
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle question
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Chargement...</div>
          ) : error ? (
            <div>Erreur: {error}</div>
          ) : (
            <DataTable columns={columns} data={questions} />
          )}
        </CardContent>
      </Card>

      {/* Dialogue création de question */}
      <Dialog open={isCreating} onOpenChange={setIsCreating}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Créer une nouvelle question</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="text">Question</Label>
              <Textarea
                id="text"
                value={newQuestion.text}
                onChange={(e) => setNewQuestion({ ...newQuestion, text: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Type</Label>
              <Select
                value={newQuestion.type}
                onValueChange={(value) => {
                  const updatedQuestion = { ...newQuestion, type: value as QuestionType };
                  if (value === QuestionType.TRUE_FALSE) {
                    updatedQuestion.options = ["True", "False"];
                  } else if (value === QuestionType.MULTIPLE_CHOICE && updatedQuestion.options.length < 2) {
                    updatedQuestion.options = ["", "", "", ""];
                  }
                  setNewQuestion(updatedQuestion);
                }}
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Sélectionner le type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Choix multiple</SelectItem>
                  <SelectItem value={QuestionType.TRUE_FALSE}>Vrai / Faux</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newQuestion.type === QuestionType.MULTIPLE_CHOICE && (
              <div className="grid gap-2">
                <Label>Options</Label>
                {newQuestion.options.map((option, index) => (
                  <Input
                    key={index}
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...newQuestion.options];
                      newOptions[index] = e.target.value;
                      setNewQuestion({ ...newQuestion, options: newOptions });
                    }}
                    placeholder={`Option ${index + 1}`}
                  />
                ))}
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="correctAnswer">Réponse correcte</Label>
              {newQuestion.type === QuestionType.MULTIPLE_CHOICE ? (
                <Select
                  value={newQuestion.correctAnswer}
                  onValueChange={(value) => setNewQuestion({ ...newQuestion, correctAnswer: value })}
                >
                  <SelectTrigger id="correctAnswer">
                    <SelectValue placeholder="Sélectionner la réponse correcte" />
                  </SelectTrigger>
                  <SelectContent>
                    {newQuestion.options.map((option, index) => (
                      <SelectItem key={index} value={option || `option_${index + 1}`}>
                        {option || `Option ${index + 1}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Select
                  value={newQuestion.correctAnswer}
                  onValueChange={(value) => setNewQuestion({ ...newQuestion, correctAnswer: value })}
                >
                  <SelectTrigger id="correctAnswer">
                    <SelectValue placeholder="Sélectionner la réponse correcte" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="True">Vrai</SelectItem>
                    <SelectItem value="False">Faux</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="quiz">Quiz</Label>
              <Select
                value={newQuestion.quizId}
                onValueChange={(value) => setNewQuestion({ ...newQuestion, quizId: value })}
              >
                <SelectTrigger id="quiz">
                  <SelectValue placeholder="Sélectionner un quiz" />
                </SelectTrigger>
                <SelectContent>
                  {quizzes.map((quiz) => (
                    <SelectItem key={quiz.id} value={quiz.id.toString()}>
                      {quiz.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="points">Points</Label>
              <Input
                id="points"
                type="number"
                value={newQuestion.points}
                onChange={(e) => setNewQuestion({ ...newQuestion, points: parseInt(e.target.value) || 1 })}
              />
            </div>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsCreating(false)}>
              Annuler
            </Button>
            <Button onClick={handleSaveQuestion}>Créer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogue édition de question */}
      <Dialog open={isEditing} onOpenChange={setIsEditing}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier la question</DialogTitle>
          </DialogHeader>
          {selectedQuestion && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-text">Question</Label>
                <Textarea
                  id="edit-text"
                  value={selectedQuestion.text}
                  onChange={(e) => setSelectedQuestion({ ...selectedQuestion, text: e.target.value })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-type">Type</Label>
                <Select
                  value={selectedQuestion.type}
                  onValueChange={(value) => {
                    const updatedQuestion = { ...selectedQuestion, type: value as QuestionType };
                    if (value === QuestionType.TRUE_FALSE) {
                      updatedQuestion.options = ["True", "False"];
                    } else if (value === QuestionType.MULTIPLE_CHOICE && updatedQuestion.options.length < 2) {
                      updatedQuestion.options = ["", "", "", ""];
                    }
                    setSelectedQuestion(updatedQuestion);
                  }}
                >
                  <SelectTrigger id="edit-type">
                    <SelectValue placeholder="Sélectionner le type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={QuestionType.MULTIPLE_CHOICE}>Choix multiple</SelectItem>
                    <SelectItem value={QuestionType.TRUE_FALSE}>Vrai / Faux</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {selectedQuestion.type === QuestionType.MULTIPLE_CHOICE && (
                <div className="grid gap-2">
                  <Label>Options</Label>
                  {selectedQuestion.options.map((option, index) => (
                    <Input
                      key={index}
                      value={option}
                      onChange={(e) => {
                        const newOptions = [...selectedQuestion.options];
                        newOptions[index] = e.target.value;
                        setSelectedQuestion({ ...selectedQuestion, options: newOptions });
                      }}
                      placeholder={`Option ${index + 1}`}
                    />
                  ))}
                </div>
              )}

              <div className="grid gap-2">
                <Label htmlFor="edit-correctAnswer">Réponse correcte</Label>
                {selectedQuestion.type === QuestionType.MULTIPLE_CHOICE ? (
                  <Select
                    value={selectedQuestion.correctAnswer}
                    onValueChange={(value) => setSelectedQuestion({ ...selectedQuestion, correctAnswer: value })}
                  >
                    <SelectTrigger id="edit-correctAnswer">
                      <SelectValue placeholder="Sélectionner la réponse correcte" />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedQuestion.options.map((option, index) => (
                        <SelectItem key={index} value={option || `option_${index + 1}`}>
                          {option || `Option ${index + 1}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Select
                    value={selectedQuestion.correctAnswer}
                    onValueChange={(value) => setSelectedQuestion({ ...selectedQuestion, correctAnswer: value })}
                  >
                    <SelectTrigger id="edit-correctAnswer">
                      <SelectValue placeholder="Sélectionner la réponse correcte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="True">Vrai</SelectItem>
                      <SelectItem value="False">Faux</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-quiz">Quiz</Label>
                <Select
                  value={selectedQuestion.quizId}
                  onValueChange={(value) => setSelectedQuestion({ ...selectedQuestion, quizId: value })}
                >
                  <SelectTrigger id="edit-quiz">
                    <SelectValue placeholder="Sélectionner un quiz" />
                  </SelectTrigger>
                  <SelectContent>
                    {quizzes.map((quiz) => (
                      <SelectItem key={quiz.id} value={quiz.id.toString()}>
                        {quiz.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="edit-points">Points</Label>
                <Input
                  id="edit-points"
                  type="number"
                  value={selectedQuestion.points}
                  onChange={(e) => setSelectedQuestion({ ...selectedQuestion, points: parseInt(e.target.value) || 1 })}
                />
              </div>
            </div>
          )}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsEditing(false)}>
              Annuler
            </Button>
            <Button onClick={handleUpdateQuestion}>Enregistrer</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogue confirmation suppression */}
      <Dialog open={isDeleting} onOpenChange={setIsDeleting}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p>Êtes-vous sûr de vouloir supprimer cette question ? Cette action ne peut pas être annulée.</p>
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setIsDeleting(false)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDeleteQuestion}>
              Supprimer
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialogue import bulk */}
      <Dialog open={bulkDialogOpen} onOpenChange={setBulkDialogOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Importer des questions en masse</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="quiz-bulk">Quiz</Label>
              <Select
                value={selectedQuizId}
                onValueChange={setSelectedQuizId}
              >
                <SelectTrigger id="quiz-bulk">
                  <SelectValue placeholder="Sélectionner un quiz" />
                </SelectTrigger>
                <SelectContent>
                  {quizzes.map((quiz) => (
                    <SelectItem key={quiz.id} value={quiz.id.toString()}>
                      {quiz.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Type d'import</Label>
              <Select
                value={importType}
                onValueChange={(value: "text" | "json") => setImportType(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner le type d'import" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Format texte</SelectItem>
                  <SelectItem value="json">Fichier JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {importType === "text" ? (
              <div className="grid gap-2">
                <Label htmlFor="bulk-questions">Questions (format: texte de la question, type, options, réponse correcte)</Label>
                <Textarea
                  id="bulk-questions"
                  value={bulkQuestions}
                  onChange={(e) => setBulkQuestions(e.target.value)}
                  className="h-64"
                  placeholder={`Quelle est la capitale de la France?
MULTIPLE_CHOICE
Paris
Lyon
Marseille
Nice
Correct: Paris

La Terre est plate.
TRUE_FALSE
Correct: False`}
                />
                <p className="text-sm text-gray-500">
                  Séparez chaque question par une ligne vide. Pour les questions à choix multiple, listez chaque option sur une ligne distincte.
                  Indiquez la réponse correcte à la fin avec "Correct: ".
                </p>
              </div>
            ) : (
              <div className="grid gap-2">
                <Label htmlFor="json-file">Fichier JSON</Label>
                <Input
                  id="json-file"
                  type="file"
                  accept=".json"
                  onChange={handleJsonFileChange}
                />
                <p className="text-sm text-gray-500">
                  Le fichier JSON doit contenir un tableau d'objets avec la structure suivante :
                  {`{
  "text": "Question",
  "type": "MULTIPLE_CHOICE" | "TRUE_FALSE",
  "options": ["Option 1", "Option 2", ...],
  "correctAnswer": "Réponse correcte",
  "points": 1
}`}
                </p>
              </div>
            )}
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => setBulkDialogOpen(false)}>
              Annuler
            </Button>
            <Button 
              onClick={handleSaveBulkQuestions} 
              disabled={!selectedQuizId || (importType === "text" ? !bulkQuestions.trim() : !jsonFile)}
            >
              Importer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
