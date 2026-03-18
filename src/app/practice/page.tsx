
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MOCK_QUESTIONS } from "../lib/data"
import { Car, Shield, Triangle, Zap, Map, ChevronRight, LayoutGrid } from "lucide-react"
import Link from "next/link"

const categories = [
  { name: 'Road Signs', icon: Triangle, count: 45, color: 'bg-red-50 text-red-600' },
  { name: 'Rules of the Road', icon: Shield, count: 120, color: 'bg-blue-50 text-blue-600' },
  { name: 'Safety', icon: Car, count: 80, color: 'bg-green-50 text-green-600' },
  { name: 'Hazard Perception', icon: Zap, count: 35, color: 'bg-yellow-50 text-yellow-600' },
  { name: 'Motorway', icon: Map, count: 50, color: 'bg-purple-50 text-purple-600' },
]

export default function PracticePage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-6xl mx-auto px-4 sm:px-0">
      <section className="p-8 sm:p-12 rounded-3xl bg-secondary/20 border border-secondary/30 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-secondary/10 rounded-full blur-3xl opacity-50" />
        <div className="relative z-10">
          <h1 className="text-3xl sm:text-5xl font-bold text-secondary mb-3 italic uppercase tracking-tighter">Practice Bank</h1>
          <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl leading-relaxed">
            Focus your high-performance training on specific categories. Build absolute mastery before entering the simulation.
          </p>
        </div>
      </section>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Card key={cat.name} className="group hover:shadow-2xl transition-all duration-300 border-white/5 bg-card/40 backdrop-blur-md overflow-hidden flex flex-col">
            <CardHeader className="pb-4 relative">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${cat.color} group-hover:scale-110 transition-transform duration-500 shadow-lg`}>
                <cat.icon size={24} />
              </div>
              <CardTitle className="text-xl text-white italic">{cat.name}</CardTitle>
              <CardDescription className="text-xs uppercase tracking-widest font-bold text-muted-foreground">{cat.count} Scenarios</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto pt-4 border-t border-white/5">
              <Button asChild className="w-full bg-primary text-white hover:bg-primary/90 h-12 font-bold uppercase tracking-widest text-[10px]" variant="default">
                <Link href={`/practice/${encodeURIComponent(cat.name)}`} className="flex items-center justify-center gap-2">
                  Initiate Training <ChevronRight size={14} />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-primary/40 border-white/5 shadow-2xl overflow-hidden relative group">
        <div className="absolute inset-0 bg-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
        <CardContent className="p-10 sm:p-16 text-center space-y-6 relative z-10">
          <div className="w-16 h-16 bg-secondary/20 rounded-2xl flex items-center justify-center mx-auto text-secondary mb-2">
            <LayoutGrid size={32} />
          </div>
          <h3 className="text-2xl sm:text-3xl font-bold text-white uppercase italic tracking-tighter">Randomized Scenario Mix</h3>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm sm:text-base leading-relaxed">
            Challenge your mental agility with a shuffled bank of questions from all categories. 
          </p>
          <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90 h-14 px-10 text-lg font-bold shadow-xl shadow-secondary/20 uppercase italic tracking-tighter">
            Start Hybrid Practice
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
