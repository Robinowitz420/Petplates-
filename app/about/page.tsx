import { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { absoluteUrl, getSiteUrl } from '@/lib/siteUrl';
import AlphabetText from '@/components/AlphabetText';

export const metadata: Metadata = {
  title: 'Our Story - Paws & Plates',
  description: 'Pet Plates helps you plan homemade pet meals with clarity, safety, and common sense — without replacing professional care.',
  keywords: ['about us', 'pet nutrition', 'our story', 'pet-loving team'],
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'Our Story - Paws & Plates',
    description: 'Meet the team and learn why we are so passionate about pet nutrition.',
    url: absoluteUrl('/about'),
  },
};

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Paws & Plates',
  url: getSiteUrl(),
  logo: absoluteUrl('/images/emojis/Mascots/HeroPics/newLogo.png'),
};

const teamMembers = [
  {
    name: 'Prep Puppy',
    title: 'Head Chef / Final Meal Prep',
    image: '/images/emojis/Mascots/PrepPuppy/PrepPuppyMug.png',
    bio: "Tries to be Gordon Ramsay. Deep down he's a goof. Owns the final meal prep and cooking steps.",
  },
  {
    name: 'Professor Purfessor',
    title: 'Nutritional Specialist / Food Scientist',
    image: '/images/emojis/Mascots/Proffessor Purfessor/ProfessorMug.png',
    bio: 'Nerdy, scatterbrained, and brilliant. Explains nutrition logic and standards without the fluff.',
  },
  {
    name: 'Sherlock Shells',
    title: 'Ingredient Detective / Meal Finder',
    image: '/images/emojis/Mascots/Sherlock Shells/SherlockMug.png',
    bio: 'Stoic, cold, mopey. Discovers ingredients, curates meals, and keeps the standards uncomfortably high.',
  },
  {
    name: 'Robin RedRoute',
    title: 'Delivery & Logistics',
    image: '/images/emojis/Mascots/Robin Red-Route/RedRobinMug.png',
    bio: 'Talkative and stubborn. Delivers ingredients to you whether the weather agrees or not.',
  },
  {
    name: 'Harvest Hamster',
    title: 'Ingredient Farmer',
    image: '/images/emojis/Mascots/Harvest Hamster/HamsterMug.png',
    bio: 'ADHD and jovial. Farms the ingredients, celebrates freshness, and gets distracted by… everything.',
  },
];

const teamInfoByName = Object.fromEntries(
  teamMembers.map((member) => [member.name, { title: member.title, bio: member.bio }])
);

