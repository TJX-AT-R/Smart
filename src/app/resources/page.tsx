
"use client"

import { useRef } from "react"
import { useUser } from "@/firebase"
import { MOCK_RESOURCES } from "../lib/data"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, ShoppingCart, Sparkles, Smartphone, Clock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import Image from "next/image"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel"
import Autoplay from "embla-carousel-autoplay"

export default function ResourcesPage() {
  const { user } = useUser()
  const { toast } = useToast()
  
  const plugin = useRef(Autoplay({ delay: 3000, stopOnInteraction: true }))

  const handlePurchaseClick = (title: string) => {
    toast({
      title: "Premium Content",
      description: `Access to "${title}" will be available for purchase soon.`,
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
          <Badge className="bg-secondary text-white mb-4">Premium Resources</Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 italic uppercase">Study Resources</h1>
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed">
            Master your theory with high-performance study guides and realistic mock banks. Unlock premium PDF booklets to guarantee your first-time pass.
          </p>
        </div>
      </section>

      {/* Featured Resources */}
      <section className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <Sparkles className="text-secondary h-5 w-5" />
            <h2 className="text-2xl font-bold text-white tracking-tight">Featured Modules</h2>
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
        <h2 className="text-2xl font-bold text-white tracking-tight px-2">Full Booklet Library</h2>
        <div className="grid gap-6 md:grid-cols-2">
          {MOCK_RESOURCES.map((res) => {
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
                      <span className="text-lg font-bold text-white">$5.00</span>
                    </div>
                    <CardTitle className="text-lg text-white">{res.title}</CardTitle>
                    <CardDescription className="text-xs leading-relaxed line-clamp-2">
                      {res.description}
                    </CardDescription>
                  </div>

                  <div className="mt-6">
                    <Button 
                      onClick={() => handlePurchaseClick(res.title)}
                      className="w-full bg-primary text-white hover:bg-primary/90 h-10"
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" /> Get Access
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
