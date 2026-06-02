'use client';
// T4 — Cursor: ponto + anel com lerp, cresce em links/[data-text] (mostra o texto no anel).
// Uso: <CustomCursor /> no layout público. Marca botões especiais com data-text="Ver".
import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

export default function CustomCursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const label = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (window.matchMedia('(pointer: coarse)').matches) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const pos = { x: innerWidth / 2, y: innerHeight / 2 };
    const ringPos = { ...pos };
    const onMove = (e: PointerEvent) => { pos.x = e.clientX; pos.y = e.clientY; };
    window.addEventListener('pointermove', onMove);

    const tick = () => {
      ringPos.x += (pos.x - ringPos.x) * 0.15;
      ringPos.y += (pos.y - ringPos.y) * 0.15;
      gsap.set(dot.current, { x: pos.x, y: pos.y });
      gsap.set(ring.current, { x: ringPos.x, y: ringPos.y });
    };
    gsap.ticker.add(tick);

    const sel = 'a, button, [data-text], [role="button"]';
    const enter = (e: Event) => {
      const text = (e.currentTarget as HTMLElement).getAttribute('data-text');
      gsap.to(ring.current, { scale: text ? 2.6 : 1.8, duration: 0.3, ease: 'power3.out' });
      if (label.current) label.current.textContent = text ?? '';
    };
    const leave = () => {
      gsap.to(ring.current, { scale: 1, duration: 0.3, ease: 'power3.out' });
      if (label.current) label.current.textContent = '';
    };
    const els = Array.from(document.querySelectorAll(sel));
    els.forEach((el) => { el.addEventListener('pointerenter', enter); el.addEventListener('pointerleave', leave); });

    return () => {
      window.removeEventListener('pointermove', onMove);
      gsap.ticker.remove(tick);
      els.forEach((el) => { el.removeEventListener('pointerenter', enter); el.removeEventListener('pointerleave', leave); });
    };
  }, []);

  return (
    <>
      <div ref={dot} className="pointer-events-none fixed left-0 top-0 z-[9998] -ml-0.5 -mt-0.5 h-1 w-1 rounded-full bg-text-primary mix-blend-difference" />
      <div ref={ring} className="pointer-events-none fixed left-0 top-0 z-[9998] -ml-5 -mt-5 flex h-10 w-10 items-center justify-center rounded-full border border-text-primary/40 text-[9px] uppercase tracking-wider">
        <span ref={label} className="text-text-primary" />
      </div>
    </>
  );
}
