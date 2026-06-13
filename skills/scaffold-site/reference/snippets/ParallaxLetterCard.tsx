'use client';
// T11 — Letras 3D com parallax de rato (M/E/C/W).
// 3 layers sobrepostas que se movem a velocidades diferentes (back:×48, middle:×32, front:×16).
// Spotlight radial segue o rato. Fundo inverte (escuro→claro) no hover.
// Usar `gsap.quickTo()` para performance em vez de React state em cada card.
// Uso: <ParallaxLetterCard letter="M" label="Marketing Digital" />
// Este snippet usa o stack bloqueado (GSAP). Ver material-playbook.md §M1.

import { useEffect, useRef, type ReactNode } from 'react'
import { gsap } from 'gsap'

interface Props {
  letter: string
  label: string
  className?: string
}

export default function ParallaxLetterCard({ letter, label, className = '' }: Props) {
  const cardRef = useRef<HTMLDivElement>(null)
  const backRef = useRef<HTMLSpanElement>(null)
  const middleRef = useRef<HTMLSpanElement>(null)
  const frontRef = useRef<HTMLSpanElement>(null)
  const spotlightRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card) return
    if (window.matchMedia('(pointer: coarse)').matches) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const pos = { x: 0, y: 0 }

    const quickBackX = gsap.quickTo(backRef.current, 'x', { x: 0, y: 0 })
    const quickBackY = gsap.quickTo(backRef.current, 'y', { x: 0, y: 0 })
    const quickMidX = gsap.quickTo(middleRef.current, 'x', { x: 0, y: 0 })
    const quickMidY = gsap.quickTo(middleRef.current, 'y', { x: 0, y: 0 })
    const quickFrontX = gsap.quickTo(frontRef.current, 'x', { x: 0, y: 0 })
    const quickFrontY = gsap.quickTo(frontRef.current, 'y', { x: 0, y: 0 })

    const moveSpotlight = (mx: number, my: number) => {
      if (!spotlightRef.current || !card) return
      const pct = { x: 50 + mx * 20, y: 50 + my * 20 }
      gsap.set(spotlightRef.current, { left: `${pct.x}%`, top: `${pct.y}%` })
    }

    const handleMove = (e: PointerEvent) => {
      const rect = card.getBoundingClientRect()
      pos.x = (e.clientX - rect.left) / rect.width - 0.5
      pos.y = (e.clientY - rect.top) / rect.height - 0.5
      quickBackX(pos.x * 48)
      quickBackY(pos.y * 48)
      quickMidX(pos.x * 32)
      quickMidY(pos.y * 32)
      quickFrontX(pos.x * 16)
      quickFrontY(pos.y * 16)
      moveSpotlight(pos.x, pos.y)
    }

    const handleEnter = () => {
      gsap.to(backRef.current, { opacity: 0, duration: 0.4 })
      gsap.to(middleRef.current, { opacity: 0, duration: 0.4 })
      gsap.to(frontRef.current, { color: '#000', duration: 0.4 })
      gsap.to(card, { backgroundColor: '#fff', duration: 0.5 })
      gsap.to(spotlightRef.current, { opacity: 1, duration: 0.3 })
      gsap.to(card.querySelector('.card-label'), { color: 'rgba(0,0,0,0.7)', duration: 0.4 })
    }

    const handleLeave = () => {
      pos.x = 0; pos.y = 0
      quickBackX(0); quickBackY(0)
      quickMidX(0); quickMidY(0)
      quickFrontX(0); quickFrontY(0)
      gsap.to(backRef.current, { opacity: 1, duration: 0.4 })
      gsap.to(middleRef.current, { opacity: 1, duration: 0.4 })
      gsap.to(frontRef.current, { color: '#fff', duration: 0.4 })
      gsap.to(card, { backgroundColor: '#101010', duration: 0.5 })
      gsap.to(spotlightRef.current, { opacity: 0, duration: 0.3 })
      gsap.to(card.querySelector('.card-label'), { color: 'rgba(255,255,255,0.6)', duration: 0.4 })
    }

    card.addEventListener('pointermove', handleMove)
    card.addEventListener('pointerenter', handleEnter)
    card.addEventListener('pointerleave', handleLeave)

    return () => {
      card.removeEventListener('pointermove', handleMove)
      card.removeEventListener('pointerenter', handleEnter)
      card.removeEventListener('pointerleave', handleLeave)
    }
  }, [])

  return (
    <div
      ref={cardRef}
      className={`relative overflow-hidden border border-white/10 bg-[#101010] cursor-pointer p-8 flex flex-col items-center justify-center min-h-[22rem] select-none ${className}`}
    >
      {/* Spotlight */}
      <div
        ref={spotlightRef}
        className="absolute pointer-events-none opacity-0"
        style={{
          width: '200%',
          height: '200%',
          transform: 'translate(-50%, -50%)',
          background: 'radial-gradient(circle, rgba(255,199,44,0.12) 0%, transparent 70%)',
        }}
      />
      {/* Layer 3 — back (outline fino, maior deslocamento) */}
      <span
        ref={backRef}
        className="absolute text-[10rem] font-bold leading-none pointer-events-none select-none"
        style={{
          color: 'transparent',
          WebkitTextStroke: '1px rgba(255,255,255,0.06)',
          willChange: 'transform',
        }}
        aria-hidden="true"
      >
        {letter}
      </span>
      {/* Layer 2 — middle (outline médio) */}
      <span
        ref={middleRef}
        className="absolute text-[10rem] font-bold leading-none pointer-events-none select-none"
        style={{
          color: 'transparent',
          WebkitTextStroke: '1.5px rgba(255,255,255,0.12)',
          willChange: 'transform',
        }}
        aria-hidden="true"
      >
        {letter}
      </span>
      {/* Layer 1 — front (preenchida, cor muda no hover) */}
      <span
        ref={frontRef}
        className="absolute text-[10rem] font-bold leading-none pointer-events-none select-none text-white"
        style={{ willChange: 'transform, color' }}
        aria-hidden="true"
      >
        {letter}
      </span>
      {/* Label */}
      <p className="card-label mt-auto pt-16 text-sm font-medium tracking-wide text-center relative z-10 whitespace-pre-line"
        style={{ color: 'rgba(255,255,255,0.6)', transition: 'color 0.4s' }}
      >
        {label}
      </p>
    </div>
  )
}
