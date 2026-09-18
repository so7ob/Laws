'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Shield,
  Loader2,
  AlertCircle,
  Plus,
  Trash2,
  UserCircle2,
  Calendar,
} from 'lucide-react'
import { toast } from 'sonner'

interface ExceptionItem {
  id: string
  policyId: string
  userId: string
  reason: string
  expiresAt: string | null
  isActive: boolean
  createdAt: string
  user: { id: string; username: string; fullName: string; email: string }
  grantedBy: { username: string; fullName: string } | null
}

interface UserOption {
  id: string
  username: string
  fullName: string
}

interface ManageExceptionsDialogProps {
  policyId: string
  policyName: string
}

/**
 * Dialog to manage policy exceptions.
 *
 * Lists existing exceptions (with user, reason, expiry, active status) and
 * provides a form to add a new exception (user select, reason, optional
 * expiry date). Existing exceptions can be revoked (soft-deleted) inline.
 */
export function ManageExceptionsDialog({
  policyId,
  policyName,
}: ManageExceptionsDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [exceptions, setExceptions] = React.useState<ExceptionItem[]>([])
  const [users, setUsers] = React.useState<UserOption[]>([])
  const [loading, setLoading] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  // Form fields
  const [userId, setUserId] = React.useState('')
  const [reason, setReason] = React.useState('')
  const [expiresAt, setExpiresAt] = React.useState('')

  const baseUrl = `/api/admin/policies/${policyId}/exceptions`

  async function loadExceptions() {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(baseUrl)
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setExceptions(data.items || [])
    } catch (e: any) {
      setError(e.message || 'تعذّر تحميل الاستثناءات')
    } finally {
      setLoading(false)
    }
  }

  async function loadUsers() {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      setUsers(data.items || [])
    } catch {
      // non-fatal
    }
  }

  React.useEffect(() => {
    if (!open) return
    loadExceptions()
    if (users.length === 0) loadUsers()
  }, [open])

  function resetForm() {
    setUserId('')
    setReason('')
    setExpiresAt('')
    setError(null)
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!userId) {
      setError('اختر مستخدمًا')
      return
    }
    if (!reason.trim()) {
      setError('السبب مطلوب')
      return
    }
    setSaving(true)
    try {
      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          reason: reason.trim(),
          expiresAt: expiresAt || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (res.status === 400 && data.details) {
          setError(data.details.join('، '))
        } else {
          throw new Error(data.error || `فشل (HTTP ${res.status})`)
        }
        return
      }
      toast.success('تم منح الاستثناء', {
        description: data.item?.user?.fullName || 'مستخدم',
      })
      resetForm()
      loadExceptions()
    } catch (e: any) {
      setError(e.message || 'فشل الإضافة')
    } finally {
      setSaving(false)
    }
  }

  async function handleRevoke(exId: string) {
    try {
      const res = await fetch(`${baseUrl}/${exId}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error || 'فشل الإلغاء')
      }
      toast.success('تم إلغاء الاستثناء')
      loadExceptions()
    } catch (e: any) {
      toast.error(e.message || 'فشل الإلغاء')
    }
  }

  function fmtDate(d: string | null): string {
    if (!d) return '—'
    try {
      return new Date(d).toLocaleDateString('ar-EG', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    } catch {
      return '—'
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        setOpen(o)
        if (!o) resetForm()
      }}
    >
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-7 text-xs">
          <Shield className="size-3.5" />
          إدارة الاستثناءات
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="size-5" />
            استثناءات السياسة
          </DialogTitle>
          <DialogDescription className="truncate">
            {policyName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {/* Existing exceptions list */}
          <div className="space-y-2">
            <Label className="text-xs text-muted-foreground">
              الاستثناءات الحالية ({exceptions.length})
            </Label>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-muted-foreground" />
              </div>
            ) : exceptions.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground border-2 border-dashed rounded-lg">
                لا توجد استثناءات بعد
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto rounded-lg border p-2 bg-muted/20">
                {exceptions.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-start gap-2 rounded-md bg-background p-2 border"
                  >
                    <UserCircle2 className="size-4 mt-0.5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">
                        {ex.user.fullName || ex.user.username}
                        <span className="text-xs text-muted-foreground mr-2">
                          ({ex.user.username})
                        </span>
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {ex.reason}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 mt-1.5 text-[11px]">
                        <Badge
                          variant={ex.isActive ? 'default' : 'secondary'}
                          className="text-[10px]"
                        >
                          {ex.isActive ? 'نشط' : 'ملغى'}
                        </Badge>
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Calendar className="size-3" />
                          ينتهي: {fmtDate(ex.expiresAt)}
                        </span>
                        {ex.grantedBy && (
                          <span className="text-muted-foreground">
                            بواسطة: {ex.grantedBy.fullName || ex.grantedBy.username}
                          </span>
                        )}
                      </div>
                    </div>
                    {ex.isActive && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7 shrink-0"
                        onClick={() => handleRevoke(ex.id)}
                        aria-label="إلغاء الاستثناء"
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add new exception form */}
          <form onSubmit={handleAdd} className="space-y-3 border-t pt-4">
            <Label className="text-sm font-medium">إضافة استثناء جديد</Label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="ex-user" className="text-xs">
                  المستخدم
                </Label>
                <Select
                  value={userId}
                  onValueChange={setUserId}
                  disabled={saving}
                >
                  <SelectTrigger id="ex-user">
                    <SelectValue placeholder="اختر مستخدمًا" />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {users.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {u.fullName} ({u.username})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="ex-expires" className="text-xs">
                  تاريخ الانتهاء (اختياري)
                </Label>
                <Input
                  id="ex-expires"
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  disabled={saving}
                  dir="ltr"
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="ex-reason" className="text-xs">
                السبب
              </Label>
              <Textarea
                id="ex-reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="مبرر منح الاستثناء..."
                disabled={saving}
                rows={2}
                className="resize-y text-sm"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-2.5 text-sm text-destructive">
                <AlertCircle className="size-4 mt-0.5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div className="flex justify-end">
              <Button type="submit" size="sm" disabled={saving}>
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Plus className="size-4" />
                )}
                {saving ? 'جارٍ الإضافة...' : 'منح استثناء'}
              </Button>
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
