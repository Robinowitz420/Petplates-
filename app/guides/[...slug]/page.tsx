import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { guidesIndex } from '@/lib/guides/guidesIndex';
import { guideCommon, guideTemplates, type GuideCategory } from '@/lib/guides/guidesTemplates';
import { absoluteUrl, getSiteUrl } from '@/lib/siteUrl';
import UserAgreementGateClient from '@/components/UserAgreementGateClient';

const BASE_URL = getSiteUrl();

const categoryLabels: Record<GuideCategory, string> = {
  dogs: 'Dogs',
  cats: 'Cats',
  birds: 'Birds',
  reptiles: 'Reptiles',
  'pocket-pets': 'Pocket Pets',
};

const fillEntity = (template: string, entityName: string): string => {
  return String(template || '').replaceAll('{entityName}', entityName);
};

const expandBullets = (bullets: string[], entityName: string): string[] => {
  const out: string[] = [];

  for (const b of bullets) {
    const raw = String(b || '');

    if (raw.trim() === '{transitionPlanDays}') {
      out.push(...guideCommon.transitionPlanDays);
      continue;
    }

    const withCommonLists = raw.replaceAll(
      '{avoidListConservative}',
      guideCommon.avoidListConservative.join(', ')
    );

    const withEntity = fillEntity(withCommonLists, entityName);
    out.push(withEntity);
  }

  return out;
};

const getGuideFromParams = (slugParts: string[]): { slug: string; category: GuideCategory; entityName: string } => {
  const normalized = `/${['guides', ...slugParts].join('/')}`;
  const guide = guidesIndex.find((g) => g.slug === normalized);
  if (!guide) notFound();
  return { slug: guide.slug, category: guide.category, entityName: guide.entityName };
};

export async function generateMetadata(props: { params: Promise<{ slug: string[] }> }): Promise<Metadata> {
  const params = await props.params;
  const guide = getGuideFromParams(params.slug);
  const template = guideTemplates[guide.category];

  const title = fillEntity(template.metaTitle, guide.entityName);
  const description = fillEntity(template.metaDescription, guide.entityName);

  return {
    title,
    description,
    alternates: {
      canonical: guide.slug,
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(guide.slug),
    },
  };
}

export default async function GuidePage(props: { params: Promise<{ slug: string[] }> }) {
  const params = await props.params;
  const guide = getGuideFromParams(params.slug);
  const template = guideTemplates[guide.category];

  const relatedGuides = guidesIndex
    .filter((g) => g.category === guide.category && g.slug !== guide.slug)
    .slice()
    .sort((a, b) => a.entityName.localeCompare(b.entityName, 'en'))
    .slice(0, 10);

  const organizationJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Paws & Plates',
    url: BASE_URL,
    logo: `${BASE_URL}/images/emojis/Mascots/HeroPics/newLogo.png`,
  };

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: `${BASE_URL}/`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: categoryLabels[guide.category],
        item: `${BASE_URL}/species/${guide.category}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'Guides',
        item: `${BASE_URL}/guides/${guide.category}`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: fillEntity(template.h1, guide.entityName),
        item: `${BASE_URL}${guide.slug}`,
      },
    ],
  };

  const faqPageJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: template.faq.map((item) => ({
      '@type': 'Question',
      name: fillEntity(item.q, guide.entityName),
      acceptedAnswer: {
        '@type': 'Answer',
        text: fillEntity(item.a, guide.entityName),
      },
    })),
  };

  return (
    <div className="min-h-screen bg-transparent text-foreground py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPageJsonLd) }}
      />
      <UserAgreementGateClient>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <nav aria-label="Breadcrumb" className="text-sm text-gray-300 mb-3">
              <ol className="flex flex-wrap items-center gap-2">
                <li>
                  <Link href="/" className="text-orange-300 hover:text-orange-200">
                    Home
                  </Link>
                </li>
                <li className="text-gray-400">→</li>
                <li>
                  <Link href={`/species/${guide.category}`} className="text-orange-300 hover:text-orange-200">
                    {categoryLabels[guide.category]}
                  </Link>
                </li>
                <li className="text-gray-400">→</li>
                <li>
                  <Link href={`/guides/${guide.category}`} className="text-orange-300 hover:text-orange-200">
                    Guides
                  </Link>
                </li>
                <li className="text-gray-400">→</li>
                <li className="text-white">{fillEntity(template.h1, guide.entityName)}</li>
              </ol>
            </nav>

            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {fillEntity(template.h1, guide.entityName)}
            </h1>
            <p className="mt-4 text-gray-300">{fillEntity(template.intro, guide.entityName)}</p>
          </div>

          <div className="space-y-8">
            {template.sections.map((section) => {
              const bullets = expandBullets(section.bullets, guide.entityName);
              return (
                <section key={section.heading} className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
                  <h2 className="text-xl font-bold text-orange-400 mb-4">{section.heading}</h2>
                  <ul className="space-y-2">
                    {bullets.map((b) => (
                      <li key={b} className="flex items-start gap-2 text-gray-200">
                        <span className="text-orange-400 mt-0.5">•</span>
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              );
            })}

            <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
              <h2 className="text-xl font-bold text-orange-400 mb-4">FAQs</h2>
              <div className="space-y-4">
                {template.faq.map((item) => (
                  <div key={item.q} className="border border-green-800/40 rounded-xl p-4 bg-surface-lighter">
                    <div className="font-semibold text-orange-300">{fillEntity(item.q, guide.entityName)}</div>
                    <div className="mt-2 text-gray-200">{fillEntity(item.a, guide.entityName)}</div>
                  </div>
                ))}
              </div>
            </section>

            {relatedGuides.length > 0 && (
              <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
                <h2 className="text-xl font-bold text-orange-400 mb-4">Related guides</h2>
                <ul className="space-y-2">
                  {relatedGuides.map((g) => (
                    <li key={g.slug} className="flex items-start gap-2">
                      <span className="text-orange-400 mt-0.5">•</span>
                      <Link href={g.slug} className="text-orange-300 hover:text-orange-200 font-medium">
                        {g.entityName} guide
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            <section className="bg-surface rounded-2xl shadow-lg p-6 border border-green-800/50">
              <div className="text-sm text-gray-200">{guideCommon.disclaimer}</div>
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <Link
                  href={guideCommon.ctaDefaults.primaryHref}
                  className="inline-flex items-center justify-center px-8 py-3 rounded-full text-sm font-semibold transition-colors shadow-md bg-green-800 text-white border-[3px] border-orange-500 hover:bg-green-900"
                >
                  {guideCommon.ctaDefaults.primaryText}
                </Link>
                <Link
                  href={guideCommon.ctaDefaults.secondaryHref}
                  className="inline-flex items-center justify-center px-8 py-3 rounded-full text-sm font-semibold transition-colors shadow-md bg-transparent text-orange-300 border-[3px] border-orange-500 hover:bg-orange-500/10 hover:text-orange-200"
                >
                  {guideCommon.ctaDefaults.secondaryText}
                </Link>
              </div>
            </section>
          </div>
        </div>
      </UserAgreementGateClient>
    </div>
  );
}
