
"use client"

import { useParams, useRouter } from "next/navigation"
import { MOCK_LESSONS } from "@/app/lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, CheckCircle2, Loader2, BookOpen, UploadCloud, ShieldAlert, Pencil, Trash2 } from "lucide-react"
import { useUser, useFirestore, useDoc, useMemoFirebase, useStorage } from "@/firebase"
import { doc, setDoc, serverTimestamp, updateDoc, deleteDoc, getDoc } from "firebase/firestore"
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage"
import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { Progress } from "@/components/ui/progress"
import { TheoryAIExplanation } from "@/components/TheoryAIExplanation"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"

const SUPER_ADMIN_EMAIL = "ncubethubelihle483@gmail.com"

export default function LessonDetailPage() {
  const { lessonId } = useParams()
  const router = useRouter()
  const { user } = useUser()
  const db = useFirestore()
  const storage = useStorage()
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [isSaving, setIsSaving] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [uploadProgress, setUploadProgress] = useState<number | null>(null)

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

  const lessonRef = useMemoFirebase(() => {
    if (!db || !lessonId) return null
    return doc(db, "lessons", lessonId as string)
  }, [db, lessonId])

  const { data: dbLesson, isLoading: isLessonLoading } = useDoc(lessonRef)
  
  const mockLesson = MOCK_LESSONS.find(l => l.id === lessonId)
  const lesson = dbLesson || mockLesson

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
      toast({ title: "Module Mastered", description: "Progress synced to learner profile." })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Failed", description: error.message })
    } finally {
      setIsSaving(false)
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !storage || !db || !lessonId) return

    const storageRef = ref(storage, `lesson-diagrams/${lessonId}_${Date.now()}_${file.name}`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on('state_changed', 
      (snapshot) => {
        const p = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setUploadProgress(p)
      }, 
      (error) => {
        toast({ variant: "destructive", title: "Upload Failed", description: error.message })
        setUploadProgress(null)
      }, 
      async () => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        const lessonDocRef = doc(db, "lessons", lessonId as string)
        
        const updateData = {
          ...lesson,
          imageUrl: downloadURL,
          updatedAt: serverTimestamp()
        }

        await setDoc(lessonDocRef, updateData, { merge: true })
        
        setUploadProgress(null)
        toast({ title: "Visual Synced", description: "Curriculum diagram updated successfully." })
      }
    )
  }

  if (isLessonLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-secondary" />
      </div>
    )
  }

  if (!lesson) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-muted-foreground uppercase font-bold tracking-widest text-[10px]">Module Not Found</p>
        <Button onClick={() => router.push("/lessons")}>Back to Curriculum</Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20 px-4 sm:px-0">
      <Button variant="ghost" size="sm" onClick={() => router.push("/lessons")} className="gap-2 text-muted-foreground hover:text-white uppercase font-bold tracking-widest text-[10px]">
        <ChevronLeft className="h-3 w-3" /> Back to Curriculum
      </Button>

      <Card className="border-white/5 bg-card/40 backdrop-blur-xl overflow-hidden shadow-2xl relative">
        {isAdmin && (
          <div className="absolute top-4 right-4 z-20 flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="bg-secondary/10 border-secondary/20 text-secondary h-8 px-3 text-[9px] font-bold uppercase tracking-widest"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadProgress !== null}
            >
              {uploadProgress !== null ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <UploadCloud className="h-3 w-3 mr-1" />}
              {lesson.imageUrl ? "Replace Diagram" : "Upload Diagram"}
            </Button>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload} />
            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20 h-8 flex items-center gap-1 text-[8px] uppercase tracking-widest">
              <ShieldAlert size={10} /> Admin Overseer
            </Badge>
          </div>
        )}

        <CardHeader className="bg-primary/20 p-8 border-b border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <BookOpen className="text-secondary" size={18} />
            <span className="text-xs font-bold uppercase tracking-widest text-secondary italic">High-Performance Module</span>
          </div>
          <CardTitle className="text-3xl sm:text-4xl font-bold text-white italic uppercase tracking-tighter">{lesson.title}</CardTitle>
          <CardDescription className="text-lg text-muted-foreground/80">{lesson.description}</CardDescription>
        </CardHeader>

        {uploadProgress !== null && (
          <div className="px-8 py-4 space-y-2 bg-secondary/5">
            <div className="flex justify-between text-[10px] font-bold uppercase text-secondary">
              <span>Syncing Diagram...</span>
              <span>{Math.round(uploadProgress)}%</span>
            </div>
            <Progress value={uploadProgress} className="h-1 bg-white/5" />
          </div>
        )}

        {lesson.imageUrl && (
          <div className="relative aspect-video w-full overflow-hidden border-b border-white/5 bg-black/20">
            <Image 
              src={lesson.imageUrl} 
              alt={lesson.title} 
              fill 
              className="object-contain p-4"
            />
          </div>
        )}

        <CardContent className="p-8 prose prose-invert max-w-none">
          <div className="text-foreground/90 leading-relaxed space-y-6 text-base sm:text-lg">
            {lesson.content.split('\n').map((para, i) => (
              <p key={i} className="text-balance">{para}</p>
            ))}
          </div>

          <TheoryAIExplanation 
            topicTitle={lesson.title}
            topicDescription={lesson.description}
          />
        </CardContent>

        <CardFooter className="p-8 bg-muted/10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            {progress?.isCompleted ? (
              <span className="flex items-center gap-2 text-secondary">
                <CheckCircle2 size={18} /> Mastery Locked: {new Date(progress.completionDate).toLocaleDateString()}
              </span>
            ) : (
              "Complete curriculum to proceed to mock tests."
            )}
          </div>
          <div className="flex gap-4 w-full md:w-auto">
            {!progress?.isCompleted && (
              <Button 
                onClick={handleComplete} 
                disabled={isSaving || isProgressLoading}
                className="flex-1 md:flex-none bg-secondary text-white hover:bg-secondary/90 h-14 px-8 font-bold uppercase tracking-widest shadow-xl shadow-secondary/20"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
                Designate as Completed
              </Button>
            )}
            <Button variant="outline" onClick={() => router.push("/lessons")} className="flex-1 md:flex-none h-14 border-white/10 hover:bg-white/5 font-bold uppercase tracking-widest text-[10px]">
              Next Module
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
