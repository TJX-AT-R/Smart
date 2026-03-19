"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { MOCK_QUESTIONS } from "@/app/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Timer, AlertCircle, CheckCircle2, Trophy, RotateCcw, ArrowRight, Loader2, ChevronLeft, ChevronRight, Pencil, Trash2, ShieldAlert, UploadCloud } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useUser, useFirestore, useCollection, useMemoFirebase, useStorage } from "@/firebase"
import { doc, collection, setDoc, serverTimestamp, query, limit, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import Image from "next/image"
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

export default function MockTestPage() {
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const storage = useStorage()
  const { toast } = useToast()
  const imageInputRef = useRef<HTMLInputElement>(null)
  
  const totalQuestions = 25
  const passThresholdPercent = 92
  const initialTime = 8 * 60

  const [testQuestions, setTestQuestions] = useState<any[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>(new Array(totalQuestions).fill(null))
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isTestActive, setIsTestActive] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [score, setScore] = useState(0)
  const [startTime, setStartTime] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  // Admin Edit State
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)
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

  const questionsQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "questions"), limit(100))
  }, [db])

  const { data: dbQuestions, isLoading: isDbLoading } = useCollection(questionsQuery)

  const saveResults = useCallback((finalScore: number, answers: (string | null)[], questionsUsed: any[]) => {
    if (!user || !db || !startTime) return

    setIsSaving(true)
    const testAttemptRef = doc(collection(db, "users", user.uid, "testAttempts"))
    const endTime = new Date().toISOString()
    const percentage = Math.round((finalScore / totalQuestions) * 100)

    const attemptData = {
      id: testAttemptRef.id,
      userId: user.uid,
      type: "mock-test",
      startTime: startTime,
      endTime: endTime,
      scorePercentage: percentage,
      isCompleted: true,
      createdAt: serverTimestamp()
    }

    setDoc(testAttemptRef, attemptData).catch((err) => {
      errorEmitter.emit("permission-error", new FirestorePermissionError({
        path: testAttemptRef.path,
        operation: "create",
        requestResourceData: attemptData
      }))
    })

    answers.forEach((answer, index) => {
      const question = questionsUsed[index]
      if (!question) return
      
      const answerRef = doc(collection(db, "users", user.uid, "testAttempts", testAttemptRef.id, "userAnswers"))
      
      const answerData = {
        id: answerRef.id,
        testAttemptId: testAttemptRef.id,
        questionId: question.id,
        selectedOptionId: answer || "unanswered",
        isCorrect: answer === question.correctAnswer,
        submittedTime: endTime
      }

      setDoc(answerRef, answerData).catch((err) => {
        errorEmitter.emit("permission-error", new FirestorePermissionError({
          path: answerRef.path,
          operation: "create",
          requestResourceData: answerData
        }))
      })
    })

    setIsSaving(false)
  }, [user, db, startTime, totalQuestions])

  const startTest = () => {
    const sourceQuestions = (dbQuestions && dbQuestions.length >= totalQuestions) 
      ? dbQuestions 
      : MOCK_QUESTIONS
      
    const shuffled = [...sourceQuestions].sort(() => 0.5 - Math.random()).slice(0, totalQuestions)
    setTestQuestions(shuffled)
    setCurrentIndex(0)
    setUserAnswers(new Array(totalQuestions).fill(null))
    setTimeLeft(initialTime)
    setIsTestActive(true)
    setIsFinished(false)
    setScore(0)
    setStartTime(new Date().toISOString())
  }

  const finishTest = useCallback(() => {
    setIsTestActive(false)
    setIsFinished(true)
    
    let finalScore = 0
    userAnswers.forEach((answer, index) => {
      if (testQuestions[index] && answer === testQuestions[index].correctAnswer) {
        finalScore++
      }
    })
    setScore(finalScore)
    saveResults(finalScore, userAnswers, testQuestions)
  }, [userAnswers, testQuestions, saveResults])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (isTestActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1)
      }, 1000)
    } else if (timeLeft === 0 && isTestActive) {
      finishTest()
    }
    return () => clearInterval(timer)
  }, [isTestActive, timeLeft, finishTest])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleOptionSelect = (option: string) => {
    if (!isTestActive) return
    const newAnswers = [...userAnswers]
    newAnswers[currentIndex] = option
    setUserAnswers(newAnswers)
  }

  const nextQuestion = () => {
    if (currentIndex < totalQuestions - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      finishTest()
    }
  }

  const prevQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  // Admin Actions
  const handleOpenEdit = () => {
    const q = testQuestions[currentIndex]
    if (!q) return
    setEditForm({
      text: q.text,
      category: q.category,
      options: q.options,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || "",
      imageUrl: q.imageUrl || ""
    })
    setUploadProgress(null)
    setIsEditOpen(true)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !storage) return

    setIsSavingEdit(true)
    const storageRef = ref(storage, `question-diagrams/${Date.now()}_${file.name}`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on('state_changed', 
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setUploadProgress(progress)
      }, 
      (error) => {
        toast({ variant: "destructive", title: "Upload Failed", description: error.message })
        setUploadProgress(null)
        setIsSavingEdit(false)
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        setEditForm(prev => ({ ...prev, imageUrl: downloadURL }))
        setUploadProgress(null)
        setIsSavingEdit(false)
        toast({ title: "Visual Replaced", description: "Diagram updated in cloud." })
      }
    )
  }

  const handleSaveEdit = async () => {
    const q = testQuestions[currentIndex]
    if (!db || !q?.id) return
    setIsSavingEdit(true)
    try {
      const qRef = doc(db, "questions", q.id)
      await updateDoc(qRef, {
        ...editForm,
        updatedAt: serverTimestamp()
      })
      toast({ title: "Scenario Synced", description: "Updated across entire platform bank." })
      // Update local test state
      const updatedQuestions = [...testQuestions]
      updatedQuestions[currentIndex] = { ...q, ...editForm }
      setTestQuestions(updatedQuestions)
      setIsEditOpen(false)
    } catch (error: any) {
      toast({ variant: "destructive", title: "Update Failed", description: error.message })
    } finally {
      setIsSavingEdit(false)
    }
  }

  const handleDeleteQuestion = async () => {
    const q = testQuestions[currentIndex]
    if (!db || !q?.id) return
    if (!confirm("Remove this scenario permanently from the repository?")) return
    
    try {
      await deleteDoc(doc(db, "questions", q.id))
      toast({ title: "Scenario Terminated" })
      // Skip to next question
      if (currentIndex < totalQuestions - 1) {
        nextQuestion()
      } else {
        finishTest()
      }
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    }
  }

  if (isDbLoading && !isTestActive) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-secondary" />
      </div>
    )
  }

  if (!isTestActive && !isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 py-8 space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto text-secondary mb-6 shadow-lg shadow-secondary/10">
            <Timer size={40} />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-tight uppercase italic text-shadow-sm">Official Mock Test</h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            This test consists of {totalQuestions} questions. You have exactly {initialTime / 60} minutes to complete it.
          </p>
        </div>

        <Card className="w-full max-w-lg border-white/5 bg-card/30 backdrop-blur-xl shadow-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white uppercase tracking-widest text-xs">Test Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm sm:text-base">
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="text-secondary shrink-0 mt-1" size={16} />
              <span className="text-muted-foreground">Pass mark is <span className="text-white font-bold">{passThresholdPercent}%</span> (23 out of 25)</span>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="text-secondary shrink-0 mt-1" size={16} />
              <span className="text-muted-foreground">Each question has multiple choices</span>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="text-secondary shrink-0 mt-1" size={16} />
              <span className="text-muted-foreground">Results are saved automatically for your coach.</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-secondary text-white hover:bg-secondary/90 h-14 text-lg font-bold shadow-xl shadow-secondary/20" onClick={startTest}>
              Start Exam Now
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (isFinished) {
    const percentage = Math.round((score / totalQuestions) * 100)
    const passed = percentage >= passThresholdPercent

    return (
      <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12 animate-in zoom-in-95 duration-500">
        <Card className="shadow-2xl border-none overflow-hidden bg-card/50 backdrop-blur-xl relative">
          <div className={`absolute top-0 left-0 w-full h-2 ${passed ? 'bg-secondary' : 'bg-destructive'}`} />
          <CardHeader className="text-center space-y-6 pt-10">
            <div className={`mx-auto w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center border-4 ${passed ? 'border-secondary/30 bg-secondary/10' : 'border-destructive/30 bg-destructive/10'}`}>
              {passed ? <Trophy className="text-secondary" size={40} /> : <AlertCircle className="text-destructive" size={40} />}
            </div>
            <div>
              <CardTitle className="text-2xl sm:text-3xl font-bold tracking-tight text-white uppercase italic">{passed ? 'Mission Accomplished' : 'More Training Required'}</CardTitle>
              <CardDescription className="text-base sm:text-lg">
                Performance: <span className={`font-bold ${passed ? 'text-secondary' : 'text-destructive'}`}>{score} / {totalQuestions}</span> Correct
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-primary/20 border border-white/5 text-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Percentage</p>
                <p className="text-xl sm:text-2xl font-bold text-white font-mono">{percentage}%</p>
              </div>
              <div className="p-4 rounded-2xl bg-primary/20 border border-white/5 text-center flex flex-col items-center justify-center">
                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-1">Status</p>
                <Badge variant={passed ? "secondary" : "destructive"} className="text-[10px] sm:text-xs px-3 py-0.5 font-bold uppercase tracking-widest">
                  {passed ? 'PASS' : 'FAIL'}
                </Badge>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs sm:text-sm p-4 rounded-xl bg-background/30 border border-white/5">
                <span className="text-muted-foreground uppercase font-bold tracking-widest">Requirement</span>
                <span className="font-bold text-white">23 Correct</span>
              </div>
              <div className="flex justify-between items-center text-xs sm:text-sm p-4 rounded-xl bg-background/30 border border-white/5">
                <span className="text-muted-foreground uppercase font-bold tracking-widest">Completion Time</span>
                <span className="font-bold text-white font-mono">{formatTime(initialTime - timeLeft)}</span>
              </div>
              {isSaving && (
                <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground uppercase font-bold tracking-widest mt-4">
                  <Loader2 className="h-3 w-3 animate-spin text-secondary" />
                  Syncing data...
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3 pb-8">
            <Button className="w-full bg-secondary text-white hover:bg-secondary/90 h-12 font-bold" onClick={startTest}>
              <RotateCcw className="mr-2 h-4 w-4" /> Restart Simulation
            </Button>
            <Button variant="ghost" className="w-full h-12 text-muted-foreground hover:text-white" onClick={() => router.push('/dashboard')}>
              Return to Command Center
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const currentQuestion = testQuestions[currentIndex]
  const progress = ((currentIndex + 1) / totalQuestions) * 100
  const selectedOption = userAnswers[currentIndex]

  if (!currentQuestion) return null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 sticky top-[72px] z-30 bg-background/60 backdrop-blur-xl p-4 sm:p-5 rounded-2xl border border-white/10 shadow-xl">
        <div className="flex items-center justify-between sm:justify-start gap-4 w-full sm:w-auto">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 transition-colors ${timeLeft < 60 ? 'border-destructive text-destructive animate-pulse bg-destructive/5' : 'border-secondary/20 text-secondary bg-secondary/5'}`}>
            <Timer size={18} className="sm:size-20" />
            <span className="text-lg sm:text-xl font-mono font-bold tracking-tighter">{formatTime(timeLeft)}</span>
          </div>
          <div className="text-xs sm:text-sm font-bold uppercase tracking-widest text-muted-foreground">
            Step <span className="text-white">{currentIndex + 1}</span> / {totalQuestions}
          </div>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <Progress value={progress} className="h-2 flex-1 sm:w-48 bg-white/5" />
          <Button variant="destructive" size="sm" onClick={() => setIsFinished(true)} className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-destructive/20 text-[10px] font-bold uppercase tracking-widest h-9">
            Abort
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-7 gap-6">
        <Card className="lg:col-span-5 shadow-2xl border-white/5 bg-card/30 backdrop-blur-md overflow-hidden flex flex-col relative">
          {isAdmin && (
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              <Button variant="ghost" size="icon" className="bg-primary/20 hover:bg-primary/40 text-secondary border border-secondary/20" onClick={handleOpenEdit}>
                <Pencil size={16} />
              </Button>
              <Button variant="ghost" size="icon" className="bg-destructive/10 hover:bg-destructive/20 text-destructive border border-destructive/20" onClick={handleDeleteQuestion}>
                <Trash2 size={16} />
              </Button>
              <Badge variant="outline" className="bg-destructive/5 text-destructive border-destructive/20 text-[8px] uppercase tracking-widest h-6">
                <ShieldAlert size={10} className="mr-1" /> Admin mode
              </Badge>
            </div>
          )}
          <CardHeader className="p-6 sm:p-10 pb-4">
            <Badge variant="outline" className="mb-4 w-fit border-secondary/30 text-secondary text-[10px] font-bold tracking-widest uppercase">{currentQuestion.category}</Badge>
            <CardTitle className="text-xl sm:text-2xl font-bold leading-tight text-white mb-6 pr-24">
              {currentQuestion.text}
            </CardTitle>
            {currentQuestion.imageUrl && (
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 mb-2 bg-primary/20">
                <Image 
                  src={currentQuestion.imageUrl} 
                  alt="Scenario Visual" 
                  fill 
                  className="object-cover"
                />
              </div>
            )}
          </CardHeader>
          <CardContent className="p-6 sm:p-10 pt-4 space-y-4 flex-1">
            {currentQuestion.options.map((option: string, idx: number) => {
              const label = String.fromCharCode(65 + idx)
              const isSelected = selectedOption === option
              
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(option)}
                  className={`
                    w-full text-left p-4 sm:p-6 rounded-2xl border-2 transition-all group relative flex items-center gap-4
                    ${isSelected 
                      ? 'border-secondary bg-secondary/10' 
                      : 'border-white/5 bg-primary/10 hover:border-white/20 hover:bg-primary/20'}
                  `}
                >
                  <div className={`
                    w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center font-bold text-base sm:text-lg shrink-0 transition-colors
                    ${isSelected ? 'bg-secondary text-white' : 'bg-muted/50 text-muted-foreground group-hover:bg-muted'}
                  `}>
                    {label}
                  </div>
                  <span className={`text-sm sm:text-lg flex-1 leading-tight ${isSelected ? 'text-white font-bold' : 'text-muted-foreground'}`}>
                    {option}
                  </span>
                  {isSelected && <CheckCircle2 className="text-secondary shrink-0 hidden sm:block" size={24} />}
                </button>
              )
            })}
          </CardContent>
          <CardFooter className="p-6 sm:p-8 bg-muted/5 flex justify-between border-t border-white/5">
            <Button 
              variant="outline" 
              onClick={prevQuestion} 
              disabled={currentIndex === 0}
              className="border-white/10 hover:bg-white/5 h-11 px-6 font-bold uppercase tracking-widest text-[10px]"
            >
              <ChevronLeft className="mr-1 h-3 w-3" /> Back
            </Button>
            <Button 
              className="bg-secondary text-white hover:bg-secondary/90 min-w-[120px] h-11 px-6 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-secondary/20" 
              onClick={nextQuestion}
            >
              {currentIndex === totalQuestions - 1 ? 'Finish' : 'Next'}
              <ChevronRight className="ml-1 h-3 w-3" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-2 border-white/5 bg-card/30 backdrop-blur-sm h-fit sticky top-48">
          <CardHeader className="pb-4">
            <CardTitle className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Navigation Map</CardTitle>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="grid grid-cols-5 gap-2">
              {userAnswers.map((answer, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`
                    h-9 sm:h-10 rounded-lg text-[10px] sm:text-xs font-bold transition-all border
                    ${currentIndex === i ? 'border-secondary ring-2 ring-secondary/20 bg-primary/20' : 'border-transparent'}
                    ${answer !== null ? 'bg-secondary text-white' : 'bg-muted/30 text-muted-foreground hover:bg-muted/50'}
                  `}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex flex-row sm:flex-col items-center sm:items-start gap-4 border-t border-white/5 pt-4">
            <div className="flex items-center gap-2 text-[8px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-secondary rounded-sm" />
              <span>Locked</span>
            </div>
            <div className="flex items-center gap-2 text-[8px] sm:text-[10px] text-muted-foreground uppercase font-bold tracking-widest">
              <div className="w-2 h-2 sm:w-3 sm:h-3 bg-muted/50 rounded-sm" />
              <span>Pending</span>
            </div>
          </CardFooter>
        </Card>
      </div>

      {/* Admin Quick Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="max-w-3xl bg-card border-white/5 shadow-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="italic uppercase tracking-tighter text-xl">Quick Edit Scenario</DialogTitle>
            <DialogDescription className="text-[10px] uppercase font-bold text-secondary">Synchronize repository updates from mock session.</DialogDescription>
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
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Category</Label>
                  <Input value={editForm.category} readOnly className="bg-muted/10 opacity-60" />
                </div>
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground ml-1">Diagram URL (Manual)</Label>
                  <Input 
                    value={editForm.imageUrl}
                    onChange={(e) => setEditForm({...editForm, imageUrl: e.target.value})}
                    className="bg-background/50 border-white/10"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Diagram Upload</Label>
                <div className="flex flex-col gap-3">
                  <Button 
                    variant="outline" 
                    className="h-28 border-dashed border-white/20 flex flex-col gap-2 hover:bg-white/5 transition-all relative overflow-hidden"
                    onClick={() => imageInputRef.current?.click()}
                    type="button"
                    disabled={uploadProgress !== null}
                  >
                    {editForm.imageUrl ? (
                      <div className="absolute inset-0">
                        <img src={editForm.imageUrl} alt="Preview" className="w-full h-full object-cover opacity-40" />
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-secondary">
                          <CheckCircle2 size={24} />
                          <span className="text-[10px] uppercase font-bold bg-background/80 px-2 py-0.5 rounded mt-1">Diagram Linked</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-muted-foreground">
                        <UploadCloud size={24} />
                        <span className="text-[10px] uppercase font-bold">Replace Diagram</span>
                      </div>
                    )}
                  </Button>
                  <input 
                    type="file" 
                    ref={imageInputRef} 
                    className="hidden" 
                    accept="image/*" 
                    onChange={handleImageUpload}
                  />
                  {uploadProgress !== null && (
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[9px] uppercase font-bold text-secondary">
                        <span>Uploading Diagram...</span>
                        <span>{Math.round(uploadProgress)}%</span>
                      </div>
                      <Progress value={uploadProgress} className="h-1 bg-white/5" />
                    </div>
                  )}
                </div>
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
            <Button className="w-full bg-secondary text-white font-bold h-12 uppercase tracking-widest text-xs" onClick={handleSaveEdit} disabled={isSavingEdit || uploadProgress !== null}>
              {isSavingEdit ? <Loader2 className="animate-spin mr-2" /> : "Sync Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
