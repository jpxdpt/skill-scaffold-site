'use client';
// T3 — Preloader: logo em chars (SplitText), barra real+fake progress,
// deteção de 1ª carga (localStorage), saída por clip-path (cortina a subir).
// Uso em app/page.tsx:  {loading && <Preloader onComplete={() => setLoading(false)} />}
import { useRef, useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { SplitText } from 'gsap/SplitText';

gsap.registerPlugin(SplitText);

const SEEN_KEY = 'site:seen'; // localStorage → preloader completo só na 1ª visita

export default function Preloader({ brand = 'Marca', onComplete }: { brand?: string; onComplete: () => void }) {
  const root = useRef<HTMLDivElement>(null);
  const logo = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const [count, setCount] = useState(0);

  useEffect(() => {
    const firstVisit = !localStorage.getItem(SEEN_KEY);
    localStorage.setItem(SEEN_KEY, '1');
    const duration = firstVisit ? 2400 : 900;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = gsap.context(() => {
      if (!reduce && logo.current) {
        const split = new SplitText(logo.current, { type: 'chars', mask: 'chars' });
        gsap.from(split.chars, { yPercent: 120, duration: 0.8, ease: 'power3.out', stagger: 0.04 });
      }
    });

    // progresso real (imagens carregadas) misturado com fake suave
    let real = 0;
    const imgs = Array.from(document.images);
    const bump = () => { real = Math.min(1, real + 1 / Math.max(imgs.length, 1)); };
    imgs.forEach((i) => (i.complete ? bump() : i.addEventListener('load', bump, { once: true })));
    window.addEventListener('load', () => { real = 1; }, { once: true });

    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const fake = Math.min(1, (now - start) / duration);
      const pct = Math.round(Math.min(fake, 0.3 + real * 0.7) * 100); // fake até ~30%, real domina depois
      setCount(pct);
      if (bar.current) bar.current.style.transform = `scaleX(${pct / 100})`;
      if (pct >= 100) return finish();
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    function finish() {
      cancelAnimationFrame(raf);
      if (reduce) return onComplete();
      gsap.to(root.current, { clipPath: 'inset(0 0 100% 0)', duration: 0.9, ease: 'power3.inOut', delay: 0.25, onComplete });
    }

    return () => { cancelAnimationFrame(raf); ctx.revert(); };
  }, [onComplete]);

  return (
    <div ref={root} className="fixed inset-0 z-[9999] flex items-center justify-center bg-[hsl(var(--bg))]" style={{ clipPath: 'inset(0 0 0 0)' }}>
      <div ref={logo} className="font-display italic text-4xl text-text-primary md:text-6xl">{brand}</div>
      <div className="absolute bottom-8 right-8 font-display tabular-nums text-6xl text-text-primary md:text-8xl">
        {String(count).padStart(3, '0')}
      </div>
      <div className="absolute inset-x-0 bottom-0 h-[3px] bg-stroke/50">
        <div ref={bar} className="accent-gradient h-full origin-left" style={{ transform: 'scaleX(0)', boxShadow: '0 0 8px hsl(var(--accent)/0.35)' }} />
      </div>
    </div>
  );
}
