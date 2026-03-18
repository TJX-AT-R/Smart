"use client"

import { useState, useRef } from "react"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore"
import { MOCK_RESOURCES } from "../lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, ShoppingCart, CheckCircle, Loader2, FileText, Lock, Sparkles, Smartphone, ArrowRight } from "lucide-react"
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

  const hasPurchased = (resourceId: string) => {
    return userPurchases?.some(p => p.studyResourceId === resourceId)
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
    
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      const purchaseRef = doc(collection(db, "users", user.uid, "purchases"))
      await setDoc(purchaseRef, {
        id: purchaseRef.id,
        userId: user.uid,
        studyResourceId: selectedResource.id,
        purchaseDate: new Date().toISOString(),
        amountPaidDollars: 5,
        paymentMethod: 'ecocash',
        transactionId: transactionRef,
        status: 'pending_verification',
        createdAt: serverTimestamp()
      })

      toast({
        title: "Payment Submitted",
        description: "Your EcoCash payment is being verified. Access will be granted once confirmed by admin.",
      })
      
      // Close dialog
      setSelectedResource(null)
      setTransactionRef("")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Submission Failed",
        description: error.message || "Something went wrong. Please try again.",
      })
    } finally {
      setIsPurchasing(null)
    }
  }

  const handleDownload = (title: string) => {
    toast({
      title: "Download Started",
      description: `Your copy of "${title}" is being downloaded.`,
    })
  }

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-20">
      <section className="relative p-8 rounded-3xl bg-primary/10 border border-secondary/20 overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-4xl font-bold text-primary mb-4">Study Resources</h1>
          <p className="text-muted-foreground text-lg">
            Unlock premium PDF booklets. We accept <span className="text-secondary font-bold font-mono">EcoCash</span> payments only.
          </p>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="space-y-6">
        <div className="flex items-center gap-2 px-2">
          <Sparkles className="text-secondary h-5 w-5" />
          <h2 className="text-2xl font-bold text-white tracking-tight">Featured Content</h2>
        </div>
        <Carousel
          plugins={[plugin.current]}
          className="w-full relative group"
          onMouseEnter={plugin.current.stop}
          onMouseLeave={plugin.current.reset}
        >
          <CarouselContent className="-ml-4">
            {MOCK_RESOURCES.map((res) => (
              <CarouselItem key={`featured-${res.id}`} className="pl-4 md:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="overflow-hidden border-white/5 bg-card/40 backdrop-blur-sm group-hover:border-secondary/30 transition-all duration-300 h-full flex flex-col">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      <Image 
                        src={res.thumbnailUrl} 
                        alt={res.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent" />
                      <div className="absolute bottom-4 left-4 right-4">
                        <Badge className="bg-secondary text-secondary-foreground mb-2">Best Seller</Badge>
                        <h3 className="text-lg font-bold text-white line-clamp-1">{res.title}</h3>
                      </div>
                    </div>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <div className="hidden group-hover:block">
            <CarouselPrevious className="left-4 bg-background/80 border-white/10" />
            <CarouselNext className="right-4 bg-background/80 border-white/10" />
          </div>
        </Carousel>
      </section>

      {/* All Booklets Grid */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-tight px-2">All Booklets</h2>
        <div className="grid gap-8 md:grid-cols-2">
          {MOCK_RESOURCES.map((res) => {
            const purchased = hasPurchased(res.id)

            return (
              <Card key={res.id} className="flex flex-col md:flex-row overflow-hidden border-white/5 bg-card/40 backdrop-blur-sm group hover:border-secondary/30 transition-all duration-300 shadow-xl">
                <div className="relative w-full md:w-48 h-64 md:h-auto overflow-hidden">
                  <Image 
                    src={res.thumbnailUrl} 
                    alt={res.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {!purchased && (
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-secondary text-secondary-foreground shadow-lg">$5.00</Badge>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 p-6 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText size={16} className="text-secondary" />
                      <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">PDF BOOKLET</span>
                    </div>
                    <CardTitle className="text-xl mb-2 text-primary">{res.title}</CardTitle>
                    <CardDescription className="text-sm leading-relaxed mb-6">
                      {res.description}
                    </CardDescription>
                  </div>

                  <div className="space-y-3">
                    {purchased ? (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-secondary text-sm font-semibold mb-1">
                          <CheckCircle size={16} />
                          Purchased
                        </div>
                        <Button 
                          onClick={() => handleDownload(res.title)}
                          className="w-full bg-secondary text-white hover:bg-secondary/90 h-11"
                        >
                          <Download className="mr-2 h-4 w-4" /> Download PDF
                        </Button>
                      </div>
                    ) : (
                      <Button 
                        onClick={() => {
                          if (!user) {
                            toast({ variant: "destructive", title: "Sign in required", description: "Please log in to purchase materials." })
                            return
                          }
                          setSelectedResource({ id: res.id, title: res.title })
                        }}
                        className="w-full bg-primary text-white hover:bg-primary/90 h-11"
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
        <DialogContent className="bg-card border-white/5 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>EcoCash Payment</DialogTitle>
            <DialogDescription>
              Follow the instructions below to unlock <span className="text-white font-semibold">{selectedResource?.title}</span>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-secondary">Instructions</p>
              <p className="text-sm text-white">
                Send <span className="font-bold">$5.00</span> to the following EcoCash account:
              </p>
              <div className="flex items-center justify-between bg-background/50 p-3 rounded-lg border border-white/5">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">EcoCash Number</span>
                  <span className="text-lg font-mono font-bold text-secondary">{ECO_CASH_NUMBER}</span>
                </div>
                <Badge variant="secondary" className="text-[10px] h-fit">Merchant</Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="ref" className="text-xs">Transaction Reference (ID)</Label>
              <div className="relative">
                <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  id="ref" 
                  placeholder="Enter the EcoCash Ref code" 
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="bg-background/50 border-white/10 pl-10 h-11"
                />
              </div>
              <p className="text-[10px] text-muted-foreground leading-tight">
                Enter the unique code from your EcoCash confirmation SMS. Our team will verify this within 24 hours.
              </p>
            </div>
          </div>

          <DialogFooter className="flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setSelectedResource(null)} disabled={isPurchasing}>
              Cancel
            </Button>
            <Button 
              className="flex-1 bg-secondary text-white hover:bg-secondary/90" 
              onClick={handlePurchase}
              disabled={isPurchasing}
            >
              {isPurchasing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
              Confirm Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="bg-muted/10 border-dashed border-2 border-white/10">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
            <Lock size={24} />
          </div>
          <h3 className="text-lg font-semibold text-primary">EcoCash Verification</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            Once you submit your reference code, our administrators will manually verify the payment. Access is typically granted within a few hours.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
