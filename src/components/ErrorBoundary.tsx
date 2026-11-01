import { Component, type ErrorInfo, type ReactNode } from 'react';

type State = { error: Error | null };

// Catches render errors so one broken panel does not blank the whole app.
export class ErrorBoundary extends Component<{ children: ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('UI error', error, info.componentStack);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="empty" role="alert" style={{ margin: '48px auto', maxWidth: 420 }}>
        <b>Something went wrong</b>
        <span>{this.state.error.message}</span>
        <button className="btn primary sm" onClick={() => window.location.reload()}>
          Reload
        </button>
      </div>
    );
  }
}
