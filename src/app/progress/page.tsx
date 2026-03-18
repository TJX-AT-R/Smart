"use client"

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Trophy, Clock, Target, Calendar, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts"

export default function ProgressPage() {
  const { user } = useUser()
  const db = useFirestore()
  const passThreshold = 92

  const testsQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return query(
      collection(db, "users", user.uid, "testAttempts"),
      orderBy("createdAt", "desc"),
      limit(20)
    )
  }, [db, user])

  const { data: tests, isLoading } = useCollection(testsQuery)

  const stats = {
    totalTests: tests?.length || 0,
    avgScore: tests?.length 
      ? Math.round(tests.reduce((acc, curr) => acc + curr.scorePercentage, 0) / tests.length) 
      : 0,
    bestScore: tests?.length 
      ? Math.max(...tests.map(t => t.scorePercentage)) 
      : 0,
    passRate: tests?.length
      ? Math.round((tests.filter(t => t.scorePercentage >= passThreshold).length / tests.length) * 100)
      : 0
  }

  const chartData = tests?.slice().reverse().map((t, i) => ({
    name: i + 1,
    score: t.scorePercentage
  })) || []

  if (isLoading) {
    return (
      <div className="flex h-[70vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <section>
        <h1 className="text-3xl font-bold text-primary mb-2">My Progress</h1>
        <p className="text-muted-foreground">Detailed breakdown of your mock test performance and learning history.</p>
      </section>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary text-primary-foreground border-none shadow-lg">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Target size={16} className="text-secondary" />
              Avg. Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.avgScore}%</div>
            <p className="text-xs opacity-70 mt-1">Passing mark is {passThreshold}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy size={16} className="text-secondary" />
              Best Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.bestScore}%</div>
            <p className="text-xs text-muted-foreground mt-1">Keep pushing for 100%!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock size={16} className="text-secondary" />
              Tests Taken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalTests}</div>
            <p className="text-xs text-muted-foreground mt-1">Attempts in total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar size={16} className="text-secondary" />
              Pass Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.passRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">Tests scored {passThreshold}%+</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Performance Trend</CardTitle>
            <CardDescription>Visualizing your scores across the last 20 attempts.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full mt-4">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff10" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false}
                    label={{ value: 'Test Sequence', position: 'insideBottom', offset: -5, fontSize: 10 }}
                  />
                  <YAxis 
                    stroke="#888888" 
                    fontSize={12} 
                    tickLine={false} 
                    axisLine={false} 
                    domain={[0, 100]}
                    tickFormatter={(value) => `${value}%`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="score" 
                    stroke="hsl(var(--secondary))" 
                    strokeWidth={3} 
                    dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, strokeWidth: 0 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Recent History</CardTitle>
            <CardDescription>Your most recent mock test results.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Score</TableHead>
                  <TableHead>Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tests?.map((test) => (
                  <TableRow key={test.id}>
                    <TableCell className="text-xs">
                      {format(new Date(test.endTime), "MMM d, HH:mm")}
                    </TableCell>
                    <TableCell className="font-bold">
                      {test.scorePercentage}%
                    </TableCell>
                    <TableCell>
                      <Badge variant={test.scorePercentage >= passThreshold ? "secondary" : "destructive"}>
                        {test.scorePercentage >= passThreshold ? "PASS" : "FAIL"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {!tests?.length && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                      No mock tests taken yet.
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
