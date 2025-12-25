'use client'

import { useEffect } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

// Register ScrollTrigger plugin
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger)
}

export function useScrollAnimations() {
  useEffect(() => {
    // Skip heavy animations on mobile for better scroll performance
    const isMobile = window.innerWidth < 768

    // Configure ScrollTrigger for mobile
    ScrollTrigger.config({
      ignoreMobileResize: true,
    })

    // Wait for DOM to be ready
    const ctx = gsap.context(() => {
      // Skip scroll animations on mobile
      if (isMobile) {
        // Just set elements to visible state without animation
        gsap.set('section', { opacity: 1, y: 0 })
        gsap.set('.glass-card, .glass-card-strong', { opacity: 1, y: 0, scale: 1 })
        return
      }
      // Animate all sections on scroll
      gsap.utils.toArray<HTMLElement>('section').forEach((section, i) => {
        // Fade in and slide up animation for sections
        gsap.fromTo(
          section,
          {
            opacity: 0,
            y: 60,
          },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: 'power3.out',
            scrollTrigger: {
              trigger: section,
              start: 'top 85%',
              end: 'top 20%',
              toggleActions: 'play none none reverse',
            },
          }
        )

        // Animate cards inside sections with stagger
        const cards = section.querySelectorAll('.glass-card, .glass-card-strong, [class*="rounded-2xl"], [class*="rounded-3xl"]')
        if (cards.length > 0) {
          gsap.fromTo(
            cards,
            {
              opacity: 0,
              y: 40,
              scale: 0.95,
            },
            {
              opacity: 1,
              y: 0,
              scale: 1,
              duration: 0.8,
              stagger: 0.15,
              ease: 'back.out(1.4)',
              scrollTrigger: {
                trigger: section,
                start: 'top 75%',
                toggleActions: 'play none none reverse',
              },
            }
          )
        }
      })

      // Special animation for hero section (first section)
      const hero = document.querySelector('section:first-of-type')
      if (hero) {
        // Reset the default animation for hero
        gsap.set(hero, { opacity: 1, y: 0 })

        // Animate hero elements
        const heroTitle = hero.querySelector('h1')
        const heroSubtitle = hero.querySelector('p')
        const heroButtons = hero.querySelectorAll('button')

        if (heroTitle) {
          gsap.fromTo(
            heroTitle,
            { opacity: 0, y: -50, scale: 0.9 },
            { opacity: 1, y: 0, scale: 1, duration: 1, ease: 'power3.out', delay: 0.2 }
          )
        }

        if (heroSubtitle) {
          gsap.fromTo(
            heroSubtitle,
            { opacity: 0, x: -30 },
            { opacity: 1, x: 0, duration: 0.8, ease: 'power2.out', delay: 0.5 }
          )
        }

        if (heroButtons.length > 0) {
          gsap.fromTo(
            heroButtons,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.6, stagger: 0.1, ease: 'back.out(1.7)', delay: 0.7 }
          )
        }
      }

      // Animate pricing cards with special effect
      const pricingSection = document.querySelector('#pricing')
      if (pricingSection) {
        const pricingCards = pricingSection.querySelectorAll('[class*="rounded"]')

        pricingCards.forEach((card, index) => {
          // Add hover effect
          card.addEventListener('mouseenter', () => {
            gsap.to(card, {
              scale: 1.05,
              y: -10,
              boxShadow: '0 25px 50px rgba(59, 147, 247, 0.3)',
              duration: 0.3,
              ease: 'power2.out',
            })
          })

          card.addEventListener('mouseleave', () => {
            gsap.to(card, {
              scale: 1,
              y: 0,
              boxShadow: '0 10px 30px rgba(59, 147, 247, 0.1)',
              duration: 0.3,
              ease: 'power2.out',
            })
          })
        })
      }

      // Parallax effect for background elements
      gsap.utils.toArray<HTMLElement>('.floating').forEach((el) => {
        gsap.to(el, {
          y: -100,
          ease: 'none',
          scrollTrigger: {
            trigger: el,
            start: 'top bottom',
            end: 'bottom top',
            scrub: 1,
          },
        })
      })

      // Counter animation for numbers
      gsap.utils.toArray<HTMLElement>('[data-counter]').forEach((el) => {
        const target = parseInt(el.getAttribute('data-counter') || '0')

        ScrollTrigger.create({
          trigger: el,
          start: 'top 80%',
          onEnter: () => {
            gsap.to(el, {
              innerHTML: target,
              duration: 2,
              snap: { innerHTML: 1 },
              ease: 'power1.out',
            })
          },
        })
      })
    })

    return () => ctx.revert()
  }, [])
}

// Component wrapper for easy use
export function ScrollAnimationsProvider({ children }: { children: React.ReactNode }) {
  useScrollAnimations()
  return <>{children}</>
}
