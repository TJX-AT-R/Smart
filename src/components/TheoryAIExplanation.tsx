
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Sparkles, Loader2, BookOpenCheck } from "lucide-react"
import { explainTheoryTopic } from "@/ai/flows/theory-explanation-tool"

interface TheoryAIExplanationProps {
  topicTitle: string
  topicDescription: string
}

export function TheoryAIExplanation({ topicTitle, topicDescription }: TheoryAIExplanationProps) {
  const [explanation, setExplanation] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleGetExplanation = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await explainTheoryTopic({
        topicTitle,
        topicDescription
      })
      setExplanation(result.deepDiveExplanation)
    } catch (err) {
      setError("Analysis failed. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (explanation) {
    return (
      <Card className="bg-secondary/5 border-secondary/20 mt-8 animate-in slide-in-from-top-4 shadow-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-bold flex items-center gap-2 text-secondary uppercase tracking-widest">
            <Sparkles size={16} />
            SmartPass AI Deep-Dive
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm leading-relaxed text-foreground whitespace-pre-wrap font-medium">
            {explanation}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mt-8">
      <Button 
        onClick={handleGetExplanation} 
        disabled={isLoading}
        variant="outline"
        className="w-full sm:w-auto h-12 gap-3 border-secondary/30 text-secondary hover:bg-secondary/5 font-bold uppercase tracking-widest text-xs"
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <BookOpenCheck className="h-4 w-4" />
        )}
        {isLoading ? "Consulting AI Coach..." : "Get AI Theory Explanation"}
      </Button>
      {error && <p className="text-[10px] text-destructive mt-2 uppercase font-bold">{error}</p>}
    </div>
  )
}
