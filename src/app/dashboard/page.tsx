"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ArrowRight, Pencil, ClipboardCheck, Timer, Trophy, Loader2, Download } from "lucide-react"
import Link from "next/link"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"

export default function DashboardPage() {
  const { user } = useUser()
  const db = useFirestore()

  // Real-time queries for learner statistics
  const testsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, "users", user.uid, "testAttempts"),
      orderBy("createdAt", "desc"),
      limit(20)
    )
  }, [db, user])

  const { data: tests, isLoading: isTestsLoading } = useCollection(testsQuery)

  // Real-time calculations
  const avgMockScore = tests?.length 
    ? Math.round(tests.reduce((acc, curr) => acc + curr.scorePercentage, 0) / tests.length) 
    : 0

  const bestScore = tests?.length 
    ? Math.max(...tests.map(t => t.scorePercentage)) 
    : 0

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-500">
      <section className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2 italic uppercase tracking-tighter">My Performance Hub</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Monitor your trajectory and eliminate weak points before the test.</p>
      </section>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary text-primary-foreground border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-bold uppercase tracking-widest">Avg. Mock Score</CardTitle>
            <Trophy className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight">
              {isTestsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : `${avgMockScore}%`}
            </div>
            <p className="text-[10px] sm:text-xs text-primary-foreground/70 mt-1 uppercase tracking-widest font-bold">
              {avgMockScore >= 92 ? "MEETING PASS STANDARD" : "AIM FOR 92%+"}
            </p>
          </CardContent>
        </Card>
        
        <Card className="shadow-md border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-bold uppercase tracking-widest">Best Attempt</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight">
              {isTestsLoading ? <Loader2 className="h-5 w-5 animate-spin inline" /> : `${bestScore}%`}
            </div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold">Record high</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-bold uppercase tracking-widest">Simulations Done</CardTitle>
            <Timer className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold tracking-tight">{tests?.length || 0}</div>
            <p className="text-[10px] sm:text-xs text-muted-foreground mt-1 uppercase tracking-widest font-bold">Total attempts</p>
          </CardContent>
        </Card>

        <Card className="shadow-md border-border bg-card/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-bold uppercase tracking-widest">Resources</CardTitle>
            <Download className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <Button variant="link" className="p-0 h-auto text-secondary font-bold uppercase tracking-widest text-[10px]" asChild>
              <Link href="/resources">Library Access <ArrowRight size={10} className="ml-1" /></Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
        <Card className="shadow-md bg-card/40 backdrop-blur-sm border-white/5">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl italic uppercase tracking-tighter">Mock Simulation</CardTitle>
            <CardDescription className="text-xs sm:text-sm uppercase tracking-widest font-bold text-muted-foreground">Run a full 8-minute high-pressure test.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="aspect-video bg-muted/30 rounded-xl relative overflow-hidden flex items-center justify-center p-6 text-center border-dashed border-2 border-white/5 shadow-inner">
              <div className="space-y-2">
                <p className="text-sm font-bold text-secondary uppercase tracking-widest">Ready for combat?</p>
                <p className="text-[10px] sm:text-xs text-muted-foreground italic">Official rules. 25 questions. 8 minutes.</p>
              </div>
            </div>
            <Button variant="default" className="w-full bg-primary h-12 font-bold uppercase tracking-widest text-xs" asChild>
              <Link href="/mock-test">Initiate Exam Now</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-md bg-card/40 backdrop-blur-sm border-white/5">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl italic uppercase tracking-tighter">Targeted Practice</CardTitle>
            <CardDescription className="text-xs sm:text-sm uppercase tracking-widest font-bold text-muted-foreground">Focus on specific categories to build mastery.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              {['Road Signs', 'Safety', 'Motorway', 'Rules'].map((cat) => (
                <div key={cat} className="p-4 rounded-xl bg-background/20 border border-white/5 flex flex-col justify-between hover:border-secondary/30 transition-all cursor-default">
                  <span className="text-[10px] font-bold text-white uppercase italic">{cat}</span>
                  <Pencil size={14} className="text-secondary mt-2" />
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full border-white/10 hover:bg-white/5 h-12 font-bold uppercase tracking-widest text-xs" asChild>
              <Link href="/practice">Open Practice Bank</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
