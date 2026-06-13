'use client';
// S4 variante — Grain overlay animado (modo "Materia").
// Em vez de estático, usa CSS @keyframes ruido com steps(2) que desloca a textura
// continuamente (translate3d). Textura de filme cinematográfico.
// Uso: <NoiseOverlay /> no layout público, antes do main content.
// Ver material-playbook.md §M2.
// Alternativa estática: div com mix-blend-mode:overlay e opacity:0.035 (snippet original).

import { useEffect, useRef } from 'react'

export default function NoiseOverlay() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      if (ref.current) ref.current.style.animation = 'none'
    }
  }, [])

  return (
    <div
      ref={ref}
      className="noise-overlay"
      style={{
        pointerEvents: 'none',
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        height: '300%',
        width: '300%',
        left: '-50%',
        top: '-100%',
        opacity: 0.08,
        backgroundImage: 'url(/textures/noise.png)',
        backfaceVisibility: 'hidden',
        willChange: 'transform',
      }}
    />
  )
}
