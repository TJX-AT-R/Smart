
"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Car, CheckCircle, BookOpen, Clock, ShieldCheck, Menu, ShieldAlert, LogOut, ChevronRight, ClipboardCheck, Info } from "lucide-react"
import { Sheet, SheetContent, SheetTrigger, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet"
import { useState } from "react"
import { useUser, useAuth } from "@/firebase"
import { signOut } from "firebase/auth"
import { useRouter } from "next/navigation"

export default function LandingPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();
  const auth = useAuth();

  const handleLogout = async () => {
    await signOut(auth);
    setIsOpen(false);
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="px-4 sm:px-6 lg:px-12 h-20 flex items-center border-b border-white/5 sticky top-0 bg-background/40 backdrop-blur-xl z-50">
        <Link className="flex items-center justify-center gap-2" href="/">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-white border border-white/10">
            <Car size={24} />
          </div>
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-white uppercase italic">SmartPass</span>
        </Link>
        
        <nav className="ml-auto hidden md:flex gap-6 lg:gap-10 items-center">
          <Link className="text-sm font-medium text-muted-foreground hover:text-secondary transition-colors" href="/about">
            About Us
          </Link>
          <Link className="text-sm font-medium text-muted-foreground hover:text-secondary transition-colors" href="/practice">
            Practice Bank
          </Link>
          <Link className="text-sm font-medium text-muted-foreground hover:text-secondary transition-colors" href="/mock-test">
            Mock Tests
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

        <div className="ml-auto md:hidden">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="text-white">
                <Menu size={24} />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="bg-background border-l-white/10 w-[85vw] sm:w-[400px]">
              <SheetHeader className="sr-only">
                <SheetTitle>Navigation Menu</SheetTitle>
                <SheetDescription>Access site features and account settings.</SheetDescription>
              </SheetHeader>
              <nav className="flex flex-col gap-6 mt-12">
                <Link 
                  className="text-2xl font-semibold text-white hover:text-secondary transition-colors flex items-center gap-4" 
                  href="/about"
                  onClick={() => setIsOpen(false)}
                >
                  <Info size={24} className="text-secondary" /> About Us
                </Link>
                <Link 
                  className="text-2xl font-semibold text-white hover:text-secondary transition-colors flex items-center gap-4" 
                  href="/practice"
                  onClick={() => setIsOpen(false)}
                >
                  <BookOpen size={24} className="text-secondary" /> Practice Bank
                </Link>
                <Link 
                  className="text-2xl font-semibold text-white hover:text-secondary transition-colors flex items-center gap-4" 
                  href="/mock-test"
                  onClick={() => setIsOpen(false)}
                >
                  <ClipboardCheck size={24} className="text-secondary" /> Mock Tests
                </Link>
                <Link 
                  className="text-2xl font-semibold text-white hover:text-secondary transition-colors flex items-center gap-4" 
                  href="/resources"
                  onClick={() => setIsOpen(false)}
                >
                  <ShieldCheck size={24} className="text-secondary" /> Study Resources
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
                    className="text-2xl font-semibold text-left text-white hover:text-secondary transition-colors flex items-center gap-4" 
                    onClick={handleLogout}
                  >
                    <LogOut size={24} className="text-secondary" /> Logout
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
                <Button asChild className="mt-4 bg-secondary text-secondary-foreground h-14 text-lg w-full">
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
        <section className="w-full py-12 sm:py-20 md:py-32 lg:py-48 px-4 sm:px-6 relative overflow-hidden">
          <div className="container mx-auto">
            <div className="grid gap-12 lg:grid-cols-2 items-center">
              <div className="flex flex-col justify-center space-y-8 sm:space-y-10 animate-in slide-in-from-left duration-700 relative z-10 text-center lg:text-left">
                <div className="space-y-4 sm:space-y-6">
                  <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-8xl/none font-extrabold tracking-tighter text-white uppercase italic">
                    SmartPass <br /><span className="text-secondary font-normal not-italic block sm:inline">First Time Success</span>
                  </h1>
                  <p className="max-w-[600px] text-muted-foreground text-base sm:text-lg md:text-xl leading-relaxed mx-auto lg:mx-0">
                    The futuristic driving theory coach with realistic mock tests and high-performance study modules.
                  </p>
                </div>
                <div className="flex flex-col gap-4 sm:flex-row justify-center lg:justify-start">
                  <Button asChild size="lg" className="h-14 sm:h-16 px-8 sm:px-10 text-lg sm:text-xl bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-xl shadow-secondary/20">
                    <Link href="/login">Get Started Free</Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="h-14 sm:h-16 px-8 sm:px-10 text-lg sm:text-xl border-white/10 hover:bg-white/5 text-white">
                    <Link href="/about">Learn More</Link>
                  </Button>
                </div>
                <div className="flex flex-wrap justify-center lg:justify-start items-center gap-4 sm:gap-8 text-xs sm:text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-secondary h-4 w-4 sm:h-5 sm:w-5" />
                    <span>Guaranteed Pass</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle className="text-secondary h-4 w-4 sm:h-5 sm:w-5" />
                    <span>professionally prepared tests</span>
                  </div>
                </div>
              </div>
              <div className="relative animate-in zoom-in duration-1000 delay-200 hidden sm:block lg:block">
                <div className="absolute -inset-20 bg-secondary/20 rounded-full blur-[120px] opacity-30" />
                <div className="relative border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
                  <img
                    alt="SmartPass Dashboard Preview"
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

        <section id="features" className="w-full py-20 sm:py-32 relative">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="text-center space-y-4 mb-12 sm:mb-20">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tighter text-white">Advanced Learning</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg">Precision tools engineered to guarantee your driving theory success.</p>
            </div>
            <div className="grid gap-6 sm:gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <FeatureCard 
                icon={<BookOpen size={32} />}
                title="Theory Modules"
                description="Comprehensive lessons structured to follow the official syllabus."
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
                description="Practice with 20-minute timed sessions that feel like the real thing."
              />
            </div>
          </div>
        </section>
      </main>
      
      <footer className="border-t border-white/5 py-12 sm:py-16 px-4 sm:px-6 bg-muted/20 backdrop-blur-sm">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-8 sm:gap-10">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-white border border-white/10">
              <Car size={18} />
            </div>
            <span className="font-bold text-xl text-white uppercase italic">SmartPass</span>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground text-center md:text-left">© 2024 SmartPass Coach. Engineered for future drivers.</p>
          <div className="flex flex-wrap justify-center gap-6 sm:gap-8">
            <Link className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-secondary transition-colors" href="/about">About Us</Link>
            <Link className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-secondary transition-colors" href="/admin/login">Admin Login</Link>
            <Link className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-secondary transition-colors" href="#">Privacy</Link>
            <Link className="text-xs sm:text-sm font-medium text-muted-foreground hover:text-secondary transition-colors" href="#">Terms</Link>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, title, description, highlight = false }: { icon: any, title: string, description: string, highlight?: boolean }) {
  return (
    <div className={`p-8 sm:p-10 rounded-3xl border transition-all duration-300 hover:-translate-y-1 ${highlight ? 'bg-primary/40 border-secondary/30 shadow-2xl shadow-secondary/5' : 'bg-card/30 border-white/5 hover:border-white/10'}`}>
      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-secondary/10 rounded-2xl flex items-center justify-center text-secondary mb-6 sm:mb-8">
        {icon}
      </div>
      <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-white">{title}</h3>
      <p className="text-muted-foreground leading-relaxed text-sm sm:text-lg">
        {description}
      </p>
    </div>
  )
}
