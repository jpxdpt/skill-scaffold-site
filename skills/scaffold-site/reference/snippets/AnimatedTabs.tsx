'use client';
// T13 — Tabs de categoria com indicador animado.
// Ideal para portfolios multimédia (vídeo, fotografia, etc.).
// Implementação com Flip do GSAP (stack bloqueado).
// Uso: <AnimatedTabs tabs={[{id,label,content}]} />
// Ver material-playbook.md §M7.

import { useState, useRef, useEffect, type ReactNode } from 'react'
import { gsap } from 'gsap'
import { Flip } from 'gsap/Flip'

interface Tab {
  id: string
  label: string
  content: ReactNode
}

interface Props {
  tabs: Tab[]
  className?: string
}

export default function AnimatedTabs({ tabs, className = '' }: Props) {
  const [active, setActive] = useState(tabs[0]?.id ?? '')
  const indicatorRef = useRef<HTMLDivElement>(null)
  const tabsRef = useRef<HTMLButtonElement[]>([])

  useEffect(() => {
    gsap.registerPlugin(Flip)
  }, [])

  const handleTabClick = (id: string) => {
    if (id === active) return
    setActive(id)

    // Anima o indicador com Flip
    const state = Flip.getState(indicatorRef.current)
    const activeTabEl = tabsRef.current[tabs.findIndex((t) => t.id === id)]
    if (activeTabEl) {
      activeTabEl.appendChild(indicatorRef.current!)
      Flip.from(state, {
        duration: 0.4,
        ease: 'power3.out',
        absolute: true,
      })
    }
  }

  return (
    <div className={className}>
      {/* Tab bar */}
      <div className="relative flex gap-1">
        {tabs.map((tab, i) => (
          <button
            key={tab.id}
            ref={(el) => { tabsRef.current[i] = el! }}
            onClick={() => handleTabClick(tab.id)}
            className={`relative px-6 py-3 text-sm font-medium tracking-wide uppercase transition-colors duration-300 ${
              active === tab.id ? 'text-white' : 'text-white/40 hover:text-white/70'
            }`}
          >
            {tab.label}
          </button>
        ))}
        {/* Indicador animado */}
        <div
          ref={indicatorRef}
          className="absolute bottom-0 h-0.5 bg-[--accent]"
          style={{
            width: `${100 / tabs.length}%`,
            left: `${tabs.findIndex((t) => t.id === active) * (100 / tabs.length)}%`,
          }}
        />
      </div>

      {/* Conteúdo */}
      <div className="mt-8">
        {tabs.find((t) => t.id === active)?.content}
      </div>
    </div>
  )
}
