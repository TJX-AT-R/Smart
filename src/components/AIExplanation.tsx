
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Loader2, Info } from "lucide-react"
import { explainIncorrectAnswer } from "@/ai/flows/ai-powered-explanation-tool"

interface AIExplanationProps {
  question: string
  userAnswer: string
  correctAnswer: string
}

export function AIExplanation({ question, userAnswer, correctAnswer }: AIExplanationProps) {
  const [explanation, setExplanation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGetExplanation = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await explainIncorrectAnswer({
        question,
        userAnswer,
        correctAnswer
      })
      setExplanation(result.detailedExplanation)
    } catch (err) {
      setError("Failed to generate explanation. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (explanation) {
    return (
      <Card className="bg-primary/5 border-primary/20 mt-4 animate-in slide-in-from-top-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold flex items-center gap-2 text-primary">
            <Sparkles size={16} className="text-secondary" />
            AI Smart Explanation
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">
            {explanation}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mt-4">
      <Button 
        onClick={handleGetExplanation} 
        disabled={isLoading}
        variant="outline"
        className="text-xs gap-2 border-primary/20 hover:bg-primary/5 h-8"
      >
        {isLoading ? (
          <Loader2 className="h-3 w-3 animate-spin" />
        ) : (
          <Sparkles className="h-3 w-3 text-secondary" />
        )}
        Explain why I was wrong
      </Button>
      {error && <p className="text-[10px] text-destructive mt-1">{error}</p>}
    </div>
  )
}
