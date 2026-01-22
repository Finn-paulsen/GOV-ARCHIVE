import React, { useEffect, useRef } from 'react'
import Typed from 'typed.js'
import { gsap } from 'gsap'
import bio from '../data/bio.json'

export default function Terminal({ view }){
  const el = useRef(null)
  const screenRef = useRef(null)

  useEffect(()=>{
    // typed.js intro
    const typed = new Typed(el.current, {
      strings: [
        `GOV-ARCHIVE SYSTEM BOOTING...`,
        `Authentifizierter Zugriff: Terminal Typ B-47`,
        `Aktuelle Ansicht: ${view.toUpperCase()}`,
        bio.summary,
      ],
      typeSpeed: 28,
      backSpeed: 6,
      startDelay: 400,
      backDelay: 1400,
      loop: false,
      showCursor: true,
      cursorChar: '|'
    })

    // subtle glow/flicker via GSAP
    const ctx = gsap.context(()=>{
      gsap.to(screenRef.current, { boxShadow: '0 8px 60px rgba(85,255,170,0.08)', duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut' })
    })

    return ()=>{
      typed.destroy()
      ctx.revert()
    }
  },[view])

  return (
    <div className="terminal-screen crt-flicker" ref={screenRef}>
      <div ref={el} aria-live="polite"></div>
    </div>
  )
}
