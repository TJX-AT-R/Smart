
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Trash2, 
  Loader2, 
  ChevronLeft, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  HelpCircle,
  Image as ImageIcon
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
  const [isAdding, setIsAdding] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)

  // New Question Form State
  const [newQuestion, setNewQuestion] = useState({
    text: "",
    category: "General",
    options: ["", "", ""],
    correctAnswer: "",
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

  const handleAddQuestion = async () => {
    if (!db || !newQuestion.text || !newQuestion.correctAnswer) {
      toast({ variant: "destructive", title: "Missing fields", description: "Please fill in all required fields." })
      return
    }

    setIsAdding(true)
    try {
      const questionRef = doc(collection(db, "questions"))
      await setDoc(questionRef, {
        ...newQuestion,
        id: questionRef.id,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      toast({ title: "Question Added", description: "Successfully added to the bank." })
      setNewQuestion({ text: "", category: "General", options: ["", "", ""], correctAnswer: "", imageUrl: "" })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    } finally {
      setIsAdding(false)
    }
  }

  const handleDeleteQuestion = async (id: string) => {
    if (!db) return
    setIsDeleting(id)
    try {
      await deleteDoc(doc(db, "questions", id))
      toast({ title: "Question Deleted", description: "Successfully removed from the bank." })
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
      toast({ title: "Seed Successful", description: "Initial question bank has been populated." })
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
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.push("/admin/dashboard")} className="gap-2">
          <ChevronLeft size={16} /> Back to Dashboard
        </Button>
        <div className="flex gap-2">
          {(!questions || questions.length === 0) && (
            <Button variant="outline" size="sm" onClick={handleSeedQuestions} disabled={isSeeding}>
              {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <AlertCircle className="mr-2 h-4 w-4" />}
              Seed Initial Bank
            </Button>
          )}
          <Dialog>
            <DialogTrigger asChild>
              <Button className="bg-secondary text-white hover:bg-secondary/90">
                <Plus size={16} className="mr-2" /> Add New Question
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card border-white/5">
              <DialogHeader>
                <DialogTitle>Create Theory Question</DialogTitle>
                <DialogDescription>Add a new multiple-choice question to the theory test bank.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Question Text</Label>
                  <Input 
                    placeholder="e.g. What should you do when you see a stop sign?" 
                    value={newQuestion.text}
                    onChange={(e) => setNewQuestion({...newQuestion, text: e.target.value})}
                    className="bg-background/50 border-white/10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Input 
                      placeholder="e.g. Road Signs" 
                      value={newQuestion.category}
                      onChange={(e) => setNewQuestion({...newQuestion, category: e.target.value})}
                      className="bg-background/50 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Image URL (Optional)</Label>
                    <Input 
                      placeholder="https://..." 
                      value={newQuestion.imageUrl}
                      onChange={(e) => setNewQuestion({...newQuestion, imageUrl: e.target.value})}
                      className="bg-background/50 border-white/10"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Options</Label>
                  {newQuestion.options.map((opt, i) => (
                    <div key={i} className="flex gap-2">
                      <Input 
                        placeholder={`Option ${i + 1}`} 
                        value={opt}
                        onChange={(e) => {
                          const opts = [...newQuestion.options]
                          opts[i] = e.target.value
                          setNewQuestion({...newQuestion, options: opts})
                        }}
                        className="bg-background/50 border-white/10"
                      />
                      <Button 
                        size="sm" 
                        variant={newQuestion.correctAnswer === opt && opt !== "" ? "secondary" : "outline"}
                        className="h-10 px-3 shrink-0"
                        onClick={() => setNewQuestion({...newQuestion, correctAnswer: opt})}
                      >
                        {newQuestion.correctAnswer === opt && opt !== "" ? <CheckCircle2 size={16} /> : "Correct"}
                      </Button>
                    </div>
                  ))}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs" 
                    onClick={() => setNewQuestion({...newQuestion, options: [...newQuestion.options, ""]})}
                  >
                    + Add Option
                  </Button>
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full bg-secondary text-white hover:bg-secondary/90" onClick={handleAddQuestion} disabled={isAdding}>
                  {isAdding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Question"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="border-white/5 bg-card/40 backdrop-blur-sm overflow-hidden">
        <CardHeader>
          <CardTitle>Question Bank</CardTitle>
          <CardDescription>Listing all active theory questions for the mock test.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="border-white/5 hover:bg-transparent">
                <TableHead className="text-muted-foreground w-12"></TableHead>
                <TableHead className="text-muted-foreground">Question</TableHead>
                <TableHead className="text-muted-foreground">Category</TableHead>
                <TableHead className="text-muted-foreground text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isQuestionsLoading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12">
                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-secondary" />
                  </TableCell>
                </TableRow>
              ) : questions && questions.length > 0 ? (
                questions.map((q) => (
                  <TableRow key={q.id} className="border-white/5 hover:bg-white/5">
                    <TableCell>
                      {q.imageUrl ? <ImageIcon size={16} className="text-secondary" /> : <HelpCircle size={16} className="text-muted-foreground" />}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-white line-clamp-1">{q.text}</span>
                        <span className="text-[10px] text-secondary font-mono">ID: {q.id}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-secondary/20 text-secondary text-[10px]">{q.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteQuestion(q.id)}
                        disabled={isDeleting === q.id}
                      >
                        {isDeleting === q.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                    No questions in the bank. Use "Seed Initial Bank" to start.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
