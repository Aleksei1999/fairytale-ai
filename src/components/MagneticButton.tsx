'use client'

import { useRef, ReactNode } from 'react'
import gsap from 'gsap'

interface MagneticButtonProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  strength?: number // How strong the magnetic effect is (default 0.4)
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
  strength = 0.4,
  disabled = false,
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLButtonElement>(null)
  const contentRef = useRef<HTMLSpanElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (disabled) return

    const button = buttonRef.current
    const content = contentRef.current
    if (!button || !content) return

    const rect = button.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    // Move button towards cursor
    gsap.to(button, {
      x: x * strength,
      y: y * strength,
      duration: 0.3,
      ease: 'power2.out',
    })

    // Move content slightly more for depth effect
    gsap.to(content, {
      x: x * strength * 0.5,
      y: y * strength * 0.5,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  const handleMouseLeave = () => {
    const button = buttonRef.current
    const content = contentRef.current
    if (!button || !content) return

    // Return to original position
    gsap.to(button, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)',
    })

    gsap.to(content, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)',
    })
  }

  const handleMouseEnter = () => {
    if (disabled) return

    const button = buttonRef.current
    if (!button) return

    gsap.to(button, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  const handleMouseDown = () => {
    if (disabled) return

    const button = buttonRef.current
    if (!button) return

    gsap.to(button, {
      scale: 0.95,
      duration: 0.1,
      ease: 'power2.out',
    })
  }

  const handleMouseUp = () => {
    if (disabled) return

    const button = buttonRef.current
    if (!button) return

    gsap.to(button, {
      scale: 1.05,
      duration: 0.2,
      ease: 'back.out(1.7)',
    })
  }

  return (
    <button
      ref={buttonRef}
      className={className}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      disabled={disabled}
      style={{ willChange: 'transform' }}
    >
      <span ref={contentRef} className="inline-block" style={{ willChange: 'transform' }}>
        {children}
      </span>
    </button>
  )
}

// Magnetic link component for <a> tags
export function MagneticLink({
  children,
  className = '',
  href,
  strength = 0.4,
  onClick,
}: MagneticLinkProps) {
  const linkRef = useRef<HTMLAnchorElement>(null)
  const contentRef = useRef<HTMLSpanElement>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const link = linkRef.current
    const content = contentRef.current
    if (!link || !content) return

    const rect = link.getBoundingClientRect()
    const x = e.clientX - rect.left - rect.width / 2
    const y = e.clientY - rect.top - rect.height / 2

    gsap.to(link, {
      x: x * strength,
      y: y * strength,
      duration: 0.3,
      ease: 'power2.out',
    })

    gsap.to(content, {
      x: x * strength * 0.5,
      y: y * strength * 0.5,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  const handleMouseLeave = () => {
    const link = linkRef.current
    const content = contentRef.current
    if (!link || !content) return

    gsap.to(link, {
      x: 0,
      y: 0,
      scale: 1,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)',
    })

    gsap.to(content, {
      x: 0,
      y: 0,
      duration: 0.5,
      ease: 'elastic.out(1, 0.5)',
    })
  }

  const handleMouseEnter = () => {
    const link = linkRef.current
    if (!link) return

    gsap.to(link, {
      scale: 1.05,
      duration: 0.3,
      ease: 'power2.out',
    })
  }

  return (
    <a
      ref={linkRef}
      href={href}
      className={className}
      onClick={onClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onMouseEnter={handleMouseEnter}
      style={{ willChange: 'transform', display: 'inline-block' }}
    >
      <span ref={contentRef} className="inline-flex items-center justify-center gap-2 w-full" style={{ willChange: 'transform' }}>
        {children}
      </span>
    </a>
  )
}
