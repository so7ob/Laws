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
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Plus, Loader2, Save, AlertCircle, X, UserPlus } from 'lucide-react'
import { toast } from 'sonner'

interface RoleOption {
  id: string
  code: string
  nameAr: string
}

interface CreateUserDialogProps {
  onCreated: () => void
}

/**
 * Dialog for creating a new user via POST /api/admin/users.
 * Password is hashed server-side with bcrypt.
 */
export function CreateUserDialog({ onCreated }: CreateUserDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [roles, setRoles] = React.useState<RoleOption[]>([])
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [username, setUsername] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [fullName, setFullName] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [selectedRoleCodes, setSelectedRoleCodes] = React.useState<string[]>([])
  const [active, setActive] = React.useState(true)

  React.useEffect(() => {
    if (!open) return
    if (roles.length > 0) return
    fetch('/api/admin/roles')
      .then((r) => r.json())
      .then((d) => {
        if (d.error) throw new Error(d.error)
        setRoles(d.items || [])
      })
      .catch(() => {
        // non-fatal
      })
  }, [open, roles.length])

  function resetForm() {
    setUsername('')
    setEmail('')
    setFullName('')
    setPassword('')
    setSelectedRoleCodes([])
    setActive(true)
    setError(null)
  }

  function toggleRole(code: string) {
    setSelectedRoleCodes((prev) =>
      prev.includes(code)
        ? prev.filter((c) => c !== code)
        : [...prev, code]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const fieldErrors: string[] = []
    if (!username.trim()) fieldErrors.push('اسم المستخدم مطلوب')
    if (!email.trim()) fieldErrors.push('البريد الإلكتروني مطلوب')
    if (!fullName.trim()) fieldErrors.push('الاسم الكامل مطلوب')
    if (!password || password.length < 8)
      fieldErrors.push('كلمة المرور مطلوبة (٨ أحرف على الأقل)')
    if (fieldErrors.length > 0) {
      setError(fieldErrors.join('، '))
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: username.trim(),
          email: email.trim(),
          fullName: fullName.trim(),
          password,
          roleCodes: selectedRoleCodes,
          isActive: active,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (res.status === 409) {
          setError(data.error || 'البيانات مستخدمة مسبقًا')
        } else if (res.status === 400 && data.details) {
          setError(data.details.join('، '))
        } else {
          throw new Error(data.error || `فشل الإنشاء (HTTP ${res.status})`)
        }
        return
      }
      toast.success('تم إنشاء المستخدم', {
        description: `${username} — ${selectedRoleCodes.length} دور`,
      })
      resetForm()
      setOpen(false)
      onCreated()
    } catch (e: any) {
      setError(e.message || 'فشل الإنشاء')
    } finally {
      setSaving(false)
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
        <Button size="sm">
          <Plus className="size-4" />
          إضافة مستخدم جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="size-5" />
            إضافة مستخدم جديد
          </DialogTitle>
          <DialogDescription>
            كلمة المرور تُجزّأ بـ bcrypt خادميًا. لا تُخزّن كنص صريح.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="u-username">
                اسم المستخدم <span className="text-destructive">*</span>
              </Label>
              <Input
                id="u-username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="مثال: editor1"
                disabled={saving}
                dir="ltr"
                className="font-mono text-sm"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="u-fullname">
                الاسم الكامل <span className="text-destructive">*</span>
              </Label>
              <Input
                id="u-fullname"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="الاسم الكامل"
                disabled={saving}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="u-email">
              البريد الإلكتروني <span className="text-destructive">*</span>
            </Label>
            <Input
              id="u-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="user@example.com"
              disabled={saving}
              dir="ltr"
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="u-password">
              كلمة المرور <span className="text-destructive">*</span>
            </Label>
            <Input
              id="u-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="٨ أحرف على الأقل"
              disabled={saving}
              dir="ltr"
              className="font-mono text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label>الأدوار</Label>
            <div className="flex flex-wrap gap-2">
              {roles.length === 0 ? (
                <p className="text-xs text-muted-foreground">جارٍ تحميل الأدوار...</p>
              ) : (
                roles.map((r) => {
                  const selected = selectedRoleCodes.includes(r.code)
                  return (
                    <button
                      key={r.id}
                      type="button"
                      onClick={() => toggleRole(r.code)}
                      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-xs transition-colors ${
                        selected
                          ? 'border-primary bg-primary text-primary-foreground'
                          : 'border-border bg-card hover:bg-muted/50'
                      }`}
                    >
                      {r.nameAr}
                      <span className="font-mono opacity-70">({r.code})</span>
                      {selected && <X className="size-3" />}
                    </button>
                  )
                })
              )}
            </div>
            <p className="text-[11px] text-muted-foreground">
              اضغط على الدور لتبديله. يمكن اختيار عدة أدوار.
            </p>
          </div>
          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
              <AlertCircle className="size-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={saving}
            >
              إلغاء
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Save className="size-4" />
              )}
              حفظ المستخدم
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
