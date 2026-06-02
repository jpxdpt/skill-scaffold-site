'use client';
// T8 (SITUACIONAL) — Scroll horizontal com pin + scrub. 1 por página, evitar em sites sóbrios.
// Uso: <HorizontalScroll>{cards}</HorizontalScroll>
import { useRef, useEffect, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function HorizontalScroll({ children }: { children: ReactNode }) {
  const section = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const ctx = gsap.context(() => {
      const t = track.current!;
      const distance = () => t.scrollWidth - window.innerWidth;
      gsap.to(t, {
        x: () => -distance(),
        ease: 'none',
        scrollTrigger: {
          trigger: section.current,
          pin: true,
          scrub: 1,
          end: () => `+=${distance()}`,
          invalidateOnRefresh: true,
        },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section ref={section} className="overflow-hidden">
      <div ref={track} className="flex w-max gap-8 will-change-transform">{children}</div>
    </section>
  );
}
