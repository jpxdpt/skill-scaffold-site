'use client';
// T2 — Media com clip-path reveal (direções) + parallax + scale "lente".
// Uso: <FlipMedia src="/images/x.jpg" alt="..." dir="upDown" className="aspect-[4/5]" />
import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type Dir = 'upDown' | 'downUp' | 'leftRight' | 'rightLeft';
const FROM: Record<Dir, string> = {
  upDown: 'inset(100% 0 0 0)',
  downUp: 'inset(0 0 100% 0)',
  leftRight: 'inset(0 100% 0 0)',
  rightLeft: 'inset(0 0 0 100%)',
};

interface Props {
  src: string;
  alt: string;
  dir?: Dir;
  parallax?: number; // intensidade (0 = sem parallax)
  className?: string;
}

export default function FlipMedia({ src, alt, dir = 'upDown', parallax = 6, className }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const ctx = gsap.context(() => {
      if (reduce) return;
      const st = { trigger: wrap.current, start: 'top 85%', once: true } as const;
      gsap.fromTo(wrap.current, { clipPath: FROM[dir] }, { clipPath: 'inset(0 0 0 0)', duration: 1.1, ease: 'expo.out', scrollTrigger: st });
      gsap.fromTo(img.current, { scale: 1.15 }, { scale: 1, duration: 1.1, ease: 'expo.out', scrollTrigger: st });
      if (parallax) {
        gsap.fromTo(img.current, { yPercent: -parallax }, {
          yPercent: parallax, ease: 'none',
          scrollTrigger: { trigger: wrap.current, start: 'top bottom', end: 'bottom top', scrub: true },
        });
      }
    }, wrap);
    return () => ctx.revert();
  }, [dir, parallax]);

  return (
    <div ref={wrap} className={`overflow-hidden ${className ?? ''}`}>
      <img ref={img} src={src} alt={alt} loading="lazy" className="h-full w-full object-cover" />
    </div>
  );
}
