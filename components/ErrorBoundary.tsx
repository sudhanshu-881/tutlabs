import React from 'react';

type State = { hasError: boolean; error?: Error | null };

export default class ErrorBoundary extends React.Component<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // TODO: wire to a monitoring service (Sentry, LogRocket) here
    // eslint-disable-next-line no-console
    console.error('ErrorBoundary caught error', error, info);
  }

  handleRetry = () => {
    // Simple retry: reload the page
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg,#667eea 0%,#764ba2 100%)',
          color: 'white',
          padding: 24,
        }}>
          <div style={{ maxWidth: 720, textAlign: 'center' }}>
            <h1 style={{ marginBottom: 12 }}>Something went wrong</h1>
            <p style={{ opacity: 0.9, marginBottom: 18 }}>
              TutLabs encountered an unexpected error. You can retry or check the console for details.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <button
                onClick={this.handleRetry}
                style={{
                  padding: '10px 18px',
                  background: '#0ea5e9',
                  color: '#042a2b',
                  borderRadius: 8,
                  border: 'none',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Retry
              </button>
              <button
                onClick={() => {
                  // eslint-disable-next-line no-alert
                  alert('Open DevTools (F12) and check the Console tab for error details.');
                }}
                style={{
                  padding: '10px 18px',
                  background: 'rgba(255,255,255,0.08)',
                  color: 'white',
                  borderRadius: 8,
                  border: '1px solid rgba(255,255,255,0.06)',
                  cursor: 'pointer',
                }}
              >
                View Console
              </button>
            </div>
            <pre style={{ marginTop: 18, color: '#fce7f3', background: 'rgba(0,0,0,0.2)', padding: 12, borderRadius: 6 }}>
              {this.state.error ? String(this.state.error) : ''}
            </pre>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}