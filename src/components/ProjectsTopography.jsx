import { useEffect, useRef } from 'react'
import { gsap } from 'gsap'

const MIN_WIDTH_QUERY = '(min-width: 992px)'
const CANVAS_MULTIPLIER = 1.3
const EXTRA_BALL_SLOTS = 4
const MAX_METABALLS = 24
const POINTER_EASE = 0.3

const debounce = (fn, wait = 120) => {
  let timeoutId
  return (...args) => {
    const scope = typeof window !== 'undefined' ? window : globalThis
    scope.clearTimeout(timeoutId)
    timeoutId = scope.setTimeout(() => {
      fn(...args)
    }, wait)
  }
}

class WebGLHelper {
  constructor(gl) {
    this.gl = gl
  }

  getUniformLocation(program, name) {
    const location = this.gl.getUniformLocation(program, name)
    if (location === -1 || location === null) {
      throw new Error(`Unable to find uniform ${name}.`)
    }
    return location
  }

  getAttribLocation(program, name) {
    const location = this.gl.getAttribLocation(program, name)
    if (location === -1) {
      throw new Error(`Unable to find attribute ${name}.`)
    }
    return location
  }

  compileShader(source, type) {
    const shader = this.gl.createShader(type)
    this.gl.shaderSource(shader, source)
    this.gl.compileShader(shader)

    if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
      const infoLog = this.gl.getShaderInfoLog(shader)
      this.gl.deleteShader(shader)
      throw new Error(`Shader compile failed: ${infoLog}`)
    }

    return shader
  }
}

class ProjectsMetaballSimulation {
  constructor(controller) {
    this.controller = controller
    this.canvasMultiplier = controller.canvasMultiplier
    this.container = controller.parent
    this.titleSelector = controller.titleSelector
    this.maxItemCount = controller.maxItemCount
    this.radius = 10
    this.renderCursor()
    this.handleResize()
  }

  handleResize() {
    this.metaballs = []
    this.items = this.controller.items.slice(0, this.maxItemCount)
    this.WIDTH = this.controller.WIDTH
    this.HEIGHT = this.controller.HEIGHT
    this.angleRoot = 4.5
    const divider = Math.max(this.WIDTH / 1512 / 2, 0.001)
    this.angleDivider = divider
    this.angle = this.angleRoot / this.angleDivider
    this.createBalls()
  }

  createBalls() {
    this.metaballs = []

    this.items.forEach((_, index) => {
      this.metaballs.push({
        x: this.WIDTH / 2,
        y: this.HEIGHT / 2,
        r: (index % 2 ? 6.5 : 4.4) * this.radius,
        angle: (index % 2 ? 0.75 : 0.9) * this.angle,
      })
    })

    this.cursorIndex = this.metaballs.push({
      x: this.WIDTH / 2,
      y: this.HEIGHT / 2,
      r: 5 * this.radius,
      angle: 1.1 * this.angle,
    })

    this.ball1to5index = this.metaballs.push({
      x: this.WIDTH / 2,
      y: this.HEIGHT / 2,
      r: 4 * this.radius,
      angle: 0.8 * this.angle,
    })

    this.ball2to4index = this.metaballs.push({
      x: this.WIDTH / 2,
      y: this.HEIGHT / 2,
      r: 4 * this.radius,
      angle: 0.9 * this.angle,
    })

    this.ball7to3index = this.metaballs.push({
      x: this.WIDTH / 2,
      y: this.HEIGHT / 2,
      r: 4 * this.radius,
      angle: 0.9 * this.angle,
    })
  }

  positionBalls() {
    const parentRect = this.container.getBoundingClientRect()
    const parentLeft = parentRect.left + window.scrollX
    const parentTop = parentRect.top + window.scrollY

    this.positionArray = []

    this.items.forEach((item, index) => {
      const titleNode = item.querySelector(this.titleSelector) || item
      const rect = titleNode.getBoundingClientRect()
      const anchorLeft = rect.left + window.scrollX - parentLeft - 20
      const anchorTop = rect.top + window.scrollY - parentTop + 11
      const x = anchorLeft * this.canvasMultiplier
      const y = this.HEIGHT - anchorTop * this.canvasMultiplier

      this.positionArray.push([x, y])
      const target = this.metaballs[index]
      if (target) {
        gsap.set(target, { x, y })
      }
    })

    this.syncAnchors()
    this.setInMotion()
  }

