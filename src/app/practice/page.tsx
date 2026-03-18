
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MOCK_QUESTIONS } from "../lib/data"
import { Car, Shield, Triangle, Zap, Map } from "lucide-react"
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
    <div className="space-y-8 animate-in fade-in duration-500">
      <section>
        <h1 className="text-3xl font-bold text-primary mb-2">Practice Bank</h1>
        <p className="text-muted-foreground">Focus your studies on specific topics to build your knowledge.</p>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((cat) => (
          <Card key={cat.name} className="hover:shadow-md transition-shadow cursor-pointer border-border/50 group">
            <CardHeader className="pb-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${cat.color} group-hover:scale-110 transition-transform`}>
                <cat.icon size={20} />
              </div>
              <CardTitle className="text-lg">{cat.name}</CardTitle>
              <CardDescription>{cat.count} Questions available</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild className="w-full bg-primary" variant="default">
                <Link href={`/practice/${encodeURIComponent(cat.name)}`}>Start Practice</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-secondary/5 border-secondary/20">
        <CardContent className="p-8 text-center space-y-4">
          <h3 className="text-xl font-bold text-primary">Master All Topics</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            Feeling confident? Try a random mix of questions from all categories to test your overall preparedness.
          </p>
          <Button size="lg" className="bg-secondary text-white hover:bg-secondary/90">
            Start Random Mix
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
