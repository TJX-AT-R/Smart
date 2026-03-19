"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, doc, getDoc, setDoc, deleteDoc, serverTimestamp, updateDoc } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Trash2, 
  Loader2, 
  ChevronLeft, 
  CheckCircle2, 
  AlertCircle,
  Database,
  MessageSquareQuote,
  Pencil
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { MOCK_QUESTIONS } from "@/app/lib/data"

const SUPER_ADMIN_EMAIL = "ncubethubelihle483@gmail.com"

export default function AdminQuestionsPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Question Form State
  const [questionForm, setQuestionForm] = useState({
    text: "",
    category: "Road Signs",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    imageUrl: ""
  })

  useEffect(() => {
    async function verifyAdmin() {
      if (user) {
        if (user.email === SUPER_ADMIN_EMAIL) {
          setIsAdmin(true)
          return
        }
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists() && userDoc.data().isAdmin) {
          setIsAdmin(true)
        } else {
          router.push("/admin/login")
        }
      } else if (!isUserLoading) {
        router.push("/admin/login")
      }
    }
    verifyAdmin()
  }, [user, isUserLoading, router, db])

  const questionsQuery = useMemoFirebase(() => {
    if (!db || isAdmin === null) return null
    return query(collection(db, "questions"), orderBy("createdAt", "desc"))
  }, [db, isAdmin])

  const { data: questions, isLoading: isQuestionsLoading } = useCollection(questionsQuery)

  const handleOpenAddDialog = () => {
    setEditingId(null)
    setQuestionForm({ text: "", category: "Road Signs", options: ["", "", "", ""], correctAnswer: "", explanation: "", imageUrl: "" })
    setIsDialogOpen(true)
  }

  const handleOpenEditDialog = (q: any) => {
    setEditingId(q.id)
    setQuestionForm({
      text: q.text,
      category: q.category,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
      imageUrl: q.imageUrl || ""
    })
    setIsDialogOpen(true)
  }

  const handleSaveQuestion = async () => {
    if (!db || !questionForm.text || !questionForm.correctAnswer) {
      toast({ variant: "destructive", title: "Validation Error", description: "Questions must have text and a designated correct answer." })
      return
    }

    setIsSaving(true)
    try {
      if (editingId) {
        const questionRef = doc(db, "questions", editingId)
        await updateDoc(questionRef, {
          ...questionForm,
          updatedAt: serverTimestamp()
        })
        toast({ title: "Scenario Updated", description: "The existing bank entry has been synchronized." })
      } else {
        const questionRef = doc(collection(db, "questions"))
        await setDoc(questionRef, {
          ...questionForm,
          id: questionRef.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        toast({ title: "Repository Updated", description: "New scenario locked into the bank." })
      }
      setIsDialogOpen(false)
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Error", description: error.message })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!db || !confirm("Are you sure you want to permanently delete this question?")) return
    setIsDeleting(id)
    try {
      await deleteDoc(doc(db, "questions", id))
      toast({ title: "Scenario Terminated", description: "Successfully removed from the bank." })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleSeedQuestions = async () => {
    if (!db) return
    setIsSeeding(true)
    try {
      for (const q of MOCK_QUESTIONS) {
        const questionRef = doc(collection(db, "questions"), q.id)
        await setDoc(questionRef, {
          ...q,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }
      toast({ title: "Seed Successful", description: "Master bank has been synchronized." })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    } finally {
      setIsSeeding(false)
    }
  }

  if (isUserLoading || isAdmin === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/dashboard")} className="gap-2 mb-4 hover:bg-white/5">
            <ChevronLeft size={16} /> Back to Dashboard
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3 italic uppercase tracking-tighter">
            <Database className="text-secondary size-8" />
            Theory Repository
          </h1>
        </div>
        
        <div className="flex gap-3">
          {(!questions || questions.length === 0) && (
            <Button variant="outline" size="sm" onClick={handleSeedQuestions} disabled={isSeeding} className="border-secondary/30 text-secondary h-10 px-6">
              {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertCircle className="mr-2 h-4 w-4" />}
              Synchronize Master Bank
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenAddDialog} className="bg-secondary text-white hover:bg-secondary/90 h-10 px-6 font-bold uppercase tracking-widest text-xs">
                <Plus size={16} className="mr-2" /> Add Scenario
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl bg-card border-white/5 shadow-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="italic uppercase tracking-tighter text-xl">
                  {editingId ? "Edit Theory Scenario" : "Create Theory Scenario"}
                </DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-widest font-bold text-secondary">Configure scenario and designate the correct path.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Scenario Question Text</Label>
                  <Input 
                    placeholder="e.g. What is the national speed limit on a single carriageway?" 
                    value={questionForm.text}
                    onChange={(e) => setQuestionForm({...questionForm, text: e.target.value})}
                    className="bg-background/50 border-white/10 h-12"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Category</Label>
                    <select 
                      value={questionForm.category}
                      onChange={(e) => setQuestionForm({...questionForm, category: e.target.value})}
                      className="w-full bg-background/50 border border-white/10 h-12 rounded-lg px-3 text-sm focus:ring-1 focus:ring-secondary outline-none"
                    >
                      <option value="Road Signs">Road Signs</option>
                      <option value="Rules of the Road">Rules of the Road</option>
                      <option value="Safety">Safety</option>
                      <option value="Hazard Perception">Hazard Perception</option>
                      <option value="Motorway">Motorway</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Diagram URL</Label>
                    <Input 
                      placeholder="https://picsum.photos/..." 
                      value={questionForm.imageUrl}
                      onChange={(e) => setQuestionForm({...questionForm, imageUrl: e.target.value})}
                      className="bg-background/50 border-white/10 h-12"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Answer Options (Highlight Correct)</Label>
                  <div className="grid gap-3">
                    {questionForm.options.map((opt, i) => (
                      <div key={i} className="flex gap-2 group">
                        <Input 
                          placeholder={`Option ${labelMap(i)}`} 
                          value={opt}
                          onChange={(e) => {
                            const opts = [...questionForm.options]
                            opts[i] = e.target.value
                            setQuestionForm({...questionForm, options: opts})
                          }}
                          className={`bg-background/50 border-white/10 h-12 flex-1 transition-all ${questionForm.correctAnswer === opt && opt !== "" ? 'border-secondary ring-1 ring-secondary/30' : ''}`}
                        />
                        <Button 
                          size="sm" 
                          variant={questionForm.correctAnswer === opt && opt !== "" ? "secondary" : "outline"}
                          className={`h-12 px-6 shrink-0 font-bold uppercase tracking-widest text-[10px] transition-all ${questionForm.correctAnswer === opt && opt !== "" ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : 'hover:border-secondary/50'}`}
                          onClick={() => setQuestionForm({...questionForm, correctAnswer: opt})}
                        >
                          {questionForm.correctAnswer === opt && opt !== "" ? <CheckCircle2 size={16} /> : "Mark Correct"}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1 flex items-center gap-2">
                    <MessageSquareQuote size={12} className="text-secondary" />
                    Official Explanation
                  </Label>
                  <Textarea 
                    placeholder="Explain why this answer is correct for the learner..." 
                    value={questionForm.explanation}
                    onChange={(e) => setQuestionForm({...questionForm, explanation: e.target.value})}
                    className="bg-background/50 border-white/10 min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter className="sticky bottom-0 bg-card pt-4 border-t border-white/5">
                <Button className="w-full bg-secondary text-white hover:bg-secondary/90 h-14 text-lg font-bold shadow-xl shadow-secondary/20 uppercase italic tracking-tighter" onClick={handleSaveQuestion} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : editingId ? "Save Changes" : "Authorize & Save Scenario"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <Card className="border-white/5 bg-card/40 backdrop-blur-sm overflow-hidden shadow-2xl">
        <CardHeader className="bg-primary/20 border-b border-white/5">
          <CardTitle className="text-lg italic uppercase tracking-tighter">Bank Overview</CardTitle>
          <CardDescription className="text-xs uppercase tracking-widest font-bold">Listing {questions?.length || 0} active scenarios in the SmartPass database.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 sm:px-6">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase font-bold text-muted-foreground w-12 text-center">Status</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold text-muted-foreground">Scenario / Correct Path</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold text-muted-foreground hidden md:table-cell">Category</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold text-muted-foreground text-right">Control</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isQuestionsLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-20">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-secondary" />
                    </TableCell>
                  </TableRow>
                ) : questions && questions.length > 0 ? (
                  questions.map((q) => (
                    <TableRow key={q.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="text-center">
                        <CheckCircle2 size={18} className="text-secondary mx-auto" />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-xs sm:text-sm line-clamp-1 italic">{q.text}</span>
                          <span className="text-[9px] text-secondary font-mono uppercase tracking-widest mt-1 flex items-center gap-1">
                            <span className="text-muted-foreground">Correct:</span> {q.correctAnswer}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">
                        <Badge variant="outline" className="border-secondary/20 text-secondary text-[9px] uppercase font-bold tracking-widest">{q.category}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-white h-9 w-9"
                            onClick={() => handleOpenEditDialog(q)}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:bg-destructive/10 h-9 w-9"
                            onClick={() => handleDeleteQuestion(q.id)}
                            disabled={isDeleting === q.id}
                          >
                            {isDeleting === q.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-20 text-muted-foreground text-[10px] uppercase tracking-widest font-bold">
                      Zero Scenarios Detected. <br /> Use "Synchronize Master Bank" to begin.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function labelMap(idx: number) {
  return String.fromCharCode(65 + idx)
}
