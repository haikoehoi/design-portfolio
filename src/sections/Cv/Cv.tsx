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
 * Фото «плывёт» вниз вместе со скроллом (sticky по центру экрана, см. CSS),
 * а за мышкой тянется с мягким лерпом в rAF.
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
      curX += (mouseX * 16 - curX) * 0.07
      curY += (mouseY * 12 - curY) * 0.07
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
  /** null — ховер-устройство (вся область строки открывает пункт), иначе тап-переключение */
  onToggle: (() => void) | null
  onEnter: () => void
  onLeave: () => void
  children: ReactNode
}

/**
 * Пункт списка. Область строки из макета (127:7898) — непрерывная зона:
 * 42px над заголовком + заголовок + 42px под ним + разделитель; попадание
 * мышью в любую её точку раскрывает пункт (на тач-устройствах — тап).
 */
function CvItem({
  id,
  num,
  title,
  wide = false,
  divider = true,
  open,
  onToggle,
  onEnter,
  onLeave,
  children,
}: CvItemProps) {
  const handlers = onToggle
    ? { onClick: onToggle }
    : { onMouseEnter: onEnter, onMouseLeave: onLeave }

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
  const [openId, setOpenId] = useState<string | null>(null)
  const [hoverCapable] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(hover: hover)').matches,
  )

  // Пункты меню в шапке раскрывают соответствующий раздел (см. Hero)
  useEffect(() => {
    const onOpen = (e: Event) => setOpenId((e as CustomEvent<string>).detail)
    window.addEventListener('cv:open', onOpen)
    return () => window.removeEventListener('cv:open', onOpen)
  }, [])

  const itemProps = (id: string) => ({
    id,
    open: openId === id,
    onToggle: hoverCapable
      ? null
      : () => setOpenId((cur) => (cur === id ? null : id)),
    onEnter: () => setOpenId(id),
    onLeave: () => setOpenId((cur) => (cur === id ? null : cur)),
  })

  return (
    <section className={styles.cv} aria-label="CV">
      <div className={styles.cvInner}>
        <aside className={styles.photoCol} aria-hidden="false">
          <ParallaxPhoto />
        </aside>

        <div className={styles.accordion}>
          <CvItem num="(1/4)" title="Profile" {...itemProps('profile')}>
            <p className={styles.profileText}>{PROFILE_TEXT}</p>
          </CvItem>

          <CvItem num="(2/4)" title="Education" {...itemProps('education')}>
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

          <CvItem num="(3/4)" title="Skills & Tools" {...itemProps('skills')}>
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

          <CvItem num="(4/4)" title="Experience" wide divider={false} {...itemProps('experience')}>
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
