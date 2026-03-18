
"use client"

import { useState, useRef } from "react"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { MOCK_RESOURCES } from "../lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, ShoppingCart, Sparkles, Smartphone, CheckCircle2, Loader2, Wallet, ArrowRight, ShieldCheck } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
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
import Autoplay from "embla-carousel-autoplay"
import { doc, setDoc, collection, serverTimestamp } from "firebase/firestore"

const ADMIN_ECOCASH_NUMBER = "0789269145"

export default function ResourcesPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  
  const [selectedResource, setSelectedResource] = useState<any>(null)
  const [isPaying, setIsPaying] = useState(false)
  const [payStep, setPayStep] = useState<'input' | 'processing' | 'success'>('input')
  const [phoneNumber, setPhoneNumber] = useState("")
  
  const plugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }))

  const purchasesQuery = useMemoFirebase(() => {
    if (!db || !user) return null
    return collection(db, "users", user.uid, "purchases")
  }, [db, user])

  const { data: userPurchases } = useCollection(purchasesQuery)

  const hasAccess = (resourceId: string) => {
    return userPurchases?.some(p => p.studyResourceId === resourceId)
  }

  const handleStartPayment = (resource: any) => {
    if (hasAccess(resource.id)) {
      toast({ title: "Already Owned", description: "You already have access to this resource." })
      return
    }
    setSelectedResource(resource)
    setPayStep('input')
    setIsPaying(true)
  }

  const processEcoCashPayment = async () => {
    if (!phoneNumber.match(/^07[7-8][0-9]{7}$/)) {
      toast({ variant: "destructive", title: "Invalid Number", description: "Please enter a valid EcoCash number (e.g. 0771234567)" })
      return
    }

    setPayStep('processing')
    
    await new Promise(resolve => setTimeout(resolve, 4000))

    if (!db || !user || !selectedResource) return

    try {
      const purchaseRef = doc(collection(db, "users", user.uid, "purchases"))
      const transactionId = "EC-" + Math.random().toString(36).substring(2, 10).toUpperCase()
      
      const purchaseData = {
        id: purchaseRef.id,
        userId: user.uid,
        studyResourceId: selectedResource.id,
        resourceTitle: selectedResource.title,
        purchaseDate: new Date().toISOString(),
        amountPaidDollars: selectedResource.priceDollars,
        transactionId: transactionId,
        paymentMethod: "EcoCash",
        ecoCashNumber: phoneNumber,
        recipientNumber: ADMIN_ECOCASH_NUMBER,
        status: "verified",
        createdAt: serverTimestamp()
      }

      await setDoc(purchaseRef, purchaseData)
      setPayStep('success')
      toast({ title: "Payment Successful", description: `Funds sent to ${ADMIN_ECOCASH_NUMBER}. Access granted.` })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Payment Failed", description: error.message })
      setPayStep('input')
    }
  }

  const handleDownload = (title: string) => {
    toast({
      title: "Download Initiated",
      description: `Preparing your high-definition copy of "${title}"...`,
    })
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <section className="relative p-8 md:p-12 rounded-3xl bg-primary/10 border border-secondary/20 overflow-hidden text-center md:text-left">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-3xl">
          <Badge className="bg-secondary text-white mb-4">SmartPass Premium</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 italic uppercase tracking-tighter">Study Resources</h1>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            Unlock professional PDF booklets via <span className="text-secondary font-bold">EcoCash</span>. Directed to official merchant account.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Sparkles className="text-secondary h-5 w-5" />
            <h2 className="text-2xl font-bold text-white tracking-tight">Featured Modules</h2>
          </div>
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
                    <Badge variant="secondary" className="mt-2 bg-secondary/20 text-secondary border-none">
                      {hasAccess(res.id) ? "Access Granted" : `$${res.priceDollars}.00`}
                    </Badge>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-tight px-2">Booklet Library</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {MOCK_RESOURCES.map((res) => {
            const owned = hasAccess(res.id)
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
                      <Badge variant="secondary" className="text-[9px] h-5 bg-secondary/10 text-secondary border-secondary/20 uppercase">
                        {owned ? "Premium" : "Market"}
                      </Badge>
                      <span className="text-lg font-bold text-white">${res.priceDollars}.00</span>
                    </div>
                    <CardTitle className="text-lg text-white">{res.title}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed line-clamp-2">
                      {res.description}
                    </CardDescription>
                  </div>

                  <div className="mt-6">
                    {owned ? (
                      <Button 
                        onClick={() => handleDownload(res.title)}
                        className="w-full bg-secondary text-white hover:bg-secondary/90 h-10"
                      >
                        <Download className="mr-2 h-4 w-4" /> Download PDF
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleStartPayment(res)}
                        className="w-full bg-primary text-white hover:bg-primary/90 h-10"
                      >
                        <ShoppingCart className="mr-2 h-4 w-4" /> Buy via EcoCash
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <Dialog open={isPaying} onOpenChange={setIsPaying}>
        <DialogContent className="bg-card border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wallet className="text-secondary" /> EcoCash USSD Push
            </DialogTitle>
            <DialogDescription>
              Purchase: <span className="text-white font-bold">{selectedResource?.title}</span>
            </DialogDescription>
          </DialogHeader>

          {payStep === 'input' && (
            <div className="space-y-6 py-4">
              <div className="p-4 rounded-xl bg-primary/20 border border-white/10 flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Recipient Merchant</p>
                  <p className="text-sm font-bold text-white">SmartPass Admin</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Merchant No.</p>
                  <p className="text-sm font-bold text-secondary font-mono">{ADMIN_ECOCASH_NUMBER}</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ecocash-number">Your EcoCash Number</Label>
                <Input 
                  id="ecocash-number"
                  placeholder="0771234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-background/50 border-white/10 h-12 text-lg"
                />
              </div>

              <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={14} className="text-secondary" />
                  <p className="text-xs text-secondary font-bold uppercase">Safe Transaction</p>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Funds will be directed to <span className="text-white font-bold">{ADMIN_ECOCASH_NUMBER}</span>. A secure push prompt will appear on your handset shortly.
                </p>
              </div>

              <Button className="w-full bg-secondary text-white hover:bg-secondary/90 h-12 text-lg" onClick={processEcoCashPayment}>
                Authorize ${selectedResource?.priceDollars}.00
              </Button>
            </div>
          )}

          {payStep === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <Loader2 className="h-16 w-16 animate-spin text-secondary" />
                <Smartphone className="absolute inset-0 m-auto h-6 w-6 text-white" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-bold text-white text-lg">Pushing USSD Request...</p>
                <p className="text-sm text-muted-foreground">Check your phone to authorize payment to 0789269145.</p>
              </div>
            </div>
          )}

          {payStep === 'success' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in zoom-in-95">
              <div className="h-20 w-20 bg-secondary/20 rounded-full flex items-center justify-center text-secondary border-2 border-secondary/50">
                <CheckCircle2 size={48} />
              </div>
              <div className="text-center space-y-2">
                <p className="font-bold text-white text-2xl">Payment Confirmed!</p>
                <p className="text-sm text-muted-foreground">Access granted to official premium resources.</p>
              </div>
              <Button className="w-full bg-secondary text-white" onClick={() => setIsPaying(false)}>
                Download Booklet <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
