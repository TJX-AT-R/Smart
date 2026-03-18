
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase"
import { collection, query, orderBy, doc, getDoc, limit, updateDoc, serverTimestamp } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, Loader2, BookOpen, User as UserIcon, CheckCircle2, Crown, ShieldCheck } from "lucide-react"
import { format } from "date-fns"
import { MOCK_LESSONS } from "@/app/lib/data"
import { useToast } from "@/hooks/use-toast"

// Obfuscated Admin Email: ncubethubelihle483@gmail.com
const ENC_A = "bmN1YmV0aHViZWxpaGxlNDgzQGdtYWlsLmNvbQ==";
const getAdminEmail = () => typeof window !== 'undefined' ? window.atob(ENC_A) : "";

export default function AdminUserProgressPage() {
  const params = useParams()
  const userId = params.userId as string
  const { user, isUserLoading: isAuthLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const passThreshold = 92

  useEffect(() => {
    async function verifyAdmin() {
      if (user) {
        const adminEmail = getAdminEmail();
        if (user.email === adminEmail) {
          setIsAdmin(true)
          return
        }
        
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists() && userDoc.data().isAdmin) {
          setIsAdmin(true)
        } else {
          router.push("/admin/login")
        }
      } else if (!isAuthLoading) {
        router.push("/admin/login")
      }
    }
    verifyAdmin()
  }, [user, isAuthLoading, router, db])

  const learnerRef = useMemoFirebase(() => {
    if (!db || !userId) return null
    return doc(db, "users", userId)
  }, [db, userId])
  const { data: learner, isLoading: isUserLoading } = useDoc(learnerRef)

  const testsQuery = useMemoFirebase(() => {
    if (!db || !userId || isAdmin === null) return null
    return query(
      collection(db, "users", userId, "testAttempts"),
      orderBy("createdAt", "desc"),
      limit(20)
    )
  }, [db, userId, isAdmin])

  const { data: tests, isLoading: isTestsLoading } = useCollection(testsQuery)

  const lessonsQuery = useMemoFirebase(() => {
    if (!db || !userId || isAdmin === null) return null
    return collection(db, "users", userId, "lessonProgress")
  }, [db, userId, isAdmin])

  const { data: lessonProgress, isLoading: isLessonsLoading } = useCollection(lessonsQuery)

  const togglePremiumAccess = async () => {
    if (!db || !userId) return
    setIsUpdatingStatus(true)
    try {
      const currentStatus = !!learner?.isPremium
      await updateDoc(doc(db, "users", userId), {
        isPremium: !currentStatus,
        updatedAt: serverTimestamp()
      })
      toast({
        title: !currentStatus ? "Premium Access Granted" : "Premium Access Revoked",
        description: `Learner status updated successfully.`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: error.message,
      })
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const stats = {
    totalTests: tests?.length || 0,
    avgScore: tests?.length 
      ? Math.round(tests.reduce((acc, curr) => acc + curr.scorePercentage, 0) / tests.length) 
      : 0,
    bestScore: tests?.length 
      ? Math.max(...tests.map(t => t.scorePercentage)) 
      : 0,
    lessonsCompleted: lessonProgress?.filter(p => p.isCompleted).length || 0
  }

  if (isAuthLoading || isAdmin === null || isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <Button variant="ghost" size="sm" onClick={() => router.push("/admin/dashboard")} className="gap-2 hover:bg-white/5">
        <ChevronLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <section className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 bg-primary/20 p-8 rounded-3xl border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-secondary/5 blur-3xl rounded-full -mr-10 -mt-10" />
        <div className="flex flex-col sm:flex-row gap-6 items-center sm:items-start relative z-10">
          <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center text-secondary border border-secondary/20 shadow-lg">
            <UserIcon size={40} />
          </div>
          <div className="text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white uppercase italic tracking-tighter">
                {learner?.firstName} {learner?.lastName}
              </h1>
              {learner?.isPremium && (
                <Badge className="bg-secondary text-white font-bold uppercase tracking-widest text-[10px] py-1 px-3 shadow-lg shadow-secondary/20">
                  <Crown size={12} className="mr-1.5" /> Premium
                </Badge>
              )}
            </div>
            <p className="text-muted-foreground font-mono text-xs">{learner?.email}</p>
          </div>
        </div>

        <Card className="bg-card/40 border-white/10 backdrop-blur-md lg:w-80 shadow-xl">
          <CardHeader className="pb-3">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
              <ShieldCheck size={14} className="text-secondary" /> Access Privileges
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between bg-background/40 p-3 rounded-xl border border-white/5">
              <div className="space-y-0.5">
                <Label htmlFor="premium-toggle" className="text-xs font-bold text-white uppercase italic">Premium Pass</Label>
                <p className="text-[9px] text-muted-foreground">Unlock all resources</p>
              </div>
              <Switch 
                id="premium-toggle" 
                checked={!!learner?.isPremium} 
                onCheckedChange={togglePremiumAccess}
                disabled={isUpdatingStatus}
              />
            </div>
          </CardContent>
        </Card>
      </section>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        <Card className="border-white/5 bg-card/40 backdrop-blur-sm overflow-hidden shadow-xl">
          <CardHeader className="bg-primary/20 border-b border-white/5">
            <CardTitle className="flex items-center gap-2 text-lg italic uppercase tracking-tighter">
              <BookOpen className="text-secondary" size={20} />
              Module Mastery
            </CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-widest font-bold">Progress across official syllabus.</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOCK_LESSONS.map((lesson) => {
                const progress = lessonProgress?.find(p => p.lessonId === lesson.id)
                return (
                  <div key={lesson.id} className="flex items-center justify-between p-4 rounded-2xl bg-background/20 border border-white/5 group hover:border-secondary/30 transition-all">
                    <span className="text-[10px] font-bold text-white uppercase italic truncate max-w-[140px]">{lesson.title}</span>
                    {progress?.isCompleted ? (
                      <CheckCircle2 className="h-5 w-5 text-secondary" />
                    ) : (
                      <Badge variant="outline" className="text-[8px] opacity-40 uppercase font-bold">Pending</Badge>
                    )}
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-card/40 backdrop-blur-sm overflow-hidden shadow-xl">
          <CardHeader className="bg-primary/20 border-b border-white/5">
            <CardTitle className="text-lg italic uppercase tracking-tighter">Simulation History</CardTitle>
            <CardDescription className="text-[10px] uppercase tracking-widest font-bold">Last 20 mock attempts.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">Date</TableHead>
                  <TableHead className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest">Score</TableHead>
                  <TableHead className="text-muted-foreground text-[10px] uppercase font-bold tracking-widest text-right">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isTestsLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-secondary" />
                    </TableCell>
                  </TableRow>
                ) : tests?.length ? (
                  tests.map((test) => (
                    <TableRow key={test.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="text-[10px] text-muted-foreground py-4 font-mono">
                        {format(new Date(test.endTime), "MMM d, HH:mm")}
                      </TableCell>
                      <TableCell className="font-bold text-white text-xs font-mono">{test.scorePercentage}%</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={test.scorePercentage >= passThreshold ? "secondary" : "destructive"} className="text-[9px] px-3 py-0.5 font-bold uppercase tracking-widest">
                          {test.scorePercentage >= passThreshold ? "PASS" : "FAIL"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-20 text-muted-foreground text-[10px] uppercase font-bold tracking-widest">
                      Zero Simulations Recorded
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
