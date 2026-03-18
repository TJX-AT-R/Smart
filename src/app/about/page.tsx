"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Car, ShieldCheck, Zap, Target, Globe, ArrowLeft, Users, GraduationCap } from "lucide-react"

export default function AboutPage() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 sm:px-6 lg:px-12 h-20 flex items-center border-b border-white/5 sticky top-0 bg-background/40 backdrop-blur-xl z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white border border-white/10">
            <Car size={24} />
          </div>
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase italic">SmartPass</span>
        </Link>
        <nav className="ml-auto hidden md:flex gap-6 items-center">
          <Button asChild variant="ghost" className="text-muted-foreground hover:text-white">
            <Link href="/">Back to Home</Link>
          </Button>
          <Button asChild className="bg-secondary text-white hover:bg-secondary/90">
            <Link href="/login">Get Started</Link>
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        <section className="py-20 px-4 sm:px-6 relative overflow-hidden">
          <div className="container mx-auto max-w-4xl text-center space-y-8 relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary/10 border border-secondary/20 text-secondary text-xs font-bold uppercase tracking-widest mb-4">
              <ShieldCheck size={14} /> The Future of Driver Education
            </div>
            <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tighter uppercase italic">
              Empowering the <span className="text-secondary">Next Generation</span> of Drivers
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
              SmartPass is Zimbabwe's leading AI-powered driving theory platform, engineered to transform the way learners prepare for their official tests.
            </p>
          </div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-secondary/5 rounded-full blur-[120px] -z-10" />
        </section>

        <section className="py-20 bg-primary/20 border-y border-white/5">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="grid gap-12 md:grid-cols-3">
              <div className="space-y-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                  <Target size={28} />
                </div>
                <h3 className="text-xl font-bold text-white uppercase italic">Our Mission</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  To eliminate test anxiety and guarantee a first-time pass through high-performance simulations and adaptive learning.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                  <Zap size={28} />
                </div>
                <h3 className="text-xl font-bold text-white uppercase italic">AI Innovation</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  We leverage advanced GenAI to provide instant, contextual explanations for every scenario, acting as your personal 24/7 coach.
                </p>
              </div>
              <div className="space-y-4">
                <div className="w-12 h-12 bg-secondary/10 rounded-xl flex items-center justify-center text-secondary">
                  <Globe size={28} />
                </div>
                <h3 className="text-xl font-bold text-white uppercase italic">Local Expertise</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">
                  Tailored specifically for the Zimbabwean market with seamless EcoCash integration and local merchant support.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-24 px-4 sm:px-6">
          <div className="container mx-auto max-w-5xl">
            <div className="grid gap-16 lg:grid-cols-2 items-center">
              <div className="space-y-6">
                <h2 className="text-3xl sm:text-4xl font-bold text-white italic uppercase tracking-tighter">Why Choose SmartPass?</h2>
                <div className="space-y-4">
                  {[
                    { icon: GraduationCap, title: "Structured Syllabus", desc: "Every module is designed to match official theory requirements." },
                    { icon: ShieldCheck, title: "Secure Payouts", desc: "Official EcoCash merchant gateway for safe study booklet purchases." },
                    { icon: Users, title: "Community Driven", desc: "Thousands of successful learners have joined our high-performance program." }
                  ].map((item, i) => (
                    <div key={i} className="flex gap-4 p-4 rounded-2xl bg-card/40 border border-white/5 hover:border-secondary/30 transition-all group">
                      <div className="shrink-0 w-10 h-10 rounded-lg bg-secondary/10 flex items-center justify-center text-secondary group-hover:bg-secondary group-hover:text-white transition-colors">
                        <item.icon size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-white uppercase italic text-sm">{item.title}</h4>
                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl relative">
                  <img 
                    src="https://picsum.photos/seed/about-pass/800/800" 
                    alt="Success rate" 
                    className="object-cover w-full h-full opacity-60 grayscale hover:grayscale-0 transition-all duration-700"
                    data-ai-hint="driving success"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
                  <div className="absolute bottom-10 left-10">
                    <div className="text-6xl font-bold text-secondary italic tracking-tighter">98%</div>
                    <div className="text-xs uppercase tracking-widest font-bold text-white">First-Time Pass Rate</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-12 px-4 sm:px-6 bg-muted/20 backdrop-blur-sm">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white border border-white/10">
              <Car size={18} />
            </div>
            <span className="font-bold text-xl text-white uppercase italic">SmartPass</span>
          </div>
          <p className="text-xs text-muted-foreground">© 2026 SmartPass Coach. Engineered for future drivers.</p>
          <div className="flex gap-6">
            <Link className="text-xs font-medium text-muted-foreground hover:text-secondary transition-colors" href="/">Home</Link>
            <Link className="text-xs font-medium text-muted-foreground hover:text-secondary transition-colors" href="/login">Login</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
