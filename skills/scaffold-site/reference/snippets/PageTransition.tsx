'use client';
// T9 (SITUACIONAL) — Transição de rota por overlay wipe (GSAP). Substitui o Swup do site
// original, que não encaixa no App Router. SÓ para sites multi-página; os sites desta skill
// são single-page por defeito, por isso normalmente NÃO uses isto.
//
// Setup:
//   1) <RouteWipe /> uma vez no layout público.
//   2) usa <TransitionLink href> em vez de <Link> nas navegações internas.
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';
import { type ReactNode } from 'react';

let overlayEl: HTMLDivElement | null = null;

export function RouteWipe() {
  return (
    <div
      ref={(el) => { overlayEl = el; }}
      className="pointer-events-none fixed inset-0 z-[9997] hidden bg-[hsl(var(--accent))]"
      style={{ transform: 'scaleY(0)' }}
    />
  );
}

export function TransitionLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  const router = useRouter();
  const go = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!overlayEl || window.matchMedia('(prefers-reduced-motion: reduce)').matches) { router.push(href); return; }
    gsap.timeline()
      .set(overlayEl, { display: 'block', transformOrigin: 'bottom' })
      .fromTo(overlayEl, { scaleY: 0 }, { scaleY: 1, duration: 0.5, ease: 'power3.inOut' })
      .add(() => { router.push(href); window.scrollTo(0, 0); })
      .to(overlayEl, { scaleY: 0, transformOrigin: 'top', duration: 0.5, ease: 'power3.inOut', delay: 0.15 })
      .set(overlayEl, { display: 'none' });
  };
  return <a href={href} onClick={go} className={className}>{children}</a>;
}
