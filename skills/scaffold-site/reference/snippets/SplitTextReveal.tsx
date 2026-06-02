'use client';
// T1 — Revelação de texto por linhas/chars (SplitText), entra debaixo de máscara.
// Uso: <SplitTextReveal as="h2" className="...">Título grande</SplitTextReveal>
import { useRef, useEffect, type ElementType, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(ScrollTrigger, SplitText);

interface Props {
  children: ReactNode;
  as?: ElementType;
  className?: string;
  type?: 'lines' | 'chars' | 'lines,chars';
  stagger?: number;
  delay?: number;
}

export default function SplitTextReveal({
  children, as: Tag = 'div', className, type = 'lines', stagger = 0.08, delay = 0,
}: Props) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const ctx = gsap.context(() => {
      const split = new SplitText(el, {
        type,
        mask: type.includes('lines') ? 'lines' : 'chars', // GSAP ≥3.13: máscara automática
      });
      const targets = type.includes('chars') ? split.chars : split.lines;
      gsap.from(targets, {
        yPercent: 110,
        duration: 1,
        ease: 'expo.out',
        stagger,
        delay,
        scrollTrigger: { trigger: el, start: 'top 85%', once: true },
      });
    }, el);

    return () => ctx.revert();
  }, [type, stagger, delay]);

  // @ts-expect-error — ref polimórfico
  return <Tag ref={ref} className={className}>{children}</Tag>;
}
