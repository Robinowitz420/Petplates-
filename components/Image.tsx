import NextImage from 'next/image';
import { ImageData } from '@/lib/types';
import { getHealthConcernStyle, getPetCategoryStyle } from '@/lib/utils/imageMapping';
import { getMascotImageForCategory } from '@/lib/utils/mascotImageMapping';

interface ImageProps {
  src?: ImageData | string; // Support both ImageData object and string URL
  variant?: 'thumbnail' | 'card' | 'hero' | 'icon' | 'banner';
  alt?: string;
  className?: string;
  priority?: boolean;
  fallbackSrc?: string;
  healthConcern?: string;
  petCategory?: string;
  showOverlays?: boolean;
}

export default function Image({
  src,
  variant = 'card',
  alt = '',
  className = '',
  priority = false,
  fallbackSrc,
  healthConcern,
  petCategory,
  showOverlays = true
}: ImageProps) {
  // Handle string URLs (legacy support)
  const imageUrl = typeof src === 'string' ? src : src?.url;
  const imageAlt = typeof src === 'string' ? alt : src?.alt || alt;
  const imageWidth = typeof src === 'string' ? undefined : src?.width;
  const imageHeight = typeof src === 'string' ? undefined : src?.height;

  // Determine fallback: use mascot image if petCategory provided, otherwise use provided fallback or default
  const mascotFallback = petCategory ? getMascotImageForCategory(petCategory) : null;
  const effectiveFallback = fallbackSrc || mascotFallback || '/images/emojis/Mascots/Mascot-Emoji-Faces.png';

  if (!imageUrl && !effectiveFallback) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">No image</span>
      </div>
    );
  }

  const getSizes = (variant: string) => {
    switch (variant) {
      case 'thumbnail':
        return '(max-width: 640px) 150px, 300px';
      case 'card':
        return '(max-width: 640px) 300px, 600px';
      case 'hero':
        return '(max-width: 768px) 800px, 1200px';
      case 'icon':
        return '128px';
      case 'banner':
        return '800px';
      default:
        return '600px';
    }
  };

  const getDefaultDimensions = (variant: string) => {
    switch (variant) {
      case 'thumbnail':
        return { width: 300, height: 300 };
      case 'card':
        return { width: 600, height: 400 };
      case 'hero':
        return { width: 1200, height: 600 };
      case 'icon':
        return { width: 128, height: 128 };
      case 'banner':
        return { width: 800, height: 200 };
      default:
        return { width: 600, height: 400 };
    }
  };

  const healthStyle = healthConcern ? getHealthConcernStyle(healthConcern) : null;
  const categoryStyle = petCategory ? getPetCategoryStyle(petCategory) : null;

  const finalUrl = imageUrl || effectiveFallback;
  const dimensions = imageWidth && imageHeight 
    ? { width: imageWidth, height: imageHeight }
    : getDefaultDimensions(variant);

  return (
    <div className={`relative ${className}`}>
      <NextImage
        src={finalUrl}
        alt={imageAlt}
        width={dimensions.width}
        height={dimensions.height}
        className="w-full h-full object-cover"
        sizes={getSizes(variant)}
        priority={priority}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          // Try mascot image if available, otherwise use effective fallback
          if (mascotFallback && !target.src.includes('Mascots')) {
            target.src = mascotFallback;
          } else if (effectiveFallback && target.src !== effectiveFallback) {
            target.src = effectiveFallback;
          }
        }}
      />

      {/* Health Concern Overlay */}
      {showOverlays && healthStyle && (
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-sm">
          <span
            className="text-sm"
            style={{ color: healthStyle.color }}
            title={`Health concern: ${healthConcern}`}
          >
            {healthStyle.symbol}
          </span>
        </div>
      )}

      {/* Pet Category Frame */}
      {showOverlays && categoryStyle && variant === 'card' && (
        <div
          className="absolute inset-0 rounded-lg border-4 pointer-events-none"
          style={{ borderColor: categoryStyle.color + '40' }}
        />
      )}
    </div>
  );
}