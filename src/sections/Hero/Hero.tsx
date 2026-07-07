import { lazy, Suspense, useCallback, useState } from 'react'
import { MOBILE_MEDIA_QUERY } from '../../config/animation'
import { useMediaQuery, usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { CanvasErrorBoundary } from './CanvasErrorBoundary'
import styles from './Hero.module.css'

// 3D-сцена (three.js + r3f) — отдельный ленивый чанк: страница
// отрисовывается сразу, тяжёлый код догружается параллельно с моделью
const Scene = lazy(() =>
  import('./Scene').then((m) => ({ default: m.Scene })),
)

export function Hero() {
  const reducedMotion = usePrefersReducedMotion()
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  const onReady = useCallback(() => setReady(true), [])
  const onError = useCallback(() => setFailed(true), [])

  // Статичная поза: просьба пользователя уменьшить движение
  // или мобильный брейкпоинт (батарея/производительность)
  const animated = !reducedMotion && !isMobile

  return (
    <section className={styles.hero}>
      {/* Слой 1: постер-фон — виден на first paint и при фейле загрузки */}
      <div className={styles.poster} aria-hidden="true" />

      {/* Слой 2: 3D-сцена, fade-in после загрузки модели */}
      {!failed && (
        <div
          className={`${styles.canvasLayer} ${ready ? styles.canvasVisible : ''}`}
          aria-hidden="true"
        >
          <CanvasErrorBoundary onError={onError}>
            <Suspense fallback={null}>
              <Scene animated={animated} compact={isMobile} onReady={onReady} />
            </Suspense>
          </CanvasErrorBoundary>
        </div>
      )}

      {/* Слой 2.5: лёгкие CSS-помехи (сканлайны, пробегающая полоса) */}
      <div className={styles.glitchLayer} aria-hidden="true" />

      {/* Слой 3: scrim под читаемость будущего текста */}
      <div className={styles.scrim} aria-hidden="true" />

      {/* Слой 4: контейнер под типографику — наполняется в следующей итерации.
          На десктопе текстовая зона — левая часть, персонаж справа;
          на мобилке — верхняя часть, персонаж ниже. */}
      <div className={styles.overlay}>
        <div className={styles.textZone}>{/* h1, подзаголовок, CTA */}</div>
      </div>
    </section>
  )
}
