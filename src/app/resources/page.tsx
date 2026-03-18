
"use client"

import { useState, useRef } from "react"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore"
import { MOCK_RESOURCES } from "../lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, ShoppingCart, CheckCircle, Loader2, FileText, Lock, Sparkles, Smartphone, ArrowRight, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Autoplay from "embla-carousel-autoplay"

const ECO_CASH_NUMBER = "0789269145"

export default function ResourcesPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null)
  const [selectedResource, setSelectedResource] = useState<{id: string, title: string} | null>(null)
  const [transactionRef, setTransactionRef] = useState("")
  
  const plugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }))

  // Fetch user's purchases
  const purchasesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, "users", user.uid, "purchases")
  }, [db, user])

  const { data: userPurchases, isLoading: isPurchasesLoading } = useCollection(purchasesQuery)

  const getPurchase = (resourceId: string) => {
    return userPurchases?.find(p => p.studyResourceId === resourceId)
  }

  const handlePurchase = async () => {
    if (!user || !selectedResource) return

    if (!transactionRef) {
      toast({
        variant: "destructive",
        title: "Reference Required",
        description: "Please enter your EcoCash transaction reference.",
      })
      return
    }

    setIsPurchasing(selectedResource.id)
    
    // Non-blocking submission
    const purchaseRef = doc(collection(db, "users", user.uid, "purchases"))
    const purchaseData = {
      id: purchaseRef.id,
      userId: user.uid,
      studyResourceId: selectedResource.id,
      purchaseDate: new Date().toISOString(),
      amountPaidDollars: 5,
      paymentMethod: 'ecocash',
      transactionId: transactionRef,
      status: 'pending_verification',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    setDoc(purchaseRef, purchaseData)
      .then(() => {
        toast({
          title: "Reference Submitted",
          description: "Admin verification is now in progress. Access granted soon!",
        })
        setSelectedResource(null)
        setTransactionRef("")
      })
      .catch((err) => {
        toast({
          variant: "destructive",
          title: "Submission Error",
          description: err.message,
        })
      })
      .finally(() => {
        setIsPurchasing(null)
      })
  }

  const handleDownload = (title: string) => {
    toast({
      title: "Download Initiated",
      description: `Preparing your copy of "${title}"...`,
    })
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <section className="relative p-8 md:p-12 rounded-3xl bg-primary/10 border border-secondary/20 overflow-hidden text-center md:text-left">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <Badge className="bg-secondary text-white mb-4">Instant Verification Enabled</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 italic uppercase">Study Resources</h1>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            Get premium PDF booklets for only <span className="text-white font-bold">$5.00</span>. Simply send to EcoCash and provide your reference for <span className="text-secondary font-bold">instant admin verification</span>.
          </p>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Sparkles className="text-secondary h-5 w-5" />
            <h2 className="text-2xl font-bold text-white tracking-tight">Top Sellers</h2>
          </div>
          <span className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Swipe to explore</span>
        </div>
        <Carousel
          plugins={[plugin.current]}
          className="w-full relative group"
        >
          <CarouselContent className="-ml-4">
            {MOCK_RESOURCES.map((res) => (
              <CarouselItem key={`featured-${res.id}`} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-white/5 hover:border-secondary/30 transition-all duration-300">
                  <Image 
                    src={res.thumbnailUrl} 
                    alt={res.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                  <div className="absolute bottom-6 left-6 right-6">
                    <h3 className="text-xl font-bold text-white line-clamp-1">{res.title}</h3>
                    <p className="text-xs text-secondary font-bold uppercase tracking-widest mt-1">Premium Access</p>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      {/* Booklet Catalog */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-tight px-2">Available Booklets</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {MOCK_RESOURCES.map((res) => {
            const purchase = getPurchase(res.id)
            const isVerified = purchase?.status === 'verified' || purchase?.amountPaidDollars === 0
            const isPending = purchase?.status === 'pending_verification'

            return (
              <Card key={res.id} className="flex flex-col sm:flex-row overflow-hidden border-white/5 bg-card/40 backdrop-blur-sm group hover:border-secondary/30 transition-all duration-300">
                <div className="relative w-full sm:w-40 h-48 sm:h-auto overflow-hidden">
                  <Image 
                    src={res.thumbnailUrl} 
                    alt={res.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary" className="text-[9px] h-5 bg-secondary/10 text-secondary border-secondary/20 uppercase">PDF Booklet</Badge>
                      {!isVerified && !isPending && <span className="text-lg font-bold text-white">$5.00</span>}
                    </div>
                    <CardTitle className="text-lg text-white">{res.title}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed line-clamp-2">
                      {res.description}
                    </CardDescription>
                  </div>

                  <div className="mt-6">
                    {isVerified ? (
                      <Button 
                        onClick={() => handleDownload(res.title)}
                        className="w-full bg-secondary text-white hover:bg-secondary/90 h-10 shadow-lg shadow-secondary/10"
                      >
                        <Download className="mr-2 h-4 w-4" /> Download
                      </Button>
                    ) : isPending ? (
                      <div className="p-2 rounded-lg bg-yellow-500/5 border border-yellow-500/20 text-center">
                        <div className="flex items-center justify-center gap-2 text-yellow-500 text-[10px] font-bold">
                          <Clock size={12} className="animate-pulse" />
                          VERIFICATION IN PROGRESS
                        </div>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => {
                          if (!user) {
                            toast({ variant: "destructive", title: "Login Required", description: "Sign in to purchase study materials." })
                            return
                          }
                          setSelectedResource({ id: res.id, title: res.title })
                        }}
                        className="w-full bg-primary text-white hover:bg-primary/90 h-10"
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
      </div>

      {/* EcoCash Payment Dialog */}
      <Dialog open={!!selectedResource} onOpenChange={(open) => !open && setSelectedResource(null)}>
        <DialogContent className="bg-card border-white/5 sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl italic uppercase">
              <Smartphone className="text-secondary" /> EcoCash Step
            </DialogTitle>
            <DialogDescription className="text-sm">
              Follow these instructions to unlock <span className="text-white font-semibold">{selectedResource?.title}</span> instantly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="p-5 rounded-2xl bg-secondary/5 border border-secondary/10 space-y-4">
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Step 1: Send $5.00 USD</p>
                <div className="flex items-center justify-between bg-background/50 p-3 rounded-xl border border-white/5">
                  <span className="text-lg font-mono font-bold text-secondary">{ECO_CASH_NUMBER}</span>
                  <Badge variant="outline" className="text-[9px] border-secondary/30 text-secondary">EcoCash</Badge>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Step 2: Submit Reference</p>
                <p className="text-[11px] text-white/70">Paste the transaction ID from your EcoCash SMS below.</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ref" className="text-[10px] font-bold uppercase tracking-wider">Transaction ID / Reference</Label>
              <Input 
                id="ref" 
                placeholder="e.g. MP240101.1234.H12345" 
                value={transactionRef}
                onChange={(e) => setTransactionRef(e.target.value)}
                className="bg-background/50 border-white/10 h-12 font-mono uppercase text-secondary"
              />
            </div>
          </div>

          <DialogFooter className="grid grid-cols-2 gap-3">
            <Button variant="ghost" className="w-full h-12" onClick={() => setSelectedResource(null)} disabled={isPurchasing}>
              Cancel
            </Button>
            <Button 
              className="w-full h-12 bg-secondary text-white hover:bg-secondary/90 shadow-lg shadow-secondary/10" 
              onClick={handlePurchase}
              disabled={isPurchasing}
            >
              {isPurchasing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Verify Access"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
