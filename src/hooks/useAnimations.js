import { useEffect, useRef, useState } from 'react';

/**
 * useInView — fires once when element scrolls into viewport.
 * Used to trigger entrance animations on scroll.
 */
export function useInView({ threshold = 0.2, rootMargin = '0px', once = true } = {}) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === 'undefined') {
      // Server-side or unsupported — show immediately
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setInView(true);
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setInView(false);
          }
        });
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin, once]);

  return [ref, inView];
}

/**
 * useCountUp — animated counter from 0 → target.
 * Triggers when `start` becomes true. Handles cleanup.
 */
export function useCountUp({ end, start = true, duration = 1400, decimals = 0 }) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    if (!start) {
      setValue(0);
      return;
    }
    startTimeRef.current = null;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const tick = (now) => {
      if (!startTimeRef.current) startTimeRef.current = now;
      const elapsed = now - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);
      const eased = easeOutCubic(progress);
      const current = end * eased;
      setValue(decimals === 0 ? Math.round(current) : Math.round(current * 10 ** decimals) / 10 ** decimals);
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      }
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, [end, start, duration, decimals]);

  return value;
}

/**
 * useStaggeredAppear — returns an array of `delay` values for use in
 * staggered fade-in animations on lists.
 */
export function useStagger(count, baseDelay = 80) {
  return Array.from({ length: count }, (_, i) => i * baseDelay);
}
