
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "react-router-dom"
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase"
import { collection, query, orderBy, doc, getDoc, limit, setDoc, serverTimestamp } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, Loader2, Target, Trophy, Clock, Calendar, ShieldCheck, Lock, Unlock } from "lucide-react"
import { format } from "date-fns"
import { MOCK_RESOURCES } from "@/app/lib/data"
import { useToast } from "@/hooks/use-toast"

const SUPER_ADMIN_EMAIL = "ncubethubelihle483@gmail.com"

export default function AdminUserProgressPage() {
  const { userId } = useParams()
  const { user, isUserLoading: isAuthLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isGranting, setIsGranting] = useState<string | null>(null)

  useEffect(() => {
    async function verifyAdmin() {
      if (user) {
        if (user.email === SUPER_ADMIN_EMAIL) {
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

  const memoizedUserRef = useMemoFirebase(() => {
    if (!db || !userId) return null
    return doc(db, "users", userId as string)
  }, [db, userId])
  const { data: learner, isLoading: isUserLoading } = useDoc(learnerRef)

  const testsQuery = useMemoFirebase(() => {
    if (!db || !userId || isAdmin === null) return null
    return query(
      collection(db, "users", userId as string, "testAttempts"),
      orderBy("createdAt", "desc"),
      limit(20)
    )
  }, [db, userId, isAdmin])

  const { data: tests, isLoading: isTestsLoading } = useCollection(testsQuery)

  const purchasesQuery = useMemoFirebase(() => {
    if (!db || !userId || isAdmin === null) return null
    return collection(db, "users", userId as string, "purchases")
  }, [db, userId, isAdmin])

  const { data: userPurchases, isLoading: isPurchasesLoading } = useCollection(purchasesQuery)

  const hasAccess = (resourceId: string) => {
    return userPurchases?.some(p => p.studyResourceId === resourceId)
  }

  const handleGrantAccess = async (resourceId: string, title: string) => {
    if (!db || !userId) return
    
    setIsGranting(resourceId)
    try {
      const purchaseRef = doc(collection(db, "users", userId as string, "purchases"))
      await setDoc(purchaseRef, {
        id: purchaseRef.id,
        userId: userId,
        studyResourceId: resourceId,
        purchaseDate: new Date().toISOString(),
        amountPaidDollars: 0,
        transactionId: `ADMIN-GRANT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        grantedBy: user?.email,
        createdAt: serverTimestamp()
      })

      toast({
        title: "Access Granted",
        description: `Successfully granted ${learner?.firstName} access to ${title}.`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to grant access",
        description: error.message,
      })
    } finally {
      setIsGranting(null)
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
    passRate: tests?.length
      ? Math.round((tests.filter(t => t.scorePercentage >= 86).length / tests.length) * 100)
      : 0
  }

  if (isAuthLoading || isAdmin === null || isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <Button variant="ghost" size="sm" onClick={() => router.push("/admin/dashboard")} className="gap-2">
        <ChevronLeft className="h-4 w-4" /> Back to Directory
      </Button>

      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-4 mb-2">
            <h1 className="text-3xl font-bold text-white">{learner?.firstName} {learner?.lastName}</h1>
            <Badge variant="outline" className="border-secondary/30 text-secondary">Learner Profile</Badge>
            {learner?.email === SUPER_ADMIN_EMAIL && <Badge variant="destructive">Super Admin</Badge>}
          </div>
          <p className="text-muted-foreground">{learner?.email}</p>
        </div>
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
          </CardContent>
        </Card>
        <Card className="bg-primary/40 border-white/5 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Trophy size={16} className="text-secondary" />
              Best Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.bestScore}%</div>
          </CardContent>
        </Card>
        <Card className="bg-primary/40 border-white/5 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Clock size={16} className="text-secondary" />
              Tests Taken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.totalTests}</div>
          </CardContent>
        </Card>
        <Card className="bg-primary/40 border-white/5 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar size={16} className="text-secondary" />
              Pass Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats.passRate}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="border-white/5 bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="text-secondary" size={20} />
              Resource Access Management
            </CardTitle>
            <CardDescription>Grant manual access to downloadable booklets.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Resource Title</TableHead>
                  <TableHead className="text-muted-foreground">Status</TableHead>
                  <TableHead className="text-muted-foreground text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {MOCK_RESOURCES.map((res) => {
                  const access = hasAccess(res.id)
                  const loading = isGranting === res.id
                  return (
                    <TableRow key={res.id} className="border-white/5">
                      <TableCell className="font-medium text-white">{res.title}</TableCell>
                      <TableCell>
                        {access ? (
                          <Badge className="bg-secondary/20 text-secondary border-secondary/30">
                            <Unlock className="mr-1 h-3 w-3" /> Granted
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-muted-foreground border-white/10">
                            <Lock className="mr-1 h-3 w-3" /> No Access
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {!access && (
                          <Button 
                            size="sm" 
                            variant="secondary" 
                            className="h-8 text-xs"
                            disabled={loading || isPurchasesLoading}
                            onClick={() => handleGrantAccess(res.id, res.title)}
                          >
                            {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Grant Access"}
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle>Attempt History</CardTitle>
            <CardDescription>Visualizing performance for this learner.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Date</TableHead>
                  <TableHead className="text-muted-foreground">Type</TableHead>
                  <TableHead className="text-muted-foreground">Score</TableHead>
                  <TableHead className="text-muted-foreground">Result</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isTestsLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-secondary" />
                    </TableCell>
                  </TableRow>
                ) : tests?.length ? (
                  tests.map((test) => (
                    <TableRow key={test.id} className="border-white/5 hover:bg-white/5">
                      <TableCell className="text-xs text-muted-foreground">
                        {format(new Date(test.endTime), "MMM d, yyyy HH:mm")}
                      </TableCell>
                      <TableCell className="capitalize text-white">{test.type.replace("-", " ")}</TableCell>
                      <TableCell className="font-bold text-white">{test.scorePercentage}%</TableCell>
                      <TableCell>
                        <Badge variant={test.scorePercentage >= 86 ? "secondary" : "destructive"} className="px-3">
                          {test.scorePercentage >= 86 ? "PASS" : "FAIL"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                      This learner has not attempted any mock tests yet.
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
