import { useEffect, useRef, useState } from "react";

interface ScrollVideoProps {
  src: string;
  /** Pixels of scroll for a 10 second video (scaled by actual duration). */
  scrollPerLoop?: number;
  /** Extra scroll distance after the video reaches its last frame. */
  afterEndScroll?: number;
}

const BASELINE_SECONDS = 10;
const CAPTION_FADE_SECONDS = 0.7;

type CaptionPlacement = "left" | "right" | "center-bottom";
type CaptionTone = "regular" | "final";

const CAPTIONS = [
  {
    start: 0.5,
    end: 2,
    text: "Pure. Fresh. Natural.",
    placement: "right",
    tone: "regular",
  },
  {
    start: 2,
    end: 4,
    text: "Bursting with real strawberry flavor",
    placement: "left",
    tone: "regular",
  },
  {
    start: 4,
    end: 6.5,
    text: "Smooth, rich & refreshing in every sip",
    placement: "right",
    tone: "regular",
  },
  {
    start: 6.5,
    end: 9,
    text: "Crafted from handpicked goodness",
    placement: "left",
    tone: "regular",
  },
  {
    start: 9,
    end: 12,
    text: "This is Berry Bliss 🍓",
    placement: "center-bottom",
    tone: "final",
  },
] as const satisfies ReadonlyArray<{
  start: number;
  end: number;
  text: string;
  placement: CaptionPlacement;
  tone: CaptionTone;
}>;

/**
 * Scroll-scrubbed video player.
 * - Scroll down → scrubs forward
 * - Scroll up → scrubs backward
 * - Stops at the last frame when reaching the end
 */
export function ScrollVideo({
  src,
  scrollPerLoop = 2400,
  afterEndScroll = 0,
}: ScrollVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const spacerRef = useRef<HTMLDivElement>(null);
  const targetTimeRef = useRef(0);
  const rafRef = useRef<number | null>(null);
  const [duration, setDuration] = useState(0);
  const [ready, setReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const activeCaptionIndex = CAPTIONS.findIndex((caption, index) => {
    const isLast = index === CAPTIONS.length - 1;
    if (isLast) {
      return currentTime >= caption.start && currentTime <= caption.end;
    }
    return currentTime >= caption.start && currentTime < caption.end;
  });
  const activeCaption =
    activeCaptionIndex >= 0 ? CAPTIONS[activeCaptionIndex] : null;

  const getCaptionWrapperClassName = (placement: CaptionPlacement) => {
    if (placement === "left") {
      return "fixed inset-y-0 left-4 z-10 flex items-center sm:left-8";
    }
    if (placement === "right") {
      return "fixed inset-y-0 right-4 z-10 flex items-center justify-end sm:right-8";
    }
    return "fixed inset-x-4 bottom-8 z-10 flex justify-center sm:bottom-12";
  };

  const totalScrollDistance =
    duration > 0
      ? (duration / BASELINE_SECONDS) * scrollPerLoop
      : scrollPerLoop;

  // Keep a tall spacer so the page is scrollable.
  useEffect(() => {
    if (!spacerRef.current) return;
    spacerRef.current.style.height = `${totalScrollDistance + afterEndScroll + window.innerHeight}px`;
  }, [afterEndScroll, totalScrollDistance]);

  // Wire up video metadata. Wait for canplay so seeks actually take effect.
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const markReady = () => {
      if (v.duration && Number.isFinite(v.duration)) {
        setDuration(v.duration);
        setReady(true);
      }
    };
    v.addEventListener("loadedmetadata", markReady);
    v.addEventListener("durationchange", markReady);
    v.addEventListener("canplay", markReady);
    if (v.readyState >= 1) markReady();
    return () => {
      v.removeEventListener("loadedmetadata", markReady);
      v.removeEventListener("durationchange", markReady);
      v.removeEventListener("canplay", markReady);
    };
  }, [src]);

  // Main scrub loop.
  useEffect(() => {
    if (!ready || !duration) return;
    const v = videoRef.current!;
    v.pause();

    let seeking = false;

    const onSeeking = () => {
      seeking = true;
    };
    const onSeeked = () => {
      seeking = false;
    };
    v.addEventListener("seeking", onSeeking);
    v.addEventListener("seeked", onSeeked);

    const onScroll = () => {
      const y = window.scrollY;
      const clampedScroll = Math.min(Math.max(y, 0), totalScrollDistance);
      const progress = clampedScroll / totalScrollDistance;
      targetTimeRef.current = progress * duration;
    };

    let lastTick = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(0.1, (now - lastTick) / 1000);
      lastTick = now;

      if (!seeking) {
        const current = v.currentTime;
        const target = targetTimeRef.current;
        const diff = target - current;

        const next = current + diff * Math.min(1, dt * 8);
        const clampedTime = Math.min(Math.max(next, 0), duration);

        if (Math.abs(clampedTime - current) > 0.01) {
          try {
            v.currentTime = clampedTime;
          } catch {
            // ignore
          }
        }

        setCurrentTime(v.currentTime);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    // Seed time so first frame renders immediately.
    try {
      v.currentTime = 0.001;
    } catch {
      // ignore
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener("scroll", onScroll);
      v.removeEventListener("seeking", onSeeking);
      v.removeEventListener("seeked", onSeeked);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [ready, duration, totalScrollDistance]);

  return (
    <>
      <div ref={spacerRef} aria-hidden="true" />
      <div className="fixed inset-0 z-0 bg-background">
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="auto"
          className="h-full w-full object-cover"
        />

        {activeCaption ? (
          <div
            className={`pointer-events-none ${getCaptionWrapperClassName(activeCaption.placement)}`}
          >
            {(() => {
              const fadeIn = Math.min(
                1,
                Math.max(
                  0,
                  (currentTime - activeCaption.start) / CAPTION_FADE_SECONDS,
                ),
              );
              const fadeOut = Math.min(
                1,
                Math.max(
                  0,
                  (activeCaption.end - currentTime) / CAPTION_FADE_SECONDS,
                ),
              );
              const opacity = Math.min(fadeIn, fadeOut);
              const translateY = (1 - fadeIn) * 16 - (1 - fadeOut) * 8;
              const blurPx = (1 - opacity) * 8;

              return (
                <p
                  className={`w-[min(50vw,42rem)] max-w-[85vw] rounded-2xl bg-black/24 px-5 py-4 text-[clamp(1.75rem,4.8vw,4rem)] leading-[1.24] tracking-[0.02em] text-white shadow-[0_12px_40px_rgba(0,0,0,0.45)] backdrop-blur-[6px] ${
                    activeCaption.tone === "final"
                      ? "text-center font-bold"
                      : "font-medium"
                  }`}
                  style={{
                    opacity,
                    transform: `translateY(${translateY}px)`,
                    filter: `blur(${blurPx}px)`,
                    transition:
                      "opacity 700ms ease, transform 700ms ease, filter 700ms ease",
                    fontFamily: '"Poppins", "Helvetica Neue", sans-serif',
                  }}
                >
                  {activeCaption.text}
                </p>
              );
            })()}
          </div>
        ) : null}
      </div>
    </>
  );
}
