'use client'

import { useEffect } from 'react'

export function useScrollAnimations() {
  useEffect(() => {
    // Add CSS class for fade-in animation on sections
    const sections = document.querySelectorAll('section')

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in-up')
          }
        })
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    sections.forEach((section) => {
      section.classList.add('opacity-0')
      observer.observe(section)
    })

    // Hero section should be visible immediately
    const hero = document.querySelector('section:first-of-type')
    if (hero) {
      hero.classList.remove('opacity-0')
      hero.classList.add('animate-fade-in-up')
    }

    return () => observer.disconnect()
  }, [])
}

// Component wrapper for easy use
export function ScrollAnimationsProvider({ children }: { children: React.ReactNode }) {
  useScrollAnimations()
  return <>{children}</>
}
