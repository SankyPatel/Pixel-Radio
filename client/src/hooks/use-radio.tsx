import { useState, useEffect, useRef } from 'react';
import { Station } from '@/lib/stations';
import Hls from 'hls.js';

export function useRadio() {
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);

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

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
    };
  }, []);

  // Handle Play/Pause and Source Change
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentStation) {
      const isM3U8 = currentStation.url.includes('.m3u8');

      // Only change source if it's different to prevent reloading
      if (audio.src !== currentStation.url) {
        // Cleanup existing HLS
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }

        if (isM3U8) {
          if (Hls.isSupported()) {
            const hls = new Hls();
            hls.loadSource(currentStation.url);
            hls.attachMedia(audio);
            hlsRef.current = hls;
          } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            audio.src = currentStation.url;
          }
        } else {
          audio.src = currentStation.url;
        }
        
        audio.load();
        
        // Update Media Session Metadata
        if ('mediaSession' in navigator) {
          const artSrc = window.location.origin + currentStation.artworkLg;
          const artType = currentStation.artworkLg.endsWith('.jpg') ? 'image/jpeg' : 'image/png';
          navigator.mediaSession.metadata = new MediaMetadata({
            title: currentStation.name,
            artist: currentStation.genre,
            album: 'Pixel Radio',
            artwork: [
              { src: artSrc, sizes: '180x180', type: artType },
              { src: artSrc, sizes: '256x256', type: artType },
              { src: artSrc, sizes: '512x512', type: artType }
            ]
          });
        }
      }

      const playAudio = async () => {
        try {
          if (audio.paused || audio.ended) {
            await audio.play();
          }
        } catch (error) {
          console.error("Playback failed:", error);
          setIsPlaying(false);
        }
      };

      if (isPlaying) {
        playAudio();
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
