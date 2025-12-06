/**
 * Beep utility for task completion notifications
 * Quiet, automatic beeps that don't require user permission
 */

/**
 * Play a quiet beep sound
 * Uses Web Audio API for a softer, less intrusive beep
 */
export function beep(frequency: number = 400, duration: number = 100, volume: number = 0.1): void {
  if (typeof window === 'undefined') return;
  
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // Set quiet volume (0.1 = 10% volume)
    gainNode.gain.value = volume;
    oscillator.frequency.value = frequency;
    oscillator.type = 'sine'; // Softer sine wave instead of harsh square wave
    
    oscillator.start();
    oscillator.stop(audioContext.currentTime + duration / 1000);
  } catch (error) {
    // Fallback: silent if Web Audio API not available
    // Don't use console.beep as it's too loud and requires permission
  }
}

/**
 * Quiet beep for task completion
 */
export function taskCompleteBeep(): void {
  beep(400, 100, 0.08); // Very quiet completion beep
}

/**
 * Beep when user action is needed (approval/run)
 */
export function actionNeededBeep(): void {
  beep(500, 150, 0.12); // Slightly louder for important notifications
}

