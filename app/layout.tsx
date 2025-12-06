import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import { ClerkProvider } from '@clerk/nextjs';
import ErrorBoundaryWrapper from "@/components/ErrorBoundaryWrapper";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Paw & Plate - Meal prep made easy, for ALL your pets!",
  description: "Meal prep made easy, for ALL your pets! Personalized, vet-approved nutrition for dogs, cats, birds, reptiles, and pocket pets.",
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
      <html lang="en">
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