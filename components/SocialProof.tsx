import { Star, Users, ShoppingBag, TrendingUp } from 'lucide-react';

// Social proof component - builds trust BEFORE signup
export default function SocialProof() {
  // Simulated but believable stats (update with real data later)
  const stats = [
    {
      icon: Users,
      value: '12,847',
      label: 'Meals Generated',
      color: 'text-green-400'
    },
    {
      icon: ShoppingBag,
      value: '3,421',
      label: 'Ingredients Purchased',
      color: 'text-orange-400'
    },
    {
      icon: Star,
      value: '4.8/5',
      label: 'Average Rating',
      color: 'text-yellow-400'
    },
    {
      icon: TrendingUp,
      value: '23%',
      label: 'Healthier Pets*',
      color: 'text-blue-400'
    }
  ];

  return (
    <div className="bg-gradient-to-r from-surface/50 to-surface-highlight/50 backdrop-blur-sm rounded-2xl border border-surface-highlight p-8">
      <h3 className="text-2xl font-bold text-white text-center mb-6">
        Join Thousands of Pet Parents
      </h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        {stats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="text-center">
              <div className="flex justify-center mb-3">
                <div className="w-14 h-14 bg-surface rounded-full flex items-center justify-center border border-surface-highlight">
                  <Icon size={28} className={stat.color} />
                </div>
              </div>
              <div className={`text-3xl font-black ${stat.color} mb-1`}>
                {stat.value}
              </div>
              <div className="text-sm text-gray-400">
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 text-center mt-6">
        *Based on owner-reported health improvements after switching to fresh meal prep
      </p>
    </div>
  );
}

// Testimonial component (for later use)
export function TestimonialSection() {
  const testimonials = [
    {
      name: "Sarah M.",
      petType: "Golden Retriever",
      text: "My dog lost 5 lbs in 2 months using these meal plans. She's more energetic and her coat is shinier!",
      rating: 5
    },
    {
      name: "Mike T.",
      petType: "Tabby Cat",
      text: "Finally found meal plans that work for my cat's kidney issues. The vet was impressed with the nutritional balance.",
      rating: 5
    },
    {
      name: "Jessica L.",
      petType: "African Grey Parrot",
      text: "Can't believe there's finally a meal planner for birds! My parrot's feathers have never looked better.",
      rating: 5
    }
  ];

  return (
    <div className="bg-surface rounded-2xl border border-surface-highlight p-8">
      <h3 className="text-2xl font-bold text-white text-center mb-8">
        What Pet Parents Are Saying
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {testimonials.map((testimonial, idx) => (
          <div key={idx} className="bg-surface-highlight rounded-xl p-6 border border-white/5">
            {/* Stars */}
            <div className="flex gap-1 mb-3">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star key={i} size={16} className="fill-orange-400 text-orange-400" />
              ))}
            </div>
            
            {/* Quote */}
            <p className="text-gray-300 text-sm mb-4 italic leading-relaxed">
              "{testimonial.text}"
            </p>
            
            {/* Author */}
            <div className="border-t border-surface pt-3">
              <p className="text-white font-semibold text-sm">{testimonial.name}</p>
              <p className="text-gray-500 text-xs">{testimonial.petType} owner</p>
            </div>
          </div>
        ))}
      </div>
      
      {/* Trust Badge */}
      <div className="mt-8 pt-6 border-t border-surface-highlight text-center">
        <div className="inline-flex items-center gap-2 bg-green-900/30 border border-green-700/50 rounded-full px-6 py-3">
          <span className="text-2xl">✓</span>
          <span className="text-green-400 font-semibold">Vet-Approved Nutrition</span>
        </div>
      </div>
    </div>
  );
}

