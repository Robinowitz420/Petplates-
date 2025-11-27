import { Award, Heart, Users, CheckCircle, Star, MessageSquare, ChefHat, TrendingUp } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About ThePetPantry
          </h1>
          <p className="text-xl text-primary-100">
            Fresh, personalized nutrition for pets we love
          </p>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Mission */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-4">
            ThePetPantry was founded on a simple belief: our pets deserve the same quality nutrition we give ourselves.
            Just as meal prep has transformed human health, we're bringing that same personalized, 
            fresh-food approach to pet nutrition.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Every recipe is scientifically formulated to meet AAFCO and WSAVA guidelines, ensuring your pet 
            gets complete, balanced nutrition tailored to their specific needs.
          </p>
        </div>

        {/* Values */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-md p-6">
            <Award className="text-primary-600 mb-4" size={40} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Science-Based
            </h3>
            <p className="text-gray-600">
              All recipes meet or exceed AAFCO and WSAVA nutritional standards, 
              developed with veterinary nutrition expertise.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <Heart className="text-primary-600 mb-4" size={40} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Pet-First
            </h3>
            <p className="text-gray-600">
              Every decision we make prioritizes your pet's health, happiness, and wellbeing.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <Users className="text-primary-600 mb-4" size={40} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Community Driven
            </h3>
            <p className="text-gray-600">
              Our recipes are refined based on feedback from thousands of pet parents like you.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <CheckCircle className="text-primary-600 mb-4" size={40} />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Transparency
            </h3>
            <p className="text-gray-600">
              Complete ingredient lists, full nutritional breakdowns, and clear sourcing information.
            </p>
          </div>
        </div>


        {/* Nutritional Standards */}
        <div className="bg-primary-50 rounded-lg p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Our Nutritional Standards
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            We adhere to the highest standards in pet nutrition:
          </p>
          <ul className="space-y-3">
            <li className="flex items-start gap-3">
              <CheckCircle className="text-primary-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">
                <strong>AAFCO Guidelines:</strong> All recipes meet Association of American Feed Control Officials standards
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-primary-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">
                <strong>WSAVA Recommendations:</strong> Aligned with World Small Animal Veterinary Association best practices
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-primary-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">
                <strong>Veterinary Reviewed:</strong> Recipes developed and reviewed by veterinary nutritionists
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-primary-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">
                <strong>Regular Updates:</strong> Formulations updated as new research emerges
              </span>
            </li>
          </ul>
        </div>

        {/* Vetting Process */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            How We Choose Your Ingredients: The Vetted Vetting Process
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            When you see a specific product recommendation (e.g., "Brand X Fish Oil") instead of a generic item (e.g., "Fish Oil"),
            it means that item has passed our three-tiered veterinary screening process.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Our goal is to ensure that the products you purchase are as safe and high-quality as the recipes you cook.
            We select the "best pick" for every core ingredient based on:
          </p>
          <ul className="space-y-4 mb-6">
            <li className="flex items-start gap-3">
              <CheckCircle className="text-primary-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">
                <strong>Safety & Purity:</strong> Every supplement and oil is vetted for third-party testing (e.g., heavy metal or contaminant checks) to guarantee safety. We choose minimal processing where possible.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-primary-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">
                <strong>Nutritional Superiority:</strong> We prioritize sourcing that maximizes the intended benefit—for instance, choosing low-fat meats for sensitive pets or specific fish (like Wild-Caught Alaskan Salmon) for high Omega-3 concentration.
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle className="text-primary-600 flex-shrink-0 mt-1" size={20} />
              <span className="text-gray-700">
                <strong>Dietary Completeness:</strong> For foundational components like multi-vitamin/mineral mixes, we exclusively select professionally formulated products that meet AAFCO/FEDIAF standards to guarantee your homemade meal is 100% balanced and complete.
              </span>
            </li>
          </ul>
          <p className="text-lg text-gray-700 leading-relaxed">
            Our shopping list is designed to be a recommendation from a veterinary nutritionist, not just a search result.
          </p>
        </div>

        {/* Why ThePetPantry */}
        <div className="bg-gradient-to-br from-primary-50 to-orange-50 rounded-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Why ThePetPantry?
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            The global pet food market is undergoing a dramatic shift toward fresh, human-grade diets, growing at 20% CAGR.
            But this transition creates significant challenges for pet owners. Here's how ThePetPantry solves the key problems:
          </p>

          <div className="space-y-8">
            {/* Problem 1 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-red-100 text-red-600 rounded-full p-2 flex-shrink-0">
                  <span className="text-xl">⚠️</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Problem: Information Overload from "Dr. Google"
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Pet owners face analysis paralysis from countless conflicting recipes, blogs, and studies online.
                    Without expertise, it's impossible to know which recipes are nutritionally complete and safe.
                  </p>
                  <div className="bg-green-50 border-l-4 border-green-500 p-4">
                    <h4 className="font-bold text-green-800 mb-2">✅ ThePetPantry Solution:</h4>
                    <p className="text-green-700">
                      <strong>Single authoritative platform</strong> with 1000+ vet-reviewed recipes featuring real nutritional
                      calculations, calcium/phosphorus ratios, and compatibility scoring. No more guesswork—just personalized,
                      scientifically-validated meal plans.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Problem 2 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-red-100 text-red-600 rounded-full p-2 flex-shrink-0">
                  <span className="text-xl">🏥</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Problem: Veterinary Skepticism of Home Cooking
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Veterinarians rightfully worry about homemade diets due to risks of nutritional imbalance,
                    missing essential minerals, and incorrect formulations that can harm pets long-term.
                  </p>
                  <div className="bg-green-50 border-l-4 border-green-500 p-4">
                    <h4 className="font-bold text-green-800 mb-2">✅ ThePetPantry Solution:</h4>
                    <p className="text-green-700">
                      <strong>Clinical-grade nutrition intelligence</strong> with AAFCO/WSAVA-compliant recipes,
                      dynamic health condition adjustments, and transparent nutritional breakdowns that vets can trust.
                      Every recipe includes calcium/phosphorus ratios and complete micronutrient profiles.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Problem 3 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-red-100 text-red-600 rounded-full p-2 flex-shrink-0">
                  <span className="text-xl">🛒</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Problem: Fresh Cooking is Inconvenient
                  </h3>
                  <p className="text-gray-700 mb-4">
                    While pet owners want fresh food, the time investment, shopping complexity, and meal prep
                    work deter most from actually cooking. Traditional meal kits are expensive and limited.
                  </p>
                  <div className="bg-green-50 border-l-4 border-green-500 p-4">
                    <h4 className="font-bold text-green-800 mb-2">✅ ThePetPantry Solution:</h4>
                    <p className="text-green-700">
                      <strong>Seamless shopping integration</strong> with direct Amazon affiliate links, "Buy All"
                      functionality, and interactive cooking mode with timers and checklists. Turn recipe browsing
                      into actual meal prep in minutes, not hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Problem 4 */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-start gap-4">
                <div className="bg-red-100 text-red-600 rounded-full p-2 flex-shrink-0">
                  <span className="text-xl">🎯</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Problem: Health Conditions Require Precise Nutrition
                  </h3>
                  <p className="text-gray-700 mb-4">
                    Most pets have specific health concerns (allergies, obesity, kidney disease, diabetes) that
                    require non-generic diets. One-size-fits-all recipes fail these pets and can worsen conditions.
                  </p>
                  <div className="bg-green-50 border-l-4 border-green-500 p-4">
                    <h4 className="font-bold text-green-800 mb-2">✅ ThePetPantry Solution:</h4>
                    <p className="text-green-700">
                      <strong>11 comprehensive health conditions</strong> with dynamic recipe modifications,
                      allergy-safe alternatives, and condition-specific supplement recommendations.
                      Each recipe adapts to your pet's unique health profile for truly personalized nutrition.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 p-6 bg-green-500 bg-opacity-10 border border-green-200 rounded-lg">
            <h3 className="text-xl font-bold mb-3 text-green-800">The Result: Fresh Food Made Simple</h3>
            <p className="text-green-700 leading-relaxed">
              ThePetPantry bridges the gap between pet owners' desire for fresh, healthy food and the nutritional
              safety veterinarians demand. We're not just another recipe site—we're the trusted partner that makes
              homemade pet nutrition accessible, safe, and effective for every pet parent.
            </p>
          </div>
        </div>

        {/* Community Impact Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Community Impact: Real Results from Real Pet Parents
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-8 text-center">
            Our community-driven approach means every rating, review, and modification helps improve recipes for all pets.
            Here's the measurable impact our community has created:
          </p>

          {/* Impact Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Star className="w-8 h-8 text-blue-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">2,847</div>
              <div className="text-sm text-gray-600">Recipes Rated</div>
              <div className="text-xs text-gray-500 mt-1">Community feedback</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-8 h-8 text-green-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">1,203</div>
              <div className="text-sm text-gray-600">Detailed Reviews</div>
              <div className="text-xs text-gray-500 mt-1">Pet acceptance data</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <ChefHat className="w-8 h-8 text-orange-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">456</div>
              <div className="text-sm text-gray-600">Recipe Modifications</div>
              <div className="text-xs text-gray-500 mt-1">Community improvements</div>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Heart className="w-8 h-8 text-purple-600" />
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">89%</div>
              <div className="text-sm text-gray-600">Pet Acceptance Rate</div>
              <div className="text-xs text-gray-500 mt-1">Pets eating meals</div>
            </div>
          </div>

          {/* Success Stories */}
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 mb-8">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Community Success Stories</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600">⭐⭐⭐⭐⭐</span>
                  <span className="text-sm text-gray-600">Sarah M., Dog Owner</span>
                </div>
                <p className="text-gray-700 text-sm italic mb-2">
                  "My picky Labrador finally eats homemade food! The community modifications for adding pumpkin
                  made all the difference."
                </p>
                <div className="text-xs text-gray-500">Recipe: Turkey & Sweet Potato • Modified by 12 community members</div>
              </div>
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-green-600">⭐⭐⭐⭐⭐</span>
                  <span className="text-sm text-gray-600">Mike R., Cat Owner</span>
                </div>
                <p className="text-gray-700 text-sm italic mb-2">
                  "My senior cat with kidney disease is thriving on the modified recipes. The phosphorus adjustments
                  from community feedback saved his life."
                </p>
                <div className="text-xs text-gray-500">Recipe: Fish & Rice • 8 community modifications</div>
              </div>
            </div>
          </div>

          {/* Transparency Metrics */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Recipe Improvement Transparency</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">94%</div>
                <div className="text-sm text-gray-600">Recipes improved based on feedback</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">67</div>
                <div className="text-sm text-gray-600">Average days to implement changes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">23</div>
                <div className="text-sm text-gray-600">Expert reviews per recipe</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mt-4 text-center">
              Every recipe rating and review directly contributes to improving our database.
              Your feedback helps make better meals for all pets in our community.
            </p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white rounded-lg p-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Community</h2>
          <p className="text-xl text-primary-100 mb-6 max-w-2xl mx-auto">
            Be part of the movement that's transforming pet nutrition. Your ratings, reviews, and modifications
            help create better recipes for pets everywhere.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/forum"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-primary-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              <Users className="w-5 h-5" />
              Join the Discussion
            </a>
            <a
              href="/forum/gallery"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white hover:text-primary-600 transition-colors"
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
