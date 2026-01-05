import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";
import PWARegister from "@/components/PWARegister";
import { absoluteUrl, getSiteUrl } from '@/lib/siteUrl';

const inter = Inter({ subsets: ["latin"], display: 'swap', weight: ['400', '600', '700'] });

const googleSiteVerification =
  process.env.GOOGLE_SITE_VERIFICATION ||
  'oa_48Zv5SXzNQ9oHYAiyExTaU60Yew5MO4ba6VzsjNo';

const siteUrl = getSiteUrl();

const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Paws & Plates',
  url: siteUrl,
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Paws & Plates - Fresh Meal Prep for Dogs, Cats, Birds, Reptiles & Small Pets",
    template: "%s | Paws & Plates"
  },
  description: "Free vet-approved meal plans for ALL your pets. Custom recipes for dogs, cats, birds, reptiles, and pocket pets with one-click Amazon ingredient ordering. AAFCO & WSAVA compliant.",
  manifest: "/manifest.webmanifest",
  themeColor: "#f97316",
  appleWebApp: { capable: true, statusBarStyle: "default", title: "Paws & Plates" },
  icons: {
    icon: ["/icon-192x192.png", "/icon-512x512.png"],
    apple: ["/icon-192x192.png"],
  },
  keywords: [
    "homemade dog food",
    "homemade cat food", 
    "DIY pet meals",
    "pet meal prep",
    "fresh pet food recipes",
    "vet approved pet food",
    "custom pet nutrition",
    "AAFCO pet food",
    "bird food recipes",
    "reptile diet plans",
    "small pet nutrition",
    "homemade pet food delivery",
    "pet meal planner",
    "healthy pet recipes",
    "balanced dog nutrition",
    "cat diet recipes"
  ],
  authors: [{ name: "Paws & Plates Team" }],
  creator: "Paws & Plates",
  publisher: "Paws & Plates",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: siteUrl,
    siteName: 'Paws & Plates',
    title: 'Paws & Plates - Fresh Meal Prep for Dogs, Cats, Birds, Reptiles & Small Pets',
    description: 'Free vet-approved meal plans for ALL your pets. Custom recipes with one-click Amazon ordering. AAFCO & WSAVA compliant nutrition.',
    images: [
      {
        url: absoluteUrl('/images/emojis/Mascots/HeroPics/hero4.jpg'),
        width: 1200,
        height: 630,
        alt: 'Paws & Plates - Meal prep for all pets',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Paws & Plates - Fresh Meal Prep for Dogs, Cats, Birds, Reptiles & Small Pets',
    description: 'Free vet-approved meal plans for ALL your pets. Custom recipes with one-click Amazon ordering.',
    images: [absoluteUrl('/images/emojis/Mascots/HeroPics/hero4.jpg')],
  },
  verification: {
    // Add these later when you have accounts:
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  category: 'Pet Care',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Additional SEO tags */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <link rel="dns-prefetch" href="//neat-grackle-2.clerk.accounts.dev" />
          <link rel="preconnect" href="https://neat-grackle-2.clerk.accounts.dev" crossOrigin="anonymous" />
          <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6986862746984728"
            crossOrigin="anonymous"
          />
          <meta name="theme-color" content="#f97316" />
          <meta name="msvalidate.01" content="F3A32F722F4B0E5C5F4737A8443E4F31" />
          <meta name="google-site-verification" content={googleSiteVerification} />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        </head>
        <body className={`${inter.className} bg-background text-foreground min-h-screen`}>
          <Script
            id="website-jsonld"
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(webSiteJsonLd),
            }}
          />
          <PWARegister />
          <ErrorBoundaryWrapper>
            <Navigation />
            <main className="min-h-screen">
              {children}
            </main>
            <Footer />
          </ErrorBoundaryWrapper>
        </body>
      </html>
    </ClerkProvider>
  );
}