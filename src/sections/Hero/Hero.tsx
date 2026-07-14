import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react'
import { MOBILE_MEDIA_QUERY } from '../../config/animation'
import { useMediaQuery, usePrefersReducedMotion } from '../../hooks/useMediaQuery'
import { ArrowSmall, StarIcon } from '../../components/icons'
import { EMAIL } from '../Cv/cvData'
import { CanvasErrorBoundary } from './CanvasErrorBoundary'
import styles from './Hero.module.css'

// 3D-сцена (three.js + r3f) — отдельный ленивый чанк: страница
// отрисовывается сразу, тяжёлый код догружается параллельно с моделью
const Scene = lazy(() =>
  import('./Scene').then((m) => ({ default: m.Scene })),
)

const NAV = [
  { label: 'Profile', href: '#profile' },
  { label: 'Education', href: '#education' },
  { label: 'Skills & Tools', href: '#skills' },
  { label: 'Experience', href: '#experience' },
]

export function Hero() {
  const reducedMotion = usePrefersReducedMotion()
  const isMobile = useMediaQuery(MOBILE_MEDIA_QUERY)
  const [ready, setReady] = useState(false)
  const [failed, setFailed] = useState(false)

  const onReady = useCallback(() => setReady(true), [])
  const onError = useCallback(() => setFailed(true), [])

  // Статичная поза остаётся только при prefers-reduced-motion;
  // мобилка получает облегчённую живую анимацию (см. Scene/FrameLimiter)
  const animated = !reducedMotion

  // Карточка CV наезжает на обложку: сама обложка sticky, а по мере
  // прокрутки слегка «отъезжает вглубь» и затемняется
  const innerRef = useRef<HTMLDivElement>(null)
  const dimRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reducedMotion) return
    let raf = 0
    const update = () => {
      raf = 0
      const p = Math.min(Math.max(window.scrollY / window.innerHeight, 0), 1)
      if (innerRef.current) {
        innerRef.current.style.transform = p > 0 ? `scale(${1 - p * 0.06})` : ''
      }
      if (dimRef.current) dimRef.current.style.opacity = (p * 0.45).toFixed(3)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [reducedMotion])

  return (
    <section className={styles.hero} id="top">
      <div className={styles.heroInner} ref={innerRef}>
        {/* 3D-сцена, fade-in после загрузки модели; расположение не меняется */}
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

        <header className={styles.topBar}>
          <a className={styles.logo} href="#top">
            <StarIcon className={styles.logoIcon} />
            <span>Anna Alemasova</span>
          </a>

          <div className={styles.contacts}>
            <p>Tbilisi, Georgia · Remote</p>
            <p>{EMAIL}</p>
          </div>

          <div className={styles.topRight}>
            <nav className={styles.menu} aria-label="Sections">
              {NAV.map((item) => (
                <a className={styles.navLink} href={item.href} key={item.href}>
                  {item.label}
                </a>
              ))}
            </nav>
            <a className={styles.sLink} href={`mailto:${EMAIL}`}>
              Let’s talk
              <ArrowSmall />
            </a>
          </div>
        </header>

        <div className={styles.heroText}>
          <h1 className={styles.headline}>
            AI Product designer
            <br />
            turning complexity
            <br />
            into clear experience.
          </h1>
          <p className={styles.sub}>
            Creating intuitive and memorable digital products with a focus on
            user needs and business goals.
          </p>
          <a className={styles.pill} href={`mailto:${EMAIL}`}>
            Let’s talk
          </a>
        </div>

        <div className={styles.dim} ref={dimRef} aria-hidden="true" />
      </div>
    </section>
  )
}
