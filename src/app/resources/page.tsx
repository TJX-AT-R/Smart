
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
    await new Promise(resolve => setTimeout(resolve, 3000))

    if (!db || !user || !selectedResource) return

    try {
      const purchaseRef = doc(collection(db, "users", user.uid, "purchases"))
      const transactionId = "EC-" + Math.random().toString(36).substring(2, 10).toUpperCase()
      
      const purchaseData = {
        id: purchaseRef.id,
        userId: user.uid,
        studyResourceId: selectedResource.id,
        purchaseDate: new Date().toISOString(),
        amountPaidDollars: selectedResource.priceDollars,
        transactionId: transactionId,
        paymentMethod: "EcoCash",
        ecoCashNumber: phoneNumber,
        recipientNumber: ADMIN_ECOCASH_NUMBER,
        createdAt: serverTimestamp()
      }

      await setDoc(purchaseRef, purchaseData)
      setPayStep('success')
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
    <div className="space-y-8 sm:space-y-12 animate-in fade-in duration-500 pb-20 px-4 sm:px-0">
      <section className="relative p-6 sm:p-12 rounded-3xl bg-primary/20 border border-secondary/30 overflow-hidden text-center sm:text-left shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl opacity-50" />
        <div className="relative z-10 max-w-3xl">
          <Badge className="bg-secondary text-white mb-4 uppercase tracking-widest text-[10px] font-bold">SmartPass Exclusive</Badge>
          <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4 italic uppercase tracking-tighter">Study Resources</h1>
          <p className="text-muted-foreground text-base sm:text-xl leading-relaxed">
            Unlock premium PDF study booklets via <span className="text-secondary font-bold">EcoCash USSD Push</span>. Direct settlement to official merchant.
          </p>
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Sparkles className="text-secondary h-5 w-5" />
            <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight uppercase italic">Featured Modules</h2>
          </div>
        </div>
        <Carousel
          plugins={[plugin.current]}
          className="w-full relative group"
        >
          <CarouselContent className="-ml-2 sm:-ml-4">
            {MOCK_RESOURCES.map((res) => (
              <CarouselItem key={`featured-${res.id}`} className="pl-2 sm:pl-4 basis-[85%] sm:basis-1/2 lg:basis-1/3">
                <div className="relative aspect-[3/4] overflow-hidden rounded-3xl border border-white/10 hover:border-secondary/50 transition-all duration-300 shadow-xl group/card">
                  <Image 
                    src={res.thumbnailUrl} 
                    alt={res.title}
                    fill
                    className="object-cover group-hover/card:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent opacity-80" />
                  <div className="absolute bottom-6 left-6 right-6 space-y-2">
                    <h3 className="text-lg sm:text-xl font-bold text-white line-clamp-1 italic">{res.title}</h3>
                    <Badge variant="secondary" className="bg-secondary/20 text-secondary border-none font-mono text-[10px] sm:text-xs">
                      {hasAccess(res.id) ? "ACCESS GRANTED" : `$${res.priceDollars}.00`}
                    </Badge>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      <div className="space-y-6">
        <h2 className="text-xl sm:text-2xl font-bold text-white tracking-tight px-2 uppercase italic">Booklet Library</h2>
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          {MOCK_RESOURCES.map((res) => {
            const owned = hasAccess(res.id)
            return (
              <Card key={res.id} className="flex flex-col sm:flex-row overflow-hidden border-white/5 bg-card/40 backdrop-blur-md group hover:border-secondary/30 transition-all duration-300 shadow-xl">
                <div className="relative w-full sm:w-48 h-56 sm:h-auto overflow-hidden">
                  <Image 
                    src={res.thumbnailUrl} 
                    alt={res.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  {!owned && (
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center sm:hidden">
                       <Badge className="bg-primary/80 text-white font-mono">$5.00</Badge>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 p-6 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between items-start">
                      <Badge variant="secondary" className="text-[9px] h-5 bg-secondary/10 text-secondary border-secondary/20 uppercase font-bold tracking-widest">
                        {owned ? "Unlocked" : "Locked"}
                      </Badge>
                      {!owned && <span className="text-lg font-bold text-white font-mono hidden sm:inline-block">${res.priceDollars}.00</span>}
                    </div>
                    <CardTitle className="text-lg sm:text-xl text-white italic font-bold">{res.title}</CardTitle>
                    <CardDescription className="text-xs sm:text-sm leading-relaxed line-clamp-2 text-muted-foreground">
                      {res.description}
                    </CardDescription>
                  </div>

                  <div className="pt-2">
                    {owned ? (
                      <Button 
                        onClick={() => handleDownload(res.title)}
                        className="w-full bg-secondary text-white hover:bg-secondary/90 h-12 font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-secondary/10"
                      >
                        <Download className="mr-2 h-4 w-4" /> Download Booklet
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => handleStartPayment(res)}
                        className="w-full bg-primary text-white hover:bg-primary/90 h-12 font-bold uppercase tracking-widest text-[10px] border border-white/5"
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
        <DialogContent className="bg-card/95 backdrop-blur-xl border-white/10 sm:max-w-md w-[95vw] rounded-3xl mx-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl italic uppercase tracking-tighter text-white">
              <Wallet className="text-secondary" /> EcoCash USSD Push
            </DialogTitle>
            <DialogDescription className="text-xs">
              Content: <span className="text-secondary font-bold uppercase">{selectedResource?.title}</span>
            </DialogDescription>
          </DialogHeader>

          {payStep === 'input' && (
            <div className="space-y-6 py-4">
              <div className="p-4 rounded-2xl bg-primary/40 border border-white/5 flex items-center justify-between shadow-inner">
                <div className="space-y-1">
                  <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Recipient</p>
                  <p className="text-xs font-bold text-white uppercase italic">SmartPass Payout</p>
                </div>
                <div className="text-right">
                  <p className="text-[9px] text-muted-foreground uppercase font-bold tracking-widest">Merchant Account</p>
                  <p className="text-sm font-bold text-secondary font-mono tracking-tighter">{ADMIN_ECOCASH_NUMBER}</p>
                </div>
              </div>

              <div className="space-y-3">
                <Label htmlFor="ecocash-number" className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Your Mobile Number</Label>
                <Input 
                  id="ecocash-number"
                  placeholder="0771234567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  className="bg-background/50 border-white/10 h-14 text-xl font-mono text-center tracking-widest"
                />
              </div>

              <div className="p-4 rounded-2xl bg-secondary/5 border border-secondary/20 space-y-2">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck size={14} className="text-secondary" />
                  <p className="text-[10px] text-secondary font-bold uppercase tracking-widest">Verified Merchant</p>
                </div>
                <p className="text-[10px] sm:text-[11px] text-muted-foreground leading-relaxed">
                  A USSD prompt will appear on your device. Please enter your PIN to authorize the payment of <b>${selectedResource?.priceDollars}.00</b>.
                </p>
              </div>

              <Button className="w-full bg-secondary text-white hover:bg-secondary/90 h-14 text-lg font-bold shadow-xl shadow-secondary/20 uppercase italic tracking-tighter" onClick={processEcoCashPayment}>
                Pay Now
              </Button>
            </div>
          )}

          {payStep === 'processing' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6">
              <div className="relative">
                <Loader2 className="h-20 w-20 animate-spin text-secondary opacity-30" />
                <Smartphone className="absolute inset-0 m-auto h-8 w-8 text-white animate-bounce" />
              </div>
              <div className="text-center space-y-2">
                <p className="font-bold text-white text-xl italic uppercase tracking-tighter">Requesting Payout...</p>
                <p className="text-xs text-muted-foreground max-w-[200px] mx-auto">Check your phone to authorize the settlement to <b>0789269145</b>.</p>
              </div>
            </div>
          )}

          {payStep === 'success' && (
            <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in zoom-in-95">
              <div className="h-20 w-20 bg-secondary/10 rounded-full flex items-center justify-center text-secondary border-2 border-secondary/30 shadow-2xl shadow-secondary/10">
                <CheckCircle2 size={48} />
              </div>
              <div className="text-center space-y-2">
                <p className="font-bold text-white text-2xl italic uppercase tracking-tighter">Access Unlocked</p>
                <p className="text-sm text-muted-foreground px-4">Your premium study booklet is now ready for high-definition download.</p>
              </div>
              <Button className="w-full bg-secondary text-white font-bold h-12 uppercase tracking-widest text-xs" onClick={() => setIsPaying(false)}>
                Go to Booklet <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
