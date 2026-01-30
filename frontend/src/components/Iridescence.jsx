import { Renderer, Program, Mesh, Color, Triangle } from 'ogl'
import { useEffect, useRef } from 'react'

const vertexShader = `
attribute vec2 uv;
attribute vec2 position;
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0.0, 1.0);
}
`

const fragmentShader = `
precision highp float;

uniform float uTime;
uniform vec3 uColor;
uniform vec3 uResolution;
uniform vec2 uMouse;
uniform float uAmplitude;
uniform float uSpeed;

varying vec2 vUv;

void main() {
  float mr = min(uResolution.x, uResolution.y);
  vec2 uv = (vUv * 2.0 - 1.0) * uResolution.xy / mr;

  uv += (uMouse - 0.5) * uAmplitude;

  float d = -uTime * 0.4 * uSpeed;
  float a = 0.0;
  for (float i = 0.0; i < 7.0; i++) {
    a += cos(i - d - a * uv.x);
    d += sin(uv.y * i + a);
  }

  vec3 col = vec3(
    0.5 + 0.5 * cos(d + uv.x),
    0.5 + 0.5 * cos(a + uv.y),
    0.5 + 0.5 * cos(a + d)
  );

col *= uColor;

/* compress highlights */
col = mix(col, vec3(dot(col, vec3(0.299, 0.587, 0.114))), 0.25);

/* soft gamma */
col = pow(col, vec3(1.4));

gl_FragColor = vec4(col, 1.0);

}
`

export default function Iridescence({
  color = [0.8, 0.85, 0.9],   // decolored
  speed = 0.6,
  amplitude = 0.08,
  mouseReact = true,
}) {
  const container = useRef(null)
  const mouse = useRef(new Float32Array([0.5, 0.5]))


  useEffect(() => {
    const renderer = new Renderer({ dpr: Math.min(2, window.devicePixelRatio) })
    const gl = renderer.gl
    gl.clearColor(0, 0, 0, 0)

    const geometry = new Triangle(gl)

    const program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uColor: { value: new Color(...color) },
        uResolution: { value: new Color(1, 1, 1) },
        uMouse: { value: mouse.current },
        uAmplitude: { value: amplitude },
        uSpeed: { value: speed },
      },
    })

    const mesh = new Mesh(gl, { geometry, program })

    function resize() {
      renderer.setSize(container.current.offsetWidth, container.current.offsetHeight)
      program.uniforms.uResolution.value.set(
        gl.canvas.width,
        gl.canvas.height,
        gl.canvas.width / gl.canvas.height
      )
    }

    window.addEventListener('resize', resize)
    resize()

    let raf
    const update = (t) => {
      raf = requestAnimationFrame(update)
      program.uniforms.uTime.value = t * 0.001
      renderer.render({ scene: mesh })
    }
    raf = requestAnimationFrame(update)

    container.current.appendChild(gl.canvas)

    const onMouse = (e) => {
      const r = container.current.getBoundingClientRect()
      mouse.current[0] = (e.clientX - r.left) / r.width
      mouse.current[1] = 1 - (e.clientY - r.top) / r.height
    }

    if (mouseReact) container.current.addEventListener('mousemove', onMouse)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', resize)
      if (mouseReact) container.current.removeEventListener('mousemove', onMouse)
      container.current.removeChild(gl.canvas)
      gl.getExtension('WEBGL_lose_context')?.loseContext()
    }
  }, [color, speed, amplitude, mouseReact])

  return <div ref={container} className="w-full h-full" />
}
