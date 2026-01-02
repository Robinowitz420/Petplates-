'use client';

import Image from 'next/image';
import React, { useEffect, useMemo, useRef, useState } from 'react';

export type SceneStatus = 'idle' | 'loading' | 'ready' | 'error';

export type MealGenerationSceneProps = {
  status: SceneStatus;
  idleImageSrc: string;
  readyImageSrc: string;
  errorImageSrc?: string;
  loadingVideoMp4Src: string;
  loadingVideoWebmSrc?: string;
  alt: string;
  width: number;
  height: number;
  className?: string;
  respectReducedMotion?: boolean;
};

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    const update = () => setPrefersReducedMotion(Boolean(mediaQuery.matches));
    update();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', update);
      return () => mediaQuery.removeEventListener('change', update);
    }

    const mediaQueryLegacy = mediaQuery as any;
    if (typeof mediaQueryLegacy.addListener === 'function') {
      mediaQueryLegacy.addListener(update);
      return () => {
        if (typeof mediaQueryLegacy.removeListener === 'function') {
          mediaQueryLegacy.removeListener(update);
        }
      };
    }
  }, []);

  return prefersReducedMotion;
}

export default function MealGenerationScene({
  status,
  idleImageSrc,
  readyImageSrc,
  errorImageSrc,
  loadingVideoMp4Src,
  loadingVideoWebmSrc,
  alt,
  width,
  height,
  className,
  respectReducedMotion = true,
}: MealGenerationSceneProps) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const didLogVideoErrorRef = useRef(false);
  const didLogDiagnosticsRef = useRef(false);
  const prefersReducedMotion = usePrefersReducedMotion();
  const [videoFailed, setVideoFailed] = useState(false);
  const [videoHasLoadedData, setVideoHasLoadedData] = useState(false);
  const [videoIsPlaying, setVideoIsPlaying] = useState(false);

  const debug = process.env.NODE_ENV !== 'production';

  const baseImageSrc = useMemo(() => {
    if (status === 'ready') return readyImageSrc;
    if (status === 'error') return errorImageSrc ?? idleImageSrc;
    return idleImageSrc;
  }, [errorImageSrc, idleImageSrc, readyImageSrc, status]);

  const imageSrc = useMemo(() => encodeURI(baseImageSrc), [baseImageSrc]);
  const mp4Src = useMemo(() => encodeURI(loadingVideoMp4Src), [loadingVideoMp4Src]);
  const webmSrc = useMemo(() => (loadingVideoWebmSrc ? encodeURI(loadingVideoWebmSrc) : undefined), [loadingVideoWebmSrc]);
  const shouldAutoplay = status === 'loading' && (!prefersReducedMotion || !respectReducedMotion);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const shouldShowVideo = status === 'loading';

    if (shouldShowVideo) {
      setVideoFailed(false);
      setVideoHasLoadedData(false);
      setVideoIsPlaying(false);
      didLogVideoErrorRef.current = false;
      didLogDiagnosticsRef.current = false;

      try {
        video.load();
      } catch {
      }
      try {
        video.currentTime = 0;
      } catch {
        // ignore
      }

      if (shouldAutoplay) {
        (async () => {
          try {
            await video.play();
          } catch {
            if (debug) {
              console.warn('[MealGenerationScene] video.play() was blocked or failed.');
            }
          }
        })();
      } else {
        try {
          video.pause();
        } catch {
          // ignore
        }
      }

      return;
    }

    setVideoHasLoadedData(false);
    setVideoIsPlaying(false);

    try {
      video.pause();
    } catch {
      // ignore
    }

    try {
      video.currentTime = 0;
    } catch {
      // ignore
    }
  }, [debug, shouldAutoplay, status]);

  useEffect(() => {
    if (!debug) return;
    if (status !== 'loading') return;
    if (didLogDiagnosticsRef.current) return;
    didLogDiagnosticsRef.current = true;

    const video = videoRef.current;
    if (!video) return;

    const canPlay = {
      mp4: video.canPlayType('video/mp4'),
      mp4H264Aac: video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"'),
      webmVp9: video.canPlayType('video/webm; codecs="vp9"'),
    };

    const logSnapshot = (label: string) => {
      console.log(`[MealGenerationScene] ${label}`, {
        prefersReducedMotion,
        videoFailed,
        canPlay,
        currentSrc: video.currentSrc,
        readyState: video.readyState,
        networkState: video.networkState,
        errorCode: video.error?.code,
      });
    };

    logSnapshot('Loading started');
    const t = window.setTimeout(() => logSnapshot('Loading +600ms'), 600);
    return () => window.clearTimeout(t);
  }, [debug, prefersReducedMotion, status, videoFailed]);

  const liveMessage = useMemo(() => {
    if (status === 'loading') return 'Generating meals…';
    if (status === 'ready') return 'Meals ready.';
    if (status === 'error') return 'Meal generation failed.';
    return '';
  }, [status]);

  const videoVisible =
    status === 'loading' &&
    !videoFailed &&
    (shouldAutoplay ? videoIsPlaying : videoHasLoadedData);

  const handleVideoError = () => {
    setVideoFailed(true);
    if (didLogVideoErrorRef.current) return;
    didLogVideoErrorRef.current = true;

    console.error('[MealGenerationScene] Loading video failed to load/decode.', {
      mp4Src,
      webmSrc,
    });
  };

  return (
    <div
      className={`relative overflow-hidden ${className ?? ''}`}
      style={{ aspectRatio: `${width} / ${height}` }}
    >
      <span className="sr-only" aria-live="polite">
        {liveMessage}
      </span>

      <Image
        src={imageSrc}
        alt={alt}
        fill
        sizes="100vw"
        className="absolute inset-0 object-cover"
        unoptimized
      />

      <video
        ref={videoRef}
        className={`absolute inset-0 w-full h-full object-cover pointer-events-none transition-opacity duration-200 motion-reduce:transition-none ${
          videoVisible ? 'opacity-100' : 'opacity-0'
        }`}
        muted
        loop
        playsInline
        preload="auto"
        autoPlay={shouldAutoplay}
        onError={handleVideoError}
        onLoadedData={() => {
          setVideoFailed(false);
          setVideoHasLoadedData(true);
        }}
        onPlaying={() => {
          setVideoIsPlaying(true);
          if (!debug) return;
          const video = videoRef.current;
          if (!video) return;
          console.log('[MealGenerationScene] Video playing', {
            currentSrc: video.currentSrc,
            readyState: video.readyState,
            networkState: video.networkState,
          });
        }}
      >
        {webmSrc ? <source src={webmSrc} type="video/webm" /> : null}
        <source src={mp4Src} type="video/mp4" />
      </video>
    </div>
  );
}
