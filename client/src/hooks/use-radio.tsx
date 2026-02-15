import { useState, useEffect, useRef } from 'react';
import { Station } from '@/lib/stations';

export function useRadio() {
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize Audio Object
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.preload = 'none';
      
      // Handle playback ending or errors
      audioRef.current.onended = () => setIsPlaying(false);
      audioRef.current.onerror = (e) => {
        console.error("Audio Error:", e);
        setIsPlaying(false);
      };
    }
  }, []);

  // Handle Play/Pause and Source Change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentStation) {
      // Only change source if it's different to prevent reloading
      if (audio.src !== currentStation.url) {
        audio.src = currentStation.url;
        audio.load();
        
        // Update Media Session Metadata
        if ('mediaSession' in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: currentStation.name,
            artist: currentStation.genre,
            artwork: [
              { src: currentStation.image, sizes: '512x512', type: 'image/png' }
            ]
          });
        }
      }

      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch(error => {
            console.error("Playback failed:", error);
            setIsPlaying(false);
          });
        }
      } else {
        audio.pause();
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [currentStation, isPlaying]);

  // Handle Media Session Actions
  useEffect(() => {
    if ('mediaSession' in navigator) {
      navigator.mediaSession.setActionHandler('play', () => setIsPlaying(true));
      navigator.mediaSession.setActionHandler('pause', () => setIsPlaying(false));
      navigator.mediaSession.setActionHandler('stop', () => {
        setIsPlaying(false);
        setCurrentStation(null);
      });
    }
  }, []);

  // Handle Volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const togglePlay = () => {
    if (!currentStation) return;
    setIsPlaying(!isPlaying);
  };

  const playStation = (station: Station) => {
    if (currentStation?.id === station.id) {
      togglePlay();
    } else {
      setCurrentStation(station);
      setIsPlaying(true);
    }
  };

  return {
    currentStation,
    isPlaying,
    volume,
    setVolume,
    togglePlay,
    playStation
  };
}
