import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowLarge } from '../../components/icons'
import photoUrl from '../../assets/photo.png'
import {
  EDUCATION,
  EXPERIENCE,
  PROFILE_TEXT,
  SKILL_ROWS,
  TELEGRAM_URL,
} from './cvData'
import styles from './Cv.module.css'

/**
 * Фото «плывёт» вниз вместе со скроллом (sticky по центру экрана, см. CSS).
 * Поверх sticky — мягкая инерция: при прокрутке фото чуть отстаёт от экрана
 * и плавно догоняет его, без рывков; за мышкой тянется с тем же лерпом.
 */
function ParallaxPhoto() {
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const desktop = window.matchMedia('(min-width: 768px)')
    let raf = 0
    let mouseX = 0
    let mouseY = 0
    let curX = 0
    let curY = 0
    let smooth = window.scrollY

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX / window.innerWidth - 0.5
      mouseY = e.clientY / window.innerHeight - 0.5
    }

    const loop = () => {
      raf = requestAnimationFrame(loop)
      const sc = window.scrollY
      smooth += (sc - smooth) * 0.07
      // Инерция от скролла — только на десктопе, где фото sticky
      const lag = desktop.matches
        ? Math.max(-48, Math.min(48, (smooth - sc) * 0.5))
        : 0
      curX += (mouseX * 24 - curX) * 0.06
      curY += (mouseY * 18 + lag - curY) * 0.06
      el.style.transform = `translate3d(${curX.toFixed(2)}px, ${curY.toFixed(2)}px, 0)`
    }

    window.addEventListener('mousemove', onMove, { passive: true })
    raf = requestAnimationFrame(loop)
    return () => {
      window.removeEventListener('mousemove', onMove)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <img
      ref={ref}
      className={styles.photo}
      src={photoUrl}
      alt="Anna Alemasova portrait"
      width={181}
      height={226}
      loading="lazy"
    />
  )
}

type CvItemProps = {
  id: string
  num: string
  title: string
  /** Контент на всю ширину пункта (Experience), а не в колонке заголовка */
  wide?: boolean
  divider?: boolean
  open: boolean
  children: ReactNode
}

function CvItem({
  id,
  num,
  title,
  wide = false,
  divider = true,
  open,
  children,
}: CvItemProps) {
  return (
    <article
      id={id}
      className={`${styles.item} ${open ? styles.itemOpen : ''}`}
    >
      <div className={styles.itemHead}>
        <span className={styles.num}>{num}</span>
        <h2 className={styles.title}>{title}</h2>
      </div>
      <div className={styles.collapse}>
        <div className={styles.collapseClip}>
          <div className={`${styles.content} ${wide ? styles.contentWide : styles.contentInset}`}>
            {children}
          </div>
        </div>
      </div>
      {divider && <div className={styles.divider} aria-hidden="true" />}
    </article>
  )
}

/** Порядок пунктов; открытость хранится счётчиком — открыты первые openCount */
const ITEM_IDS = ['profile', 'education', 'skills', 'experience']

/** Пункт открывается, когда верх его строки поднимается выше этой доли экрана */
const OPEN_AT = 0.78
/** …и закрывается (при скролле вверх), когда опускается ниже этой доли */
const CLOSE_AT = 0.92
/** Минимальная пауза между шагами — пункты раскрываются по очереди */
const STEP_MS = 160

/**
 * Аккордеон управляется скроллом: пункты раскрываются по очереди по мере
 * прокрутки вниз и остаются открытыми; при скролле вверх закрываются
 * в обратном порядке — от последнего открытого к первому.
 */
