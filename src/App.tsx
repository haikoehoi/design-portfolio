import { useEffect } from 'react'
import { Hero } from './sections/Hero/Hero'
import { Cv } from './sections/Cv/Cv'

export default function App() {
  // Пиксельный курсор: пока кнопка мыши зажата, на <html> висит класс
  // is-pressed — CSS подменяет руку на состояние «клик» (см. global.css)
  useEffect(() => {
    const root = document.documentElement
    const down = () => root.classList.add('is-pressed')
    const up = () => root.classList.remove('is-pressed')
    window.addEventListener('pointerdown', down)
    window.addEventListener('pointerup', up)
    window.addEventListener('blur', up)
    return () => {
      window.removeEventListener('pointerdown', down)
      window.removeEventListener('pointerup', up)
      window.removeEventListener('blur', up)
      root.classList.remove('is-pressed')
    }
  }, [])

  return (
    <>
      <Hero />
      <main>
        <Cv />
      </main>
    </>
  )
}
