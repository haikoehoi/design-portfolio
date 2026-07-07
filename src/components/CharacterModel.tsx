import { useEffect, useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { Box3, DoubleSide, Mesh, Vector3, type Material, type Texture } from 'three'
import { MODEL_URL } from '../config/animation'
import { useChoreography } from '../hooks/useChoreography'
import { useGlitch } from '../hooks/useGlitch'

const TARGET_HEIGHT = 2 // высота персонажа в юнитах сцены

type Props = {
  animated: boolean
  /** Узкий экран: персонаж по центру, чуть дальше от камеры */
  compact: boolean
  onReady: () => void
}

export function CharacterModel({ animated, compact, onReady }: Props) {
  const { scene, animations } = useGLTF(MODEL_URL)

  // Фикс вывернутых нормалей: чёрные/просвечивающие участки — это backface
  // culling на полигонах с битыми нормалями. Рендерим обе стороны; если
  // материал уже двусторонний — пересчитываем нормали геометрии.
  useMemo(() => {
    scene.traverse((obj) => {
      if (!(obj instanceof Mesh)) return
      const materials: Material[] = Array.isArray(obj.material)
        ? obj.material
        : [obj.material]
      let alreadyDoubleSided = true
      for (const material of materials) {
        if (material.side !== DoubleSide) {
          material.side = DoubleSide
          material.needsUpdate = true
          alreadyDoubleSided = false
        }
      }
      if (alreadyDoubleSided) {
        // Нормали в сжатом glb квантованы (int8) — аккумуляция площадей
        // в computeVertexNormals округляется в ноль в таком массиве.
        // Удаляем атрибут, чтобы пересчёт создал полноценный float32.
        obj.geometry.deleteAttribute('normal')
        obj.geometry.computeVertexNormals()
      }
    })
  }, [scene])

  // Нормализация: рост TARGET_HEIGHT, ноги на y=0, центр по x/z в нуле
  const { scale, offset, rawHeight } = useMemo(() => {
    const box = new Box3().setFromObject(scene)
    const size = box.getSize(new Vector3())
    const center = box.getCenter(new Vector3())
    const s = TARGET_HEIGHT / size.y
    return {
      scale: s,
      offset: new Vector3(-center.x * s, -box.min.y * s, -center.z * s),
      rawHeight: size.y,
    }
  }, [scene])

  useChoreography(scene, animations, animated)
  useGlitch(scene, rawHeight, animated)

  useEffect(() => {
    onReady()
  }, [onReady])

  useEffect(
    () => () => {
      scene.traverse((obj) => {
        if (!(obj instanceof Mesh)) return
        obj.geometry.dispose()
        const materials: Material[] = Array.isArray(obj.material)
          ? obj.material
          : [obj.material]
        for (const material of materials) {
          for (const value of Object.values(material)) {
            if ((value as Texture)?.isTexture) (value as Texture).dispose()
          }
          material.dispose()
        }
      })
    },
    [scene],
  )

  return (
    <group
      // Десктоп: персонаж смещён вправо и слегка развёрнут к текстовой зоне.
      // Мобилка: по центру, ниже и дальше — над ним остаётся место под текст.
      position={compact ? [0, -1.15, -0.4] : [0.85, -1, 0]}
      rotation={[0, compact ? 0 : -0.35, 0]}
    >
      <primitive object={scene} scale={scale} position={offset} />
    </group>
  )
}

useGLTF.preload(MODEL_URL)
