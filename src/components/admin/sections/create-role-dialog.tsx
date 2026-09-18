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
import { Plus, Loader2, Save, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

interface CreateRoleDialogProps {
  onCreated: () => void
}

/**
 * Dialog for creating a new role via POST /api/admin/roles.
 */
export function CreateRoleDialog({ onCreated }: CreateRoleDialogProps) {
  const [open, setOpen] = React.useState(false)
  const [saving, setSaving] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const [code, setCode] = React.useState('')
  const [nameAr, setNameAr] = React.useState('')
  const [description, setDescription] = React.useState('')
  const [powerLevel, setPowerLevel] = React.useState('0')

  function resetForm() {
    setCode('')
    setNameAr('')
    setDescription('')
    setPowerLevel('0')
    setError(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const fieldErrors: string[] = []
    if (!code.trim()) fieldErrors.push('رمز الدور مطلوب')
    if (!nameAr.trim()) fieldErrors.push('اسم الدور بالعربية مطلوب')
    if (fieldErrors.length > 0) {
      setError(fieldErrors.join('، '))
      return
    }

    setSaving(true)
    try {
      const res = await fetch('/api/admin/roles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: code.trim(),
          nameAr: nameAr.trim(),
          description: description.trim() || undefined,
          powerLevel: powerLevel ? parseInt(powerLevel, 10) : 0,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        if (res.status === 409) {
          setError(data.error || 'الرمز مستخدم مسبقًا')
        } else if (res.status === 400 && data.details) {
          setError(data.details.join('، '))
        } else {
          throw new Error(data.error || `فشل الإنشاء (HTTP ${res.status})`)
        }
        return
      }
      toast.success('تم إنشاء الدور', {
        description: `${code} — ${nameAr}`,
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
          إنشاء دور جديد
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="size-5" />
            إنشاء دور جديد
          </DialogTitle>
          <DialogDescription>
            يُنشأ الدور بحالة نشط ومستوى صلاحية قابل للتعديل لاحقًا.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="role-code">
              الرمز <span className="text-destructive">*</span>
            </Label>
            <Input
              id="role-code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="مثال: legal_editor"
              disabled={saving}
              dir="ltr"
              className="font-mono text-sm"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-name">
              الاسم (عربي) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="role-name"
              value={nameAr}
              onChange={(e) => setNameAr(e.target.value)}
              placeholder="مثال: محرر قانوني"
              disabled={saving}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-power">مستوى الصلاحية</Label>
            <Input
              id="role-power"
              type="number"
              value={powerLevel}
              onChange={(e) => setPowerLevel(e.target.value)}
              disabled={saving}
              dir="ltr"
            />
            <p className="text-[11px] text-muted-foreground">
              0 = أدنى صلاحية، كلما زاد الرقم زادت الصلاحية.
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="role-desc">الوصف</Label>
            <Textarea
              id="role-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وصف موجز لصلاحيات الدور..."
              disabled={saving}
              rows={2}
              className="resize-y text-sm"
            />
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
              حفظ الدور
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
