import { useState, useEffect, useCallback, useRef } from 'react';
import { Station } from '@/lib/stations';

declare global {
  interface Window {
    __onGCastApiAvailable?: (isAvailable: boolean) => void;
    cast?: any;
    chrome?: any;
  }
}

export function useCast() {
  const [isCastAvailable, setIsCastAvailable] = useState(false);
  const [isCasting, setIsCasting] = useState(false);
  const [castDeviceName, setCastDeviceName] = useState<string | null>(null);
  const sessionRef = useRef<any>(null);

  useEffect(() => {
    window.__onGCastApiAvailable = (isAvailable: boolean) => {
      if (isAvailable) {
        initializeCast();
      }
    };

    if (!document.querySelector('script[src*="cast_sender"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
      script.async = true;
      document.head.appendChild(script);
    } else if (window.cast && window.cast.framework) {
      initializeCast();
    }
  }, []);

  const initializeCast = () => {
    const castContext = window.cast.framework.CastContext.getInstance();
    castContext.setOptions({
      receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
      autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.ORIGIN_SCOPED
    });

    castContext.addEventListener(
      window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
      (event: any) => {
        const session = castContext.getCurrentSession();
        if (event.sessionState === window.cast.framework.SessionState.SESSION_STARTED ||
            event.sessionState === window.cast.framework.SessionState.SESSION_RESUMED) {
          setIsCasting(true);
          sessionRef.current = session;
          setCastDeviceName(session?.getCastDevice()?.friendlyName || 'Cast Device');
        } else if (event.sessionState === window.cast.framework.SessionState.SESSION_ENDED) {
          setIsCasting(false);
          sessionRef.current = null;
          setCastDeviceName(null);
        }
      }
    );

    setIsCastAvailable(true);
  };

  const requestCast = useCallback(() => {
    if (!window.cast) return;
    const castContext = window.cast.framework.CastContext.getInstance();
    castContext.requestSession();
  }, []);

  const castStation = useCallback((station: Station) => {
    const session = sessionRef.current;
    if (!session) return;

    const mediaInfo = new window.chrome.cast.media.MediaInfo(station.url, 'audio/mpeg');
    mediaInfo.metadata = new window.chrome.cast.media.MusicTrackMediaMetadata();
    mediaInfo.metadata.title = station.name;
    mediaInfo.metadata.artist = station.genre;
    mediaInfo.metadata.images = [
      new window.chrome.cast.Image(window.location.origin + station.image)
    ];

    const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
    session.loadMedia(request).then(
      () => console.log('Cast: Media loaded'),
      (err: any) => console.error('Cast: Error loading media', err)
    );
  }, []);

  const stopCast = useCallback(() => {
    if (!window.cast) return;
    const castContext = window.cast.framework.CastContext.getInstance();
    castContext.endCurrentSession(true);
  }, []);

  return {
    isCastAvailable,
    isCasting,
    castDeviceName,
    requestCast,
    castStation,
    stopCast
  };
}
