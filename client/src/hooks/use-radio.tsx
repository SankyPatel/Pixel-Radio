import { useState, useEffect, useRef, useCallback } from 'react';
import { Station } from '@/lib/stations';
import Hls from 'hls.js';

export function useRadio() {
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const interruptedRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const currentStationRef = useRef<Station | null>(null);
  const onNextRef = useRef<(() => void) | null>(null);
  const onPrevRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    currentStationRef.current = currentStation;
  }, [currentStation]);

  const reloadAndPlay = useCallback(async () => {
    const audio = audioRef.current;
    const station = currentStationRef.current;
    if (!audio || !station) return;

    try {
      const isM3U8 = station.url.includes('.m3u8');

      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }

      if (isM3U8) {
        if (Hls.isSupported()) {
          const hls = new Hls({
            liveSyncDurationCount: 3,
            liveMaxLatencyDurationCount: 6,
          });
          hls.loadSource(station.url);
          hls.attachMedia(audio);
          hlsRef.current = hls;
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            audio.play().catch(() => {});
          });
        } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
          audio.src = station.url;
          audio.load();
          await audio.play();
        }
      } else {
        audio.src = station.url;
        audio.load();
        await audio.play();
      }
    } catch (err) {
      console.error('Resume playback failed:', err);
    }
  }, []);

  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'none';
      audioRef.current = audio;

      audio.addEventListener('pause', () => {
        if (currentStationRef.current && !audio.ended) {
          interruptedRef.current = true;
        }
      });

      audio.addEventListener('play', () => {
        interruptedRef.current = false;
        setIsPlaying(true);
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
      });

      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused';
        }
      });

      audio.addEventListener('error', (e) => {
        console.error('Audio Error:', e);
        if (interruptedRef.current && currentStationRef.current) {
          if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
          resumeTimerRef.current = setTimeout(() => {
            reloadAndPlay();
          }, 2000);
        } else {
          setIsPlaying(false);
        }
      });
    }

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
      }
      if (resumeTimerRef.current) {
        clearTimeout(resumeTimerRef.current);
      }
    };
  }, [reloadAndPlay]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentStation) {
      const isM3U8 = currentStation.url.includes('.m3u8');

      if (audio.src !== currentStation.url || (!hlsRef.current && isM3U8)) {
        if (hlsRef.current) {
          hlsRef.current.destroy();
          hlsRef.current = null;
        }

        if (isM3U8) {
          if (Hls.isSupported()) {
            const hls = new Hls({
              liveSyncDurationCount: 3,
              liveMaxLatencyDurationCount: 6,
            });
            hls.loadSource(currentStation.url);
            hls.attachMedia(audio);
            hlsRef.current = hls;
          } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
            audio.src = currentStation.url;
          }
        } else {
          audio.src = currentStation.url;
        }

        audio.load();

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

      if (isPlaying) {
        const playAudio = async () => {
          try {
            if (audio.paused || audio.ended) {
              await audio.play();
            }
          } catch (error) {
            console.error('Playback failed:', error);
            setIsPlaying(false);
          }
        };
        playAudio();
      } else {
        audio.pause();
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'paused';
        }
      }
    } else {
      audio.pause();
      setIsPlaying(false);
    }
  }, [currentStation, isPlaying]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', () => {
      interruptedRef.current = false;
      if (currentStationRef.current) {
        reloadAndPlay();
        setIsPlaying(true);
      }
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      interruptedRef.current = false;
      audioRef.current?.pause();
      setIsPlaying(false);
    });

    navigator.mediaSession.setActionHandler('stop', () => {
      interruptedRef.current = false;
      setIsPlaying(false);
      setCurrentStation(null);
    });

    navigator.mediaSession.setActionHandler('previoustrack', () => {
      if (onPrevRef.current) onPrevRef.current();
    });
    navigator.mediaSession.setActionHandler('nexttrack', () => {
      if (onNextRef.current) onNextRef.current();
    });
  }, [reloadAndPlay]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && interruptedRef.current && currentStationRef.current) {
        interruptedRef.current = false;
        reloadAndPlay();
        setIsPlaying(true);
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [reloadAndPlay]);

  const togglePlay = () => {
    if (!currentStation) return;
    if (isPlaying) {
      interruptedRef.current = false;
      setIsPlaying(false);
    } else {
      reloadAndPlay();
      setIsPlaying(true);
    }
  };

  const playStation = (station: Station) => {
    if (currentStation?.id === station.id) {
      togglePlay();
    } else {
      setCurrentStation(station);
      setIsPlaying(true);
    }
  };

  const setOnNext = useCallback((fn: () => void) => { onNextRef.current = fn; }, []);
  const setOnPrev = useCallback((fn: () => void) => { onPrevRef.current = fn; }, []);

  return {
    currentStation,
    isPlaying,
    volume,
    setVolume,
    togglePlay,
    playStation,
    setOnNext,
    setOnPrev
  };
}
