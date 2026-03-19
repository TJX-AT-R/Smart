
"use client"

import { useState, useRef, useMemo } from "react"
import { useUser, useFirestore, useCollection, useMemoFirebase, useDoc } from "@/firebase"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, ShoppingCart, Sparkles, CheckCircle2, Loader2, Wallet, ArrowRight, ShieldCheck, Crown, Clock, Copy, AlertTriangle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { doc, setDoc, collection, serverTimestamp, query, orderBy } from "firebase/firestore"

const ADMIN_ECOCASH_NUMBER = "0789269145"

export default function ResourcesPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [selectedResource, setSelectedResource] = useState<any>(null)
  const [isPaying, setIsPaying] = useState(false)
  const [payStep, setPayStep] = useState<'instructions' | 'submit' | 'processing' | 'success'>('instructions')
  const [referenceCode, setReferenceCode] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const userDocRef = useMemoFirebase(() => {
    if (!db || !user) return null
    return doc(db, "users", user.uid)
  }, [db, user])
  const { data: userData } = useDoc(userDocRef)

  const resourcesQuery = useMemoFirebase(() => {
    if (!db) return null
    return query(collection(db, "studyResources"), orderBy("createdAt", "desc"))
  }, [db])
  const { data: resources, isLoading: isResourcesLoading } = useCollection(resourcesQuery)

  const purchasesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, "users", user.uid, "purchases")
  }, [db, user])
  const { data: userPurchases } = useCollection(purchasesQuery)

  const hasAccess = (resourceId: string) => {
    if (userData?.isPremium) return true
    return userPurchases?.some(p => p.studyResourceId === resourceId && p.status === 'verified')
  }

  const isPending = (resourceId: string) => {
    return userPurchases?.some(p => p.studyResourceId === resourceId && p.status === 'pending')
  }

  const handleStartPayment = (resource: any) => {
    if (hasAccess(resource.id)) {
      toast({ title: "Already Owned", description: "You already have access to this resource." })
      return
    }
    setSelectedResource(resource)
    setPayStep('instructions')
    setIsPaying(true)
  }

  const handleSubmitReference = async () => {
    if (referenceCode.length < 5) {
      toast({ variant: "destructive", title: "Invalid Reference", description: "Please enter the full reference code from your EcoCash SMS." })
      return
    }

    setIsSubmitting(true)
    setPayStep('processing')

    if (!db || !user || !selectedResource) return

    try {
      const purchaseId = `${user.uid}_${selectedResource.id}_${Date.now()}`
      const userPurchaseRef = doc(db, "users", user.uid, "purchases", purchaseId)
      const globalPurchaseRef = doc(db, "purchases", purchaseId)
      
      const purchaseData = {
        id: purchaseId,
        userId: user.uid,
        userEmail: user.email,
        studyResourceId: selectedResource.id,
        resourceTitle: selectedResource.title,
        purchaseDate: new Date().toISOString(),
        amountPaidDollars: selectedResource.priceDollars,
        transactionId: referenceCode,
        status: "pending",
        paymentMethod: "EcoCash",
        recipientNumber: ADMIN_ECOCASH_NUMBER,
        createdAt: serverTimestamp()
      }

      await setDoc(userPurchaseRef, purchaseData)
      await setDoc(globalPurchaseRef, purchaseData)
      
      setPayStep('success')
    } catch (error: any) {
      toast({ variant: "destructive", title: "Submission Failed", description: error.message })
      setPayStep('submit')
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({ title: "Copied!", description: "Number copied to clipboard." })
  }

  const handleDownload = (res: any) => {
    if (res.downloadUrl) {
      window.open(res.downloadUrl, '_blank')
      toast({
        title: "Download Initiated",
        description: `Your copy of "${res.title}" is opening in a new tab.`,
      })
    } else {
      toast({ variant: "destructive", title: "Link Error", description: "The download link for this resource is currently unavailable." })
    }
  }

  return (
    <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-500 pb-20 px-4 sm:px-0">
      <section className="relative p-6 sm:p-12 rounded-3xl bg-primary/20 border border-secondary/30 overflow-hidden text-center sm:text-left shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl opacity-50" />
        <div className="relative z-10 max-w-3xl">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mb-4">
            <Badge className="bg-secondary text-white uppercase tracking-widest text-[10px] font-bold">SmartPass Exclusive</Badge>
            {userData?.isPremium && (
              <Badge className="bg-amber-500 text-white uppercase tracking-widest text-[10px] font-bold flex items-center gap-1 shadow-lg shadow-amber-500/20">
                <Crown size={10} /> Global Access Active
              </Badge>
            )}
          </div>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 italic uppercase tracking-tighter">Study Resources</h1>
          <p className="text-muted-foreground text-base sm:text-xl leading-relaxed">
            Unlock premium PDF study booklets via <span className="text-secondary font-bold">Manual EcoCash Transfer</span>. Submit your reference code for instant admin verification.
          </p>
        </div>
      </section>

      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight px-2 uppercase italic">Booklet Library</h2>
        
        {isResourcesLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-secondary" />
          </div>
        ) : resources && resources.length > 0 ? (
          <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
            {resources.map((res) => {
              const owned = hasAccess(res.id)
              const pending = isPending(res.id)
              return (
                <Card key={res.id} className="flex flex-col sm:flex-row overflow-hidden border-white/5 bg-card/40 backdrop-blur-md group hover:border-secondary/30 transition-all duration-300 shadow-xl">
                  <div className="relative w-full sm:w-48 h-56 sm:h-auto overflow-hidden">
                    <Image 
                      src={res.thumbnailUrl || "https://picsum.photos/seed/booklet/400/600"} 
                      alt={res.title}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    {!owned && !pending && (
                      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center sm:hidden">
                         <Badge className="bg-primary/80 text-white font-mono">${res.priceDollars}.00</Badge>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between items-start">
                        <Badge variant="secondary" className={`text-[9px] h-5 uppercase font-bold tracking-widest ${owned ? 'bg-secondary/10 text-secondary border-secondary/20' : pending ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' : 'bg-muted/10 text-muted-foreground'}`}>
                          {owned ? "Unlocked" : pending ? "Pending Verification" : "Locked"}
                        </Badge>
                        {!owned && !pending && <span className="text-lg font-bold text-white font-mono hidden sm:inline-block">${res.priceDollars}.00</span>}
                      </div>
                      <CardTitle className="text-lg sm:text-xl text-white italic font-bold">{res.title}</CardTitle>
                      <CardDescription className="text-xs sm:text-sm leading-relaxed line-clamp-2 text-muted-foreground">
                        {res.description}
                      </CardDescription>
                    </div>

                    <div className="pt-2">
                      {owned ? (
                        <Button 
                          onClick={() => handleDownload(res)}
                          className="w-full bg-secondary text-white hover:bg-secondary/90 h-12 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-secondary/10"
                        >
                          <Download className="mr-2 h-4 w-4" /> Download Booklet
                        </Button>
                      ) : pending ? (
                        <Button 
                          disabled
                          className="w-full bg-amber-500/20 text-amber-500 border border-amber-500/30 h-12 font-bold uppercase tracking-widest text-[10px]"
                        >
                          <Clock className="mr-2 h-4 w-4 animate-pulse" /> Awaiting Verification
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleStartPayment(res)}
                          className="w-full bg-primary text-white hover:bg-primary/90 h-12 font-bold uppercase tracking-widest text-[10px] border border-white/5"
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" /> Unlock via EcoCash
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground italic">No study resources found in the library.</div>
        )}
      </div>

      <Dialog open={isPaying} onOpenChange={setIsPaying}>
        <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10 sm:max-w-md w-[95vw] rounded-3xl mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl italic uppercase tracking-tighter text-white">
              <Wallet className="text-secondary" /> Manual EcoCash Transfer
            </DialogTitle>
            <DialogDescription className="text-xs">
              Direct payment to Admin for: <span className="text-secondary font-bold uppercase">{selectedResource?.title}</span>
            </DialogDescription>
          </DialogHeader>

          {payStep === 'instructions' && (
            <div className="space-y-6 py-4">
              <div className="p-5 rounded-2xl bg-primary/40 border border-white/5 space-y-4 shadow-inner">
                <div className="space-y-1">
                  <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Step 1: Send Funds</p>
                  <p className="text-sm text-white">Transfer <span className="text-secondary font-bold">${selectedResource?.priceDollars}.00</span> via EcoCash to:</p>
                </div>
                
                <div className="flex items-center justify-between bg-background/60 p-3 rounded-xl border border-white/10">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-muted-foreground uppercase font-bold">Admin Number</span>
                    <span className="text-xl font-mono text-secondary tracking-tighter">{ADMIN_ECOCASH_NUMBER}</span>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => copyToClipboard(ADMIN_ECOCASH_NUMBER)} className="text-muted-foreground hover:text-white">
                    <Copy size={18} />
                  </Button>
                </div>

                <div className="flex gap-3 items-start p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <AlertTriangle className="text-amber-500 shrink-0 mt-0.5" size={14} />
                  <p className="text-[10px] text-amber-500 leading-tight">After sending, wait for the SMS confirmation. You will need to paste the Reference Code in the next step.</p>
                </div>
              </div>

              <Button className="w-full bg-secondary text-white hover:bg-secondary/90 h-14 text-lg font-bold shadow-xl shadow-secondary/20 uppercase italic tracking-tighter" onClick={() => setPayStep('submit')}>
                I have sent the payment <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>
          )}

          {payStep === 'submit' && (
            <div className="space-y-6 py-4">
              <div className="space-y-3">
                <Label htmlFor="reference-code" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">EcoCash Reference Code</Label>
                <Input 
                  id="reference-code"
                  placeholder="e.g. EC240830.1234.H12345"
                  value={referenceCode}
                  onChange={(e) => setReferenceCode(e.target.value)}
                  className="bg-background/50 border-white/10 h-14 text-lg font-mono tracking-wider"
                />
                <p className="text-[9px] text-muted-foreground italic px-1">Admin will verify this code against their EcoCash statement.</p>
              </div>

              <div className="flex gap-3">
                <Button variant="ghost" className="flex-1 h-12 text-xs font-bold uppercase tracking-widest" onClick={() => setPayStep('instructions')}>Back</Button>
                <Button className="flex-[2] bg-secondary text-white hover:bg-secondary/90 h-12 text-xs font-bold shadow-xl shadow-secondary/20 uppercase tracking-widest" onClick={handleSubmitReference}>
                  Submit for Verification
                </Button>
              </div>
            </div>
          )}

          {payStep === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <Loader2 className="h-20 w-20 animate-spin text-secondary opacity-30" />
                <ShieldCheck className="absolute inset-0 m-auto h-8 w-8 text-white animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-bold text-white text-xl italic uppercase tracking-tighter">Submitting Reference...</p>
              </div>
            </div>
          )}

          {payStep === 'success' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in zoom-in-95">
              <div className="h-20 w-20 bg-secondary/10 rounded-full flex items-center justify-center text-secondary border-2 border-secondary/30 shadow-2xl shadow-secondary/10">
                <Clock size={48} className="animate-pulse" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-bold text-white text-2xl italic uppercase tracking-tighter">Reference Submitted</p>
                <p className="text-sm text-muted-foreground px-4">Admin will verify your payment shortly. Check back in 15 minutes.</p>
              </div>
              <Button className="w-full bg-secondary text-white font-bold h-12 uppercase tracking-widest text-xs" onClick={() => setIsPaying(false)}>
                Return to Library <CheckCircle2 className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
