import Link from 'next/link';
import { Clock, Star, Users } from 'lucide-react';
import { Recipe } from '@/lib/types';

interface RecipeCardProps {
  recipe: Recipe;
}

export default function RecipeCard({ recipe }: RecipeCardProps) {
  return (
    <Link
      href={`/recipe/${recipe.id}`}
      className="group bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden"
    >
      <div className="relative aspect-video overflow-hidden">
        <img
          src={recipe.imageUrl}
          alt={recipe.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-2 right-2 bg-white px-2 py-1 rounded-full text-xs font-semibold">
          {recipe.category.charAt(0).toUpperCase() + recipe.category.slice(1)}
        </div>
      </div>
      <div className="p-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
          {recipe.name}
        </h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
          {recipe.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
          <div className="flex items-center gap-1">
            <Clock size={16} />
            <span>{recipe.prepTime}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users size={16} />
            <span>{recipe.servings} servings</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            <Star size={16} className="fill-yellow-400 text-yellow-400" />
            <span className="font-semibold">{recipe.rating}</span>
            <span className="text-gray-500 text-sm">({recipe.reviews})</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {recipe.tags.slice(0, 2).map((tag) => (
              <span
                key={tag}
                className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}
