import { Component, type ErrorInfo, type ReactNode } from 'react'

interface State { failed: boolean }

export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { failed: false }

  static getDerivedStateFromError(): State {
    return { failed: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error(error, info.componentStack)
  }

  backToMap = () => {
    window.location.hash = '#/'
    this.setState({ failed: false })
  }

  render() {
    if (!this.state.failed) return this.props.children
    return (
      <main className="map-page">
        <p role="alert">มีอะไรผิดพลาด ลองกดรีเฟรชนะ</p>
        <p><button type="button" className="btn primary" onClick={this.backToMap}>กลับไปแผนที่</button></p>
      </main>
    )
  }
}
