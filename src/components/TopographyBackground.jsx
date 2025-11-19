import { useEffect, useRef } from 'react'

const LINE_COUNT = 28
const POINTS_PER_LINE = 140

function sampleColors() {
  const style = getComputedStyle(document.documentElement)
  const lineColor = style.getPropertyValue('--topography-line').trim() || '14, 14, 14'
  const glowColor = style.getPropertyValue('--topography-glow').trim() || '0, 0, 0'
  return { lineColor, glowColor }
}

function layeredNoise(x, y, t) {
  return (
    Math.sin(x * 3.2 + t * 0.002 + y * 0.3) * 0.6 +
    Math.sin(x * 1.2 - y * 0.5 + t * 0.003) * 0.3 +
    Math.sin(x * 6.8 + t * 0.0007) * 0.1
  )
}

function TopographyBackground() {
  const canvasRef = useRef(null)
  const animationRef = useRef()
  const pointerRef = useRef({ x: 0.5, y: 0.5, active: false })
  const timeRef = useRef(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return () => {}

    const ctx = canvas.getContext('2d', { alpha: true })
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    const pointer = pointerRef.current
    const prefersReduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reducedMotion = prefersReduceMotion.matches
    let colors = sampleColors()
    let width = 0
    let height = 0

    const resize = () => {
      const parent = canvas.parentElement
      if (!parent) return
      const { width: parentWidth, height: parentHeight } = parent.getBoundingClientRect()
      width = parentWidth
      height = parentHeight
      canvas.width = parentWidth * dpr
      canvas.height = parentHeight * dpr
      canvas.style.width = `${parentWidth}px`
      canvas.style.height = `${parentHeight}px`
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)
    }

    resize()

    let resizeObserver
    const handleResize = () => resize()
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(resize)
      resizeObserver.observe(canvas.parentElement || canvas)
    } else {
      window.addEventListener('resize', handleResize)
    }

    const pointerHandler = (event) => {
      const rect = canvas.getBoundingClientRect()
      pointer.x = (event.clientX - rect.left) / rect.width
      pointer.y = (event.clientY - rect.top) / rect.height
      pointer.active = pointer.x >= 0 && pointer.x <= 1 && pointer.y >= 0 && pointer.y <= 1
    }

    const leaveHandler = () => {
      pointer.active = false
    }

    window.addEventListener('pointermove', pointerHandler)
    window.addEventListener('pointerleave', leaveHandler)

    const handleMotionPreference = (event) => {
      reducedMotion = event.matches
      if (reducedMotion) {
        cancelAnimationFrame(animationRef.current)
        drawFrame(true)
      } else {
        animationRef.current = requestAnimationFrame(drawFrame)
      }
    }

    prefersReduceMotion.addEventListener('change', handleMotionPreference)

    const drawFrame = (staticFrame = false) => {
      if (!canvas || !ctx) return
      timeRef.current += staticFrame ? 0 : 1
      if (timeRef.current % 60 === 0) {
        colors = sampleColors()
      }

      ctx.clearRect(0, 0, width, height)
      ctx.lineCap = 'round'
      ctx.setLineDash([])

      const amplitude = Math.max(40, height * 0.08)

      for (let lineIndex = 0; lineIndex < LINE_COUNT; lineIndex += 1) {
        const verticalRatio = lineIndex / (LINE_COUNT - 1)
        const baseY = verticalRatio * height
        ctx.beginPath()

        for (let pointIndex = 0; pointIndex <= POINTS_PER_LINE; pointIndex += 1) {
          const horizontalRatio = pointIndex / POINTS_PER_LINE
          const x = horizontalRatio * width
          const noise = layeredNoise(horizontalRatio * 3, verticalRatio * 1.8, timeRef.current + lineIndex * 12)
          const pointerDx = horizontalRatio - pointer.x
          const pointerDy = verticalRatio - pointer.y
          const pointerDistance = Math.hypot(pointerDx, pointerDy)
          const pointerInfluence = pointer.active ? Math.max(0, 1 - pointerDistance * 2.2) : 0
          const pointerWave = Math.sin((horizontalRatio - pointer.x) * Math.PI * 1.2)
          const offset = noise * amplitude + pointerWave * pointerInfluence * amplitude * 0.65
          const y = baseY + offset

          if (pointIndex === 0) {
            ctx.moveTo(x, y)
          } else {
            ctx.lineTo(x, y)
          }
        }

        const proximity = pointer.active ? Math.max(0.25, 1 - Math.abs(verticalRatio - pointer.y) * 2.5) : 0.35
        ctx.lineWidth = 1 + proximity * 1.5
        ctx.strokeStyle = `rgba(${colors.lineColor}, ${0.12 + proximity * 0.4})`
        ctx.shadowColor = `rgba(${colors.glowColor}, ${pointer.active ? 0.08 + proximity * 0.12 : 0.05})`
        ctx.shadowBlur = 14 * proximity
        ctx.stroke()
      }

      ctx.shadowBlur = 0
      ctx.shadowColor = 'transparent'

      if (!staticFrame && !reducedMotion) {
        animationRef.current = requestAnimationFrame(drawFrame)
      }
    }

    drawFrame(reducedMotion)
    if (!reducedMotion) {
      animationRef.current = requestAnimationFrame(drawFrame)
    }

    return () => {
      cancelAnimationFrame(animationRef.current)
      if (resizeObserver) {
        resizeObserver.disconnect()
      } else {
        window.removeEventListener('resize', handleResize)
      }
      window.removeEventListener('pointermove', pointerHandler)
      window.removeEventListener('pointerleave', leaveHandler)
      prefersReduceMotion.removeEventListener('change', handleMotionPreference)
    }
  }, [])

  return <canvas ref={canvasRef} className="topography-background" aria-hidden />
}

export default TopographyBackground
