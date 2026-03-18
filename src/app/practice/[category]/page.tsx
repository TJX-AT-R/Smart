"use client"

import { useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import { MOCK_QUESTIONS } from "@/app/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, XCircle, ArrowLeft, RotateCcw } from "lucide-react"

export default function CategoryPracticePage() {
  const { category } = useParams()
  const router = useRouter()
  const decodedCategory = decodeURIComponent(category as string)

  const filteredQuestions = useMemo(() => 
    MOCK_QUESTIONS.filter(q => q.category === decodedCategory), 
    [decodedCategory]
  )

  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [isAnswered, setIsAnswered] = useState(false)
  const [score, setScore] = useState(0)
  const [showResults, setShowResults] = useState(false)

  const currentQuestion = filteredQuestions[currentIndex]
  const progress = ((currentIndex + 1) / filteredQuestions.length) * 100

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
    if (currentIndex < filteredQuestions.length - 1) {
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

  if (filteredQuestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <p className="text-muted-foreground">No questions found for this category.</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    )
  }

  if (showResults) {
    return (
      <div className="max-w-md mx-auto py-8 animate-in zoom-in-95 duration-300">
        <Card className="text-center shadow-xl border-none overflow-hidden">
          <div className="h-2 bg-secondary" />
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Session Complete!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="relative inline-flex items-center justify-center">
              <svg className="h-32 w-32">
                <circle
                  className="text-muted/20"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                  r="58"
                  cx="64"
                  cy="64"
                />
                <circle
                  className="text-secondary"
                  strokeWidth="8"
                  strokeDasharray={364.4}
                  strokeDashoffset={364.4 - (364.4 * (score / filteredQuestions.length))}
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="transparent"
                  r="58"
                  cx="64"
                  cy="64"
                />
              </svg>
              <div className="absolute text-3xl font-bold">
                {Math.round((score / filteredQuestions.length) * 100)}%
              </div>
            </div>
            <div className="space-y-1">
              <p className="text-muted-foreground">You got</p>
              <p className="text-2xl font-bold text-primary">{score} out of {filteredQuestions.length}</p>
              <p className="text-muted-foreground">questions correct</p>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full bg-primary" onClick={resetQuiz}>
              <RotateCcw className="mr-2 h-4 w-4" /> Try Again
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => router.push('/practice')}>
              Back to Categories
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Exit
        </Button>
        <div className="text-xs font-medium text-muted-foreground">
          Question {currentIndex + 1} of {filteredQuestions.length}
        </div>
      </div>

      <Progress value={progress} className="h-2" />

      <Card className="shadow-lg border-none">
        <CardHeader>
          <div className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">{decodedCategory}</div>
          <CardTitle className="text-xl leading-relaxed">{currentQuestion.text}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {currentQuestion.options.map((option) => {
            const isSelected = selectedOption === option
            const isCorrect = isAnswered && option === currentQuestion.correctAnswer
            const isWrong = isAnswered && isSelected && option !== currentQuestion.correctAnswer

            return (
              <button
                key={option}
                disabled={isAnswered}
                onClick={() => handleOptionClick(option)}
                className={`
                  w-full text-left p-4 rounded-xl border-2 transition-all flex items-center justify-between
                  ${isSelected ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
                  ${isCorrect ? 'border-green-500 bg-green-50 text-green-700' : ''}
                  ${isWrong ? 'border-red-500 bg-red-50 text-red-700' : ''}
                  ${isAnswered && !isSelected && !isCorrect ? 'opacity-50' : ''}
                `}
              >
                <span className="flex-1">{option}</span>
                {isCorrect && <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0 ml-2" />}
                {isWrong && <XCircle className="h-5 w-5 text-red-600 shrink-0 ml-2" />}
              </button>
            )
          })}
        </CardContent>
        <CardFooter>
          {!isAnswered ? (
            <Button 
              className="w-full h-12 text-lg bg-primary" 
              onClick={handleConfirm}
              disabled={!selectedOption}
            >
              Confirm Answer
            </Button>
          ) : (
            <Button className="w-full h-12 text-lg bg-secondary text-white" onClick={handleNext}>
              {currentIndex < filteredQuestions.length - 1 ? 'Next Question' : 'Finish Quiz'}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
