'use client';
// T6 — Link rollover por máscara: a label sobe e a cópia entra por baixo no hover.
// Versão CSS (linha única). Para multi-linha usa SplitText (ver SplitTextReveal).
// Uso: <LinkRollover href="#work">Trabalho</LinkRollover>
import { type ReactNode } from 'react';

export default function LinkRollover({ children, href, className = '' }: { children: ReactNode; href: string; className?: string }) {
  const ease = 'ease-[cubic-bezier(0.32,0.72,0,1)]';
  return (
    <a href={href} className={`group relative inline-block overflow-hidden align-bottom ${className}`}>
      <span className={`block transition-transform duration-500 ${ease} group-hover:-translate-y-full`}>{children}</span>
      <span aria-hidden className={`absolute left-0 top-full block transition-transform duration-500 ${ease} group-hover:-translate-y-full`}>{children}</span>
    </a>
  );
}
