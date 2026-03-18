
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, doc, getDoc, collectionGroup, where, limit } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Loader2, ArrowRight, ShieldAlert, BarChart3, Database, ClipboardList, Wallet, Smartphone } from "lucide-react"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { format } from "date-fns"

const SUPER_ADMIN_EMAIL = "ncubethubelihle483@gmail.com"

export default function AdminDashboardPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

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
      } else if (!isUserLoading) {
        router.push("/admin/login")
      }
    }
    verifyAdmin()
  }, [user, isUserLoading, router, db])

  const usersQuery = useMemoFirebase(() => {
    if (!db || isAdmin === null) return null
    return query(collection(db, "users"), orderBy("registrationDate", "desc"))
  }, [db, isAdmin])

  const { data: learners, isLoading: isUsersLoading } = useCollection(usersQuery)

  // Pending payments query using collectionGroup
  const pendingPaymentsQuery = useMemoFirebase(() => {
    if (!db || isAdmin === null) return null
    return query(
      collectionGroup(db, "purchases"),
      where("status", "==", "pending_verification"),
      orderBy("purchaseDate", "desc"),
      limit(5)
    )
  }, [db, isAdmin])

  const { data: pendingPayments, isLoading: isPaymentsLoading } = useCollection(pendingPaymentsQuery)

  const filteredUsers = learners?.filter(u => 
    u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(searchTerm.toLowerCase())
  ) || []

  if (isUserLoading || isAdmin === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    )
  }

  return (
    <div className="p-8 space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <ShieldAlert className="text-destructive" />
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">Monitoring learner progress and managing platform content.</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant="outline" className="px-4 py-1 border-destructive/30 text-destructive bg-destructive/5">
            {user?.email === SUPER_ADMIN_EMAIL ? "Super Admin Access" : "Admin Access Active"}
          </Badge>
          <Button variant="outline" onClick={() => router.push("/")} size="sm">
            Exit to Site
          </Button>
        </div>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/40 border-white/5 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users size={16} className="text-secondary" />
              Total Learners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{learners?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/40 border-white/5 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Wallet size={16} className="text-secondary" />
              Pending Payments
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">{pendingPayments?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Requires manual verification</p>
          </CardContent>
        </Card>

        <Card className="bg-primary/40 border-white/5 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Database size={16} className="text-secondary" />
              Manage Content
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="secondary" size="sm" className="w-full text-xs" asChild>
              <Link href="/admin/questions">
                Question Bank <ArrowRight size={12} className="ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-primary/40 border-white/5 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 size={16} className="text-secondary" />
              Platform Avg.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-white">74%</div>
            <p className="text-xs text-muted-foreground mt-1">Across all mock tests</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Pending Payments Section */}
        <Card className="lg:col-span-1 border-white/5 bg-card/40 backdrop-blur-sm overflow-hidden border-t-2 border-t-secondary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone size={18} className="text-secondary" />
              Pending Verifications
            </CardTitle>
            <CardDescription>Recent EcoCash submissions.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {isPaymentsLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="h-6 w-6 animate-spin text-secondary" />
              </div>
            ) : pendingPayments && pendingPayments.length > 0 ? (
              <div className="divide-y divide-white/5">
                {pendingPayments.map((payment) => (
                  <div key={payment.id} className="p-4 hover:bg-white/5 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <span className="text-xs font-bold font-mono text-secondary">{payment.transactionId}</span>
                      <span className="text-[10px] text-muted-foreground">{format(new Date(payment.purchaseDate), "MMM d, HH:mm")}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-white truncate max-w-[120px]">Resource: {payment.studyResourceId}</span>
                      <Button variant="ghost" size="sm" className="h-7 text-[10px]" asChild>
                        <Link href={`/admin/users/${payment.userId}`}>
                          Review <ArrowRight size={10} className="ml-1" />
                        </Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-8 text-center text-sm text-muted-foreground">
                No pending payments.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learner Directory Section */}
        <Card className="lg:col-span-2 border-white/5 bg-card/40 backdrop-blur-sm overflow-hidden">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle>Learner Directory</CardTitle>
              <CardDescription>View individual progress and test histories.</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input 
                placeholder="Search..." 
                className="w-full pl-10 h-10 bg-background/50 border border-white/10 rounded-md text-sm outline-none focus:ring-1 focus:ring-secondary/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-muted-foreground">Learner</TableHead>
                  <TableHead className="text-muted-foreground">Joined</TableHead>
                  <TableHead className="text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isUsersLoading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto text-secondary" />
                    </TableCell>
                  </TableRow>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((learner) => (
                    <TableRow key={learner.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-medium text-white">
                        <div className="flex flex-col">
                          <span>{learner.firstName} {learner.lastName}</span>
                          <span className="text-[10px] text-muted-foreground">{learner.email}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-xs">
                        {new Date(learner.registrationDate).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" className="hover:bg-secondary/10 hover:text-secondary h-8" asChild>
                          <Link href={`/admin/users/${learner.id}`}>
                            View <ArrowRight className="ml-2 h-4 w-4" />
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-12 text-muted-foreground">
                      No learners found.
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
