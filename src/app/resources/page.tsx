
"use client"

import { useState, useRef } from "react"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore"
import { MOCK_RESOURCES } from "../lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, ShoppingCart, CheckCircle, Loader2, FileText, Lock, Sparkles, Smartphone, CreditCard, ArrowRight } from "lucide-react"
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
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'ecocash' | null>(null)
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
    if (!user || !selectedResource || !paymentMethod) return

    if (paymentMethod === 'ecocash' && !transactionRef) {
      toast({
        variant: "destructive",
        title: "Reference Required",
        description: "Please enter your EcoCash transaction reference.",
      })
      return
    }

    setIsPurchasing(selectedResource.id)
    
    // Simulate payment processing
    await new Promise(resolve => setTimeout(resolve, 2000))

    try {
      const purchaseRef = doc(collection(db, "users", user.uid, "purchases"))
      await setDoc(purchaseRef, {
        id: purchaseRef.id,
        userId: user.uid,
        studyResourceId: selectedResource.id,
        purchaseDate: new Date().toISOString(),
        amountPaidDollars: 5,
        paymentMethod: paymentMethod,
        transactionId: paymentMethod === 'ecocash' ? transactionRef : `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        status: paymentMethod === 'ecocash' ? 'pending_verification' : 'completed',
        createdAt: serverTimestamp()
      })

      toast({
        title: paymentMethod === 'ecocash' ? "Payment Submitted" : "Purchase Successful!",
        description: paymentMethod === 'ecocash' 
          ? "Your EcoCash payment is being verified. Access will be granted shortly."
          : `You have successfully purchased ${selectedResource.title}.`,
      })
      
      // Close dialog
      setSelectedResource(null)
      setPaymentMethod(null)
      setTransactionRef("")
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Transaction Failed",
        description: error.message || "Something went wrong during the transaction.",
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
            Unlock premium PDF booklets and master the road. Pay via Card or <span className="text-secondary font-bold font-mono">EcoCash</span>.
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
            const isSelected = selectedResource?.id === res.id

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
                        <ShoppingCart className="mr-2 h-4 w-4" /> Unlock for $5.00
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Payment Dialog */}
      <Dialog open={!!selectedResource} onOpenChange={(open) => !open && setSelectedResource(null)}>
        <DialogContent className="bg-card border-white/5 sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Complete Purchase</DialogTitle>
            <DialogDescription>
              Select your preferred payment method for <span className="text-white font-semibold">{selectedResource?.title}</span>.
            </DialogDescription>
          </DialogHeader>

          {!paymentMethod ? (
            <div className="grid grid-cols-1 gap-4 py-4">
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-2 border-white/10 hover:border-secondary/50 hover:bg-secondary/5"
                onClick={() => setPaymentMethod('ecocash')}
              >
                <Smartphone className="text-secondary" />
                <span>Pay via EcoCash</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex flex-col items-center justify-center gap-2 border-white/10 hover:border-primary/50 hover:bg-primary/5"
                onClick={() => setPaymentMethod('card')}
              >
                <CreditCard className="text-primary" />
                <span>Pay via Card</span>
              </Button>
            </div>
          ) : paymentMethod === 'ecocash' ? (
            <div className="space-y-6 py-4">
              <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20 space-y-2">
                <p className="text-xs font-bold uppercase tracking-wider text-secondary">Instructions</p>
                <p className="text-sm text-white">
                  Send <span className="font-bold">$5.00</span> to the following EcoCash account:
                </p>
                <div className="flex items-center justify-between bg-background/50 p-3 rounded-lg border border-white/5">
                  <span className="text-lg font-mono font-bold text-secondary">{ECO_CASH_NUMBER}</span>
                  <Badge variant="secondary" className="text-[10px]">Merchant/Agent</Badge>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ref" className="text-xs">Transaction Reference (ID)</Label>
                <Input 
                  id="ref" 
                  placeholder="Enter the EcoCash Ref code" 
                  value={transactionRef}
                  onChange={(e) => setTransactionRef(e.target.value)}
                  className="bg-background/50 border-white/10"
                />
                <p className="text-[10px] text-muted-foreground">This is the unique code received in your confirmation SMS.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              <div className="p-4 rounded-xl bg-primary/10 border border-primary/20">
                <p className="text-sm text-center italic text-muted-foreground">Standard credit/debit card checkout simulation.</p>
              </div>
              <Button variant="outline" className="w-full" disabled>
                Continue to Secure Processor
              </Button>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button variant="ghost" onClick={() => setPaymentMethod(null)} disabled={isPurchasing || !paymentMethod}>
              Change Method
            </Button>
            <Button 
              className="bg-secondary text-white hover:bg-secondary/90 min-w-[120px]" 
              onClick={handlePurchase}
              disabled={isPurchasing || !paymentMethod}
            >
              {isPurchasing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <ArrowRight className="h-4 w-4 mr-2" />}
              {paymentMethod === 'ecocash' ? 'Confirm Payment' : 'Complete Purchase'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Card className="bg-muted/10 border-dashed border-2 border-white/10">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
            <Lock size={24} />
          </div>
          <h3 className="text-lg font-semibold text-primary">Secure Multi-Channel Payments</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            We support both EcoCash and standard Card payments. Your resources are permanently linked to your account once verified.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
