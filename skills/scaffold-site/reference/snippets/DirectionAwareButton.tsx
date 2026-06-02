'use client';
// T5 — Botão com preenchimento que nasce do ponto onde o rato entra (--posX/--posY).
// Uso: <DirectionAwareButton onClick={...}>Adquirir</DirectionAwareButton>
import { useRef, type ReactNode, type ButtonHTMLAttributes } from 'react';

type Props = { children: ReactNode } & ButtonHTMLAttributes<HTMLButtonElement>;

export default function DirectionAwareButton({ children, className = '', ...rest }: Props) {
  const ref = useRef<HTMLButtonElement>(null);

  const setPos = (e: React.PointerEvent) => {
    const el = ref.current!;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--posX', `${((e.clientX - r.left) / r.width) * 100}%`);
    el.style.setProperty('--posY', `${((e.clientY - r.top) / r.height) * 100}%`);
  };

  return (
    <button
      ref={ref}
      onPointerEnter={setPos}
      onPointerLeave={setPos}
      className={`group relative overflow-hidden rounded-full border border-stroke px-7 py-3.5 text-sm ${className}`}
      {...rest}
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-[hsl(var(--accent))] transition-[width,height] duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:h-[320%] group-hover:w-[160%]"
        style={{ left: 'var(--posX,50%)', top: 'var(--posY,50%)', width: 0, height: 0 }}
      />
      <span className="relative z-10 transition-colors duration-300 group-hover:text-[hsl(var(--bg))]">
        {children}
      </span>
    </button>
  );
}
