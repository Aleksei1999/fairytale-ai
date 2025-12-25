'use client'

import { ReactNode } from 'react'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  strength?: number // Kept for API compatibility
  disabled?: boolean
}

interface MagneticLinkProps {
  children: ReactNode
  className?: string
  href: string
  strength?: number
  onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void
}

export function MagneticButton({
  children,
  className = '',
  onClick,
  disabled = false,
}: MagneticButtonProps) {
  return (
    <button
      className={`transition-transform duration-200 hover:scale-105 active:scale-95 ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      <span className="inline-block">
        {children}
      </span>
    </button>
  )
}

// Link component for <a> tags
export function MagneticLink({
  children,
  className = '',
  href,
  onClick,
}: MagneticLinkProps) {
  return (
    <a
      href={href}
      className={`transition-transform duration-200 hover:scale-105 inline-block ${className}`}
      onClick={onClick}
    >
      <span className="inline-flex items-center justify-center gap-2 w-full">
        {children}
      </span>
    </a>
  )
}
