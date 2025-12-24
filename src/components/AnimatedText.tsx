'use client'

import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

type AnimationType = 'chars' | 'words' | 'lines' | 'fade'

interface AnimatedTextProps {
  text: string
  className?: string
  delay?: number
  type?: AnimationType
  scrollTrigger?: boolean // Animate on scroll instead of on load
}

// 1. Character by character animation
export function AnimatedText({ text, className = '', delay = 0, type = 'chars', scrollTrigger = false }: AnimatedTextProps) {
  const containerRef = useRef<HTMLSpanElement>(null)
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    setIsReady(true)
  }, [])

  useEffect(() => {
    if (!isReady) return

    const container = containerRef.current
    if (!container) return

    const elements = container.querySelectorAll('.anim-item')
    if (!elements || elements.length === 0) return

    const animationConfig = {
      chars: {
        from: { opacity: 0, y: 20, scale: 0.8 },
        to: { opacity: 1, y: 0, scale: 1, duration: 0.4, stagger: 0.03, ease: 'back.out(1.7)' }
      },
      words: {
        from: { opacity: 0, y: 30, rotateX: -90 },
        to: { opacity: 1, y: 0, rotateX: 0, duration: 0.6, stagger: 0.1, ease: 'power3.out' }
      },
      lines: {
        from: { opacity: 0, x: -50, skewX: 5 },
        to: { opacity: 1, x: 0, skewX: 0, duration: 0.8, stagger: 0.15, ease: 'power3.out' }
      },
      fade: {
        from: { opacity: 0, y: 10 },
        to: { opacity: 1, y: 0, duration: 0.5, stagger: 0.02, ease: 'power2.out' }
      }
    }

    const config = animationConfig[type]
    gsap.set(elements, config.from)

    if (scrollTrigger) {
      gsap.to(elements, {
        ...config.to,
        scrollTrigger: {
          trigger: container,
          start: 'top 85%',
          toggleActions: 'play none none none'
        }
      })
    } else {
      gsap.to(elements, {
        ...config.to,
        delay: delay,
      })
    }
  }, [isReady, delay, type, scrollTrigger])

  // Split based on type
  const renderContent = () => {
    if (type === 'words') {
      return text.split(' ').map((word, i, arr) => (
        <span key={i} className={`anim-item inline-block ${className}`}>
          {word}{i < arr.length - 1 ? '\u00A0' : ''}
        </span>
      ))
    }

    if (type === 'lines') {
      return (
        <span className={`anim-item inline-block ${className}`}>
          {text}
        </span>
      )
    }

    // chars and fade - split by character
    return text.split('').map((char, i) => (
      <span
        key={i}
        className={`anim-item inline-block ${className}`}
      >
        {char === ' ' ? '\u00A0' : char}
      </span>
    ))
  }

  return (
    <span ref={containerRef} style={{ perspective: '1000px' }}>
      {renderContent()}
    </span>
  )
}

// 2. Word by word animation (convenience export)
export function AnimatedWords({ text, className = '', delay = 0, scrollTrigger = false }: Omit<AnimatedTextProps, 'type'>) {
  return <AnimatedText text={text} className={className} delay={delay} type="words" scrollTrigger={scrollTrigger} />
}

// 3. Line reveal animation (convenience export)
export function AnimatedLine({ text, className = '', delay = 0, scrollTrigger = false }: Omit<AnimatedTextProps, 'type'>) {
  return <AnimatedText text={text} className={className} delay={delay} type="lines" scrollTrigger={scrollTrigger} />
}

// 4. Fade animation (convenience export)
export function AnimatedFade({ text, className = '', delay = 0, scrollTrigger = false }: Omit<AnimatedTextProps, 'type'>) {
  return <AnimatedText text={text} className={className} delay={delay} type="fade" scrollTrigger={scrollTrigger} />
}
