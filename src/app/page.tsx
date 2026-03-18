
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Car, CheckCircle, BookOpen, Clock, ShieldCheck, Sparkles } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-6 lg:px-12 h-20 flex items-center border-b sticky top-0 bg-background/80 backdrop-blur-md z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white">
            <Car size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-primary">DriveSmart Coach</span>
        </Link>
        <nav className="ml-auto flex gap-6 sm:gap-10">
          <Link className="text-sm font-medium hover:text-secondary transition-colors" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium hover:text-secondary transition-colors" href="/dashboard">
            Login
          </Link>
        </nav>
      </header>
      <main className="flex-1">
        <section className="w-full py-12 md:py-24 lg:py-32 xl:py-48 px-6 overflow-hidden">
          <div className="container mx-auto">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="flex flex-col justify-center space-y-8 animate-in slide-in-from-left duration-700">
                <div className="space-y-4">
                  <h1 className="text-4xl font-extrabold tracking-tighter sm:text-5xl xl:text-7xl/none text-primary">
                    Pass Your Theory Test <span className="text-secondary underline decoration-4 underline-offset-8">First Time</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed">
                    Personalized driving theory coach with AI-powered explanations, official question banks, and realistic mock tests.
                  </p>
                </div>
                <div className="flex flex-col gap-4 min-[400px]:flex-row">
                  <Button asChild size="lg" className="h-14 px-8 text-lg bg-primary hover:bg-primary/90">
                    <Link href="/dashboard">Start Learning Free</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-14 px-8 text-lg border-2 border-primary/20 hover:bg-primary/5">
                    <Link href="#features">Explore Features</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-secondary h-4 w-4" />
                    <span>Official DVSA Bank</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-secondary h-4 w-4" />
                    <span>AI Tutor Included</span>
                  </div>
                </div>
              </div>
              <div className="relative animate-in zoom-in duration-700 delay-200">
                <div className="absolute -inset-4 bg-secondary/10 rounded-full blur-3xl" />
                <img
                  alt="DriveSmart Dashboard"
                  className="relative mx-auto rounded-2xl shadow-2xl border-4 border-white object-cover aspect-[4/3] w-full"
                  src="https://picsum.photos/seed/dash/800/600"
                  data-ai-hint="driving app"
                />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-24 bg-primary/5">
          <div className="container mx-auto px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-primary">Master the Road</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">Everything you need to succeed in one clean, easy-to-use platform.</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary mb-6">
                  <BookOpen size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary">Theory Modules</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Structured lessons covering essential topics, road signs, and hazard perception rules.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary mb-6">
                  <Sparkles size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary">AI Smart Tutor</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Get detailed, AI-generated explanations for incorrect answers to truly understand the reasoning.
                </p>
              </div>
              <div className="bg-white p-8 rounded-2xl shadow-sm border hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary mb-6">
                  <Clock size={24} />
                </div>
                <h3 className="text-xl font-bold mb-3 text-primary">Realistic Mock Tests</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Timed tests designed to mimic the format and difficulty of the official driving theory exam.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-12 px-6">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Car className="text-primary h-6 w-6" />
            <span className="font-bold text-lg text-primary">DriveSmart Coach</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 DriveSmart Coach. All rights reserved.</p>
          <div className="flex gap-6">
            <Link className="text-sm text-muted-foreground hover:text-primary" href="#">Privacy</Link>
            <Link className="text-sm text-muted-foreground hover:text-primary" href="#">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
