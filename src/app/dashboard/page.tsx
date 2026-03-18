
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, ClipboardCheck, Timer, Trophy, Loader2 } from "lucide-react"
import Link from "next/link"
import { MOCK_LESSONS } from "../lib/data"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"

export default function DashboardPage() {
  const { user } = useUser()
  const db = useFirestore()

  const overallProgress = Math.round(MOCK_LESSONS.reduce((acc, curr) => acc + curr.progress, 0) / MOCK_LESSONS.length);

  const testsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, "users", user.uid, "testAttempts"),
      orderBy("createdAt", "desc"),
      limit(10)
    )
  }, [db, user])

  const { data: tests, isLoading: isTestsLoading } = useCollection(testsQuery)

  const avgMockScore = tests?.length 
    ? Math.round(tests.reduce((acc, curr) => acc + curr.scorePercentage, 0) / tests.length) 
    : 0

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <section className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">My Learning Journey</h1>
        <p className="text-sm sm:text-base text-muted-foreground">You're making great progress! Continue where you left off.</p>
      </section>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary text-primary-foreground border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium uppercase tracking-wider">Overall Completion</CardTitle>
            <Trophy className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight">{overallProgress}%</div>
            <Progress value={overallProgress} className="mt-4 h-2 bg-white/20" />
          </CardContent>
        </Card>
        <Card className="shadow-md border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium uppercase tracking-wider">Lessons Done</CardTitle>
            <BookOpen className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight">12 / 24</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Study goal: 100%</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium uppercase tracking-wider">Avg. Mock Score</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight">
              {isTestsLoading ? <Loader2 className="h-5 w-5 animate-spin inline" /> : `${avgMockScore}%`}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">
              {avgMockScore >= 92 ? "Meeting pass standard" : "Aim for 92%+"}
            </p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium uppercase tracking-wider">Mock Attempts</CardTitle>
            <Timer className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight">{tests?.length || 0}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1">Tests completed</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-md bg-card/40 backdrop-blur-sm border-white/5">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Continue Learning</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Pick up exactly where you left off in your modules.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_LESSONS.slice(1, 4).map((lesson) => (
              <div key={lesson.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border border-white/5 bg-accent/10 group hover:border-secondary/30 transition-all gap-4">
                <div className="space-y-1">
                  <p className="font-semibold text-white text-sm sm:text-base">{lesson.title}</p>
                  <p className="text-xs text-muted-foreground line-clamp-1">{lesson.description}</p>
                  <Progress value={lesson.progress} className="h-1.5 w-full sm:w-32 mt-2" />
                </div>
                <Button variant="ghost" size="sm" className="w-full sm:w-auto self-end sm:self-center bg-secondary/10 text-secondary hover:bg-secondary hover:text-white" asChild>
                  <Link href={`/lessons/${lesson.id}`} className="flex items-center gap-2">
                    Resume <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                  </Link>
                </Button>
              </div>
            ))}
            <Button className="w-full bg-secondary hover:bg-secondary/90 text-white h-11" asChild>
              <Link href="/lessons">View All Modules</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-md bg-card/40 backdrop-blur-sm border-white/5">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Quick Practice</CardTitle>
            <CardDescription className="text-xs sm:text-sm">Test your knowledge with random questions.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="aspect-video bg-muted/30 rounded-xl relative overflow-hidden flex items-center justify-center p-6 text-center border-dashed border-2 border-white/5">
              <div className="space-y-2">
                <p className="text-sm font-semibold text-secondary uppercase tracking-widest">Ready for a challenge?</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground">Taking regular mock tests is the best way to ensure a first-time pass.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-3">
              <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 h-11" asChild>
                <Link href="/practice">Start Practice Bank</Link>
              </Button>
              <Button variant="default" className="w-full bg-primary h-11" asChild>
                <Link href="/mock-test">Take Mock Test</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