  syncAnchors() {
    const assignPosition = (ballIndex, positionIndex) => {
      if (!this.positionArray.length) return
      const safeIndex = Math.max(0, Math.min(positionIndex, this.positionArray.length - 1))
      const coords = this.positionArray[safeIndex]
      const ball = this.metaballs[ballIndex]
      if (coords && ball) {
        gsap.set(ball, { x: coords[0], y: coords[1] })
      }
    }

    assignPosition(this.ball1to5index - 1, 0)
    assignPosition(this.ball2to4index - 1, 3)
    assignPosition(this.ball7to3index - 1, 6)
  }

  setInMotion() {
    const clampIndex = (desired) => {
      if (!this.positionArray.length) return null
      return Math.max(0, Math.min(desired, this.positionArray.length - 1))
    }

    const makeTimeline = (timelineRef, ballIndex, targetIndex, duration) => {
      const clampedIndex = clampIndex(targetIndex)
      if (clampedIndex === null || !this.metaballs[ballIndex]) {
        if (this[timelineRef]) {
          this[timelineRef].kill()
          this[timelineRef] = null
        }
        return
      }

      if (this[timelineRef]) {
        this[timelineRef].kill()
      }

      this[timelineRef] = gsap.timeline({ repeat: -1, yoyo: true })
      this[timelineRef].to(this.metaballs[ballIndex], {
        x: this.positionArray[clampedIndex][0],
        y: this.positionArray[clampedIndex][1],
        duration,
        ease: 'sine.inOut',
      })
    }

    if (!this.angleTimeline) {
      this.angleTimeline = gsap.timeline({ repeat: -1, repeatDelay: 1, yoyo: true })
    } else {
      this.angleTimeline.clear()
    }

    this.items.forEach((_, index) => {
      const ball = this.metaballs[index]
      if (!ball) return
      this.angleTimeline.to(
        ball,
        {
          angle: (index % 2 ? 0.75 : 0.9) * this.angle,
          duration: 8,
          ease: 'sine.inOut',
        },
        0
      )
    })

    makeTimeline('ball1to5tl', this.ball1to5index - 1, 4, 10)
    makeTimeline('ball2to4tl', this.ball2to4index - 1, 1, 15)
    makeTimeline('ball7to3tl', this.ball7to3index - 1, 2, 10)
  }

  renderCursor() {
    if (!this.boundPointerMoveListener) {
      this.boundPointerMoveListener = (event) => this.pointerMoveListener(event)
      document.addEventListener('pointermove', this.boundPointerMoveListener)
    }
  }

  pointerMoveListener(event) {
    this.clientX = event.clientX
    this.clientY = event.clientY
    this.hasPointer = true
  }

  projectPointer() {
    if (!this.hasPointer) return null
    const parentRect = this.container.getBoundingClientRect()
    const left = parentRect.left + window.scrollX
    const top = parentRect.top + window.scrollY
    const x = (this.clientX + window.scrollX - left) * this.canvasMultiplier
    const y = this.HEIGHT - ((this.clientY + window.scrollY - top) * this.canvasMultiplier)

    return {
      x: Math.min(Math.max(x, 0), this.WIDTH),
      y: Math.min(Math.max(y, 0), this.HEIGHT),
    }
  }

  step() {
    if (!this.metaballs || !this.metaballs.length) return
    const cursorBall = this.metaballs[this.cursorIndex - 1]
    if (!cursorBall) return
    const projected = this.projectPointer()
    if (!projected) return

    gsap.to(cursorBall, {
      x: projected.x,
      y: projected.y,
      duration: POINTER_EASE,
      overwrite: 'auto',
      ease: 'none',
    })
  }

