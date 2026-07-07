import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Mesh,
  type Material,
  type Object3D,
  type WebGLProgramParametersWithUniforms,
} from 'three'
import { GLITCH } from '../config/animation'

/**
 * Шейдерный глитч поверх штатных материалов модели — без постпроцессинга
 * и лишних draw call'ов. В вершинном шейдере горизонтальные полосы
 * геометрии сдвигаются вбок во время всплеска; во фрагментном — RGB-каналы
 * базовой текстуры расходятся (постоянно чуть-чуть, во всплеск — сильно),
 * что заодно маскирует дыры от битых нормалей.
 */

const VERT_INJECT = /* glsl */ `
  float gBand = floor(transformed.y * uGFreq + uGTime * 22.0);
  float gH = fract(sin(gBand * 91.17) * 43758.5453);
  float gOn = step(0.78, gH) * uGlitch;
  transformed.x += (gH - 0.5) * 2.0 * uGAmp * gOn;
  transformed.z += (fract(gH * 9.31) - 0.5) * uGAmp * gOn;
  #include <project_vertex>
`

const FRAG_INJECT = /* glsl */ `
  #ifdef USE_MAP
    vec2 gOff = vec2(uGChromaBase + uGChromaBurst * uGlitch, 0.0);
    vec4 sampledDiffuseColor = texture2D( map, vMapUv );
    sampledDiffuseColor.r = texture2D( map, vMapUv + gOff ).r;
    sampledDiffuseColor.b = texture2D( map, vMapUv - gOff ).b;
    diffuseColor *= sampledDiffuseColor;
  #endif
`

const rand = (min: number, max: number) => min + Math.random() * (max - min)

export function useGlitch(root: Object3D, modelHeight: number, enabled: boolean) {
  // Амплитуда/частота полос в единицах модели — glb может быть и в метрах,
  // и в сантиметрах, поэтому масштабируем от фактического роста
  const uniforms = useMemo(
    () => ({
      uGlitch: { value: 0 },
      uGTime: { value: 0 },
      uGAmp: { value: modelHeight * 0.04 },
      uGFreq: { value: 9 / modelHeight },
      uGChromaBase: { value: GLITCH.chromaBase },
      uGChromaBurst: { value: GLITCH.chromaBurst },
    }),
    [modelHeight],
  )

  useEffect(() => {
    if (!GLITCH.enabled) return
    const patched: Material[] = []
    root.traverse((obj) => {
      if (!(obj instanceof Mesh)) return
      const materials: Material[] = Array.isArray(obj.material)
        ? obj.material
        : [obj.material]
      for (const material of materials) {
        material.onBeforeCompile = (shader: WebGLProgramParametersWithUniforms) => {
          Object.assign(shader.uniforms, uniforms)
          shader.vertexShader =
            'uniform float uGlitch;\nuniform float uGTime;\nuniform float uGAmp;\nuniform float uGFreq;\n' +
            shader.vertexShader.replace('#include <project_vertex>', VERT_INJECT)
          shader.fragmentShader =
            'uniform float uGlitch;\nuniform float uGChromaBase;\nuniform float uGChromaBurst;\n' +
            shader.fragmentShader.replace('#include <map_fragment>', FRAG_INJECT)
        }
        material.customProgramCacheKey = () => 'glitch'
        material.needsUpdate = true
        patched.push(material)
      }
    })
    return () => {
      for (const material of patched) {
        material.onBeforeCompile = () => {}
        material.customProgramCacheKey = () => ''
        material.needsUpdate = true
      }
    }
  }, [root, uniforms])

  // Расписание всплесков: случайные паузы, случайная длительность и сила
  const burst = useRef({ t: 0, nextAt: rand(1, 2), endAt: 0, level: 0 })

  useFrame((_, delta) => {
    if (!enabled || !GLITCH.enabled) return
    const b = burst.current
    b.t += delta
    if (b.t >= b.nextAt) {
      b.endAt = b.t + rand(GLITCH.minDurationS, GLITCH.maxDurationS)
      b.level = rand(0.4, 1)
      b.nextAt = b.endAt + rand(GLITCH.minIntervalS, GLITCH.maxIntervalS)
    }
    uniforms.uGlitch.value = b.t < b.endAt ? b.level : 0
    uniforms.uGTime.value = b.t
  })
}
