import { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { CharacterModel } from '../../components/CharacterModel'

type Props = {
  /** false — статичная поза (reduced-motion или мобильный брейкпоинт) */
  animated: boolean
  compact: boolean
  onReady: () => void
}

export function Scene({ animated, compact, onReady }: Props) {
  return (
    <Canvas
      // key: при смене брейкпоинта пересоздаём канвас с нужной камерой/dpr
      key={compact ? 'compact' : 'wide'}
      dpr={compact ? 1 : [1, 2]}
      frameloop={animated ? 'always' : 'demand'}
      camera={{ position: [0, 0.35, 4.4], fov: compact ? 42 : 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
    >
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
