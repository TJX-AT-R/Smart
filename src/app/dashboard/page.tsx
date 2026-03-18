
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { ArrowRight, BookOpen, ClipboardCheck, Timer, Trophy } from "lucide-react"
import Link from "next/link"
import { MOCK_LESSONS } from "../lib/data"

export default function DashboardPage() {
  const overallProgress = Math.round(MOCK_LESSONS.reduce((acc, curr) => acc + curr.progress, 0) / MOCK_LESSONS.length);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section>
        <h1 className="text-3xl font-bold text-primary mb-2">My Learning Journey</h1>
        <p className="text-muted-foreground">You're making great progress! Continue where you left off.</p>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary text-primary-foreground border-none shadow-lg">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Overall Completion</CardTitle>
            <Trophy className="h-4 w-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{overallProgress}%</div>
            <Progress value={overallProgress} className="mt-4 h-2 bg-white/20" />
          </CardContent>
        </Card>
        <Card className="shadow-md border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Lessons Done</CardTitle>
            <BookOpen className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12 / 24</div>
            <p className="text-xs text-muted-foreground mt-1">+2 this week</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Avg. Mock Score</CardTitle>
            <ClipboardCheck className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">84%</div>
            <p className="text-xs text-muted-foreground mt-1">Passing standard is 86%</p>
          </CardContent>
        </Card>
        <Card className="shadow-md border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-medium">Study Time</CardTitle>
            <Timer className="h-4 w-4 text-secondary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14.5 hrs</div>
            <p className="text-xs text-muted-foreground mt-1">Goal: 20 hrs total</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 shadow-md">
          <CardHeader>
            <CardTitle>Continue Learning</CardTitle>
            <CardDescription>Pick up exactly where you left off in your modules.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {MOCK_LESSONS.slice(1, 4).map((lesson) => (
              <div key={lesson.id} className="flex items-center justify-between p-4 rounded-lg border bg-accent/20 group hover:border-primary transition-all">
                <div className="space-y-1">
                  <p className="font-semibold text-primary">{lesson.title}</p>
                  <p className="text-sm text-muted-foreground">{lesson.description}</p>
                  <Progress value={lesson.progress} className="h-1.5 w-32 mt-2" />
                </div>
                <Button variant="ghost" size="icon" className="group-hover:translate-x-1 transition-transform">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button className="w-full bg-secondary hover:bg-secondary/90 text-white" asChild>
              <Link href="/lessons">View All Modules</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-md">
          <CardHeader>
            <CardTitle>Quick Practice</CardTitle>
            <CardDescription>Test your knowledge with random questions.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="aspect-video bg-muted rounded-lg relative overflow-hidden flex items-center justify-center p-6 text-center border-dashed border-2">
              <div className="space-y-2">
                <p className="text-sm font-medium">Daily Challenge</p>
                <p className="text-xs text-muted-foreground">Answer 10 questions to maintain your streak!</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/practice">Start Practice Bank</Link>
            </Button>
            <Button variant="default" className="w-full bg-primary" asChild>
              <Link href="/mock-test">Take Mock Test</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
