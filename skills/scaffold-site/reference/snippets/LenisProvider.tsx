'use client';
// Smooth scroll Lenis — SÓ desktop (como o normalisboring), sincronizado com o GSAP ticker.
// Uso: envolve {children} em app/layout.tsx (site público).
import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);

export default function LenisProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const coarse = window.matchMedia('(pointer: coarse)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (coarse || reduce || window.innerWidth < 768) return; // só desktop

    const lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    const onTick = (t: number) => lenis.raf(t * 1000);
    gsap.ticker.add(onTick);
    gsap.ticker.lagSmoothing(0);

    return () => { lenis.destroy(); gsap.ticker.remove(onTick); };
  }, []);

  return <>{children}</>;
}
