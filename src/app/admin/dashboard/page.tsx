"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, doc, getDoc, limit, updateDoc, serverTimestamp } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Users, Search, Loader2, ArrowRight, ShieldAlert, Database, Wallet, History, ShieldCheck, CheckCircle2, XCircle, LogOut } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"
import { errorEmitter } from "@/firebase/error-emitter"
import { FirestorePermissionError } from "@/firebase/errors"

const ENC_A = "bmN1YmV0aHViZWxpaGxlNDgzQGdtYWlsLmNvbQ==";
const getAdminEmail = () => typeof window !== 'undefined' ? window.atob(ENC_A) : "";
const ADMIN_ECOCASH_NUMBER = "0789269145";

export default function AdminDashboardPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const [verifyingId, setVerifyingId] = useState<string | null>(null)

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
    return query(collection(db, "purchases"), orderBy("createdAt", "desc"), limit(50))
  }, [db, isAdmin])

  const { data: transactions, isLoading: isTxLoading } = useCollection(transactionsQuery)

  const handleVerifyPurchase = (tx: any, newStatus: 'verified' | 'rejected') => {
    if (!db) return
    setVerifyingId(tx.id)
    
    const globalRef = doc(db, "purchases", tx.id)
    const userRef = doc(db, "users", tx.userId, "purchases", tx.id)

    const updateData = {
      status: newStatus,
      verifiedAt: serverTimestamp(),
      verifiedBy: user?.email
    }

    updateDoc(globalRef, updateData).catch(async (err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: globalRef.path,
        operation: 'update',
        requestResourceData: updateData
      }))
    })

    updateDoc(userRef, updateData).catch(async (err) => {
      errorEmitter.emit('permission-error', new FirestorePermissionError({
        path: userRef.path,
        operation: 'update',
        requestResourceData: updateData
      }))
    })

    toast({
      title: newStatus === 'verified' ? "Reference Verified" : "Reference Rejected",
      description: `Reference ${tx.transactionId} updated.`
    })
    setVerifyingId(null)
  }

  const totalRevenue = transactions?.filter(t => t.status === 'verified').reduce((acc, curr) => acc + (curr.amountPaidDollars || 0), 0) || 0
  const pendingCount = transactions?.filter(t => t.status === 'pending').length || 0

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
    <div className="p-4 sm:p-8 space-y-6 sm:space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-primary/20 p-6 rounded-2xl border border-white/5">
        <div className="text-center lg:text-left">
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center justify-center lg:justify-start gap-3 italic uppercase tracking-tighter">
            <ShieldAlert className="text-destructive size-6 sm:size-8" />
            SmartPass Command
          </h1>
          <p className="text-muted-foreground font-mono text-[10px] uppercase tracking-widest mt-1">Administrator Oversight Portal</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-end gap-4 w-full sm:w-auto">
          <div className="flex items-center gap-2 bg-secondary/5 px-4 py-2 rounded-full border border-secondary/20 w-full sm:w-auto justify-center">
            <ShieldCheck size={14} className="text-secondary shrink-0" />
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest whitespace-nowrap">Payout:</span>
            <span className="text-[11px] font-mono font-bold text-secondary">{ADMIN_ECOCASH_NUMBER}</span>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <Badge variant="outline" className="flex-1 sm:flex-none px-3 py-1.5 border-destructive/30 text-destructive bg-destructive/5 font-mono text-[9px] uppercase tracking-widest flex justify-center items-center">
              {user?.email === getAdminEmail() ? "ROOT ACCESS" : "ADMIN ROLE"}
            </Badge>
            <Button variant="outline" onClick={() => router.push("/")} size="sm" className="flex-1 sm:flex-none border-white/10 hover:bg-white/5 text-[10px] h-9 font-bold uppercase tracking-widest">
              Exit <LogOut size={12} className="ml-2" />
            </Button>
          </div>
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
              Verified Revenue
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-secondary tracking-tighter">${totalRevenue}.00</div>
          </CardContent>
        </Card>

        <Card className="bg-primary/40 border-white/5 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-amber-500">
              <History size={12} className="text-amber-500" />
              Pending Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl sm:text-3xl font-bold text-amber-500 tracking-tighter">{pendingCount}</div>
          </CardContent>
        </Card>

        <Card className="bg-primary/40 border-white/5 shadow-xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-[10px] font-bold uppercase tracking-widest flex items-center gap-2 text-muted-foreground">
              <Database size={12} className="text-secondary" />
              Global Controls
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 sm:grid-cols-1 gap-2">
            <Button variant="secondary" size="sm" className="w-full text-[9px] h-8 bg-secondary/10 text-secondary hover:bg-secondary/20 font-bold uppercase tracking-widest" asChild>
              <Link href="/admin/questions">
                Theory Bank
              </Link>
            </Button>
            <Button variant="secondary" size="sm" className="w-full text-[9px] h-8 bg-secondary/10 text-secondary hover:bg-secondary/20 font-bold uppercase tracking-widest" asChild>
              <Link href="/admin/resources">
                Library
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-2">
        <Card className="border-white/5 bg-card/40 backdrop-blur-sm overflow-hidden flex flex-col shadow-2xl">
          <CardHeader className="flex flex-row items-center justify-between border-b border-white/5 bg-primary/10">
            <div>
              <CardTitle className="text-base sm:text-lg italic uppercase tracking-tighter">EcoCash Registry</CardTitle>
              <CardDescription className="text-[9px] uppercase font-bold text-muted-foreground">Verify incoming reference codes.</CardDescription>
            </div>
            <History size={16} className="text-secondary" />
          </CardHeader>
          <CardContent className="px-0 flex-1">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-[9px] uppercase font-bold text-muted-foreground pl-6">Reference / Resource</TableHead>
                    <TableHead className="text-[9px] uppercase font-bold text-muted-foreground">Status</TableHead>
                    <TableHead className="text-[9px] uppercase font-bold text-muted-foreground text-right pr-6">Control</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isTxLoading ? (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12">
                        <Loader2 className="h-6 w-6 animate-spin mx-auto text-secondary" />
                      </TableCell>
                    </TableRow>
                  ) : transactions?.length ? (
                    transactions.map((tx) => (
                      <TableRow key={tx.id} className="border-white/5 hover:bg-white/5 transition-colors">
                        <TableCell className="pl-6">
                          <div className="flex flex-col py-1">
                            <span className="text-[10px] font-bold text-white font-mono tracking-wider">{tx.transactionId}</span>
                            <span className="text-[9px] text-muted-foreground italic mt-0.5">{tx.resourceTitle || "Study Booklet"}</span>
                            <span className="text-[8px] text-muted-foreground/60 font-mono mt-0.5">{tx.userEmail}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={`text-[8px] uppercase font-bold tracking-widest px-2 py-0.5 ${
                              tx.status === 'verified' ? 'border-secondary/30 text-secondary bg-secondary/5' : 
                              tx.status === 'pending' ? 'border-amber-500/30 text-amber-500 bg-amber-500/5' : 
                              'border-destructive/30 text-destructive bg-destructive/5'
                            }`}
                          >
                            {tx.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          {tx.status === 'pending' ? (
                            <div className="flex items-center justify-end gap-1">
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-secondary hover:bg-secondary/10"
                                onClick={() => handleVerifyPurchase(tx, 'verified')}
                                disabled={verifyingId === tx.id}
                              >
                                <CheckCircle2 size={16} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon" 
                                className="h-8 w-8 text-destructive hover:bg-destructive/10"
                                onClick={() => handleVerifyPurchase(tx, 'rejected')}
                                disabled={verifyingId === tx.id}
                              >
                                <XCircle size={16} />
                              </Button>
                            </div>
                          ) : (
                            <span className="text-[9px] text-muted-foreground font-mono bg-white/5 px-2 py-1 rounded">
                              {tx.verifiedAt ? format(new Date(tx.verifiedAt.toDate()), "MMM d, HH:mm") : 'Done'}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12 text-muted-foreground text-[10px] uppercase tracking-widest font-bold">
                        Zero Records
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-card/40 backdrop-blur-sm overflow-hidden flex flex-col shadow-2xl">
          <CardHeader className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 bg-primary/10">
            <div>
              <CardTitle className="text-base sm:text-lg italic uppercase tracking-tighter">Learner Registry</CardTitle>
              <CardDescription className="text-[9px] uppercase font-bold text-muted-foreground">Mastery and Engagement tracking.</CardDescription>
            </div>
            <div className="relative w-full md:w-56">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input 
                placeholder="Search Database..." 
                className="w-full pl-9 h-9 bg-background/50 border border-white/10 rounded-lg text-[10px] sm:text-xs outline-none focus:ring-1 focus:ring-secondary/50 placeholder:text-muted-foreground/50 transition-all"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="px-0 flex-1">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="text-[9px] uppercase font-bold text-muted-foreground pl-6">Learner Profile</TableHead>
                    <TableHead className="text-[9px] uppercase font-bold text-muted-foreground hidden sm:table-cell">Enlisted</TableHead>
                    <TableHead className="text-[9px] uppercase font-bold text-muted-foreground text-right pr-6">Action</TableHead>
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
                        <TableCell className="pl-6">
                          <div className="flex flex-col py-1">
                            <span className="text-[10px] sm:text-xs font-bold text-white">{learner.firstName} {learner.lastName}</span>
                            <span className="text-[9px] text-muted-foreground font-mono mt-0.5">{learner.email}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-[10px] font-mono hidden sm:table-cell">
                          {format(new Date(learner.registrationDate), "MMM d, yyyy")}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <Button variant="ghost" size="sm" className="hover:bg-secondary/10 hover:text-secondary h-8 px-4 text-[9px] font-bold uppercase tracking-widest border border-white/5" asChild>
                            <Link href={`/admin/users/${learner.id}`}>
                              Oversight
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-12 text-muted-foreground text-[10px] uppercase tracking-widest font-bold">
                        Zero Matches
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
