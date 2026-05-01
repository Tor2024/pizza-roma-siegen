'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen bg-roma-dark flex items-center justify-center p-4">
            <div className="bg-white/5 rounded-2xl p-8 max-w-md text-center border border-white/10">
              <div className="text-6xl mb-4">🔧</div>
              <h2 className="text-2xl font-poppins font-bold text-white mb-4">
                Etwas ist schief gelaufen
              </h2>
              <p className="text-white/60 mb-6">
                Entschuldigung, ein unerwarteter Fehler ist aufgetreten. Bitte laden Sie die Seite neu.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-roma-red text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-700 transition-colors"
              >
                Seite neu laden
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
