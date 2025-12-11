import { useEffect, useRef, useState } from 'react';

interface UseGameAudioProps {
  isNightmareMode: boolean;
  isPlaying: boolean;
  isPaused: boolean;
}

export const useGameAudio = ({ isNightmareMode, isPlaying, isPaused }: UseGameAudioProps) => {
  const normalAudioRef = useRef<HTMLAudioElement | null>(null);
  const nightmareAudioRef = useRef<HTMLAudioElement | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const [isAudioReady, setIsAudioReady] = useState(false);

  // Initialize audio elements
  useEffect(() => {
    normalAudioRef.current = new Audio('/audio/normal-mode.mp3');
    nightmareAudioRef.current = new Audio('/audio/nighmare-mode.mp3'); // Using the actual filename with typo
    
    // Set audio properties
    if (normalAudioRef.current) {
      normalAudioRef.current.loop = true;
      normalAudioRef.current.volume = 0.3;
    }
    if (nightmareAudioRef.current) {
      nightmareAudioRef.current.loop = true;
      nightmareAudioRef.current.volume = 0.3;
    }

    setIsAudioReady(true);

    // Cleanup on unmount
    return () => {
      if (normalAudioRef.current) {
        normalAudioRef.current.pause();
        normalAudioRef.current = null;
      }
      if (nightmareAudioRef.current) {
        nightmareAudioRef.current.pause();
        nightmareAudioRef.current = null;
      }
    };
  }, []);

  // Handle music switching based on mode
  useEffect(() => {
    if (!isAudioReady || !isPlaying) return;

    const currentAudio = isNightmareMode ? nightmareAudioRef.current : normalAudioRef.current;
    const otherAudio = isNightmareMode ? normalAudioRef.current : nightmareAudioRef.current;

    let fadeOutInterval: number | null = null;
    let fadeInInterval: number | null = null;

    // Fade out other audio
    if (otherAudio && !otherAudio.paused) {
      fadeOutInterval = setInterval(() => {
        if (otherAudio.volume > 0.05) {
          otherAudio.volume = Math.max(0, otherAudio.volume - 0.05);
        } else {
          otherAudio.pause();
          otherAudio.currentTime = 0;
          otherAudio.volume = 0.3;
          if (fadeOutInterval) clearInterval(fadeOutInterval);
        }
      }, 50);
    }

    // Fade in current audio
    if (currentAudio && !isMuted && !isPaused) {
      currentAudio.volume = 0;
      currentAudio.play().catch(err => console.log('Audio play failed:', err));
      
      fadeInInterval = setInterval(() => {
        if (currentAudio.volume < 0.25) {
          currentAudio.volume = Math.min(0.3, currentAudio.volume + 0.05);
        } else {
          if (fadeInInterval) clearInterval(fadeInInterval);
        }
      }, 50);
    }

    // Cleanup intervals on unmount or when dependencies change
    return () => {
      if (fadeOutInterval) clearInterval(fadeOutInterval);
      if (fadeInInterval) clearInterval(fadeInInterval);
    };
  }, [isNightmareMode, isPlaying, isAudioReady, isMuted, isPaused]);

  // Handle pause/resume
  useEffect(() => {
    if (!isAudioReady) return;

    const currentAudio = isNightmareMode ? nightmareAudioRef.current : normalAudioRef.current;

    if (currentAudio) {
      if (isPaused) {
        currentAudio.pause();
      } else if (isPlaying && !isMuted) {
        currentAudio.play().catch(err => console.log('Audio play failed:', err));
      }
    }
  }, [isPaused, isPlaying, isNightmareMode, isAudioReady, isMuted]);

  // Stop music when game stops
  useEffect(() => {
    if (!isPlaying && isAudioReady) {
      if (normalAudioRef.current) {
        normalAudioRef.current.pause();
        normalAudioRef.current.currentTime = 0;
      }
      if (nightmareAudioRef.current) {
        nightmareAudioRef.current.pause();
        nightmareAudioRef.current.currentTime = 0;
      }
    }
  }, [isPlaying, isAudioReady]);

  // Handle mute toggle
  const toggleMute = () => {
    setIsMuted(prev => {
      const newMuted = !prev;
      
      if (normalAudioRef.current) {
        normalAudioRef.current.muted = newMuted;
      }
      if (nightmareAudioRef.current) {
        nightmareAudioRef.current.muted = newMuted;
      }
      
      return newMuted;
    });
  };

  return {
    isMuted,
    toggleMute,
  };
};
