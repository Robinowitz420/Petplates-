import { Award, Heart, Users, CheckCircle } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            About PetPlates
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
            PetPlates was founded on a simple belief: our pets deserve the same quality nutrition we give ourselves. 
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

        {/* Why Pet Categories */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            Why We Serve All Pet Types
          </h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            Most pet meal services focus exclusively on dogs and cats, but we believe every pet deserves 
            fresh, personalized nutrition. That's why we've expanded to include:
          </p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="text-2xl">🐕</div>
              <div>
                <h4 className="font-bold text-gray-900">Dogs</h4>
                <p className="text-gray-600">From Chihuahuas to Great Danes, breed-specific nutrition</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🐈</div>
              <div>
                <h4 className="font-bold text-gray-900">Cats</h4>
                <p className="text-gray-600">Obligate carnivore meals with essential taurine</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🦜</div>
              <div>
                <h4 className="font-bold text-gray-900">Birds</h4>
                <p className="text-gray-600">Species-appropriate seed mixes and fresh foods</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🦎</div>
              <div>
                <h4 className="font-bold text-gray-900">Reptiles</h4>
                <p className="text-gray-600">Calcium-rich diets for healthy bones and shells</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="text-2xl">🐰</div>
              <div>
                <h4 className="font-bold text-gray-900">Pocket Pets</h4>
                <p className="text-gray-600">High-fiber meals for rabbits, guinea pigs, and more</p>
              </div>
            </div>
          </div>
        </div>

        {/* Nutritional Standards */}
        <div className="bg-primary-50 rounded-lg p-8">
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
      </div>
    </div>
  );
}
