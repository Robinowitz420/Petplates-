import NextImage from 'next/image';
import { ImageData } from '@/lib/types';
import { getHealthConcernStyle, getPetCategoryStyle } from '@/lib/utils/imageMapping';

interface ImageProps {
  src?: ImageData;
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
  fallbackSrc = '/placeholder-image.jpg',
  healthConcern,
  petCategory,
  showOverlays = true
}: ImageProps) {
  if (!src) {
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

  const healthStyle = healthConcern ? getHealthConcernStyle(healthConcern) : null;
  const categoryStyle = petCategory ? getPetCategoryStyle(petCategory) : null;

  return (
    <div className={`relative ${className}`}>
      <NextImage
        src={src.url}
        alt={src.alt || alt}
        width={src.width}
        height={src.height}
        className="w-full h-full object-cover"
        sizes={getSizes(variant)}
        priority={priority}
        placeholder="blur"
        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWGRkqGx0f/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R+IRjWjBqO6O2mhP//Z"
        onError={(e) => {
          const target = e.target as HTMLImageElement;
          if (fallbackSrc && target.src !== fallbackSrc) {
            target.src = fallbackSrc;
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