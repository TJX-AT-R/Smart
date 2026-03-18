
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, CheckCircle2, ChevronRight, Eye, Navigation, AlertTriangle, ArrowRightLeft } from "lucide-react"
import Link from "next/link"
import { MOCK_LESSONS } from "../lib/data"

const iconMap: Record<string, any> = {
  Eye: Eye,
  Navigation: Navigation,
  AlertTriangle: AlertTriangle,
  ArrowRightLeft: ArrowRightLeft
}

export default function LessonsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section>
        <h1 className="text-3xl font-bold text-primary mb-2">Theory Modules</h1>
        <p className="text-muted-foreground">Structured lessons covering everything you need to know for the official test.</p>
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        {MOCK_LESSONS.map((lesson) => {
          const IconComp = iconMap[lesson.icon] || BookOpen
          return (
            <Card key={lesson.id} className="group hover:shadow-lg transition-all border-border/50">
              <CardHeader className="flex flex-row items-start gap-4 space-y-0">
                <div className="p-3 rounded-xl bg-secondary/10 text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                  <IconComp size={24} />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl">{lesson.title}</CardTitle>
                    {lesson.progress === 100 && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-none">
                        Completed
                      </Badge>
                    )}
                  </div>
                  <CardDescription>{lesson.description}</CardDescription>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-medium mb-1">
                    <span>Progress</span>
                    <span>{lesson.progress}%</span>
                  </div>
                  <Progress value={lesson.progress} className="h-2" />
                </div>
              </CardContent>
              <CardFooter>
                <Button variant={lesson.progress === 100 ? "outline" : "default"} className="w-full bg-primary" asChild>
                  <Link href={`/lessons/${lesson.id}`} className="flex items-center justify-center gap-2">
                    {lesson.progress === 0 ? "Start Lesson" : lesson.progress === 100 ? "Review Lesson" : "Continue Lesson"}
                    <ChevronRight size={16} />
                  </Link>
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