  destroy() {
    if (this.boundPointerMoveListener) {
      document.removeEventListener('pointermove', this.boundPointerMoveListener)
      this.boundPointerMoveListener = null
    }

    ;['angleTimeline', 'ball1to5tl', 'ball2to4tl', 'ball7to3tl'].forEach((key) => {
      if (this[key]) {
        this[key].kill()
        this[key] = null
      }
    })
  }
}

class ProjectsTopographyCore {
  constructor(canvas, { host, items, titleSelector }) {
    this.canvas = canvas
    this.parent = host
    this.items = items
    this.titleSelector = titleSelector
    this.canvasMultiplier = CANVAS_MULTIPLIER
    this.extraBallSlots = EXTRA_BALL_SLOTS
    this.maxUniformBalls = MAX_METABALLS
    this.maxItemCount = Math.max(
      0,
      Math.min(this.items.length, this.maxUniformBalls - this.extraBallSlots)
    )
    this.uniformBallCount = Math.max(1, this.maxItemCount + this.extraBallSlots)
    this.canvas.classList.remove('is-active')

    this.breakpoint = window.matchMedia(MIN_WIDTH_QUERY)
    this.onBreakpointChange = (event) => {
      if (event.matches) {
        this.init()
      } else {
        this.destroy()
      }
    }

    this.breakpoint.addEventListener('change', this.onBreakpointChange)

    if (this.breakpoint.matches) {
      this.init()
    }
  }

  init() {
    if (this.initialized) return
    if (!this.parent || !this.items.length) return
    this.initialized = true
    this.handleResize()
    this.simulation = new ProjectsMetaballSimulation(this)
    this.simulation.positionBalls()
    this.canvas.classList.add('is-active')
    this.step()
    this.boundResizeListener = debounce(() => this.handleResize(), 150)
    window.addEventListener('resize', this.boundResizeListener)
  }

  handleResize() {
    if (!this.parent) return
    if (!this.canvas.isConnected) {
      this.parent.prepend(this.canvas)
    }

    const { width, height } = this.parent.getBoundingClientRect()
    this.WIDTH = Math.max(width * this.canvasMultiplier, 1)
    this.HEIGHT = Math.max(height * this.canvasMultiplier, 1)

    this.canvas.width = this.WIDTH
    this.canvas.height = this.HEIGHT
    this.canvas.style.width = '100%'
    this.canvas.style.height = '100%'

    const gl = this.canvas.getContext('webgl2')
    if (!gl) {
      this.destroy()
      return
    }

    this.gl = gl
    this.webGl = new WebGLHelper(gl)
    const program = this.compileProgram()
    this.setupGeometry(program)
    this.metaballsHandle = this.webGl.getUniformLocation(program, 'metaballs')
    this.gl.viewport(0, 0, this.WIDTH, this.HEIGHT)

    if (this.simulation) {
      this.simulation.handleResize()
      this.simulation.positionBalls()
    }
  }

  step() {
    if (!this.initialized) return
    if (this.simulation) {
      this.simulation.step()
    }
    this.render()
    this.raf = window.requestAnimationFrame(() => this.step())
  }

