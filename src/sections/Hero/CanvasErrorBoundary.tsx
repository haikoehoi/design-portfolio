import { Component, type ReactNode } from 'react'

type Props = {
  onError?: (error: Error) => void
  children: ReactNode
}

type State = { failed: boolean }

/**
 * Ловит ошибки 3D-сцены (в т.ч. фейл загрузки glb, проброшенный из useGLTF).
 * Вместо канваса остаётся постер-фон hero — без белого экрана смерти.
 */
export class CanvasErrorBoundary extends Component<Props, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error) {
    console.error('[hero] 3D-сцена не загрузилась, остаёмся на постере:', error)
    this.props.onError?.(error)
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