const lineupRecords = [
  {
    name: 'Prep Puppy',
    number: '#00143',
    date: '12.30.2025',
    frontImage: '/images/emojis/Mascots/PrepPuppy/PrepPuppyMug.png',
    sideImage: '/images/emojis/Mascots/PrepPuppy/PrepPuppyMug.png',
    crimes: [
      'Excessive enthusiasm in the kitchen',
      'Unauthorized taste testing (all ingredients)',
      'Impersonating Gordon Ramsay (poorly)',
      'Possession of illegal levels of flavor',
    ],
    quote:
      "I can explain! I was just making sure it was PAWFECT. It's not a crime to care too much about food quality.",
  },
  {
    name: 'Professor Purfessor',
    number: '#31415',
    date: '12.30.2025',
    frontImage: '/images/emojis/Mascots/Proffessor Purfessor/ProfessorMug.png',
    sideImage: '/images/emojis/Mascots/Proffessor Purfessor/ProfessorMug.png',
    crimes: [
      'Illegal possession of 47 degrees (it is actually just one)',
      'Misdemeanor tangent-going in the first degree',
      'Aggravated nutrition nerding',
      'Grand theft of your attention during explanations',
    ],
    quote:
      "This is preposterous! By definition a 'crime' is— wait, where are my glasses? Oh. Right. Continue.",
  },
  {
    name: 'Sherlock Shells',
    number: '#221B',
    date: '12.30.2025',
    frontImage: '/images/emojis/Mascots/Sherlock Shells/SherlockMug.png',
    sideImage: '/images/emojis/Mascots/Sherlock Shells/SherlockMug.png',
    crimes: [
      "Excessive skepticism of 'premium' labels",
      'Aggravated side-eye',
      'Investigation without a warrant (your pantry)',
      'Grand theft of your subpar ingredients',
    ],
    quote:
      "I've committed no crime—unless you count exposing mediocre ingredients masquerading as quality. In that case, guilty.",
  },
  {
    name: 'Harvest Hamster',
    number: '#47896',
    date: '12.30.2025',
    frontImage: '/images/emojis/Mascots/Harvest Hamster/HamsterMug.png',
    sideImage: '/images/emojis/Mascots/Harvest Hamster/HamsterMug.png',
    crimes: [
      'Farming without a chill permit',
      'Reckless enthusiasm',
      'Possession of seventeen carrot varieties (only needed one)',
      'Talking at 385 WPM in a 25 WPM zone',
    ],
    quote:
      'OHMYGOSH AM I IN TROUBLE?! Is this about the carrots?! Because I can explain each variety—wait, are those handcuffs?!',
  },
  {
    name: 'Robin RedRoute',
    number: '#10538',
    date: '12.30.2025',
    frontImage: '/images/emojis/Mascots/Robin Red-Route/RedRobinMug.png',
    sideImage: '/images/emojis/Mascots/Robin Red-Route/RedRobinMug.png',
    crimes: [
      'Arguing with GPS (and winning)',
      'Unauthorized route optimization',
      'Excessive opinions on porch placement',
      "Refusing to accept 'delay' as an answer",
    ],
    quote:
      "This is ridiculous! I'm still delivering your ingredients on time. I have standards. Are we done here?",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      {/* Header */}
      <div className="text-white py-12 px-4">
        <div className="max-w-4xl mx-auto text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold">
            <AlphabetText text="About Us" size={48} className="text-foreground" />
          </h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="bg-surface rounded-lg shadow-md p-8 mb-12 border border-surface-highlight">
          <div className="text-center mb-8">
            <div className="text-sm font-semibold tracking-widest text-orange-400">WANTED</div>
            <h2 className="text-3xl font-bold text-foreground mt-2">
              <AlphabetText text="By the Department of Pet Nutrition" size={32} className="text-foreground" />
            </h2>
            <p className="text-white/70 mt-3">
              These individuals are wanted for crimes against boring pet food.
            </p>
          </div>

          <div className="space-y-10">
            {lineupRecords.map((record) => (
              <div key={record.name} className="rounded-lg border border-surface-highlight bg-background/40 p-6">
                <div className="flex flex-col md:flex-row md:items-stretch gap-6">
                  <div className="w-full md:w-[380px] flex flex-col h-full">
                    <div className="grid grid-cols-1 gap-5">
                      <div className="rounded-md border border-white/10 bg-black/20 p-4">
                        <div className="relative w-full aspect-square">
                          <Image
                            src={record.frontImage}
                            alt={`${record.name} photo`}
                            fill
                            className="object-cover rounded"
                            sizes="220px"
                          />
                        </div>
                      </div>
                    </div>
                    {teamInfoByName[record.name] && (
                      <div className="mt-4 rounded border border-white/10 bg-black/10 p-3 text-sm text-white/80 mt-auto">
                        <div className="text-orange-300 font-semibold">{teamInfoByName[record.name].title}</div>
                        <p className="mt-1">{teamInfoByName[record.name].bio}</p>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold text-foreground">{record.name}</h3>
                    <div className="mt-4">
                      <div className="text-sm font-semibold text-orange-400">WANTED FOR</div>
                      <ul className="mt-2 list-disc pl-5 text-white/80 space-y-1">
                        {record.crimes.map((crime) => (
                          <li key={crime}>{crime}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="mt-5 rounded-md border border-white/10 bg-black/20 p-4 text-white/80 mt-auto">
                      <div className="text-sm font-semibold text-orange-400 mb-2">QUOTE</div>
                      <p className="text-sm">“{record.quote}”</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center rounded-lg border border-orange-500/30 bg-black/20 p-6">
            <div className="text-sm font-semibold tracking-widest text-orange-400">RECORD SCRATCH</div>
            <h3 className="text-2xl font-bold text-foreground mt-2">
              <AlphabetText text="OKAY OKAY… we had some fun." size={28} className="text-foreground" />
            </h3>
            <p className="text-white/70 mt-3">Scroll for the real About Us.</p>
          </div>
        </div>

        <section className="bg-surface rounded-lg shadow-md p-8 mb-12 border border-surface-highlight">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            <AlphabetText text="Real food for pets shouldn’t be confusing." size={32} className="text-foreground" />
          </h2>
          <p className="text-lg text-white/80 leading-relaxed mb-4">
            Pet Plates helps you plan homemade pet meals with clarity, structure, and safety — without pretending to replace professional care.
          </p>
          <p className="text-white/80 leading-relaxed">
            Pet Plates is a learning project. We test ideas about ingredient safety, nutrition guardrails, and how to make meal planning more transparent.
          </p>
          <ul className="mt-4 space-y-2 text-white/80">
            <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span>We prioritize clarity over hype</span></li>
            <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span>We don’t hide edge cases</span></li>
            <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span>We show our assumptions</span></li>
          </ul>
          <p className="text-white/70 mt-4">We take pet food seriously — but not ourselves.</p>
        </section>

        <section className="bg-surface rounded-lg shadow-md p-8 mb-12 border border-surface-highlight">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            <AlphabetText text="What Pet Plates is (and is not)" size={32} className="text-foreground" />
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-lg border border-surface-highlight bg-background/40 p-5">
              <h3 className="text-xl font-bold text-foreground mb-3">What Pet Plates is</h3>
              <ul className="space-y-2 text-white/80">
                <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span>A meal-planning tool for homemade pet food</span></li>
                <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span>A safety-first ingredient and nutrition guide</span></li>
                <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span>A starting point for informed pet owners</span></li>
                <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span>A way to understand what goes into the bowl</span></li>
              </ul>
            </div>
            <div className="rounded-lg border border-surface-highlight bg-background/40 p-5">
              <h3 className="text-xl font-bold text-foreground mb-3">What Pet Plates is not</h3>
              <ul className="space-y-2 text-white/80">
                <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span>Not a medical service</span></li>
                <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span>Not a diagnosis or treatment tool</span></li>
                <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span>Not a replacement for professional care</span></li>
                <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span>Not a guarantee of medical outcomes</span></li>
              </ul>
            </div>
          </div>
          <p className="mt-5 text-white/80">
            For medical conditions, allergies, or long-term diet decisions, consult a qualified animal health professional.
          </p>
        </section>

        <section className="bg-surface rounded-lg shadow-md p-8 mb-12 border border-surface-highlight">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            <AlphabetText text="Why this exists" size={32} className="text-foreground" />
          </h2>
          <div className="text-white/80 leading-relaxed space-y-4">
            <p>
              Pet owners want to do better, but commercial food labels are confusing and online advice can be contradictory — or flat-out unsafe.
            </p>
            <p>
              Homemade food shouldn’t require a nutrition degree. Pet Plates exists to make thinking clearly about ingredients, portions, and tradeoffs easier.
            </p>
            <p>
              We’re not here to sell miracles. We’re here to give you structure, guardrails, and straightforward explanations you can actually use.
            </p>
          </div>
        </section>

        <section className="bg-surface rounded-lg shadow-md p-8 mb-12 border border-surface-highlight">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            <AlphabetText text="AI-Powered Multi-Species Recipe Generation Engine" size={32} className="text-foreground" />
          </h2>
          <div className="text-white/80 leading-relaxed space-y-4">
            <h3 className="text-xl font-bold text-foreground">Overview</h3>
            <p>
              Paws and Plates employs a sophisticated AI-driven recipe generation system that creates species-specific, nutritionally optimized meal plans for every type of pet—from dogs and cats to birds, reptiles, and pocket pets. This isn't a simple database lookup; it's a multi-layered intelligence system that synthesizes veterinary nutrition science, species biology, and individual health needs into custom meal formulations.
            </p>

            <h3 className="text-xl font-bold text-foreground">The Generation Pipeline</h3>
            <ol className="space-y-6">
              <li>
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">1.</span>
                  <div>
                    <div className="font-semibold text-foreground">Species-Aware Recipe Priors</div>
                    <p className="mt-1">
                      The system maintains curated recipe templates for each species and subspecies (e.g., iguanas vs. bearded dragons, parrots vs. finches). These priors encode:
                    </p>
                    <ul className="mt-2 list-disc pl-6 space-y-1">
                      <li>Species-appropriate macronutrient ratios (protein/fat/carb profiles)</li>
                      <li>Natural dietary patterns (carnivore, omnivore, herbivore, insectivore)</li>
                      <li>Feeding behavior constraints (ground feeders, tree foragers, aquatic)</li>
                      <li>Temperature and preparation requirements</li>
                    </ul>
                  </div>
                </div>
              </li>

              <li>
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">2.</span>
                  <div>
                    <div className="font-semibold text-foreground">Unified Ingredient Intelligence</div>
                    <p className="mt-1">
                      A centralized ingredient registry of 300+ pet-safe foods powers the generation engine. Each ingredient is tagged with:
                    </p>
                    <ul className="mt-2 list-disc pl-6 space-y-1">
                      <li>Nutritional composition (vitamins, minerals, macros)</li>
                      <li>Species compatibility matrices</li>
                      <li>Toxicity flags (e.g., chocolate for dogs, avocado for birds)</li>
                      <li>Health benefit mappings (joint support, digestive health, immune boost)</li>
                    </ul>
                  </div>
                </div>
              </li>

              <li>
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">3.</span>
                  <div>
                    <div className="font-semibold text-foreground">AAFCO &amp; Species-Standard Compliance</div>
                    <p className="mt-1">Recipe generation is constrained by:</p>
                    <ul className="mt-2 list-disc pl-6 space-y-1">
                      <li>AAFCO standards for dogs and cats (life stage-specific)</li>
                      <li>Avian nutrition guidelines (NRC recommendations)</li>
                      <li>Reptile dietary research (calcium:phosphorus ratios, UVB considerations)</li>
                      <li>Exotic pet veterinary consensus (pocket pets, aquatics)</li>
                    </ul>
                    <p className="mt-2">The AI cannot generate recipes that violate these nutritional boundaries.</p>
                  </div>
                </div>
              </li>

              <li>
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">4.</span>
                  <div>
                    <div className="font-semibold text-foreground">Health-Condition Optimization</div>
                    <p className="mt-1">
                      When a pet profile includes health concerns (diabetes, kidney disease, obesity, allergies), the generation engine:
                    </p>
                    <ul className="mt-2 list-disc pl-6 space-y-1">
                      <li>Excludes contraindicated ingredients</li>
                      <li>Prioritizes therapeutic nutrients (e.g., omega-3s for inflammation, low-phosphorus for renal support)</li>
                      <li>Adjusts portion sizes and meal frequency recommendations</li>
                      <li>Adds veterinary disclaimers where appropriate</li>
                    </ul>
                  </div>
                </div>
              </li>

              <li>
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">5.</span>
                  <div>
                    <div className="font-semibold text-foreground">Gemini AI Synthesis</div>
                    <p className="mt-1">Google's Gemini AI model orchestrates the final recipe creation by:</p>
                    <ul className="mt-2 list-disc pl-6 space-y-1">
                      <li>Receiving structured prompts with pet profile + nutritional constraints + ingredient pool</li>
                      <li>Generating creative, palatable meal combinations within strict guardrails</li>
                      <li>Producing human-readable instructions (prep steps, cooking temps, storage)</li>
                      <li>Explaining nutritional rationale for each ingredient choice</li>
                    </ul>
                    <p className="mt-2">The AI doesn't just assemble ingredients—it creates meals that pets will actually eat while meeting their biological needs.</p>
                  </div>
                </div>
              </li>

              <li>
                <div className="flex items-start gap-2">
                  <span className="text-orange-400 mt-0.5">6.</span>
                  <div>
                    <div className="font-semibold text-foreground">Real-Time Compatibility Scoring</div>
                    <p className="mt-1">Every generated recipe is run through a machine learning scoring engine that evaluates:</p>
                    <ul className="mt-2 list-disc pl-6 space-y-1">
                      <li>Nutritional completeness (0-100 scale)</li>
                      <li>Species appropriateness (biological fit)</li>
                      <li>Health condition alignment (therapeutic value)</li>
                      <li>Ingredient synergy (bioavailability, digestibility)</li>
                    </ul>
                    <p className="mt-2">Scores below 70 trigger warnings. Scores above 90 indicate premium, veterinarian-grade formulations.</p>
                  </div>
                </div>
              </li>
            </ol>

            <h3 className="text-xl font-bold text-foreground">What Makes This Exceptional</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li>Cross-Species Expertise: Most pet nutrition platforms focus on dogs/cats. Paws and Plates is the only system that handles avian, reptilian, and exotic pet nutrition with the same rigor as traditional companion animals.</li>
              <li>Dynamic, Not Static: Recipes aren't pulled from a pre-written database—they're generated on-demand based on individual pet needs. Two pets of the same species but different health profiles get entirely different meal plans.</li>
              <li>Vetted Intelligence: The system combines AI creativity with hard nutritional science. Gemini can't generate a recipe that violates AAFCO minimums or includes toxic ingredients—the guardrails are baked into the architecture.</li>
              <li>Explainable AI: Every recipe includes a compatibility explanation showing why specific ingredients were chosen and how they address the pet's unique health requirements. No black-box recommendations.</li>
              <li>Production-Grade Validation: Generated recipes undergo Zod schema validation, nutritional boundary checks, and toxic ingredient screening before being presented to users. Multiple layers of safety ensure no harmful formulations escape the pipeline.</li>
            </ul>
          </div>
        </section>

        <section className="bg-surface rounded-lg shadow-md p-8 mb-12 border border-surface-highlight">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            <AlphabetText text="Safety & responsibility" size={32} className="text-foreground" />
          </h2>
          <ul className="space-y-2 text-white/80">
            <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span>Ingredient bans for known toxic foods</span></li>
            <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span>Conservative assumptions when data is uncertain</span></li>
            <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span>Clear warnings for red-flag ingredients and edge cases</span></li>
            <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span>Encouragement to double-check with professionals</span></li>
          </ul>
        </section>

        <section className="bg-surface rounded-lg shadow-md p-8 mb-12 border border-surface-highlight">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            <AlphabetText text="Who Paws And Plates Is For" size={32} className="text-foreground" />
          </h2>
          <ul className="space-y-4 text-white/80 leading-relaxed">
            <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span>Paws And Plates is for pet owners who want to feed real food—but don't want to guess, Google endlessly, or accidentally do harm.</span></li>
            <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span>It's for people who've looked at ingredient labels and thought, there has to be a more rational way to do this.</span></li>
            <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span>It's for owners of dogs, cats, and other companion animals who care about nutrition, variety, and safety—but don't have the time (or desire) to become amateur veterinary nutritionists.</span></li>
            <li className="flex items-start gap-2"><span className="text-orange-400 mt-0.5">•</span><span>If you want clear guidance, species-appropriate meals, and practical plans you can actually follow at the grocery store, this was built for you.</span></li>
          </ul>
        </section>

        <section id="user-agreement-disclaimer" className="bg-surface rounded-lg shadow-md p-8 mb-12 border border-surface-highlight">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            <AlphabetText text="User Agreement Disclaimer" size={32} className="text-foreground" />
          </h2>
          <p className="text-white/80 leading-relaxed">
            <strong>User Agreement Disclaimer:</strong>
            <br />
            Pet Plates is designed for informational and educational purposes only. It is not intended to diagnose, treat, or replace professional medical guidance. If your pet has health-related questions or concerns, consult a qualified animal health professional. By continuing to use this site, you acknowledge and agree to these terms.
          </p>
        </section>

        <div className="text-sm text-white/70">
          <a href="#user-agreement-disclaimer" className="text-orange-300 hover:text-orange-200">View the User Agreement Disclaimer</a>
        </div>

      </div>
    </div>
  );
}
