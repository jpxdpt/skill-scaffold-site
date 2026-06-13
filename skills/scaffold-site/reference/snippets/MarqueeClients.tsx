'use client';
// T12 — Marquee infinito de clientes/parceiros.
// Fila horizontal que se desloca infinitamente (right→left).
// Conteúdo duplicado 3× para ilusão de continuidade.
// Uso: <MarqueeClients items={["Cliente A","Cliente B"]} />
// Ver material-playbook.md §M8.
// Alternativa CSS pura: trocar Framer Motion por @keyframes marquee (mais leve).

import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

interface Props {
  items: string[]
  className?: string
}

export default function MarqueeClients({ items, className = '' }: Props) {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const track = trackRef.current
    if (!track) return

    const ctx = gsap.context(() => {
      gsap.to(track, {
        xPercent: -50,
        repeat: -1,
        duration: 40,
        ease: 'none',
      })
    })

    return () => ctx.revert()
  }, [])

  // Duplica 3× para que o loop nunca mostre o fim
  const tripled = [...items, ...items, ...items]

  return (
    <div className={`overflow-hidden ${className}`}>
      <div ref={trackRef} className="flex gap-16 items-center w-max">
        {tripled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="text-sm uppercase tracking-widest text-white/30 whitespace-nowrap"
          >
            {item}
          </span>
        ))}
      </div>
    </div>
  )
}

/* Variante CSS pura (mais leve, sem GSAP):
   Em globals.css:
   @keyframes marquee { 0% { transform: translateX(0); } 100% { transform: translateX(-50%); } }
   .marquee-track { animation: marquee 30s linear infinite; }
   E no componente: <div className="flex gap-16 items-center marquee-track">
     {[...items, ...items].map(...)}
   </div>
*/
