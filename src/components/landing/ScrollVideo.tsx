"use client";

import { useEffect, useRef, useState } from "react";

// Scroll-gesteuertes Video: spielt NICHT automatisch ab. Der Scroll-
// Fortschritt der gesamten Seite wird auf die Videolaufzeit gemappt
// und per requestAnimationFrame weich interpoliert → flüssiges
// Frame-by-Frame-Scrubbing. Am Ende der Seite (Footer) ist das Video
// bei seiner letzten Sekunde angelangt.
//
// Robustheit:
//  - duration/readyState werden pro Frame geprüft (nicht nur per Event),
//    damit ein vor dem Mount geladenes Video oder verzögertes Metadata
//    nie zu einem eingefrorenen Frame führen.
//  - Seek erst ab HAVE_METADATA (readyState >= 1).
//  - Bei Lade-Fehler bleibt das Poster sichtbar (kein schwarzes Loch).
export default function ScrollVideo({
  src,
  poster,
  className,
}: {
  src: string;
  poster?: string;
  className?: string;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isIOS] = useState(() => {
    if (typeof window === "undefined") return false;
    const ua = navigator.userAgent;
    return (
      /iPad|iPhone|iPod/.test(ua) ||
      (navigator.platform === "MacIntel" &&
        typeof navigator.maxTouchPoints === "number" &&
        navigator.maxTouchPoints > 1)
    );
  });

  useEffect(() => {
    // iOS Safari: programmatisches currentTime-Seeking (Scroll-Scrub) wird
    // ohne Nutzer-Geste blockiert → Video bleibt auf Frame 0/unsichtbar.
    // Daher auf iOS ein reguläres muted-autoplay-Loop-Video verwenden
    // (muted+playsInline+autoplay funktioniert dort zuverlässig).
    if (isIOS) {
      const v = videoRef.current;
      if (!v) return;
      try {
        v.muted = true;
        v.playsInline = true;
        const p = v.play();
        if (p) p.catch(() => {});
      } catch {
        /* ignore */
      }
      return;
    }

    const video = videoRef.current;
    if (!video) return;

    let rafId = 0;
    let duration = 0;
    let target = 0;
    let lastSet = -1;
    let applyStatic: (() => void) | null = null;

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const updateTarget = () => {
      const doc = document.documentElement;
      const max = doc.scrollHeight - window.innerHeight;
      const progress =
        max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      target = progress * duration;
    };

    const syncDuration = () => {
      if (video.readyState < 1) return false;
      const d = video.duration;
      if (Number.isFinite(d) && d > 0) {
        duration = d;
        return true;
      }
      return false;
    };

    const tick = () => {
      if (duration === 0 && syncDuration()) {
        updateTarget();
      }
      if (duration > 0 && !video.seeking && video.readyState >= 1) {
        // Sanftes Nachziehen des Zeitpunkts = flüssige Wiedergabe
        const current = video.currentTime;
        const next = reduceMotion
          ? target
          : current + (target - current) * 0.12;
        const clamped = Math.min(Math.max(next, 0), duration - 0.01);
        if (Math.abs(clamped - lastSet) > 0.004) {
          try {
            video.currentTime = clamped;
            lastSet = clamped;
          } catch {
            /* Seek noch nicht möglich */
          }
        }
      }
      if (!reduceMotion) {
        rafId = requestAnimationFrame(tick);
      }
    };

    const onLoadedMetadata = () => {
      syncDuration();
      updateTarget();
    };
    const onError = () => {
      // Video nicht ladbar → rAF anhalten, Poster bleibt stehen.
      cancelAnimationFrame(rafId);
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("error", onError);
    syncDuration();

    window.addEventListener("scroll", updateTarget, { passive: true });
    window.addEventListener("resize", updateTarget);
    window.addEventListener("orientationchange", updateTarget);
    updateTarget();
    if (reduceMotion) {
      // Reduced motion: kein Dauer-rAF — Frame nur beim Scrollen setzen.
      applyStatic = () => {
        if (duration === 0 && syncDuration()) updateTarget();
        if (duration > 0 && video.readyState >= 1) {
          try {
            video.currentTime = Math.min(Math.max(target, 0), duration - 0.01);
          } catch {
            /* ignore */
          }
        }
      };
      window.addEventListener("scroll", applyStatic, { passive: true });
      applyStatic();
    } else {
      rafId = requestAnimationFrame(tick);
    }

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", updateTarget);
      window.removeEventListener("resize", updateTarget);
      window.removeEventListener("orientationchange", updateTarget);
      if (applyStatic) window.removeEventListener("scroll", applyStatic);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("error", onError);
    };
  }, [isIOS]);

  return (
    <video
      ref={videoRef}
      muted
      playsInline
      autoPlay={isIOS}
      loop={isIOS}
      preload="auto"
      disablePictureInPicture
      disableRemotePlayback
      poster={poster}
      aria-hidden="true"
      className={className}
    >
      <source src={src} type="video/mp4" />
    </video>
  );
}
