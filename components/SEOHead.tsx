'use client';

import Head from 'next/head';
import { usePathname } from 'next/navigation';
import { getSiteUrl } from '@/lib/siteUrl';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  structuredData?: any;
  noindex?: boolean;
}

// Client-side SEO component for dynamic pages
export default function SEOHead({ 
  title, 
  description, 
  keywords = [],
  structuredData,
  noindex = false 
}: SEOHeadProps) {
  const pathname = usePathname();
  const baseUrl = getSiteUrl();
  const canonicalUrl = `${baseUrl}${pathname}`;

  const fullTitle = title 
    ? `${title} | Paws & Plates` 
    : 'Paws & Plates - Fresh Meal Prep for All Pets';

  return (
    <Head>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {keywords.length > 0 && (
        <meta name="keywords" content={keywords.join(', ')} />
      )}
      <link rel="canonical" href={canonicalUrl} />
      
      {noindex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      <meta property="og:url" content={canonicalUrl} />
      
      {/* Twitter Card */}
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}
      
      {/* Structured Data */}
      {structuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredData)
          }}
        />
      )}
    </Head>
  );
}

