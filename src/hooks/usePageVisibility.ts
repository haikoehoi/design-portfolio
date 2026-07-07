import { useEffect, useState } from 'react'

/** true, пока вкладка видима; false — когда document.hidden. */
export function usePageVisibility(): boolean {
  const [visible, setVisible] = useState(
    () => typeof document === 'undefined' || !document.hidden,
  )

  useEffect(() => {
    const onChange = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onChange)
    return () => document.removeEventListener('visibilitychange', onChange)
  }, [])

  return visible
}
