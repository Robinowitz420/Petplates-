import { ReactNode } from 'react';
import MascotIcon, { MascotName } from './MascotIcon';

interface TooltipProps {
  content: string;
  children: ReactNode;
  className?: string;
  mascot?: MascotName; // Optional mascot face in tooltip header
  wide?: boolean; // Make tooltip extra wide (for nutritional fit, etc.)
}

export default function Tooltip({ content, children, className = '', mascot, wide = false }: TooltipProps) {
  const widthClass = wide ? 'max-w-4xl w-[500px]' : 'max-w-2xl';
  return (
    <div className={`relative group ${className}`}>
      {children}
      {/* Tooltip positioned below the element to avoid cutoff at top */}
      <div className={`absolute top-full left-1/2 transform -translate-x-1/2 mt-2 ${wide ? 'px-4 py-3' : 'px-5 py-4'} bg-surface text-foreground ${wide ? 'text-xs' : 'text-sm'} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-50 ${widthClass} shadow-2xl border-2 border-surface-highlight`}>
        {mascot && (
          <div className="flex items-center gap-2 mb-3 pb-3 border-b border-surface-highlight">
            <MascotIcon mascot={mascot} size={14} />
            <span className="font-semibold text-xs text-foreground">
              {mascot === 'puppy-prepper' && 'Puppy Prepper says'}
              {mascot === 'professor-purrfessor' && 'Professor Purrfessor says'}
              {mascot === 'sherlock-shells' && 'Sherlock Shells says'}
              {mascot === 'farmer-fluff' && 'Farmer Fluff says'}
              {mascot === 'robin-redroute' && 'Robin Redroute says'}
            </span>
          </div>
        )}
        <div className={mascot ? 'text-xs leading-tight text-gray-300' : wide ? 'text-xs leading-tight text-gray-200' : 'text-sm leading-relaxed text-gray-200'} style={{ whiteSpace: 'pre-line' }}>{content}</div>
        {/* Arrow pointing up to the element */}
        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-b-surface-highlight"></div>
      </div>
    </div>
  );
}