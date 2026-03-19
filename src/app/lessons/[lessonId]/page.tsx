
"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function LessonDetailPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace("/dashboard")
  }, [router])

  return (
    <div className="flex h-screen w-full items-center justify-center">
      <p className="text-muted-foreground animate-pulse font-bold uppercase tracking-widest text-xs">Redirecting to Dashboard...</p>
    </div>
  )
}
