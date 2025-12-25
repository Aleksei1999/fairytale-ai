'use client'

import { useEffect, useRef, useState } from 'react'

type AnimationType = 'chars' | 'words' | 'lines' | 'fade'

interface AnimatedTextProps {
  text: string
  className?: string
  delay?: number
  type?: AnimationType
  scrollTrigger?: boolean // Animate on scroll instead of on load
}

// Animated text with CSS animations
export function AnimatedText({ text, className = '', delay = 0, type = 'chars', scrollTrigger = false }: AnimatedTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const [isVisible, setIsVisible] = useState(!scrollTrigger)

  useEffect(() => {
    if (!scrollTrigger) return

    const container = containerRef.current
    if (!container) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true)
            observer.disconnect()
          }
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(container)
    return () => observer.disconnect()
  }, [scrollTrigger])

  // Split based on type
  const renderContent = () => {
    const baseStyle = {
      animationDelay: `${delay}s`,
    }

    if (type === 'words') {
      return text.split(' ').map((word, i, arr) => (
        <span
          key={i}
          className={`inline-block ${isVisible ? 'animate-fade-in-up' : 'opacity-0'} ${className}`}
          style={{ ...baseStyle, animationDelay: `${delay + i * 0.1}s` }}
        >
          {word}{i < arr.length - 1 ? '\u00A0' : ''}
        </span>
      ))
    }

    if (type === 'lines') {
      return (
        <span
          className={`inline-block ${isVisible ? 'animate-fade-in-up' : 'opacity-0'} ${className}`}
          style={baseStyle}
        >
          {text}
        </span>
      )
    }

    // chars and fade - just show text with fade animation
    return (
      <span
        className={`inline-block ${isVisible ? 'animate-fade-in-up' : 'opacity-0'} ${className}`}
        style={baseStyle}
      >
        {text}
      </span>
    )
  }

  return (
    <span ref={containerRef}>
      {renderContent()}
    </span>
  )
}

// Word by word animation (convenience export)
export function AnimatedWords({ text, className = '', delay = 0, scrollTrigger = false }: Omit<AnimatedTextProps, 'type'>) {
  return <AnimatedText text={text} className={className} delay={delay} type="words" scrollTrigger={scrollTrigger} />
}

// Line reveal animation (convenience export)
export function AnimatedLine({ text, className = '', delay = 0, scrollTrigger = false }: Omit<AnimatedTextProps, 'type'>) {
  return <AnimatedText text={text} className={className} delay={delay} type="lines" scrollTrigger={scrollTrigger} />
}

// Fade animation (convenience export)
export function AnimatedFade({ text, className = '', delay = 0, scrollTrigger = false }: Omit<AnimatedTextProps, 'type'>) {
  return <AnimatedText text={text} className={className} delay={delay} type="fade" scrollTrigger={scrollTrigger} />
}
