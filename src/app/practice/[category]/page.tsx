"use client"

import { useState, useMemo, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { MOCK_QUESTIONS } from "@/app/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, ArrowLeft, RotateCcw, ChevronRight, Loader2, Info, Pencil, Trash2, ShieldAlert } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, where, doc, getDoc, updateDoc, deleteDoc, serverTimestamp } from "firebase/firestore"
import Image from "next/image"
import { AIExplanation } from "@/components/AIExplanation"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"

const SUPER_ADMIN_EMAIL = "ncubethubelihle483@gmail.com"

export default function CategoryPracticePage() {
  const { category } = useParams()
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const decodedCategory = decodeURIComponent(category as string)

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Admin Edit State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [editForm, setEditForm] = useState({
    text: "",
    category: "",
    options: ["", "", "", ""],
    correctAnswer: "",
    explanation: "",
    imageUrl: ""
  })

  useEffect(() => {
    async function checkAdmin() {
      if (user) {
        if (user.email === SUPER_ADMIN_EMAIL) {
          setIsAdmin(true)
          return
        }
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists() && userDoc.data().isAdmin) {
          setIsAdmin(true)
        }
      }
    }
    checkAdmin()
  }, [user, db])

  const qRef = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "questions"), where("category", "==", decodedCategory))
  }, [db, decodedCategory])

  const { data: dbQuestions, isLoading: isQuestionsLoading } = useCollection(qRef)

  const questions = useMemo(() => {
    if (dbQuestions && dbQuestions.length > 0) return dbQuestions
    return MOCK_QUESTIONS.filter(q => q.category === decodedCategory)
  }, [dbQuestions, decodedCategory])

  const currentQuestion = questions[currentIndex]
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0

  const handleOptionClick = (option: string) => {
    if (isAnswered) return
    setSelectedOption(option)
  }

  const handleConfirm = () => {
    if (!selectedOption) return
    setIsAnswered(true)
    if (selectedOption === currentQuestion.correctAnswer) {
      setScore(prev => prev + 1)
    }
  }

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1)
      setSelectedOption(null)
      setIsAnswered(false)
    } else {
      setShowResults(true)
    }
  }

  const resetQuiz = () => {
    setCurrentIndex(0)
    setSelectedOption(null)
    setIsAnswered(false)
    setScore(0)
    setShowResults(false)
  }

  // Admin Actions
  const handleOpenEdit = () => {
    if (!currentQuestion) return
    setEditForm({
      text: currentQuestion.text,
      category: currentQuestion.category,
      options: currentQuestion.options,
      correctAnswer: currentQuestion.correctAnswer,
      explanation: currentQuestion.explanation || "",
      imageUrl: currentQuestion.imageUrl || ""
    })
    setIsEditOpen(true)
  }

  const handleSaveEdit = async () => {
    if (!db || !currentQuestion.id) return
    setIsSaving(true)
    try {
      const qRef = doc(db, "questions", currentQuestion.id)
      await updateDoc(qRef, {
        ...editForm,
        updatedAt: serverTimestamp()
      })
      toast({ title: "Scenario Updated", description: "Changes synced to master bank." })
      setIsEditOpen(false)
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteQuestion = async () => {
    if (!db || !currentQuestion.id) return
    if (!confirm("Are you sure you want to terminate this scenario from the repository?")) return
    
    setIsDeleting(true)
    try {
      await deleteDoc(doc(db, "questions", currentQuestion.id))
      toast({ title: "Scenario Terminated" })
      if (currentIndex > 0) {
        setCurrentIndex(currentIndex - 1)
      } else if (questions.length === 1) {
        router.back()
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    } finally {
      setIsDeleting(false)
    }
  }

  if (isQuestionsLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    )
  }

  if (questions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-6 px-4 text-center animate-in fade-in">
        <div className="w-16 h-16 bg-muted/20 rounded-full flex items-center justify-center text-muted-foreground">
          <Info size={32} />
        </div>
        <p className="text-muted-foreground text-lg italic uppercase tracking-tighter">No scenarios detected for this sector.</p>
        <Button onClick={() => router.back()} variant="outline" className="h-12 px-8">Return to Library</Button>
      </div>
    )
  }

  if (showResults) {
    const percentage = Math.round((score / questions.length) * 100)
    return (
      <div className="max-w-lg mx-auto py-8 sm:py-12 animate-in zoom-in-95 duration-500 px-4">
        <Card className="text-center shadow-2xl border-none overflow-hidden bg-card/40 backdrop-blur-xl relative">
          <div className="absolute top-0 left-0 w-full h-2 bg-secondary" />
          <CardHeader className="pt-10">
            <CardTitle className="text-2xl sm:text-3xl font-bold uppercase italic tracking-tighter text-white">Analysis Complete</CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 pb-10">
            <div className="relative inline-flex items-center justify-center">
              <svg className="h-40 w-40 sm:h-48 sm:w-48 transform -rotate-90">
                <circle
                  className="text-white/5"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="70"
                  cx="80"
                  cy="80"
                />
                <circle
                  className="text-secondary transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={440}
                  strokeDashoffset={440 - (440 * (score / questions.length))}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="70"
                  cx="80"
                  cy="80"
                />
              </svg>
              <div className="absolute text-3xl sm:text-4xl font-bold text-white font-mono">
                {percentage}%
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Score Result</p>
              <p className="text-3xl font-bold text-white tracking-tighter">{score} / {questions.length}</p>
              <Badge variant="outline" className="mt-2 border-secondary/30 text-secondary px-4 py-1 text-[10px] font-bold uppercase tracking-widest">
                {percentage >= 90 ? "OPTIMAL MASTERY" : "NEEDS REFINEMENT"}
              </Badge>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 p-8 bg-muted/5 border-t border-white/5">
            <Button className="w-full bg-secondary text-white hover:bg-secondary/90 h-14 font-bold uppercase tracking-widest text-xs" onClick={resetQuiz}>
              <RotateCcw className="mr-2 h-4 w-4" /> Repeat Simulation
            </Button>
            <Button variant="ghost" className="w-full h-12 text-muted-foreground hover:text-white text-xs font-bold uppercase tracking-widest" onClick={() => router.push('/practice')}>
              Back to Repository
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 px-4 pb-20">
      <div className="flex items-center justify-between p-4 bg-primary/20 rounded-2xl border border-white/5 shadow-xl">
        <Button variant="ghost" size="sm" onClick={() => router.back()} className="text-muted-foreground hover:text-white uppercase font-bold text-[10px] tracking-widest">
          <ArrowLeft className="mr-2 h-3 w-3" /> Terminate
        </Button>
        <div className="flex items-center gap-4 flex-1 max-w-xs mx-4">
           <Progress value={progress} className="h-1.5 flex-1 bg-white/5" />
        </div>
        <div className="text-[10px] font-bold text-secondary uppercase tracking-widest font-mono">
          {currentIndex + 1} // {questions.length}
        </div>
      </div>

      <Card className="shadow-2xl border-white/5 bg-card/30 backdrop-blur-xl overflow-hidden flex flex-col relative">
        {isAdmin && (
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <Button variant="ghost" size="icon" className="bg-primary/20 hover:bg-primary/40 text-secondary border border-secondary/20" onClick={handleOpenEdit}>
              <Pencil size={16} />
            </Button>
            <Button variant="ghost" size="icon" className="bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20" onClick={handleDeleteQuestion} disabled={isDeleting}>
              {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
            </Button>
            <Badge variant="outline" className="bg-destructive/5 text-destructive border-destructive/20 text-[8px] uppercase tracking-widest h-6">
              <ShieldAlert size={10} className="mr-1" /> Admin mode
            </Badge>
          </div>
        )}
        <CardHeader className="p-6 sm:p-10 pb-6">
          <Badge variant="outline" className="mb-4 w-fit border-secondary/30 text-secondary text-[10px] font-bold tracking-widest uppercase italic">
            {decodedCategory}
          </Badge>
          <CardTitle className="text-xl sm:text-2xl font-bold leading-tight text-white mb-6 pr-24">
            {currentQuestion.text}
          </CardTitle>
          
          {currentQuestion.imageUrl && (
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 mb-2 bg-primary/20 shadow-inner">
              <Image 
                src={currentQuestion.imageUrl} 
                alt="Scenario Diagram" 
                fill 
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
            </div>
          )}
        </CardHeader>
        <CardContent className="p-6 sm:p-10 pt-4 space-y-4">
          {currentQuestion.options.map((option: string, idx: number) => {
            const label = String.fromCharCode(65 + idx)
            const isSelected = selectedOption === option
            const isCorrect = isAnswered && option === currentQuestion.correctAnswer
            const isWrong = isAnswered && isSelected && option !== currentQuestion.correctAnswer

            return (
              <button
                key={idx}
                disabled={isAnswered}
                onClick={() => handleOptionClick(option)}
                className={`
                  w-full text-left p-4 sm:p-6 rounded-2xl border-2 transition-all flex items-center justify-between gap-4 group
                  ${isSelected && !isAnswered ? 'border-secondary bg-secondary/5' : 'border-white/5 bg-primary/5 hover:border-white/20 hover:bg-primary/10'}
                  ${isCorrect ? 'border-secondary bg-secondary/10 text-secondary ring-2 ring-secondary/50' : ''}
                  ${isWrong ? 'border-destructive bg-destructive/10 text-destructive' : ''}
                  ${isAnswered && !isSelected && !isCorrect ? 'opacity-30' : ''}
                `}
              >
                <div className="flex items-center gap-4">
                   <div className={`
                    w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs sm:text-sm shrink-0 transition-colors
                    ${isSelected ? 'bg-secondary text-white' : 'bg-muted/20 text-muted-foreground group-hover:bg-muted/40'}
                    ${isCorrect ? 'bg-secondary text-white shadow-lg shadow-secondary/20' : ''}
                    ${isWrong ? 'bg-destructive text-white' : ''}
                  `}>
                    {label}
                  </div>
                  <span className={`text-sm sm:text-lg flex-1 leading-snug ${isSelected || isCorrect ? 'font-bold text-white' : ''}`}>{option}</span>
                </div>
                {isCorrect && <CheckCircle2 className="h-6 w-6 text-secondary shrink-0 animate-in zoom-in duration-300" />}
                {isWrong && <XCircle className="h-6 w-6 text-destructive shrink-0" />}
              </button>
            )
          })}

          {isAnswered && (
            <div className="mt-8 space-y-4 animate-in slide-in-from-top-4 duration-500">
              <div className="p-6 rounded-2xl bg-secondary/10 border border-secondary/20">
                 <p className="text-xs font-bold text-secondary uppercase tracking-widest mb-2 flex items-center gap-2">
                   <CheckCircle2 size={14} /> Official Explanation
                 </p>
                 <p className="text-sm text-foreground leading-relaxed">
                   {currentQuestion.explanation || "No manual explanation provided for this scenario. Use the AI tool below for deep analysis."}
                 </p>
              </div>
              <AIExplanation 
                question={currentQuestion.text}
                userAnswer={selectedOption || ""}
                correctAnswer={currentQuestion.correctAnswer}
              />
            </div>
          )}
        </CardContent>
        <CardFooter className="p-6 sm:p-10 bg-muted/5 flex justify-end border-t border-white/5">
          {!isAnswered ? (
            <Button 
              className="w-full sm:w-auto min-w-[200px] h-14 bg-secondary text-white hover:bg-secondary/90 font-bold uppercase tracking-widest text-xs shadow-xl shadow-secondary/10" 
              onClick={handleConfirm}
              disabled={!selectedOption}
            >
              Lock Decision
            </Button>
          ) : (
            <Button className="w-full sm:w-auto min-w-[200px] h-14 bg-primary text-white hover:bg-primary/90 font-bold uppercase tracking-widest text-xs" onClick={handleNext}>
              {currentIndex < questions.length - 1 ? 'Next Scenario' : 'Finalize Analysis'}
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </CardFooter>
      </Card>

      {/* Admin Quick Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl bg-card border-white/5 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="italic uppercase tracking-tighter text-xl">Quick Edit Scenario</DialogTitle>
            <DialogDescription className="text-[10px] uppercase font-bold text-secondary">Synchronize repository updates from live session.</DialogDescription>
          </DialogHeader>
          <div className="space-y-6 py-6">
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Scenario Question Text</Label>
              <Input 
                value={editForm.text}
                onChange={(e) => setEditForm({...editForm, text: e.target.value})}
                className="bg-background/50 border-white/10"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Category</Label>
                <Input value={editForm.category} readOnly className="bg-muted/10 opacity-60" />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Diagram URL</Label>
                <Input 
                  value={editForm.imageUrl}
                  onChange={(e) => setEditForm({...editForm, imageUrl: e.target.value})}
                  className="bg-background/50 border-white/10"
                />
              </div>
            </div>
            <div className="space-y-4">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Options</Label>
              <div className="grid gap-3">
                {editForm.options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <Input 
                      value={opt}
                      onChange={(e) => {
                        const opts = [...editForm.options]
                        opts[i] = e.target.value
                        setEditForm({...editForm, options: opts})
                      }}
                      className={`flex-1 bg-background/50 border-white/10 ${editForm.correctAnswer === opt ? 'border-secondary' : ''}`}
                    />
                    <Button 
                      variant={editForm.correctAnswer === opt ? "secondary" : "outline"}
                      className="text-[10px] uppercase font-bold"
                      onClick={() => setEditForm({...editForm, correctAnswer: opt})}
                    >
                      Correct
                    </Button>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Official Explanation</Label>
              <Textarea 
                value={editForm.explanation}
                onChange={(e) => setEditForm({...editForm, explanation: e.target.value})}
                className="bg-background/50 border-white/10 min-h-[100px]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button className="w-full bg-secondary text-white font-bold h-12 uppercase tracking-widest text-xs" onClick={handleSaveEdit} disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin mr-2" /> : "Sync Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
