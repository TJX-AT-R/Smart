
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth, useFirestore, useUser } from "@/firebase"
import { signInWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth"
import { doc, getDoc } from "firebase/firestore"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ShieldAlert, Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

// Obfuscated Admin Email: ncubethubelihle483@gmail.com
const ENC_A = "bmN1YmV0aHViZWxpaGxlNDgzQGdtYWlsLmNvbQ==";
const getAdminEmail = () => typeof window !== 'undefined' ? window.atob(ENC_A) : "";

export default function AdminLoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isResetLoading, setIsResetLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [resetEmail, setResetEmail] = useState("")
  const [isResetOpen, setIsResetOpen] = useState(false)
  
  const auth = useAuth()
  const db = useFirestore()
  const { user, isUserLoading } = useUser()
  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    async function checkAdmin() {
      if (user) {
        const adminEmail = getAdminEmail();
        if (user.email === adminEmail) {
          router.push("/admin/dashboard")
          return
        }
        
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists() && userDoc.data().isAdmin) {
          router.push("/admin/dashboard")
        }
      }
    }
    if (!isUserLoading) {
      checkAdmin()
    }
  }, [user, isUserLoading, router, db])

  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const loggedInUser = userCredential.user
      const adminEmail = getAdminEmail();
      
      if (loggedInUser.email === adminEmail) {
        toast({
          title: "Absolute Admin Access Granted",
          description: `Welcome back, System Administrator.`,
        })
        router.push("/admin/dashboard")
        return
      }

      const userDoc = await getDoc(doc(db, "users", loggedInUser.uid))
      if (userDoc.exists() && userDoc.data().isAdmin) {
        toast({
          title: "Admin Access Granted",
          description: "Welcome to the administrator panel.",
        })
        router.push("/admin/dashboard")
      } else {
        await auth.signOut()
        toast({
          variant: "destructive",
          title: "Access Denied",
          description: "This account does not have administrator privileges.",
        })
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Login Failed",
        description: error.message || "Invalid credentials.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!resetEmail) {
      toast({ variant: "destructive", title: "Email required", description: "Please enter your email address." })
      return
    }
    setIsResetLoading(true)
    try {
      await sendPasswordResetEmail(auth, resetEmail)
      toast({
        title: "Reset Email Sent",
        description: "Check your inbox for password reset instructions.",
      })
      setIsResetOpen(false)
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Could not send reset email.",
      })
    } finally {
      setIsResetLoading(false)
    }
  }

  if (isUserLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
      <div className="absolute inset-0 bg-primary/20 backdrop-blur-3xl -z-10" />
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
            <ArrowLeft className="h-4 w-4 text-muted-foreground group-hover:text-secondary transition-colors" />
            <span className="text-sm text-muted-foreground group-hover:text-secondary transition-colors">Back to Site</span>
          </Link>
          <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mx-auto mb-6 border border-destructive/20 shadow-xl">
            <ShieldAlert size={40} />
          </div>
          <h2 className="text-3xl font-extrabold text-white tracking-tight uppercase italic">SmartPass Admin</h2>
          <p className="mt-2 text-sm text-muted-foreground">Authorized Access Only</p>
        </div>

        <Card className="border-none bg-card/40 backdrop-blur-xl shadow-2xl border-t border-white/5">
          <form onSubmit={handleAdminLogin}>
            <CardHeader>
              <CardTitle>Sign In</CardTitle>
              <CardDescription>Enter administrator credentials to proceed.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="admin-email">Admin Email</Label>
                <Input 
                  id="admin-email" 
                  type="email" 
                  placeholder="admin@smartpass.co.zw" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-background/50 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="admin-password">Password</Label>
                  <Dialog open={isResetOpen} onOpenChange={setIsResetOpen}>
                    <DialogTrigger asChild>
                      <Button variant="link" className="px-0 font-normal text-xs text-destructive hover:text-destructive/80 h-auto">
                        Forgot password?
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-card border-white/5">
                      <DialogHeader>
                        <DialogTitle>Admin Password Reset</DialogTitle>
                        <DialogDescription>
                          Enter your admin email address to receive a reset link.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="py-4">
                        <Label htmlFor="admin-reset-email">Email Address</Label>
                        <Input 
                          id="admin-reset-email" 
                          type="email" 
                          placeholder="admin@example.com" 
                          value={resetEmail}
                          onChange={(e) => setResetEmail(e.target.value)}
                          className="bg-background/50 border-white/10 mt-2"
                        />
                      </div>
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsResetOpen(false)} disabled={isResetLoading}>Cancel</Button>
                        <Button className="bg-destructive text-white hover:bg-destructive/90" onClick={handlePasswordReset} disabled={isResetLoading}>
                          {isResetLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                          Send Reset Link
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
                <Input 
                  id="admin-password" 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-background/50 border-white/10"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button type="submit" className="w-full bg-destructive text-white hover:bg-destructive/90 h-12 text-lg shadow-lg shadow-destructive/20" disabled={isLoading}>
                {isLoading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : "Verify Access"}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  )
}
