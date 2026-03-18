
"use client"

import { useState, useRef } from "react"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, doc, setDoc, serverTimestamp } from "firebase/firestore"
import { MOCK_RESOURCES } from "../lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, ShoppingCart, CheckCircle, Loader2, FileText, Lock, Sparkles } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

export default function ResourcesPage() {
  const { user } = useUser()
  const db = useFirestore()
  const { toast } = useToast()
  const [isPurchasing, setIsPurchasing] = useState<string | null>(null)
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

  const handlePurchase = async (resourceId: string, title: string) => {
    if (!user) {
      toast({
        variant: "destructive",
        title: "Sign in required",
        description: "Please log in to purchase study materials.",
      })
      return
    }

    setIsPurchasing(resourceId)
    
    // Simulate payment delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    try {
      const purchaseRef = doc(collection(db, "users", user.uid, "purchases"))
      await setDoc(purchaseRef, {
        id: purchaseRef.id,
        userId: user.uid,
        studyResourceId: resourceId,
        purchaseDate: new Date().toISOString(),
        amountPaidDollars: 5,
        transactionId: `TXN-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
        createdAt: serverTimestamp()
      })

      toast({
        title: "Purchase Successful!",
        description: `You have successfully purchased ${title}.`,
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Purchase Failed",
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
            Unlock premium PDF booklets and master the road. Every resource is just <span className="text-secondary font-bold">$5</span>.
          </p>
        </div>
      </section>

      {/* Animated Featured Slides */}
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
                        <Badge className="bg-secondary text-secondary-foreground mb-2">Featured</Badge>
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

      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-white tracking-tight px-2">All Booklets</h2>
        <div className="grid gap-8 md:grid-cols-2">
          {MOCK_RESOURCES.map((res) => {
            const purchased = hasPurchased(res.id)
            const purchasing = isPurchasing === res.id

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
                        onClick={() => handlePurchase(res.id, res.title)}
                        disabled={purchasing || isPurchasesLoading}
                        className="w-full bg-primary text-white hover:bg-primary/90 h-11"
                      >
                        {purchasing ? (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                          <ShoppingCart className="mr-2 h-4 w-4" />
                        )}
                        Unlock for $5.00
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      <Card className="bg-muted/10 border-dashed border-2 border-white/10">
        <CardContent className="p-8 text-center space-y-4">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground">
            <Lock size={24} />
          </div>
          <h3 className="text-lg font-semibold text-primary">Secure Payments</h3>
          <p className="text-sm text-muted-foreground max-w-sm mx-auto">
            All transactions are processed through our secure gateway. Once purchased, your resources are permanently available in your account.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
