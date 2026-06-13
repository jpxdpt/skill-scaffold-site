'use client';
// S5 — Social sidebar sticky vertical (opcional).
// Ícones fixos à esquerda do ecrã, alinhados verticalmente ao centro.
// Só visível em lg:flex. Usar em agências/portfolios; não usar em sites de conversão.
// Uso: <SocialSidebar /> no layout público, antes do main content.
// Ver material-playbook.md §M5.

import { type ReactNode } from 'react'

interface Social {
  href: string
  label: string
  icon: ReactNode
}

interface Props {
  socials?: Social[]
  className?: string
}

const DEFAULT_SOCIALS: Social[] = [
  { href: '#', label: 'Instagram', icon: <InstagramIcon /> },
  { href: '#', label: 'YouTube', icon: <YouTubeIcon /> },
  { href: '#', label: 'LinkedIn', icon: <LinkedInIcon /> },
  { href: '#', label: 'Email', icon: <EmailIcon /> },
]

export default function SocialSidebar({ socials = DEFAULT_SOCIALS, className = '' }: Props) {
  return (
    <div className={`fixed left-5 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-4 ${className}`}>
      {socials.map((s) => (
        <a
          key={s.label}
          href={s.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={s.label}
          className="w-10 h-10 flex items-center justify-center border border-white/15 rounded-full text-white/40 hover:text-white hover:border-white/40 hover:bg-white/5 transition-all duration-300 hover:scale-110"
        >
          {s.icon}
        </a>
      ))}
    </div>
  )
}

/* Ícones SVGs minimalistas (substituir por Phosphor ou SVGs da marca) */
function InstagramIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function YouTubeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29.02 29.02 0 0 0 1 12a29.02 29.02 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2A29.02 29.02 0 0 0 23 12a29.02 29.02 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />
    </svg>
  )
}

function LinkedInIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
      <rect x="2" y="9" width="4" height="12" />
      <circle cx="4" cy="4" r="2" />
    </svg>
  )
}

function EmailIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}
