
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, doc, getDoc, limit } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Loader2, ArrowRight, ShieldAlert, BarChart3, Database, Wallet, Smartphone, History, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

const ENC_A = "bmN1YmV0aHViZWxpaGxlNDgzQGdtYWlsLmNvbQ==";
const getAdminEmail = () => typeof window !== 'undefined' ? window.atob(ENC_A) : "";
const ADMIN_ECOCASH_NUMBER = "0789269145";

export default function AdminDashboardPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [searchTerm, setSearchTerm] = useState("")

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

  const transactionsQuery = useMemoFirebase(() => {
    if (!db || isAdmin === null) return null
    return query(collection(db, "purchases"), orderBy("createdAt", "desc"), limit(10))
  }, [db, isAdmin])

  const { data: transactions, isLoading: isTxLoading } = useCollection(transactionsQuery)

  const totalRevenue = transactions?.reduce((acc, curr) => acc + (curr.amountPaidDollars || 0), 0) || 0

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
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="text-center sm:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center justify-center sm:justify-start gap-3 italic uppercase tracking-tighter">
            <ShieldAlert className="text-destructive size-6 sm:size-8" />
            SmartPass Command
          </h1>
          <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mt-1">Administrator Oversight Portal</p>
        </div>
        <div className="flex flex-wrap items-center justify-center sm:justify-end gap-3 sm:gap-4">
          <div className="hidden lg:flex items-center gap-2 bg-secondary/5 px-4 py-1.5 rounded-full border border-secondary/20">
            <ShieldCheck size={14} className="text-secondary" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Payout Active:</span>
            <span className="text-[11px] font-mono font-bold text-secondary">{ADMIN_ECOCASH_NUMBER}</span>
          </div>
          <Badge variant="outline" className="px-3 sm:px-4 py-1 border-destructive/30 text-destructive bg-destructive/5 font-mono text-[9px] sm:text-[10px]">
            {user?.email === getAdminEmail() ? "ROOT ACCESS ACTIVE" : "ADMIN ROLE ACTIVE"}
          </Badge>
          <Button variant="outline" onClick={() => router.push("/")} size="sm" className="border-white/10 hover:bg-white/5 text-[10px] h-8 sm:h-9">
            Exit to Site
          </Button>
        </div>
      </header>

      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-primary/40 border-white/5 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
              <Users size={12} className="text-secondary" />
              Total Learners
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tighter">{learners?.length || 0}</div>
          </CardContent>
        </Card>
        
        <Card className="bg-primary/40 border-white/5 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
              <Wallet size={12} className="text-secondary" />
              Revenue (Log)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-secondary tracking-tighter">${totalRevenue}.00</div>
          </CardContent>
        </Card>

        <Card className="bg-primary/40 border-white/5 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
              <Database size={12} className="text-secondary" />
              Content Management
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button variant="secondary" size="sm" className="w-full text-[10px] h-7 bg-secondary/10 text-secondary hover:bg-secondary/20 font-bold uppercase tracking-widest" asChild>
              <Link href="/admin/questions">
                Manage Questions <ArrowRight size={10} className="ml-1" />
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-primary/40 border-white/5 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
              <BarChart3 size={12} className="text-secondary" />
              Platform Avg.
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-white tracking-tighter">74%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        <Card className="border-white/5 bg-card/40 backdrop-blur-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base sm:text-lg italic uppercase tracking-tighter">EcoCash Activity</CardTitle>
              <CardDescription className="text-[10px]">Funds directed to {ADMIN_ECOCASH_NUMBER}.</CardDescription>
            </div>
            <History size={16} className="text-muted-foreground" />
          </CardHeader>
          <CardContent className="px-0 sm:px-6">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground">Transaction / Sender</TableHead>
                    <TableHead className="text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground">Amount</TableHead>
                    <TableHead className="text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground text-right">Time</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isTxLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto text-secondary" />
                      </TableCell>
                    </TableRow>
                  ) : transactions?.length ? (
                    transactions.map((tx) => (
                      <TableRow key={tx.id} className="border-white/5">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-[10px] font-bold text-white font-mono">{tx.transactionId}</span>
                            <span className="text-[9px] text-muted-foreground flex items-center gap-1 mt-0.5">
                              <Smartphone size={8} /> {tx.ecoCashNumber || "N/A"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-[10px] sm:text-xs font-bold text-secondary">${tx.amountPaidDollars}.00</TableCell>
                        <TableCell className="text-right text-[9px] text-muted-foreground font-mono">
                          {format(new Date(tx.createdAt?.toDate() || tx.purchaseDate), "MMM d, HH:mm")}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground text-[10px] uppercase tracking-widest">
                        Zero Activity
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-card/40 backdrop-blur-sm overflow-hidden flex flex-col">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-base sm:text-lg italic uppercase tracking-tighter">Learner Registry</CardTitle>
              <CardDescription className="text-[10px]">Track engagement and mastery.</CardDescription>
            </div>
            <div className="relative w-full md:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input 
                placeholder="Search Database..." 
                className="w-full pl-9 h-9 bg-background/50 border border-white/10 rounded-lg text-[10px] sm:text-xs outline-none focus:ring-1 focus:ring-secondary/50 placeholder:text-muted-foreground/50"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="px-0 sm:px-6 flex-1">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground">Learner</TableHead>
                    <TableHead className="text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground hidden sm:table-cell">Joined</TableHead>
                    <TableHead className="text-[9px] sm:text-[10px] uppercase font-bold text-muted-foreground text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isUsersLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8">
                        <Loader2 className="h-4 w-4 animate-spin mx-auto text-secondary" />
                      </TableCell>
                    </TableRow>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((learner) => (
                      <TableRow key={learner.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="font-medium text-white">
                          <div className="flex flex-col">
                            <span className="text-[10px] sm:text-xs font-bold">{learner.firstName} {learner.lastName}</span>
                            <span className="text-[9px] text-muted-foreground font-mono">{learner.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-[10px] font-mono hidden sm:table-cell">
                          {format(new Date(learner.registrationDate), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" className="hover:bg-secondary/10 hover:text-secondary h-7 text-[9px] font-bold uppercase tracking-widest" asChild>
                            <Link href={`/admin/users/${learner.id}`}>
                              Profile
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-8 text-muted-foreground text-[10px] uppercase tracking-widest">
                        No Records Found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
