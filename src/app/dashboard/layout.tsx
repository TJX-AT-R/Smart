
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { SidebarNav } from "@/components/SidebarNav"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <SidebarProvider>
      <SidebarNav />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-6 sticky top-0 bg-background/80 backdrop-blur-sm z-10">
          <SidebarTrigger />
          <div className="flex-1" />
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium hidden sm:inline-block">Welcome back, Learner!</span>
            <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-white">
              JD
            </div>
          </div>
        </header>
        <main className="flex-1 p-6 md:p-8 bg-background">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
