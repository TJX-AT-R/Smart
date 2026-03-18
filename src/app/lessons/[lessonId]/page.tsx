
"use client"

import { useParams, useRouter } from "next/navigation"
import { MOCK_LESSONS } from "@/app/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, CheckCircle2, Loader2, BookOpen } from "lucide-react"
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase"
import { doc, setDoc, serverTimestamp } from "firebase/firestore"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export default function LessonDetailPage() {
  const { lessonId } = useParams()
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [isSaving, setIsSaving] = useState(false)

  const lesson = MOCK_LESSONS.find(l => l.id === lessonId)

  const progressRef = useMemoFirebase(() => {
    if (!db || !user || !lessonId) return null
    return doc(db, "users", user.uid, "lessonProgress", lessonId as string)
  }, [db, user, lessonId])

  const { data: progress, isLoading: isProgressLoading } = useDoc(progressRef)

  const handleComplete = async () => {
    if (!db || !user || !lessonId) return
    
    setIsSaving(true)
    try {
      await setDoc(doc(db, "users", user.uid, "lessonProgress", lessonId as string), {
        id: lessonId,
        userId: user.uid,
        lessonId: lessonId,
        isCompleted: true,
        completionDate: new Date().toISOString(),
        updatedAt: serverTimestamp()
      })
      
      toast({
        title: "Lesson Completed!",
        description: "Your progress has been saved to your profile.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to save progress",
        description: error.message,
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-muted-foreground">Lesson not found.</p>
        <Button onClick={() => router.push("/lessons")}>Back to Lessons</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      <Button variant="ghost" size="sm" onClick={() => router.push("/lessons")} className="gap-2">
        <ChevronLeft className="h-4 w-4" /> Back to Modules
      </Button>

      <Card className="border-white/5 bg-card/40 backdrop-blur-sm overflow-hidden">
        <CardHeader className="bg-primary/20 p-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="text-secondary" />
            <span className="text-xs font-bold uppercase tracking-widest text-secondary">Study Module</span>
          </div>
          <CardTitle className="text-3xl font-bold text-white">{lesson.title}</CardTitle>
          <CardDescription className="text-lg">{lesson.description}</CardDescription>
        </CardHeader>
        <CardContent className="p-8 prose prose-invert max-w-none">
          <div className="text-foreground leading-relaxed space-y-4">
            {lesson.content.split('\n').map((para, i) => (
              <p key={i}>{para}</p>
            ))}
          </div>
        </CardContent>
        <CardFooter className="p-8 bg-muted/10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-sm text-muted-foreground">
            {progress?.isCompleted ? (
              <span className="flex items-center gap-2 text-secondary font-semibold">
                <CheckCircle2 size={18} /> Completed on {new Date(progress.completionDate).toLocaleDateString()}
              </span>
            ) : (
              "Ready to finish this module?"
            )}
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            {!progress?.isCompleted && (
              <Button 
                onClick={handleComplete} 
                disabled={isSaving || isProgressLoading}
                className="flex-1 md:flex-none bg-secondary text-white hover:bg-secondary/90 h-12 px-8"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Mark as Completed
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push("/lessons")} className="flex-1 md:flex-none h-12">
              Next Lesson
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
