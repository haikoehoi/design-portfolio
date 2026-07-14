import { useEffect, useRef, useState, type ReactNode } from 'react'
import { ArrowLarge } from '../../components/icons'
import photoUrl from '../../assets/photo.png'
import {
  EDUCATION,
  EMAIL,
  EXPERIENCE,
  PROFILE_TEXT,
  SKILL_ROWS,
} from './cvData'
import styles from './Cv.module.css'

function clamp(v: number, min: number, max: number) {
  return Math.min(Math.max(v, min), max)
}

/**
 * Фото с мягким параллаксом: чуть отстаёт от скролла и тянется за мышкой.
 * Целевое смещение считается от «сырой» (без transform) позиции элемента,
 * текущее — лерпится к нему в rAF, поэтому движение плавное и ленивое.
 */
function ParallaxPhoto() {
  const ref = useRef<HTMLImageElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let raf = 0
    let mouseX = 0
    let mouseY = 0
    let curX = 0
    let curY = 0

    const onMove = (e: MouseEvent) => {
      mouseX = e.clientX / window.innerWidth - 0.5
      mouseY = e.clientY / window.innerHeight - 0.5
    }

    const loop = () => {
      raf = requestAnimationFrame(loop)
      const rect = el.getBoundingClientRect()
      // Позиция без учёта текущего сдвига — иначе обратная связь
      const rawCenter = rect.top + rect.height / 2 - curY
      const drift = clamp((window.innerHeight / 2 - rawCenter) * 0.08, -32, 32)
      const targetX = mouseX * 16
      const targetY = drift + mouseY * 12
      curX += (targetX - curX) * 0.07
      curY += (targetY - curY) * 0.07
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
  children: ReactNode
}

/** Пункт списка: заголовок всегда виден, контент раскрывается по ховеру (по тапу на тач-устройствах) */
function CvItem({ id, num, title, wide = false, divider = true, children }: CvItemProps) {
  const [open, setOpen] = useState(false)
  const [hoverCapable] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches,
  )

  const handlers = hoverCapable
    ? {
        onMouseEnter: () => setOpen(true),
        onMouseLeave: () => setOpen(false),
      }
    : {
        onClick: () => setOpen((o) => !o),
      }

  return (
    <article
      id={id}
      className={`${styles.item} ${open ? styles.itemOpen : ''}`}
      {...handlers}
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

export function Cv() {
  return (
    <section className={styles.cv} aria-label="CV">
      <div className={styles.cvInner}>
        <aside className={styles.photoCol} aria-hidden="false">
          <ParallaxPhoto />
        </aside>

        <div className={styles.accordion}>
          <CvItem id="profile" num="(1/4)" title="Profile">
            <p className={styles.profileText}>{PROFILE_TEXT}</p>
          </CvItem>

          <CvItem id="education" num="(2/4)" title="Education">
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

          <CvItem id="skills" num="(3/4)" title="Skills & Tools">
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

          <CvItem id="experience" num="(4/4)" title="Experience" wide divider={false}>
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
        <a className={styles.bigLink} href={`mailto:${EMAIL}`}>
          Let’s talk
          <ArrowLarge className={styles.bigLinkArrow} />
        </a>
      </footer>
    </section>
  )
}
