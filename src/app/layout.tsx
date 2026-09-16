import type { Metadata } from "next";
import { Cairo, Tajawal } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as SonnerToaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  display: "swap",
  weight: ["200", "300", "400", "500", "600", "700", "800", "900"],
});

const tajawal = Tajawal({
  variable: "--font-cairo-mono",
  subsets: ["arabic", "latin"],
  display: "swap",
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  title: "منصة التشريعات اليمنية",
  description:
    "منصة وطنية متكاملة لإدارة التشريعات اليمنية وعرضها والبحث فيها، مع دعم النسخ الزمنية والتعديلات والملاحق والعلاقات القانونية.",
  keywords: [
    "التشريعات اليمنية",
    "القوانين اليمنية",
    "الجريدة الرسمية",
    "المنظومة التشريعية",
    "الدستور اليمني",
  ],
  authors: [{ name: "منصة التشريعات اليمنية" }],
  icons: {
    icon: "/logo.svg",
  },
  openGraph: {
    title: "منصة التشريعات اليمنية",
    description: "منصة وطنية متكاملة لإدارة التشريعات اليمنية وعرضها والبحث فيها",
    siteName: "منصة التشريعات اليمنية",
    type: "website",
    locale: "ar_YE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className={`${cairo.variable} ${tajawal.variable} font-sans antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <a href="#main-content" className="skip-link">
            تخطَّ إلى المحتوى الرئيس
          </a>
          {children}
          <Toaster />
          <SonnerToaster position="top-center" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
