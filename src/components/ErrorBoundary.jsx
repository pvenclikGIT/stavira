import { Component } from 'react';

/**
 * Top-level error boundary. Catches any React render error
 * and shows a recovery screen instead of a blank page.
 *
 * Includes a "reset all data" button — single click fixes the most
 * common cause (stale localStorage from older schema).
 */
export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });
    // eslint-disable-next-line no-console
    console.error('[Stavira] React error boundary caught:', error, errorInfo);
  }

  handleClearAndReload = () => {
    try {
      // Clear all stavira keys regardless of version
      const toRemove = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (key && key.startsWith('stavira:')) toRemove.push(key);
      }
      toRemove.forEach((k) => window.localStorage.removeItem(k));
    } catch {
      /* ignore */
    }
    window.location.hash = '#/';
    window.location.reload();
  };

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.error) return this.props.children;

    const message = this.state.error?.message || 'Neznámá chyba';
    const stack = this.state.error?.stack || '';

    return (
      <div style={{
        minHeight: '100vh',
        background: '#f8fafc',
        padding: '40px 20px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        color: '#0f1117',
      }}>
        <div style={{ maxWidth: 560, margin: '40px auto' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            marginBottom: 24,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: 10,
              background: '#fbbf24',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: 800, fontSize: 18, color: '#0f1117',
            }}>
              !
            </div>
            <div>
              <p style={{ fontWeight: 700, fontSize: 18, margin: 0 }}>Stavira</p>
              <p style={{ color: '#64748b', fontSize: 13, margin: 0 }}>
                Něco se pokazilo
              </p>
            </div>
          </div>

          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 12px', lineHeight: 1.2 }}>
            Aplikace narazila na chybu
          </h1>
          <p style={{ color: '#475569', margin: '0 0 24px', lineHeight: 1.5 }}>
            Nejčastější příčinou jsou zastaralá data v prohlížeči po aktualizaci aplikace.
            Stačí jedno kliknutí a vyřešíme to.
          </p>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 32 }}>
            <button
              type="button"
              onClick={this.handleClearAndReload}
              style={{
                background: '#0f1117', color: 'white',
                padding: '12px 20px', borderRadius: 10,
                fontWeight: 700, fontSize: 14, border: 'none',
                cursor: 'pointer',
              }}
            >
              Resetovat data a obnovit
            </button>
            <button
              type="button"
              onClick={this.handleReload}
              style={{
                background: 'white', color: '#0f1117',
                padding: '12px 20px', borderRadius: 10,
                fontWeight: 700, fontSize: 14,
                border: '1px solid #e2e8f0',
                cursor: 'pointer',
              }}
            >
              Jen obnovit stránku
            </button>
          </div>

          <details style={{
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: 10,
            padding: 12,
          }}>
            <summary style={{
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 600,
              color: '#64748b',
            }}>
              Technické detaily (pošlete vývojáři)
            </summary>
            <p style={{
              fontSize: 12,
              color: '#0f1117',
              fontFamily: 'monospace',
              margin: '12px 0 4px',
              wordBreak: 'break-word',
            }}>
              {message}
            </p>
            {stack && (
              <pre style={{
                fontSize: 11,
                color: '#64748b',
                whiteSpace: 'pre-wrap',
                margin: 0,
                fontFamily: 'monospace',
                maxHeight: 200,
                overflow: 'auto',
              }}>
                {stack}
              </pre>
            )}
          </details>
        </div>
      </div>
    );
  }
}
