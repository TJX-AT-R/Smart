"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Car, CheckCircle, BookOpen, Clock, ShieldCheck, Menu, ShieldAlert, LogOut } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { useState } from "react"
import { useUser, useAuth } from "@/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const auth = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut(auth);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <header className="px-6 lg:px-12 h-20 flex items-center border-b border-white/5 sticky top-0 bg-background/40 backdrop-blur-xl z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white border border-white/10">
            <Car size={24} />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">DriveSmart</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="ml-auto hidden md:flex gap-6 sm:gap-10 items-center">
          <Link className="text-sm font-medium text-muted-foreground hover:text-secondary transition-colors" href="#features">
            Features
          </Link>
          <Link className="text-sm font-medium text-muted-foreground hover:text-secondary transition-colors" href="/resources">
            Study Resources
          </Link>
          <Link className="text-sm font-medium text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1" href="/admin/login">
            <ShieldAlert size={14} /> Admin
          </Link>
          {user ? (
            <div className="flex items-center gap-4">
              <Button asChild variant="secondary" size="sm">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-white">
                <LogOut size={16} className="mr-2" /> Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-4">
              <Link className="text-sm font-medium text-muted-foreground hover:text-secondary transition-colors" href="/login">
                Login
              </Link>
              <Button asChild className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                <Link href="/login">Get Started</Link>
              </Button>
            </div>
          )}
        </nav>

        {/* Mobile Hamburger Menu */}
        <div className="ml-auto md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-l-white/10">
              <nav className="flex flex-col gap-6 mt-12">
                <Link 
                  className="text-2xl font-semibold text-white hover:text-secondary transition-colors" 
                  href="#features"
                  onClick={() => setIsOpen(false)}
                >
                  Features
                </Link>
                <Link 
                  className="text-2xl font-semibold text-white hover:text-secondary transition-colors" 
                  href="/resources"
                  onClick={() => setIsOpen(false)}
                >
                  Study Resources
                </Link>
                {!user ? (
                  <>
                    <Link 
                      className="text-2xl font-semibold text-white hover:text-secondary transition-colors" 
                      href="/login"
                      onClick={() => setIsOpen(false)}
                    >
                      Login
                    </Link>
                    <Link 
                      className="text-2xl font-semibold text-white hover:text-secondary transition-colors" 
                      href="/login?tab=signup"
                      onClick={() => setIsOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                ) : (
                  <button 
                    className="text-2xl font-semibold text-left text-white hover:text-secondary transition-colors flex items-center gap-2" 
                    onClick={handleLogout}
                  >
                    <LogOut size={24} /> Logout
                  </button>
                )}
                <div className="border-t border-white/10 pt-6">
                  <Link 
                    className="text-xl font-medium text-destructive hover:text-destructive/80 transition-colors flex items-center gap-2" 
                    href="/admin/login"
                    onClick={() => setIsOpen(false)}
                  >
                    <ShieldAlert size={20} /> Admin Portal
                  </Link>
                </div>
                <Button asChild className="mt-4 bg-secondary text-secondary-foreground h-14 text-lg">
                  <Link href={user ? "/dashboard" : "/login"} onClick={() => setIsOpen(false)}>
                    {user ? "Go to Dashboard" : "Start Learning"}
                  </Link>
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      <main className="flex-1">
        <section className="w-full py-20 md:py-32 lg:py-48 px-6 relative overflow-hidden">
          <div className="container mx-auto">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="flex flex-col justify-center space-y-10 animate-in slide-in-from-left duration-700 relative z-10">
                <div className="space-y-6">
                  <h1 className="text-5xl font-extrabold tracking-tighter sm:text-6xl xl:text-8xl/none text-white">
                    Pass Your Theory <span className="text-secondary">First Time</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground md:text-xl leading-relaxed">
                    The ultimate driving theory coach with realistic mock tests and structured modules for your success.
                  </p>
                </div>
                <div className="flex flex-col gap-4 min-[400px]:flex-row">
                  <Button asChild size="lg" className="h-16 px-10 text-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-xl shadow-secondary/20">
                    <Link href="/login">Get Started Free</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-16 px-10 text-xl border-white/10 hover:bg-white/5 text-white">
                    <Link href="#features">How it works</Link>
                  </Button>
                </div>
                <div className="flex items-center gap-8 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-secondary h-5 w-5" />
                    <span>Official DVSA Bank</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-secondary h-5 w-5" />
                    <span>Realistic Simulations</span>
                  </div>
                </div>
              </div>
              <div className="relative animate-in zoom-in duration-1000 delay-200">
                <div className="absolute -inset-20 bg-secondary/20 rounded-full blur-[120px] opacity-30" />
                <div className="relative border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    alt="DriveSmart Dashboard Preview"
                    className="w-full object-cover aspect-[4/3]"
                    src="https://picsum.photos/seed/theory-test/1000/750"
                    data-ai-hint="driving simulator dashboard"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent opacity-60" />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full py-32 relative">
          <div className="container mx-auto px-6">
            <div className="text-center space-y-4 mb-20">
              <h2 className="text-4xl font-bold tracking-tighter sm:text-5xl text-white">Everything You Need</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Clean, efficient tools designed for one purpose: helping you pass.</p>
            </div>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard 
                icon={<BookOpen size={32} />}
                title="Theory Modules"
                description="Comprehensive lessons structured to follow the official DVSA syllabus."
              />
              <FeatureCard 
                icon={<ShieldCheck size={32} />}
                title="Secure Progress"
                description="Your study history and scores are safely synced across all your devices."
                highlight
              />
              <FeatureCard 
                icon={<Clock size={32} />}
                title="Timed Mock Tests"
                description="Practice with 8-minute timed sessions that feel like the real thing."
              />
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t border-white/5 py-16 px-6 bg-muted/20 backdrop-blur-sm">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white border border-white/10">
              <Car size={18} />
            </div>
            <span className="font-bold text-xl text-white">DriveSmart</span>
          </div>
          <p className="text-sm text-muted-foreground">© 2024 DriveSmart Coach. Built for future drivers.</p>
          <div className="flex gap-8">
            <Link className="text-sm font-medium text-muted-foreground hover:text-secondary transition-colors" href="/admin/login">Admin Login</Link>
            <Link className="text-sm font-medium text-muted-foreground hover:text-secondary transition-colors" href="#">Privacy</Link>
            <Link className="text-sm font-medium text-muted-foreground hover:text-secondary transition-colors" href="#">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, highlight = false }: { icon: any, title: string, description: string, highlight?: boolean }) {
  return (
    <div className={`p-10 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${highlight ? 'bg-primary/40 border-secondary/30 shadow-2xl shadow-secondary/5' : 'bg-card/30 border-white/5 hover:border-white/10'}`}>
      <div className="w-16 h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-8">
        {icon}
      </div>
      <h3 className="text-2xl font-bold mb-4 text-white">{title}</h3>
      <p className="text-muted-foreground leading-relaxed text-lg">
        {description}
      </p>
    </div>
  )
}
