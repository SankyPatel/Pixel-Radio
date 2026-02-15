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
  const castContextRef = useRef<any>(null);
  const pendingStationRef = useRef<Station | null>(null);

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
    try {
      const context = window.cast.framework.CastContext.getInstance();
      context.setOptions({
        receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED
      });

      castContextRef.current = context;

      context.addEventListener(
        window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        (event: any) => {
          switch (event.sessionState) {
            case window.cast.framework.SessionState.SESSION_STARTED:
            case window.cast.framework.SessionState.SESSION_RESUMED: {
              const session = context.getCurrentSession();
              setIsCasting(true);
              setCastDeviceName(session?.getCastDevice()?.friendlyName || 'Cast Device');

              if (pendingStationRef.current) {
                loadMediaOnSession(session, pendingStationRef.current);
                pendingStationRef.current = null;
              }
              break;
            }
            case window.cast.framework.SessionState.SESSION_ENDED:
              setIsCasting(false);
              setCastDeviceName(null);
              break;
          }
        }
      );

      setIsCastAvailable(true);
    } catch (err) {
      console.error('Cast: Failed to initialize', err);
    }
  };

  const getContentType = (url: string) => {
    if (url.includes('.m3u8')) return 'application/x-mpegURL';
    if (url.includes('.aac') || url.includes('ESTAAC')) return 'audio/aac';
    return 'audio/mpeg';
  };

  const loadMediaOnSession = (session: any, station: Station) => {
    if (!session) return;

    try {
      const contentType = getContentType(station.url);
      const mediaInfo = new window.chrome.cast.media.MediaInfo(station.url, contentType);

      mediaInfo.streamType = window.chrome.cast.media.StreamType.LIVE;

      const metadata = new window.chrome.cast.media.MusicTrackMediaMetadata();
      metadata.title = station.name;
      metadata.artist = station.genre;
      metadata.images = [
        new window.chrome.cast.Image(window.location.origin + station.image)
      ];
      mediaInfo.metadata = metadata;

      const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
      request.autoplay = true;

      session.loadMedia(request).then(
        () => console.log('Cast: Media loaded successfully'),
        (err: any) => console.error('Cast: Error loading media', err)
      );
    } catch (err) {
      console.error('Cast: Error creating media request', err);
    }
  };

  const requestCast = useCallback(() => {
    if (!castContextRef.current) return;
    castContextRef.current.requestSession().then(
      () => console.log('Cast: Session started'),
      (err: any) => {
        if (err !== 'cancel') {
          console.error('Cast: Error starting session', err);
        }
      }
    );
  }, []);

  const castStation = useCallback((station: Station) => {
    const context = castContextRef.current;
    if (!context) return;

    const session = context.getCurrentSession();
    if (session) {
      loadMediaOnSession(session, station);
    } else {
      pendingStationRef.current = station;
      requestCast();
    }
  }, [requestCast]);

  const stopCast = useCallback(() => {
    if (!castContextRef.current) return;
    castContextRef.current.endCurrentSession(true);
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
