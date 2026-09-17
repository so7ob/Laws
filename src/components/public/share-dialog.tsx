'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Share2,
  Copy,
  Check,
  Twitter,
  Facebook,
  Linkedin,
  Mail,
  MessageCircle,
  X,
  Link as LinkIcon,
} from 'lucide-react'
import { toast } from 'sonner'

export function ShareDialog({ legislationTitle }: { legislationTitle: string }) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const url = typeof window !== 'undefined' ? window.location.href : ''
  const text = `${legislationTitle} — منصة التشريعات اليمنية`

  function handleCopy() {
    if (typeof navigator === 'undefined') return
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true)
      toast.success('تم نسخ الرابط')
      setTimeout(() => setCopied(false), 2000)
    }).catch(() => toast.error('تعذر نسخ الرابط'))
  }

  function shareToPlatform(platform: string) {
    const encodedUrl = encodeURIComponent(url)
    const encodedText = encodeURIComponent(text)
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
      telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
      email: `mailto:?subject=${encodedText}&body=${encodedUrl}`,
    }
    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'noopener,noreferrer')
    }
  }

  const platforms = [
    { id: 'twitter', label: 'تويتر', icon: Twitter, color: 'hover:bg-sky-50 hover:text-sky-600 hover:border-sky-300' },
    { id: 'facebook', label: 'فيسبوك', icon: Facebook, color: 'hover:bg-blue-50 hover:text-blue-600 hover:border-blue-300' },
    { id: 'linkedin', label: 'لينكدإن', icon: Linkedin, color: 'hover:bg-blue-50 hover:text-blue-700 hover:border-blue-300' },
    { id: 'whatsapp', label: 'واتساب', icon: MessageCircle, color: 'hover:bg-emerald-50 hover:text-emerald-600 hover:border-emerald-300' },
    { id: 'telegram', label: 'تيليجرام', icon: MessageCircle, color: 'hover:bg-cyan-50 hover:text-cyan-600 hover:border-cyan-300' },
    { id: 'email', label: 'بريد', icon: Mail, color: 'hover:bg-amber-50 hover:text-amber-600 hover:border-amber-300' },
  ]

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-1.5"
      >
        <Share2 className="h-4 w-4" />
        <span className="hidden sm:inline">مشاركة</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Share2 className="h-4 w-4 text-primary" />
              </div>
              مشاركة التشريع
            </DialogTitle>
            <DialogDescription className="text-xs truncate">
              {legislationTitle}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Social platforms */}
            <div>
              <Label className="mb-2 block">شارك على</Label>
              <div className="grid grid-cols-3 gap-2">
                {platforms.map((p) => {
              const Icon = p.icon
              return (
                <button
                  key={p.id}
                  onClick={() => shareToPlatform(p.id)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-lg border border-border bg-card transition-all ${p.color}`}
                >
                  <Icon className="h-5 w-5" />
                  <span className="text-xs font-medium">{p.label}</span>
                </button>
              )
            })}
              </div>
            </div>

            {/* Copy link */}
            <div>
              <Label className="mb-2 block">رابط التشريع</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <LinkIcon className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={url}
                    readOnly
                    className="pr-10 text-xs bg-muted/50"
                    onClick={(e) => (e.target as HTMLInputElement).select()}
                  />
                </div>
                <Button
                  onClick={handleCopy}
                  size="sm"
                  className={copied ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  <span className="mr-1">{copied ? 'تم' : 'نسخ'}</span>
                </Button>
              </div>
            </div>

            {/* Close */}
            <Button variant="outline" className="w-full" onClick={() => setOpen(false)}>
              <X className="h-4 w-4 ml-1.5" />
              إغلاق
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
