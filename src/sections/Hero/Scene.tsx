import { Suspense, useEffect } from 'react'
import { Canvas, useThree } from '@react-three/fiber'
import { MOBILE_FPS } from '../../config/animation'
import { CharacterModel } from '../../components/CharacterModel'

type Props = {
  /** false — статичная поза (prefers-reduced-motion) */
  animated: boolean
  compact: boolean
  onReady: () => void
}

/**
 * Лимитер кадров для лёгкого мобильного режима: канвас живёт в режиме
 * 'demand', а рендер запрашивается по rAF не чаще fps. В фоновой вкладке
 * rAF не тикает — анимация встаёт на паузу сама.
 */
function FrameLimiter({ fps }: { fps: number }) {
  const invalidate = useThree((state) => state.invalidate)
  useEffect(() => {
    let id = 0
    let last = 0
    const loop = (t: number) => {
      id = requestAnimationFrame(loop)
      if (t - last >= 1000 / fps) {
        last = t
        invalidate()
      }
    }
    id = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(id)
  }, [fps, invalidate])
  return null
}

export function Scene({ animated, compact, onReady }: Props) {
  return (
    <Canvas
      // key: при смене брейкпоинта пересоздаём канвас с нужной камерой/dpr
      key={compact ? 'compact' : 'wide'}
      dpr={compact ? 1 : [1, 2]}
      // Десктоп: полный кадровый цикл. Мобилка: 'demand' + FrameLimiter.
      frameloop={animated && !compact ? 'always' : 'demand'}
      camera={{ position: [0, 0.35, 4.4], fov: compact ? 42 : 35 }}
      gl={{
        // На мобилке канвас dpr=1 растягивается экраном — MSAA не виден
        antialias: !compact,
        alpha: true,
        powerPreference: 'high-performance',
      }}
    >
      {animated && compact && <FrameLimiter fps={MOBILE_FPS} />}
      {/* Текстуры запечены — свет мягкий, только чтобы проявить объём */}
      <hemisphereLight intensity={0.5} color="#ffffff" groundColor="#3a3d46" />
      <directionalLight position={[3, 4, 3]} intensity={1.1} />
      <directionalLight position={[-3, 2, -3]} intensity={0.6} color="#a9c0ff" />

      <Suspense fallback={null}>
        <CharacterModel animated={animated} compact={compact} onReady={onReady} />
      </Suspense>
    </Canvas>
  )
}
