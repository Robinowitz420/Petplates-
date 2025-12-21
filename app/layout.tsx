import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ClerkProvider } from '@clerk/nextjs';
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  metadataBase: new URL('https://petplatesmealplatform-ldvstwjsy-plateandpaw.vercel.app'),
  title: {
    default: "Paws & Plates - Fresh Meal Prep for Dogs, Cats, Birds, Reptiles & Small Pets",
    template: "%s | Paws & Plates"
  },
  description: "Free vet-approved meal plans for ALL your pets. Custom recipes for dogs, cats, birds, reptiles, and pocket pets with one-click Amazon ingredient ordering. AAFCO & WSAVA compliant.",
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
    url: 'https://petplatesmealplatform-ldvstwjsy-plateandpaw.vercel.app',
    siteName: 'Paws & Plates',
    title: 'Paws & Plates - Fresh Meal Prep for Dogs, Cats, Birds, Reptiles & Small Pets',
    description: 'Free vet-approved meal plans for ALL your pets. Custom recipes with one-click Amazon ordering. AAFCO & WSAVA compliant nutrition.',
    images: [
      {
        url: '/images/emojis/Mascots/HeroPics/hero4.jpg',
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
    images: ['/images/emojis/Mascots/HeroPics/hero4.jpg'],
  },
  alternates: {
    canonical: 'https://petplatesmealplatform-ldvstwjsy-plateandpaw.vercel.app',
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
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
    >
      <html lang="en" suppressHydrationWarning>
        <head>
          {/* Additional SEO tags */}
          <link rel="icon" href="/favicon.ico" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
          <meta name="theme-color" content="#043136" />
          <meta name="apple-mobile-web-app-capable" content="yes" />
          <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
          
          {/* Schema.org markup for Google */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "WebSite",
                "name": "Paws & Plates",
                "description": "Free vet-approved meal plans for dogs, cats, birds, reptiles, and pocket pets",
                "url": "https://petplatesmealplatform-ldvstwjsy-plateandpaw.vercel.app",
                "potentialAction": {
                  "@type": "SearchAction",
                  "target": "https://petplatesmealplatform-ldvstwjsy-plateandpaw.vercel.app/search?q={search_term_string}",
                  "query-input": "required name=search_term_string"
                }
              })
            }}
          />
        </head>
        <body className={`${inter.className} bg-background text-foreground min-h-screen`}>
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