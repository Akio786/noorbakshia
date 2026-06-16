import React from 'react';
import { FiAlertOctagon, FiRefreshCw } from 'react-icons/fi';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
      // Clear state and caches, then reload
      localStorage.clear();
      if (window.localforage) {
          window.localforage.clear();
      }
      window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-full h-screen bg-[#05110d] flex items-center justify-center p-6 relative overflow-hidden">
            {/* Background ambient glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="w-full max-w-sm bg-forest border border-rose-500/20 rounded-3xl p-8 relative z-10 animate-fade-up shadow-2xl flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400 text-4xl mb-6 shadow-[0_0_30px_rgba(244,63,94,0.2)]">
                    <FiAlertOctagon />
                </div>
                
                <h2 className="font-display text-2xl text-cream mb-3">Something Went Wrong</h2>
                <p className="text-sage text-sm mb-8 leading-relaxed">
                    The app encountered an unexpected error. Please clear your cache and restart to continue.
                </p>

                <div className="w-full max-h-32 overflow-y-auto bg-emerald-dark/50 border border-cream/5 rounded-xl p-3 mb-8 text-left text-rose-300/80 font-mono text-[10px] hide-scroll">
                    {this.state.error && this.state.error.toString()}
                </div>

                <button 
                    onClick={this.handleReset}
                    className="w-full bg-rose-500 hover:bg-rose-600 text-white font-display tracking-widest uppercase text-xs py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] flex items-center justify-center gap-2"
                >
                    <FiRefreshCw /> Clear & Restart
                </button>
            </div>
        </div>
      );
    }

    return this.props.children; 
  }
}
