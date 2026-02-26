import { useState, useEffect, useRef, useCallback } from 'react';
import { Station } from '@/lib/stations';
import Hls from 'hls.js';

export function useRadio() {
  const [currentStation, setCurrentStation] = useState<Station | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hlsRef = useRef<Hls | null>(null);
  const currentStationRef = useRef<Station | null>(null);
  const onNextRef = useRef<(() => void) | null>(null);
  const onPrevRef = useRef<(() => void) | null>(null);
  const isPlayingRef = useRef(false);
  const wasPlayingBeforeHiddenRef = useRef(false);
  const resumeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    currentStationRef.current = currentStation;
  }, [currentStation]);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  const setupSource = useCallback((audio: HTMLAudioElement, station: Station) => {
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
        return new Promise<void>((resolve) => {
          hls.on(Hls.Events.MANIFEST_PARSED, () => resolve());
        });
      } else if (audio.canPlayType('application/vnd.apple.mpegurl')) {
        audio.src = station.url;
        audio.load();
      }
    } else {
      audio.src = station.url;
      audio.load();
    }
    return Promise.resolve();
  }, []);

  const reloadAndPlay = useCallback(async () => {
    const audio = audioRef.current;
    const station = currentStationRef.current;
    if (!audio || !station) return;

    try {
      await setupSource(audio, station);
      await audio.play();
    } catch (err) {
      console.error('Resume playback failed:', err);
    }
  }, [setupSource]);

  useEffect(() => {
    if (!audioRef.current) {
      const audio = document.createElement('audio');
      audio.preload = 'none';
      audio.setAttribute('playsinline', '');
      audio.setAttribute('x-webkit-airplay', 'allow');
      audio.style.display = 'none';
      document.body.appendChild(audio);
      audioRef.current = audio;

      audio.addEventListener('play', () => {
        setIsPlaying(true);
        if ('mediaSession' in navigator) {
          navigator.mediaSession.playbackState = 'playing';
        }
      });

      audio.addEventListener('playing', () => {
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
  }, []);

  const updateMediaSession = useCallback((station: Station) => {
    if (!('mediaSession' in navigator)) return;
    const artSrc = window.location.origin + station.artworkLg;
    const artType = station.artworkLg.endsWith('.jpg') ? 'image/jpeg' : station.artworkLg.endsWith('.webp') ? 'image/webp' : 'image/png';
    navigator.mediaSession.metadata = new MediaMetadata({
      title: station.name,
      artist: station.genre,
      album: 'Pixel Radio',
      artwork: [
        { src: artSrc, sizes: '96x96', type: artType },
        { src: artSrc, sizes: '180x180', type: artType },
        { src: artSrc, sizes: '256x256', type: artType },
        { src: artSrc, sizes: '512x512', type: artType }
      ]
    });
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (currentStation) {
      const isM3U8 = currentStation.url.includes('.m3u8');
      const needsSourceChange = audio.src !== currentStation.url || (!hlsRef.current && isM3U8 && Hls.isSupported());

      if (needsSourceChange) {
        setupSource(audio, currentStation);
        updateMediaSession(currentStation);
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
      audio.removeAttribute('src');
      audio.load();
      setIsPlaying(false);
    }
  }, [currentStation, isPlaying, setupSource, updateMediaSession]);

  useEffect(() => {
    if (!('mediaSession' in navigator)) return;

    navigator.mediaSession.setActionHandler('play', () => {
      if (currentStationRef.current) {
        reloadAndPlay();
        setIsPlaying(true);
      }
    });

    navigator.mediaSession.setActionHandler('pause', () => {
      audioRef.current?.pause();
      setIsPlaying(false);
    });

    navigator.mediaSession.setActionHandler('stop', () => {
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
      if (document.visibilityState === 'hidden') {
        wasPlayingBeforeHiddenRef.current = isPlayingRef.current;
      }

      if (document.visibilityState === 'visible') {
        const audio = audioRef.current;
        if (wasPlayingBeforeHiddenRef.current && currentStationRef.current && audio) {
          if (audio.paused || audio.readyState === 0) {
            if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
            resumeTimerRef.current = setTimeout(() => {
              if (isPlayingRef.current || wasPlayingBeforeHiddenRef.current) {
                reloadAndPlay();
                setIsPlaying(true);
              }
            }, 500);
          }
        }
      }
    };

    const handlePageShow = (e: PageTransitionEvent) => {
      if (e.persisted && wasPlayingBeforeHiddenRef.current && currentStationRef.current) {
        if (resumeTimerRef.current) clearTimeout(resumeTimerRef.current);
        resumeTimerRef.current = setTimeout(() => {
          reloadAndPlay();
          setIsPlaying(true);
        }, 500);
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('pageshow', handlePageShow);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('pageshow', handlePageShow);
    };
  }, [reloadAndPlay]);

  const togglePlay = () => {
    if (!currentStation) return;
    if (isPlaying) {
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