export function Cv() {
  const [openCount, setOpenCount] = useState(0)
  const countRef = useRef(0)
  const accordionRef = useRef<HTMLDivElement>(null)
  /** Пока идёт программный скролл из меню, автологика спит */
  const suppressUntil = useRef(0)
  /** Проверка шага — доступна и обработчику cv:open (после докрутки) */
  const stepRef = useRef<() => void>(() => {})

  const applyCount = (n: number) => {
    countRef.current = n
    setOpenCount(n)
  }

  useEffect(() => {
    let timer = 0
    let lastStep = 0

    // Один шаг за раз: открываем следующий пункт, когда его строка поднялась
    // выше OPEN_AT, закрываем последний открытый, когда он опустился ниже
    // CLOSE_AT. Каскад продолжается таймером с паузой STEP_MS — «по очереди»
    const step = () => {
      const acc = accordionRef.current
      if (!acc) return
      const now = performance.now()
      if (now < suppressUntil.current) return
      if (now - lastStep < STEP_MS) {
        window.clearTimeout(timer)
        timer = window.setTimeout(step, STEP_MS - (now - lastStep))
        return
      }

      const items = acc.children
      const vh = window.innerHeight
      const count = countRef.current
      let next = count
      if (
        count < items.length &&
        items[count].getBoundingClientRect().top < vh * OPEN_AT
      ) {
        next = count + 1
      } else if (
        count > 0 &&
        items[count - 1].getBoundingClientRect().top > vh * CLOSE_AT
      ) {
        next = count - 1
      }
      if (next !== count) {
        lastStep = now
        applyCount(next)
        window.clearTimeout(timer)
        timer = window.setTimeout(step, STEP_MS)
      }
    }

    stepRef.current = step
    step()
    window.addEventListener('scroll', step, { passive: true })
    window.addEventListener('resize', step)
    return () => {
      window.removeEventListener('scroll', step)
      window.removeEventListener('resize', step)
      window.clearTimeout(timer)
    }
  }, [])

  // Пункт меню в шапке раскрывает раздел (и все перед ним) и докручивает
  // к нему после раскрытия, когда раскладка уже устоялась (см. Hero)
  useEffect(() => {
    let scrollTimer = 0
    let resumeTimer = 0

    const onOpen = (e: Event) => {
      const id = (e as CustomEvent<string>).detail
      const idx = ITEM_IDS.indexOf(id)
      if (idx < 0) return

      suppressUntil.current = performance.now() + 2600
      if (idx + 1 > countRef.current) applyCount(idx + 1)

      const behavior: ScrollBehavior = window.matchMedia(
        '(prefers-reduced-motion: reduce)',
      ).matches
        ? 'auto'
        : 'smooth'
      document.getElementById(id)?.scrollIntoView({ behavior })
      window.clearTimeout(scrollTimer)
      scrollTimer = window.setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior })
      }, 640)
      // После докрутки — сверить счётчик с фактической позицией
      window.clearTimeout(resumeTimer)
      resumeTimer = window.setTimeout(() => stepRef.current(), 2650)
    }

    window.addEventListener('cv:open', onOpen)
    return () => {
      window.removeEventListener('cv:open', onOpen)
      window.clearTimeout(scrollTimer)
      window.clearTimeout(resumeTimer)
    }
  }, [])

  return (
    <section className={styles.cv} aria-label="CV">
      <div className={styles.cvInner}>
        <aside className={styles.photoCol} aria-hidden="false">
          <ParallaxPhoto />
        </aside>

        <div className={styles.accordion} ref={accordionRef}>
          <CvItem num="(1/4)" title="Profile" id="profile" open={openCount > 0}>
            <p className={styles.profileText}>{PROFILE_TEXT}</p>
          </CvItem>

          <CvItem num="(2/4)" title="Education" id="education" open={openCount > 1}>
            <div className={styles.eduRows}>
              {EDUCATION.map((row) => (
                <div className={styles.eduRow} key={row.label}>
                  <span className={styles.eduLabel}>{row.label}</span>
                  <span className={styles.eduValues}>
                    {row.values.map((v) => (
                      <span key={v}>{v}</span>
                    ))}
                  </span>
                </div>
              ))}
            </div>
          </CvItem>

          <CvItem num="(3/4)" title="Skills & Tools" id="skills" open={openCount > 2}>
            <div className={styles.skillRows}>
              {SKILL_ROWS.map((row, i) => (
                <div className={styles.skillRow} key={i}>
                  {row.map((skill) => (
                    <span className={styles.tag} key={skill}>
                      {skill}
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </CvItem>

          <CvItem
            num="(4/4)"
            title="Experience"
            id="experience"
            wide
            divider={false}
            open={openCount > 3}
          >
            <div className={styles.expList}>
              {EXPERIENCE.map((entry) => (
                <div className={styles.expEntry} key={entry.title}>
                  <span className={styles.expYears}>{entry.years}</span>
                  <div className={styles.expBody}>
                    <h3 className={styles.expTitle}>{entry.title}</h3>
                    <div className={styles.expParagraphs}>
                      {entry.paragraphs.map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CvItem>
        </div>
      </div>

      <footer className={styles.footer}>
        <p className={styles.footerNote}>Anna Alemasova, 2026</p>
        <a
          className={styles.bigLink}
          href={TELEGRAM_URL}
          target="_blank"
          rel="noreferrer"
        >
          Let’s talk
          <ArrowLarge className={styles.bigLinkArrow} />
        </a>
      </footer>
    </section>
  )
}
