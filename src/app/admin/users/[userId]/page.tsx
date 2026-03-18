
"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase"
import { collection, query, orderBy, doc, getDoc, limit, setDoc, updateDoc, serverTimestamp } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChevronLeft, Loader2, Target, Trophy, Clock, ShieldCheck, Lock, Unlock, BookOpen, User as UserIcon, CheckCircle2, AlertCircle, Smartphone } from "lucide-react"
import { format } from "date-fns"
import { MOCK_RESOURCES, MOCK_LESSONS } from "@/app/lib/data"
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
  const [isVerifying, setIsVerifying] = useState<string | null>(null)
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

  const purchasesQuery = useMemoFirebase(() => {
    if (!db || !userId || isAdmin === null) return null
    return collection(db, "users", userId, "purchases")
  }, [db, userId, isAdmin])

  const { data: userPurchases, isLoading: isPurchasesLoading } = useCollection(purchasesQuery)

  const getPurchaseStatus = (resourceId: string) => {
    const purchase = userPurchases?.find(p => p.studyResourceId === resourceId)
    if (!purchase) return null
    return purchase
  }

  const handleVerifyPayment = async (purchaseId: string, resourceTitle: string) => {
    if (!db || !userId) return
    
    setIsVerifying(purchaseId)
    try {
      const purchaseRef = doc(db, "users", userId, "purchases", purchaseId)
      await updateDoc(purchaseRef, {
        status: 'verified',
        verifiedBy: user?.email,
        verifiedAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      toast({
        title: "Payment Verified",
        description: `Access to ${resourceTitle} has been granted instantly.`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Verification failed",
        description: error.message,
      })
    } finally {
      setIsVerifying(null)
    }
  }

  const handleGrantAccessManually = async (resourceId: string, title: string) => {
    if (!db || !userId) return
    
    setIsVerifying(resourceId)
    try {
      const purchaseRef = doc(collection(db, "users", userId, "purchases"))
      await setDoc(purchaseRef, {
        id: purchaseRef.id,
        userId: userId,
        studyResourceId: resourceId,
        purchaseDate: new Date().toISOString(),
        amountPaidDollars: 0,
        transactionId: `ADMIN-GRANT-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
        status: 'verified',
        grantedBy: user?.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      toast({
        title: "Access Granted",
        description: `Successfully granted manual access to ${title}.`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Failed to grant access",
        description: error.message,
      })
    } finally {
      setIsVerifying(null)
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
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <Button variant="ghost" size="sm" onClick={() => router.push("/admin/dashboard")} className="gap-2">
        <ChevronLeft className="h-4 w-4" /> Back to Dashboard
      </Button>

      <section className="flex flex-col md:flex-row md:items-end justify-between gap-6 bg-primary/20 p-6 rounded-2xl border border-white/5">
        <div className="flex gap-6 items-center">
          <div className="w-16 h-16 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary">
            <UserIcon size={32} />
          </div>
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white">{learner?.firstName} {learner?.lastName}</h1>
              <Badge variant="outline" className="border-secondary/30 text-secondary text-[10px]">Active Learner</Badge>
            </div>
            <p className="text-sm text-muted-foreground">{learner?.email}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge className="bg-secondary text-white font-mono">{stats.avgScore}% Avg</Badge>
          <Badge variant="outline" className="border-white/10 text-white font-mono">{stats.totalTests} Tests</Badge>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="space-y-8">
          <Card className="border-white/5 bg-card/40 backdrop-blur-sm overflow-hidden">
            <CardHeader className="border-b border-white/5 bg-secondary/5">
              <CardTitle className="flex items-center gap-2 text-lg">
                <ShieldCheck className="text-secondary" size={20} />
                Access Verification
              </CardTitle>
              <CardDescription>Confirm EcoCash payments to unlock booklets.</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-muted-foreground text-xs">Resource</TableHead>
                    <TableHead className="text-muted-foreground text-xs">EcoCash Ref</TableHead>
                    <TableHead className="text-muted-foreground text-xs text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {MOCK_RESOURCES.map((res) => {
                    const purchase = getPurchaseStatus(res.id)
                    const loading = isVerifying === (purchase?.id || res.id)
                    
                    return (
                      <TableRow key={res.id} className="border-white/5 hover:bg-white/5">
                        <TableCell className="font-medium text-white text-xs py-4">{res.title}</TableCell>
                        <TableCell>
                          {purchase ? (
                            <div className="flex flex-col gap-1">
                              <span className="text-xs font-mono font-bold text-secondary">{purchase.transactionId}</span>
                              <Badge 
                                variant={purchase.status === 'verified' ? "secondary" : "outline"} 
                                className={`text-[9px] w-fit ${purchase.status === 'verified' ? "" : "border-yellow-500/50 text-yellow-500"}`}
                              >
                                {purchase.status === 'verified' ? 'Verified' : 'Pending'}
                              </Badge>
                            </div>
                          ) : (
                            <span className="text-[10px] text-muted-foreground italic">No submission</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          {purchase?.status === 'pending_verification' ? (
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="h-8 text-[10px] bg-secondary text-white hover:bg-secondary/90"
                              disabled={loading}
                              onClick={() => handleVerifyPayment(purchase.id, res.title)}
                            >
                              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Approve Access"}
                            </Button>
                          ) : !purchase ? (
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              className="h-8 text-[10px] text-muted-foreground hover:text-white"
                              disabled={loading}
                              onClick={() => handleGrantAccessManually(res.id, res.title)}
                            >
                              {loading ? <Loader2 className="h-3 w-3 animate-spin" /> : "Manual Grant"}
                            </Button>
                          ) : (
                            <div className="flex items-center justify-end gap-1 text-secondary">
                              <CheckCircle2 className="h-4 w-4" />
                              <span className="text-[10px] font-bold">GRANTED</span>
                            </div>
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
              <CardTitle className="flex items-center gap-2 text-lg">
                <BookOpen className="text-secondary" size={20} />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {MOCK_LESSONS.map((lesson) => {
                  const progress = lessonProgress?.find(p => p.lessonId === lesson.id)
                  return (
                    <div key={lesson.id} className="flex items-center justify-between p-3 rounded-xl bg-background/20 border border-white/5">
                      <span className="text-xs text-white truncate max-w-[120px]">{lesson.title}</span>
                      {progress?.isCompleted ? (
                        <CheckCircle2 className="h-4 w-4 text-secondary" />
                      ) : (
                        <Badge variant="outline" className="text-[8px] opacity-40">Incomplete</Badge>
                      )}
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-white/5 bg-card/40 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-lg">Recent Performance</CardTitle>
            <CardDescription>Mock test attempt history.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-muted-foreground text-xs">Date</TableHead>
                  <TableHead className="text-muted-foreground text-xs">Score</TableHead>
                  <TableHead className="text-muted-foreground text-xs text-right">Result</TableHead>
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
                    <TableRow key={test.id} className="border-white/5">
                      <TableCell className="text-[10px] text-muted-foreground py-4">
                        {format(new Date(test.endTime), "MMM d, HH:mm")}
                      </TableCell>
                      <TableCell className="font-bold text-white text-xs">{test.scorePercentage}%</TableCell>
                      <TableCell className="text-right">
                        <Badge variant={test.scorePercentage >= passThreshold ? "secondary" : "destructive"} className="text-[10px] px-2 py-0 h-5">
                          {test.scorePercentage >= passThreshold ? "PASS" : "FAIL"}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12 text-muted-foreground text-xs">
                      No mock tests recorded.
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
