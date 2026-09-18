'use client'

import * as React from 'react'
import { useAppStore } from '@/store/app-store'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ShieldCheck,
  Loader2,
  LogIn,
  AlertCircle,
  Home,
  Lock,
  User as UserIcon,
} from 'lucide-react'
import { toast } from 'sonner'

/**
 * Login gate shown when a user tries to enter the admin panel without a
 * valid session. The demo credentials are surfaced explicitly so reviewers
 * can exercise the admin surface; production deployments must remove the
 * hint and rely on real credential issuance.
 */
export function LoginView() {
  const navigate = useAppStore((s) => s.navigate)
  const goHome = useAppStore((s) => s.goHome)
  const setAuthUser = useAppStore((s) => s.setAuthUser)
  const setAuthChecked = useAppStore((s) => s.setAuthChecked)

  const [username, setUsername] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState<string | null>(null)
  const [submitting, setSubmitting] = React.useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!username.trim() || !password) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور')
      return
    }
    setSubmitting(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim(), password }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data.error || 'فشل تسجيل الدخول')
      }
      // Map the /me response shape into the store's AuthUser shape.
      const mapped = {
        id: data.user.id,
        username: data.user.username,
        email: data.user.email,
        fullName: data.user.fullName,
        roles: (data.user.roleCodes || []).map((code: string) => ({
          code,
          nameAr: code,
        })),
      }
      setAuthUser(mapped)
      setAuthChecked(true)
      toast.success(`مرحبًا ${mapped.fullName || mapped.username}`, {
        description: 'تم تسجيل الدخول بنجاح',
      })
      navigate('admin')
    } catch (e: any) {
      setError(e.message || 'فشل تسجيل الدخول')
    } finally {
      setSubmitting(false)
    }
  }

  function fillDemo(role: string) {
    setUsername(role)
    setPassword('Demo1234!')
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-12 bg-gradient-to-b from-secondary/5 to-transparent">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center size-14 rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <ShieldCheck className="size-7" />
          </div>
          <h1 className="text-2xl font-bold">بوابة دخول الإدارة</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            يتطلب الوصول للوحة الإدارة تسجيل الدخول بحساب مصرّح. جميع مسارات
            الإدارة محمية خادمياً.
          </p>
        </div>

        <Card className="border-primary/20 shadow-md">
          <CardHeader className="space-y-1 pb-2">
            <CardTitle className="text-lg flex items-center gap-2">
              <LogIn className="size-4" />
              تسجيل الدخول
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username" className="flex items-center gap-1.5">
                  <UserIcon className="size-3.5" />
                  اسم المستخدم
                </Label>
                <Input
                  id="login-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                  autoComplete="username"
                  disabled={submitting}
                  className="font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="login-password" className="flex items-center gap-1.5">
                  <Lock className="size-3.5" />
                  كلمة المرور
                </Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  disabled={submitting}
                  className="font-mono"
                />
              </div>

              {error && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                  <AlertCircle className="size-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    جارٍ التحقق...
                  </>
                ) : (
                  <>
                    <LogIn className="size-4" />
                    دخول
                  </>
                )}
              </Button>
            </form>

            <div className="mt-5 pt-4 border-t border-border/60">
              <p className="text-xs text-muted-foreground mb-2 text-center">
                حسابات تجريبية (اضغط للتعبئة)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { code: 'admin', label: 'مدير نظام' },
                  { code: 'content.mgr', label: 'مدير محتوى' },
                  { code: 'reviewer', label: 'مُراجع' },
                  { code: 'reader', label: 'قارئ' },
                ].map((r) => (
                  <Button
                    key={r.code}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs justify-start"
                    onClick={() => fillDemo(r.code)}
                    disabled={submitting}
                  >
                    <span className="font-mono">{r.code}</span>
                    <span className="text-muted-foreground">— {r.label}</span>
                  </Button>
                ))}
              </div>
              <p className="text-[11px] text-muted-foreground/70 mt-2 text-center">
                كلمة المرور التجريبية لجميع الحسابات: <span className="font-mono">Demo1234!</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-center">
          <Button variant="ghost" size="sm" onClick={goHome}>
            <Home className="size-4 ml-1.5" />
            العودة للرئيسية
          </Button>
        </div>
      </div>
    </div>
  )
}
