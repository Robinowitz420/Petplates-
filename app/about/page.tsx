import { Award, Heart, Users, CheckCircle, ChefHat } from 'lucide-react';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us - Vet-Approved Pet Meal Prep',
  description: 'Learn how Paws & Plates provides AAFCO & WSAVA compliant meal plans for dogs, cats, birds, reptiles, and pocket pets. Free personalized nutrition planning.',
  keywords: ['about pet meal prep', 'vet approved pet food', 'AAFCO compliant', 'pet nutrition platform'],
  openGraph: {
    title: 'About Paws & Plates - Vet-Approved Pet Meal Prep',
    description: 'AAFCO & WSAVA compliant meal plans for all pet types. Free personalized nutrition planning.',
  },
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-800 to-green-900 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About Paws & Plates
          </h1>
          <p className="text-xl text-orange-200">
            Fresh, personalized nutrition for pets we love
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Mission */}
        <div className="bg-surface rounded-lg shadow-md p-8 mb-8 border border-surface-highlight">
          <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
          <p className="text-lg text-white/80 leading-relaxed mb-4">
            Paws & Plates was founded on a simple belief: our pets deserve the same quality nutrition we give ourselves.
            Just as meal prep has transformed human health, we're bringing that same personalized, 
            fresh-food approach to pet nutrition.
          </p>
          <p className="text-lg text-white/80 leading-relaxed">
            Every recipe is scientifically formulated to meet AAFCO and WSAVA guidelines, ensuring your pet 
            gets complete, balanced nutrition tailored to their specific needs.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-surface rounded-lg shadow-md p-6">
            <Award className="text-orange-400 mb-4" size={40} />
            <h3 className="text-xl font-bold text-foreground mb-2">
              Science-Based
            </h3>
            <p className="text-white/80">
              All recipes meet or exceed AAFCO and WSAVA nutritional standards, 
              developed with pet health specialist expertise.
            </p>
          </div>

          <div className="bg-surface rounded-lg shadow-md p-6">
            <Heart className="text-orange-400 mb-4" size={40} />
            <h3 className="text-xl font-bold text-foreground mb-2">
              Pet-First
            </h3>
            <p className="text-white/80">
              Every decision we make prioritizes your pet's health, happiness, and wellbeing.
            </p>
          </div>

          <div className="bg-surface rounded-lg shadow-md p-6">
            <Users className="text-orange-400 mb-4" size={40} />
            <h3 className="text-xl font-bold text-foreground mb-2">
              Community Driven
            </h3>
            <p className="text-white/80">
              Our recipes are refined based on feedback from thousands of pet parents like you.
            </p>
          </div>

          <div className="bg-surface rounded-lg shadow-md p-6">
            <CheckCircle className="text-orange-400 mb-4" size={40} />
            <h3 className="text-xl font-bold text-foreground mb-2">
              Transparency
            </h3>
            <p className="text-white/80">
              Complete ingredient lists, full nutritional breakdowns, and clear sourcing information.
            </p>
          </div>
        </div>


        {/* Nutritional Standards */}
        <div className="bg-surface rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            Our Nutritional Standards
          </h2>
          <p className="text-lg text-white/80 leading-relaxed mb-6">
            We adhere to the highest standards in pet nutrition:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="text-orange-400 flex-shrink-0 mt-1" size={20} />
              <span className="text-white/80">
                <strong>AAFCO Guidelines:</strong> All recipes meet Association of American Feed Control Officials standards
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-orange-400 flex-shrink-0 mt-1" size={20} />
              <span className="text-white/80">
                <strong>WSAVA Recommendations:</strong> Aligned with World Small Animal Veterinary Association best practices
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-orange-400 flex-shrink-0 mt-1" size={20} />
              <span className="text-white/80">
                <strong>Pet Specialist Reviewed:</strong> Recipes developed and reviewed by pet nutritionists
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-orange-400 flex-shrink-0 mt-1" size={20} />
              <span className="text-white/80">
                <strong>Regular Updates:</strong> Formulations updated as new research emerges
              </span>
            </li>
          </ul>
        </div>

        {/* Vetting Process */}
        <div className="bg-surface rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-foreground mb-4">
            How We Choose Your Ingredients: The Vetted Vetting Process
          </h2>
          <p className="text-lg text-white/80 leading-relaxed mb-6">
            When you see a specific product recommendation (e.g., "Brand X Fish Oil") instead of a generic item (e.g., "Fish Oil"),
            it means that item has passed our three-tiered pet health specialist screening process.
          </p>
          <p className="text-lg text-white/80 leading-relaxed mb-6">
            Our goal is to ensure that the products you purchase are as safe and high-quality as the recipes you cook.
            We select the "best pick" for every core ingredient based on:
          </p>
          <ul className="space-y-4 mb-6">
            <li className="flex items-start gap-3">
              <CheckCircle className="text-orange-400 flex-shrink-0 mt-1" size={20} />
              <span className="text-white/80">
                <strong>Safety & Purity:</strong> Every supplement and oil is vetted for third-party testing (e.g., heavy metal or contaminant checks) to guarantee safety. We choose minimal processing where possible.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-orange-400 flex-shrink-0 mt-1" size={20} />
              <span className="text-white/80">
                <strong>Nutritional Superiority:</strong> We prioritize sourcing that maximizes the intended benefit—for instance, choosing low-fat meats for sensitive pets or specific fish (like Wild-Caught Alaskan Salmon) for high Omega-3 concentration.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-orange-400 flex-shrink-0 mt-1" size={20} />
              <span className="text-white/80">
                <strong>Dietary Completeness:</strong> For foundational components like multi-vitamin/mineral mixes, we exclusively select professionally formulated products that meet AAFCO/FEDIAF standards to guarantee your homemade meal is 100% balanced and complete.
              </span>
            </li>
          </ul>
          <p className="text-lg text-white/80 leading-relaxed">
            Our shopping list is designed to be a recommendation from a pet health specialist, not just a search result.
          </p>
        </div>

        {/* Why Paws & Plates */}
        <div className="bg-surface border border-surface-highlight rounded-lg p-8">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Why Paws & Plates?
          </h2>
          <p className="text-lg text-white/80 leading-relaxed mb-8">
            The global pet food market is undergoing a dramatic shift toward fresh, human-grade diets, growing at 20% CAGR.
            But this transition creates significant challenges for pet owners. Here's how Paws & Plates solves the key problems:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Problem 1 */}
            <div className="bg-surface rounded-lg p-5 shadow-sm border border-surface-highlight hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-900/20 text-orange-300 rounded-full p-2 flex-shrink-0">
                  <span className="text-xl">⚠️</span>
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Information Overload
                </h3>
              </div>
              <p className="text-sm text-white/80 mb-3">
                Pet owners face analysis paralysis from countless conflicting recipes, blogs, and studies online.
              </p>
              <div className="bg-green-900/20 border-l-4 border-orange-500/80 p-3 rounded">
                <h4 className="font-bold text-orange-300 mb-1 text-sm">✅ Our Solution:</h4>
                <p className="text-white/80 text-sm">
                  <strong>Single authoritative platform</strong> with 1000+ vet-reviewed recipes featuring real nutritional
                  calculations and compatibility scoring.
                </p>
              </div>
            </div>

            {/* Problem 2 */}
            <div className="bg-surface rounded-lg p-5 shadow-sm border border-surface-highlight hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-900/20 text-orange-300 rounded-full p-2 flex-shrink-0">
                  <span className="text-xl">🏥</span>
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Specialist Skepticism
                </h3>
              </div>
              <p className="text-sm text-white/80 mb-3">
                Pet health specialists worry about homemade diets due to risks of nutritional imbalance and missing essential minerals.
              </p>
              <div className="bg-green-900/20 border-l-4 border-orange-500/80 p-3 rounded">
                <h4 className="font-bold text-orange-300 mb-1 text-sm">✅ Our Solution:</h4>
                <p className="text-white/80 text-sm">
                  <strong>Clinical-grade nutrition</strong> with AAFCO/WSAVA-compliant recipes and transparent nutritional breakdowns that specialists can trust.
                </p>
              </div>
            </div>

            {/* Problem 3 */}
            <div className="bg-surface rounded-lg p-5 shadow-sm border border-surface-highlight hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-900/20 text-orange-300 rounded-full p-2 flex-shrink-0">
                  <span className="text-xl">🛒</span>
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Cooking Inconvenience
                </h3>
              </div>
              <p className="text-sm text-white/80 mb-3">
                Time investment, shopping complexity, and meal prep work deter most from actually cooking fresh food.
              </p>
              <div className="bg-green-900/20 border-l-4 border-orange-500/80 p-3 rounded">
                <h4 className="font-bold text-orange-300 mb-1 text-sm">✅ Our Solution:</h4>
                <p className="text-white/80 text-sm">
                  <strong>Seamless shopping</strong> with direct Amazon links, "Buy All" functionality, and interactive cooking mode with timers.
                </p>
              </div>
            </div>

            {/* Problem 4 */}
            <div className="bg-surface rounded-lg p-5 shadow-sm border border-surface-highlight hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-green-900/20 text-orange-300 rounded-full p-2 flex-shrink-0">
                  <span className="text-xl">🎯</span>
                </div>
                <h3 className="text-lg font-bold text-foreground">
                  Health Conditions
                </h3>
              </div>
              <p className="text-sm text-white/80 mb-3">
                Most pets have specific health concerns that require non-generic diets. One-size-fits-all recipes fail these pets.
              </p>
              <div className="bg-green-900/20 border-l-4 border-orange-500/80 p-3 rounded">
                <h4 className="font-bold text-orange-300 mb-1 text-sm">✅ Our Solution:</h4>
                <p className="text-white/80 text-sm">
                  <strong>11 health conditions</strong> with dynamic recipe modifications, allergy-safe alternatives, and condition-specific supplements.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-green-900/20 border border-green-800/30 rounded-lg">
            <h3 className="text-xl font-bold mb-3 text-orange-300">The Result: Fresh Food Made Simple</h3>
            <p className="text-white/80 leading-relaxed">
              Paws & Plates bridges the gap between pet owners' desire for fresh, healthy food and the nutritional
              safety veterinarians demand. We're not just another recipe site—we're the trusted partner that makes
              homemade pet nutrition accessible, safe, and effective for every pet parent.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-green-800 to-green-900 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl text-orange-200 mb-6 max-w-2xl mx-auto">
            Be part of the movement that's transforming pet nutrition. Your ratings, reviews, and modifications
            help create better recipes for pets everywhere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/forum"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-orange-700 font-semibold rounded-lg hover:bg-orange-50 transition-colors"
            >
              <Users className="w-5 h-5" />
              Join the Discussion
            </a>
            <a
              href="/forum/gallery"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-orange-200 text-white font-semibold rounded-lg hover:bg-white hover:text-orange-700 transition-colors"
            >
              <ChefHat className="w-5 h-5" />
              Browse Modifications
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
