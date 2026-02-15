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
  const castInitializedRef = useRef(false);
  const pendingStationRef = useRef<Station | null>(null);
  const currentCastStationRef = useRef<Station | null>(null);

  const getContentType = useCallback((url: string) => {
    if (url.includes('.m3u8')) return 'application/x-mpegURL';
    if (url.includes('.aac') || url.includes('ESTAAC')) return 'audio/aac';
    return 'audio/mpeg';
  }, []);

  const loadMediaOnSession = useCallback((station: Station) => {
    try {
      const castSession = window.cast?.framework?.CastContext?.getInstance()?.getCurrentSession();
      if (!castSession) {
        console.warn('Cast: No active session to load media on');
        return;
      }

      const contentType = getContentType(station.url);
      const mediaInfo = new window.chrome.cast.media.MediaInfo(station.url, contentType);
      mediaInfo.streamType = window.chrome.cast.media.StreamType.LIVE;

      const metadata = new window.chrome.cast.media.MusicTrackMediaMetadata();
      metadata.title = station.name;
      metadata.artist = station.genre;
      metadata.images = [
        new window.chrome.cast.Image(window.location.origin + station.artworkLg)
      ];
      mediaInfo.metadata = metadata;

      const request = new window.chrome.cast.media.LoadRequest(mediaInfo);
      request.autoplay = true;

      castSession.loadMedia(request).then(
        () => {
          console.log('Cast: Media loaded -', station.name);
          currentCastStationRef.current = station;
        },
        (err: any) => console.error('Cast: Load media error', err)
      );
    } catch (err) {
      console.error('Cast: Error in loadMediaOnSession', err);
    }
  }, [getContentType]);

  const initializeCast = useCallback(() => {
    if (castInitializedRef.current) return;
    if (!window.cast?.framework || !window.chrome?.cast) return;

    try {
      const context = window.cast.framework.CastContext.getInstance();
      context.setOptions({
        receiverApplicationId: window.chrome.cast.media.DEFAULT_MEDIA_RECEIVER_APP_ID,
        autoJoinPolicy: window.chrome.cast.AutoJoinPolicy.TAB_AND_ORIGIN_SCOPED
      });

      context.addEventListener(
        window.cast.framework.CastContextEventType.SESSION_STATE_CHANGED,
        (event: any) => {
          const state = event.sessionState;
          console.log('Cast: Session state changed to', state);

          if (state === window.cast.framework.SessionState.SESSION_STARTED ||
              state === window.cast.framework.SessionState.SESSION_RESUMED) {
            const session = context.getCurrentSession();
            const deviceName = session?.getCastDevice()?.friendlyName || 'Cast Device';
            setIsCasting(true);
            setCastDeviceName(deviceName);
            console.log('Cast: Connected to', deviceName);

            if (pendingStationRef.current) {
              setTimeout(() => {
                loadMediaOnSession(pendingStationRef.current!);
                pendingStationRef.current = null;
              }, 500);
            }
          } else if (state === window.cast.framework.SessionState.SESSION_ENDED) {
            setIsCasting(false);
            setCastDeviceName(null);
            currentCastStationRef.current = null;
            console.log('Cast: Session ended');
          }
        }
      );

      castInitializedRef.current = true;
      setIsCastAvailable(true);
      console.log('Cast: Initialized successfully');
    } catch (err) {
      console.error('Cast: Initialization failed', err);
    }
  }, [loadMediaOnSession]);

  useEffect(() => {
    window.__onGCastApiAvailable = (isAvailable: boolean) => {
      console.log('Cast: API available =', isAvailable);
      if (isAvailable) {
        initializeCast();
      }
    };

    if (!document.querySelector('script[src*="cast_sender"]')) {
      const script = document.createElement('script');
      script.src = 'https://www.gstatic.com/cv/js/sender/v1/cast_sender.js?loadCastFramework=1';
      script.async = true;
      script.onerror = () => console.error('Cast: Failed to load SDK script');
      document.head.appendChild(script);
    } else if (window.cast?.framework) {
      initializeCast();
    }
  }, [initializeCast]);

  const requestCast = useCallback(() => {
    if (!window.cast?.framework) {
      console.warn('Cast: Framework not available');
      return;
    }
    try {
      const context = window.cast.framework.CastContext.getInstance();
      context.requestSession().then(
        () => console.log('Cast: Session request successful'),
        (err: any) => {
          if (err === 'cancel' || err?.code === 'cancel') {
            console.log('Cast: User cancelled');
          } else {
            console.error('Cast: Session request failed', err);
          }
        }
      );
    } catch (err) {
      console.error('Cast: requestSession error', err);
    }
  }, []);

  const castStation = useCallback((station: Station) => {
    if (!window.cast?.framework) return;

    const context = window.cast.framework.CastContext.getInstance();
    const session = context.getCurrentSession();

    if (session) {
      loadMediaOnSession(station);
    } else {
      pendingStationRef.current = station;
      requestCast();
    }
  }, [requestCast, loadMediaOnSession]);

  const stopCast = useCallback(() => {
    if (!window.cast?.framework) return;
    try {
      const context = window.cast.framework.CastContext.getInstance();
      context.endCurrentSession(true);
    } catch (err) {
      console.error('Cast: Error stopping session', err);
    }
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
