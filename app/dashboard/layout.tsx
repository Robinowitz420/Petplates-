import { ClerkProvider } from '@clerk/nextjs';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkPublishableKey = process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY;

  return (
    clerkPublishableKey ? (
      <ClerkProvider publishableKey={clerkPublishableKey}>{children}</ClerkProvider>
    ) : (
      <>{children}</>
    )
  );
}
