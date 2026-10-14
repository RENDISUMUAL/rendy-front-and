import { useEffect, useRef } from 'react'

type Particle = {
  x: number
  y: number
  baseX: number
  baseY: number
  vx: number
  vy: number
  radius: number
  hue: number
  phase: number
}

export function ParticleScene() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const particles: Particle[] = []
    let animationFrameId = 0

    const setupCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    const createParticles = () => {
      particles.length = 0
      setupCanvas()

      const fontSize = Math.min(window.innerWidth * 0.18, 220)
      ctx.font = `700 ${fontSize}px 'Segoe UI', sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = '#ffffff'
      ctx.fillText('REACT', window.innerWidth / 2, window.innerHeight / 2)

      const image = ctx.getImageData(0, 0, canvas.width, canvas.height)
      const { data } = image

      for (let y = 0; y < canvas.height; y += 4) {
        for (let x = 0; x < canvas.width; x += 4) {
          const idx = (x + y * canvas.width) * 4
          const alpha = data[idx + 3]

          if (alpha > 120) {
            particles.push({
              x: x + Math.random() * 2 - 1,
              y: y + Math.random() * 2 - 1,
              baseX: x + Math.random() * 2 - 1,
              baseY: y + Math.random() * 2 - 1,
              vx: (Math.random() - 0.5) * 0.5,
              vy: (Math.random() - 0.5) * 0.5,
              radius: Math.random() * 2.2 + 1.1,
              hue: 180 + Math.random() * 120,
              phase: Math.random() * Math.PI * 2,
            })
          }
        }
      }
    }

    const render = () => {
      ctx.fillStyle = 'rgba(4, 8, 22, 0.18)'
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      const time = performance.now() * 0.001

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i]
        const driftX = Math.sin(time * 0.9 + p.phase) * 1.8
        const driftY = Math.cos(time * 0.8 + p.phase) * 1.8

        p.x += (p.baseX + driftX - p.x) * 0.08 + p.vx
        p.y += (p.baseY + driftY - p.y) * 0.08 + p.vy
      }

      for (let i = 0; i < particles.length; i += 1) {
        const a = particles[i]

        for (let j = i + 1; j < particles.length; j += 1) {
          const b = particles[j]
          const dx = a.x - b.x
          const dy = a.y - b.y
          const distance = Math.hypot(dx, dy)

          if (distance < 90) {
            const alpha = 1 - distance / 90
            ctx.beginPath()
            ctx.moveTo(a.x, a.y)
            ctx.lineTo(b.x, b.y)
            ctx.strokeStyle = `hsla(${(a.hue + b.hue) / 2}, 80%, 62%, ${alpha * 0.4})`
            ctx.lineWidth = 0.9
            ctx.stroke()
          }
        }
      }

      for (let i = 0; i < particles.length; i += 1) {
        const p = particles[i]
        const pulse = 1 + Math.sin(time * 2.2 + p.phase) * 0.7

        ctx.beginPath()
        ctx.fillStyle = `hsla(${p.hue}, 90%, 70%, 0.9)`
        ctx.arc(p.x, p.y, p.radius * pulse, 0, Math.PI * 2)
        ctx.fill()
      }

      animationFrameId = requestAnimationFrame(render)
    }

    createParticles()
    animationFrameId = requestAnimationFrame(render)

    const handleResize = () => createParticles()
    window.addEventListener('resize', handleResize)

    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('resize', handleResize)
    }
  }, [])

  return <canvas className="particle-scene" ref={canvasRef} />
}
