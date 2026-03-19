
"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, doc, getDoc, setDoc, deleteDoc, serverTimestamp, updateDoc } from "firebase/firestore"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { 
  Plus, 
  Trash2, 
  Loader2, 
  ChevronLeft, 
  Download,
  BookOpen,
  Pencil,
  ExternalLink
} from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { MOCK_RESOURCES } from "@/app/lib/data"

const SUPER_ADMIN_EMAIL = "ncubethubelihle483@gmail.com"

export default function AdminResourcesPage() {
  const { user, isUserLoading } = useUser()
  const db = useFirestore()
  const router = useRouter()
  const { toast } = useToast()
  
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [isSeeding, setIsSeeding] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Resource Form State
  const [resourceForm, setResourceForm] = useState({
    title: "",
    description: "",
    priceDollars: 5,
    downloadUrl: "",
    thumbnailUrl: "https://picsum.photos/seed/booklet/400/600"
  })

  useEffect(() => {
    async function verifyAdmin() {
      if (user) {
        if (user.email === SUPER_ADMIN_EMAIL) {
          setIsAdmin(true)
          return
        }
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists() && userDoc.data().isAdmin) {
          setIsAdmin(true)
        } else {
          router.push("/admin/login")
        }
      } else if (!isUserLoading) {
        router.push("/admin/login")
      }
    }
    verifyAdmin()
  }, [user, isUserLoading, router, db])

  const resourcesQuery = useMemoFirebase(() => {
    if (!db || isAdmin === null) return null
    return query(collection(db, "studyResources"), orderBy("createdAt", "desc"))
  }, [db, isAdmin])

  const { data: resources, isLoading: isResourcesLoading } = useCollection(resourcesQuery)

  const handleOpenAddDialog = () => {
    setEditingId(null)
    setResourceForm({ title: "", description: "", priceDollars: 5, downloadUrl: "", thumbnailUrl: "https://picsum.photos/seed/booklet/400/600" })
    setIsDialogOpen(true)
  }

  const handleOpenEditDialog = (res: any) => {
    setEditingId(res.id)
    setResourceForm({
      title: res.title,
      description: res.description,
      priceDollars: res.priceDollars,
      downloadUrl: res.downloadUrl,
      thumbnailUrl: res.thumbnailUrl || "https://picsum.photos/seed/booklet/400/600"
    })
    setIsDialogOpen(true)
  }

  const handleSaveResource = async () => {
    if (!db || !resourceForm.title || !resourceForm.downloadUrl) {
      toast({ variant: "destructive", title: "Validation Error", description: "Resources must have a title and a download URL." })
      return
    }

    setIsSaving(true)
    try {
      if (editingId) {
        const resourceRef = doc(db, "studyResources", editingId)
        await updateDoc(resourceRef, {
          ...resourceForm,
          updatedAt: serverTimestamp()
        })
        toast({ title: "Resource Updated", description: "Successfully updated in the library." })
      } else {
        const resourceRef = doc(collection(db, "studyResources"))
        await setDoc(resourceRef, {
          ...resourceForm,
          id: resourceRef.id,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
        toast({ title: "Resource Added", description: "Successfully added to the booklet library." })
      }
      setIsDialogOpen(false)
    } catch (error: any) {
      toast({ variant: "destructive", title: "Sync Error", description: error.message })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteResource = async (id: string) => {
    if (!db || !confirm("Permanently remove this booklet from the library?")) return
    setIsDeleting(id)
    try {
      await deleteDoc(doc(db, "studyResources", id))
      toast({ title: "Resource Terminated" })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    } finally {
      setIsDeleting(null)
    }
  }

  const handleSeedResources = async () => {
    if (!db) return
    setIsSeeding(true)
    try {
      for (const res of MOCK_RESOURCES) {
        const resourceRef = doc(collection(db, "studyResources"), res.id)
        await setDoc(resourceRef, {
          ...res,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }
      toast({ title: "Seed Successful", description: "Study library synchronized." })
    } catch (error: any) {
      toast({ variant: "destructive", title: "Error", description: error.message })
    } finally {
      setIsSeeding(false)
    }
  }

  if (isUserLoading || isAdmin === null) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-secondary" />
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-8 space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center md:items-start">
          <Button variant="ghost" size="sm" onClick={() => router.push("/admin/dashboard")} className="gap-2 mb-4 hover:bg-white/5">
            <ChevronLeft size={16} /> Back to Dashboard
          </Button>
          <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3 italic uppercase tracking-tighter">
            <Download className="text-secondary size-8" />
            Study Library Management
          </h1>
        </div>
        
        <div className="flex gap-3">
          {(!resources || resources.length === 0) && (
            <Button variant="outline" size="sm" onClick={handleSeedResources} disabled={isSeeding} className="border-secondary/30 text-secondary h-10 px-6">
              {isSeeding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <BookOpen className="mr-2 h-4 w-4" />}
              Seed Initial Library
            </Button>
          )}
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={handleOpenAddDialog} className="bg-secondary text-white hover:bg-secondary/90 h-10 px-6 font-bold uppercase tracking-widest text-xs">
                <Plus size={16} className="mr-2" /> Add Booklet
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl bg-card border-white/5 shadow-2xl">
              <DialogHeader>
                <DialogTitle className="italic uppercase tracking-tighter text-xl">
                  {editingId ? "Edit Study Booklet" : "New Study Booklet"}
                </DialogTitle>
                <DialogDescription className="text-xs uppercase tracking-widest font-bold text-secondary">Configure downloadable content for learners.</DialogDescription>
              </DialogHeader>
              <div className="space-y-6 py-6">
                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Booklet Title</Label>
                  <Input 
                    placeholder="e.g. The Highway Code 2026 Edition" 
                    value={resourceForm.title}
                    onChange={(e) => setResourceForm({...resourceForm, title: e.target.value})}
                    className="bg-background/50 border-white/10"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Price ($ USD)</Label>
                    <Input 
                      type="number"
                      value={resourceForm.priceDollars}
                      onChange={(e) => setResourceForm({...resourceForm, priceDollars: Number(e.target.value)})}
                      className="bg-background/50 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Thumbnail URL</Label>
                    <Input 
                      placeholder="https://picsum.photos/..." 
                      value={resourceForm.thumbnailUrl}
                      onChange={(e) => setResourceForm({...resourceForm, thumbnailUrl: e.target.value})}
                      className="bg-background/50 border-white/10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Download URL (Secure Link)</Label>
                  <Input 
                    placeholder="e.g. Google Drive or Dropbox direct link" 
                    value={resourceForm.downloadUrl}
                    onChange={(e) => setResourceForm({...resourceForm, downloadUrl: e.target.value})}
                    className="bg-background/50 border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-[10px] uppercase font-bold tracking-widest text-muted-foreground ml-1">Description</Label>
                  <Textarea 
                    placeholder="Briefly describe what's inside the booklet..." 
                    value={resourceForm.description}
                    onChange={(e) => setResourceForm({...resourceForm, description: e.target.value})}
                    className="bg-background/50 border-white/10 min-h-[100px]"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button className="w-full bg-secondary text-white hover:bg-secondary/90 h-14 text-lg font-bold shadow-xl shadow-secondary/20 uppercase italic tracking-tighter" onClick={handleSaveResource} disabled={isSaving}>
                  {isSaving ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : editingId ? "Save Changes" : "Publish Booklet"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <Card className="border-white/5 bg-card/40 backdrop-blur-sm overflow-hidden shadow-2xl">
        <CardHeader className="bg-primary/20 border-b border-white/5">
          <CardTitle className="text-lg italic uppercase tracking-tighter">Library Catalog</CardTitle>
          <CardDescription className="text-xs uppercase tracking-widest font-bold">Manage high-performance downloadable content.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="text-[10px] uppercase font-bold text-muted-foreground">Booklet</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold text-muted-foreground">Price</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold text-muted-foreground hidden sm:table-cell">Link Status</TableHead>
                  <TableHead className="text-[10px] uppercase font-bold text-muted-foreground text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isResourcesLoading ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-20">
                      <Loader2 className="h-8 w-8 animate-spin mx-auto text-secondary" />
                    </TableCell>
                  </TableRow>
                ) : resources && resources.length > 0 ? (
                  resources.map((res) => (
                    <TableRow key={res.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-bold text-white text-xs sm:text-sm">{res.title}</span>
                          <span className="text-[9px] text-muted-foreground italic line-clamp-1 mt-0.5">{res.description}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="border-secondary/20 text-secondary font-mono">${res.priceDollars}.00</Badge>
                      </TableCell>
                      <TableCell className="hidden sm:table-cell">
                        {res.downloadUrl ? (
                          <a href={res.downloadUrl} target="_blank" rel="noopener noreferrer" className="text-secondary hover:underline flex items-center gap-1 text-[10px]">
                            <ExternalLink size={10} /> Validated
                          </a>
                        ) : (
                          <span className="text-destructive text-[10px]">Missing Link</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-muted-foreground hover:text-white h-9 w-9"
                            onClick={() => handleOpenEditDialog(res)}
                          >
                            <Pencil size={16} />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-destructive hover:bg-destructive/10 h-9 w-9"
                            onClick={() => handleDeleteResource(res.id)}
                            disabled={isDeleting === res.id}
                          >
                            {isDeleting === res.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-20 text-muted-foreground text-[10px] uppercase tracking-widest font-bold">
                      Library is empty.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
