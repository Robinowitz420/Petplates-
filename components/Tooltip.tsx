import { ReactNode } from 'react';
import MascotIcon, { MascotName } from './MascotIcon';

interface TooltipProps {
  content: string;
  children: ReactNode;
  className?: string;
  mascot?: MascotName; // Optional mascot face in tooltip header
}

export default function Tooltip({ content, children, className = '', mascot }: TooltipProps) {
  return (
    <div className={`relative group ${className}`}>
      {children}
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 max-w-xs">
        {mascot && (
          <div className="flex items-center gap-2 mb-1 pb-1 border-b border-gray-700">
            <MascotIcon mascot={mascot} size={14} />
            <span className="font-semibold text-xs">
              {mascot === 'puppy-prepper' && 'Puppy Prepper says'}
              {mascot === 'professor-purrfessor' && 'Professor Purrfessor says'}
              {mascot === 'sherlock-shells' && 'Sherlock Shells says'}
              {mascot === 'farmer-fluff' && 'Farmer Fluff says'}
              {mascot === 'robin-redroute' && 'Robin Redroute says'}
            </span>
          </div>
        )}
        <div className={mascot ? 'text-xs' : ''}>{content}</div>
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
      </div>
    </div>
  );
}