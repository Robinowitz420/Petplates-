import { useState, useEffect } from 'react';

interface UseProgressiveMealCountOptions {
  target: number;
  duration?: number; // Animation duration in milliseconds
  steps?: number; // Number of animation steps
}

interface UseProgressiveMealCountResult {
  displayCount: number;
  isCounting: boolean;
}

/**
 * Hook that animates a count from 0 to target over a specified duration.
 * 
 * This creates an engaging UX where the count appears to be "searching" and
 * counting up in real-time.
 * 
 * @param options Configuration options
 * @returns Current display count and whether counting is in progress
 */
export function useProgressiveMealCount({
  target,
  duration = 1000,
  steps = 20,
}: UseProgressiveMealCountOptions): UseProgressiveMealCountResult {
  const [displayCount, setDisplayCount] = useState(0);
  const [isCounting, setIsCounting] = useState(true);

  useEffect(() => {
    if (target === 0) {
      setDisplayCount(0);
      setIsCounting(false);
      return;
    }

    setIsCounting(true);
    let current = 0;
    const increment = Math.ceil(target / steps);
    const stepDuration = duration / steps;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
        setIsCounting(false);
      }
      setDisplayCount(current);
    }, stepDuration);

    return () => clearInterval(timer);
  }, [target, duration, steps]);

  return { displayCount, isCounting };
}

