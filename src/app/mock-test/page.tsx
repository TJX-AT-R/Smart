
"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { MOCK_QUESTIONS } from "@/app/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardFooter, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Timer, AlertCircle, CheckCircle2, Trophy, RotateCcw, ArrowRight, Loader2 } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useUser, useFirestore } from "@/firebase"
import { doc, collection, setDoc, serverTimestamp } from "firebase/firestore"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"
import Image from "next/image"

export default function MockTestPage() {
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const totalQuestions = 10 // Adjusted to match available data or preferred length
  const initialTime = 8 * 60 // 8 minutes in seconds

  const [testQuestions, setTestQuestions] = useState(MOCK_QUESTIONS.slice(0, totalQuestions))
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userAnswers, setUserAnswers] = useState<(string | null)[]>(new Array(totalQuestions).fill(null))
  const [timeLeft, setTimeLeft] = useState(initialTime)
  const [isTestActive, setIsTestActive] = useState(false)
  const [isFinished, setIsFinished] = useState(false)
  const [score, setScore] = useState(0)
  const [startTime, setStartTime] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const saveResults = useCallback((finalScore: number, answers: (string | null)[]) => {
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
      const question = testQuestions[index]
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
  }, [user, db, startTime, testQuestions, totalQuestions])

  const startTest = () => {
    const shuffled = [...MOCK_QUESTIONS].sort(() => 0.5 - Math.random()).slice(0, totalQuestions)
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
      if (answer === testQuestions[index].correctAnswer) {
        finalScore++
      }
    })
    setScore(finalScore)
    saveResults(finalScore, userAnswers)
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

  if (!isTestActive && !isFinished) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-8 animate-in fade-in duration-500">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center mx-auto text-secondary mb-6">
            <Timer size={48} />
          </div>
          <h1 className="text-4xl font-bold text-primary">Official Mock Test</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            This test consists of {totalQuestions} questions. You have exactly 8 minutes to complete it.
          </p>
        </div>

        <Card className="w-full max-w-lg border-white/5 bg-card/30 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Test Rules</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm">
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="text-secondary shrink-0 mt-0.5" size={16} />
              <span>Pass mark is 86% ({Math.ceil(totalQuestions * 0.86)} out of {totalQuestions})</span>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="text-secondary shrink-0 mt-0.5" size={16} />
              <span>Each question has multiple options</span>
            </div>
            <div className="flex gap-3 items-start">
              <CheckCircle2 className="text-secondary shrink-0 mt-0.5" size={16} />
              <span>Results will be saved to your profile automatically.</span>
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full bg-secondary text-white hover:bg-secondary/90 h-12 text-lg" onClick={startTest}>
              Start Exam Now
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  if (isFinished) {
    const percentage = Math.round((score / totalQuestions) * 100)
    const passed = percentage >= 86

    return (
      <div className="max-w-2xl mx-auto py-12 animate-in zoom-in-95 duration-500">
        <Card className="shadow-2xl border-none overflow-hidden bg-card/50 backdrop-blur-xl">
          <div className={`h-3 ${passed ? 'bg-green-500' : 'bg-destructive'}`} />
          <CardHeader className="text-center space-y-4">
            <div className="mx-auto w-24 h-24 rounded-full bg-background/50 flex items-center justify-center border-4 border-secondary/20">
              {passed ? <Trophy className="text-secondary" size={48} /> : <AlertCircle className="text-destructive" size={48} />}
            </div>
            <div>
              <CardTitle className="text-3xl font-bold">{passed ? 'Congratulations!' : 'Keep Practicing'}</CardTitle>
              <CardDescription className="text-lg">
                You scored <span className={`font-bold ${passed ? 'text-secondary' : 'text-destructive'}`}>{score}</span> out of {totalQuestions}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-8">
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="p-4 rounded-2xl bg-muted/30 border border-white/5">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Percentage</p>
                <p className="text-2xl font-bold text-primary">{percentage}%</p>
              </div>
              <div className="p-4 rounded-2xl bg-muted/30 border border-white/5">
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Status</p>
                <Badge variant={passed ? "secondary" : "destructive"} className="text-sm px-4 py-1">
                  {passed ? 'PASSED' : 'FAILED'}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="font-semibold text-primary">Summary</h4>
              <div className="flex justify-between items-center text-sm p-4 rounded-xl bg-background/30 border border-white/5">
                <span>Pass Requirement:</span>
                <span className="font-bold">{Math.ceil(totalQuestions * 0.86)} Correct</span>
              </div>
              <div className="flex justify-between items-center text-sm p-4 rounded-xl bg-background/30 border border-white/5">
                <span>Time Taken:</span>
                <span className="font-bold">{formatTime(initialTime - timeLeft)}</span>
              </div>
              {isSaving && (
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving results...
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button className="w-full bg-secondary text-white hover:bg-secondary/90 h-12" onClick={startTest}>
              <RotateCcw className="mr-2 h-4 w-4" /> Try Again
            </Button>
            <Button variant="ghost" className="w-full h-12" onClick={() => router.push('/dashboard')}>
              Back to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  const currentQuestion = testQuestions[currentIndex]
  const progress = ((currentIndex + 1) / totalQuestions) * 100
  const selectedOption = userAnswers[currentIndex]

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500 pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-20 z-20 bg-background/80 backdrop-blur-md p-4 rounded-2xl border border-white/5">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 ${timeLeft < 60 ? 'border-destructive text-destructive animate-pulse' : 'border-secondary/20 text-secondary'}`}>
            <Timer size={20} />
            <span className="text-xl font-mono font-bold">{formatTime(timeLeft)}</span>
          </div>
          <div className="text-sm font-medium text-muted-foreground">
            Question <span className="text-primary font-bold">{currentIndex + 1}</span> of {totalQuestions}
          </div>
        </div>
        <Progress value={progress} className="h-2 w-full md:w-48 bg-muted" />
        <Button variant="destructive" size="sm" onClick={() => setIsFinished(true)} className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border-destructive/20">
          Finish Test
        </Button>
      </div>

      <div className="grid lg:grid-cols-7 gap-6">
        <Card className="lg:col-span-5 shadow-xl border-white/5 bg-card/40 overflow-hidden">
          <CardHeader className="p-8">
            <Badge variant="outline" className="mb-4 w-fit border-secondary/30 text-secondary">{currentQuestion.category}</Badge>
            <CardTitle className="text-2xl font-bold leading-tight text-secondary mb-6">
              {currentQuestion.text}
            </CardTitle>
            {currentQuestion.imageUrl && (
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 mb-6 bg-muted">
                <Image 
                  src={currentQuestion.imageUrl} 
                  alt="Question Illustration" 
                  fill 
                  className="object-cover"
                />
              </div>
            )}
          </CardHeader>
          <CardContent className="p-8 pt-0 space-y-4">
            {currentQuestion.options.map((option, idx) => {
              const label = String.fromCharCode(65 + idx) // A, B, C
              const isSelected = selectedOption === option
              
              return (
                <button
                  key={idx}
                  onClick={() => handleOptionSelect(option)}
                  className={`
                    w-full text-left p-6 rounded-2xl border-2 transition-all group relative flex items-center gap-4
                    ${isSelected 
                      ? 'border-secondary bg-secondary/10' 
                      : 'border-white/5 bg-background/30 hover:border-white/20 hover:bg-background/50'}
                  `}
                >
                  <div className={`
                    w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg shrink-0
                    ${isSelected ? 'bg-secondary text-white' : 'bg-muted text-muted-foreground group-hover:bg-muted/80'}
                  `}>
                    {label}
                  </div>
                  <span className={`text-lg flex-1 ${isSelected ? 'text-primary font-semibold' : 'text-muted-foreground'}`}>
                    {option}
                  </span>
                  {isSelected && <CheckCircle2 className="text-secondary shrink-0" size={24} />}
                </button>
              )
            })}
          </CardContent>
          <CardFooter className="p-8 bg-muted/10 flex justify-between border-t border-white/5">
            <Button 
              variant="outline" 
              onClick={prevQuestion} 
              disabled={currentIndex === 0}
              className="border-white/10 hover:bg-white/5"
            >
              Previous
            </Button>
            <Button 
              className="bg-primary text-white hover:bg-primary/90 min-w-[120px]" 
              onClick={nextQuestion}
            >
              {currentIndex === totalQuestions - 1 ? 'Finish Test' : 'Next Question'}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card className="lg:col-span-2 border-white/5 bg-card/40">
          <CardHeader>
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Question Grid</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 gap-2">
              {userAnswers.map((answer, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentIndex(i)}
                  className={`
                    h-10 rounded-lg text-xs font-bold transition-all border
                    ${currentIndex === i ? 'border-primary ring-2 ring-primary/20 ring-offset-2 ring-offset-background' : 'border-transparent'}
                    ${answer !== null ? 'bg-secondary text-white' : 'bg-muted/50 text-muted-foreground'}
                  `}
                >
                  {i + 1}
                </button>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex-col items-start gap-4">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 bg-secondary rounded-sm" />
              <span>Answered</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="w-3 h-3 bg-muted rounded-sm" />
              <span>Unanswered</span>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
