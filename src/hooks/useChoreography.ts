import { useEffect, useMemo, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import {
  AnimationMixer,
  Bone,
  LoopOnce,
  LoopRepeat,
  type AnimationAction,
  type AnimationClip,
  type Object3D,
} from 'three'
import { CLIP_QUEUE, CROSSFADE_SECONDS, PIN_ROOT_XZ } from '../config/animation'
import { usePageVisibility } from './usePageVisibility'

/** Имя корневой кости скелета (кость, чей родитель — не кость). */
function findRootBoneName(root: Object3D): string | null {
  let name: string | null = null
  root.traverse((obj) => {
    if (!name && obj instanceof Bone && !(obj.parent instanceof Bone)) {
      name = obj.name
    }
  })
  return name
}

/**
 * Убирает горизонтальный root motion: x/z позиции корневой кости
 * замораживаются на значениях первого кадра, y (прыжки) не трогаем.
 * Возвращает клоны — исходные клипы из кеша gltf не мутируются.
 */
function pinClipsToSpot(clips: AnimationClip[], rootBoneName: string) {
  const trackName = `${rootBoneName}.position`
  return clips.map((clip) => {
    const pinned = clip.clone()
    for (const track of pinned.tracks) {
      if (track.name !== trackName) continue
      const v = track.values
      for (let i = 3; i < v.length; i += 3) {
        v[i] = v[0] // x
        v[i + 2] = v[2] // z
      }
    }
    return pinned
  })
}

/**
 * Непрерывная хореография: клипы играют по очереди единым потоком.
 * Каждый клип — LoopOnce с clampWhenFinished, за CROSSFADE_SECONDS до его
 * конца стартует crossFadeTo следующего, поэтому конечная поза плавно
 * перетекает в стартовую без скачка. Конец очереди заворачивается на начало.
 *
 * animated=false (prefers-reduced-motion) — микшер позирует первый кадр
 * первого клипа и замирает.
 */
export function useChoreography(
  root: Object3D,
  clips: AnimationClip[],
  animated: boolean,
) {
  const invalidate = useThree((state) => state.invalidate)
  const pageVisible = usePageVisibility()

  const mixer = useMemo(() => new AnimationMixer(root), [root])

  const queue = useMemo(() => {
    const names = clips.map((c) => c.name)
    console.info('[choreography] клипы в файле:', names)

    let source = clips
    if (PIN_ROOT_XZ) {
      const rootBone = findRootBoneName(root)
      if (rootBone) source = pinClipsToSpot(clips, rootBone)
    }
    if (!CLIP_QUEUE) return source

    const byName = new Map(source.map((c) => [c.name, c]))
    const missing = CLIP_QUEUE.filter((n) => !byName.has(n))
    if (missing.length) {
      console.warn('[choreography] в CLIP_QUEUE нет таких клипов:', missing)
    }
    const resolved = CLIP_QUEUE.flatMap((n) => byName.get(n) ?? [])
    return resolved.length ? resolved : source
  }, [clips, root])

  const indexRef = useRef(0)
  const currentRef = useRef<AnimationAction | null>(null)

  useEffect(() => {
    if (!queue.length) return

    const first = mixer.clipAction(queue[0])
    if (queue.length === 1) {
      first.setLoop(LoopRepeat, Infinity)
    } else {
      first.setLoop(LoopOnce, 1)
      first.clampWhenFinished = true
    }
    first.play()
    indexRef.current = 0
    currentRef.current = first

    if (!animated) {
      // Статичная поза: применяем первый кадр и не двигаем время
      first.paused = true
      mixer.update(0)
      invalidate()
    }

    return () => {
      mixer.stopAllAction()
      mixer.uncacheRoot(root)
      currentRef.current = null
    }
  }, [mixer, queue, animated, root, invalidate])

  useEffect(() => {
    // Пауза, когда вкладка неактивна — не жечь батарею
    mixer.timeScale = pageVisible ? 1 : 0
  }, [mixer, pageVisible])

  useFrame((_, delta) => {
    if (!animated) return
    mixer.update(delta)

    const current = currentRef.current
    if (!current || queue.length < 2) return

    const remaining = current.getClip().duration - current.time
    if (remaining > CROSSFADE_SECONDS) return

    const nextIndex = (indexRef.current + 1) % queue.length
    const next = mixer.clipAction(queue[nextIndex])
    if (next === current) {
      // Один и тот же клип дважды подряд в очереди — просто перезапуск
      current.reset()
    } else {
      next.reset()
      next.setLoop(LoopOnce, 1)
      next.clampWhenFinished = true
      next.play()
      current.crossFadeTo(next, CROSSFADE_SECONDS, false)
      currentRef.current = next
    }
    indexRef.current = nextIndex
  })
}