  render() {
    if (!this.gl || !this.metaballsHandle || !this.simulation) return
    const buffer = new Float32Array(4 * this.uniformBallCount)

    for (let i = 0; i < this.uniformBallCount; i += 1) {
      const offset = 4 * i
      const ball = this.simulation.metaballs[i]
      if (ball) {
        buffer[offset + 0] = ball.x
        buffer[offset + 1] = ball.y
        buffer[offset + 2] = ball.r
        buffer[offset + 3] = ball.angle
      } else {
        buffer[offset + 0] = 0
        buffer[offset + 1] = 0
        buffer[offset + 2] = 0
        buffer[offset + 3] = 1
      }
    }

    this.gl.clearColor(0, 0.5, 0, 1)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT)
    this.gl.uniform4fv(this.metaballsHandle, buffer)
    this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4)
  }

  compileProgram() {
    const vertex = this.webGl.compileShader(
      `#version 300 es
precision mediump float;
in vec2 position;

void main() {
  gl_Position = vec4(position, 0.0, 1.0);
}
`,
      this.gl.VERTEX_SHADER
    )

    const fragment = this.webGl.compileShader(
      `#version 300 es
precision mediump float;
uniform vec4 metaballs[${this.uniformBallCount}];
layout(location = 0) out vec4 fragColor;

float isoline(float val, float lg, float ref, float pas, float tickness) {
  float v = abs(mod(val-ref+pas*.5, pas)-pas*.5)/lg - .1*tickness;
  return smoothstep(.1, .7, v);
}

float map(float value, float min1, float max1, float min2, float max2) {
  float perc = (value - min1) / (max1 - min1);
  return perc * (max2 - min2) + min2;
}

void main(){
  float x = gl_FragCoord.x;
  float y = gl_FragCoord.y;
  float v = 0.0;
  for (int i = 0; i < ${this.uniformBallCount}; i++) {
    vec4 mb = metaballs[i];
    float dx = mb.x - x;
    float dy = mb.y - y;
    float r = mb.z;
    float angle = mb.w;
    float distance = sqrt(dx*dx + dy*dy);
    float power = clamp(1.0 / max(distance * angle, 0.0001), 0.0, 1.0);
    power = pow(power, 0.4);
    power *= r;
    v += power;
  }

  v = clamp(v, 0.0, 25.1);
  float lg = 2.0 * length(vec2(dFdx(v), dFdy(v)));
  float k1 = isoline(v, lg, 0.0, 0.5, 0.9);
  float opacityScore = map(v , 18.0 , 25.1, 0.0 , 1.0 );
  vec3 col = vec3(1.0) * k1;
  vec3 background = vec3(35.0/256.0, 34.0/256.0, 34.0/256.0);
  vec3 limit = max(background, vec3(opacityScore));
  fragColor = clamp(vec4(1.0-col, 1.0), vec4(background, 0.0), vec4(limit, 1.0));
}
`,
      this.gl.FRAGMENT_SHADER
    )

    const program = this.gl.createProgram()
    this.gl.attachShader(program, vertex)
    this.gl.attachShader(program, fragment)
    this.gl.linkProgram(program)
    this.gl.useProgram(program)

    return program
  }

  setupGeometry(program) {
    const vertices = new Float32Array([-1, 1, -1, -1, 1, 1, 1, -1])
    const buffer = this.gl.createBuffer()
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer)
    this.gl.bufferData(this.gl.ARRAY_BUFFER, vertices, this.gl.STATIC_DRAW)

    const position = this.webGl.getAttribLocation(program, 'position')
    this.gl.enableVertexAttribArray(position)
    this.gl.vertexAttribPointer(position, 2, this.gl.FLOAT, false, 0, 0)
  }

  destroy() {
    if (!this.initialized) {
      this.canvas.classList.remove('is-active')
      return
    }
    if (this.raf) {
      window.cancelAnimationFrame(this.raf)
      this.raf = null
    }

    if (this.boundResizeListener) {
      window.removeEventListener('resize', this.boundResizeListener)
      this.boundResizeListener = null
    }

    if (this.simulation) {
      this.simulation.destroy()
      this.simulation = null
    }

    this.gl = null
    this.webGl = null
    this.metaballsHandle = null

    this.initialized = false
    this.canvas.classList.remove('is-active')
  }

  dispose() {
    this.destroy()
    if (this.breakpoint && this.onBreakpointChange) {
      this.breakpoint.removeEventListener('change', this.onBreakpointChange)
    }
  }
}

function ProjectsTopography({
  hostRef,
  itemSelector = '[data-project-card]',
  titleSelector = '[data-project-card-title]',
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    const host = hostRef?.current
    const canvas = canvasRef.current
    if (!host || !canvas) return undefined

    const items = Array.from(host.querySelectorAll(itemSelector))
    if (!items.length) return undefined

    const controller = new ProjectsTopographyCore(canvas, {
      host,
      items,
      titleSelector,
    })

    return () => controller.dispose()
  }, [hostRef, itemSelector, titleSelector])

  return <canvas ref={canvasRef} className="projects-topography__canvas" aria-hidden="true" />
}

export default ProjectsTopography
