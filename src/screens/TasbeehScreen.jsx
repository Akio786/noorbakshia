import React, { useState, useCallback, useEffect } from 'react';
import { GiPrayerBeads } from 'react-icons/gi';
import { FiRefreshCw } from 'react-icons/fi';

export const TasbeehScreen = ({ setTab }) => {
    const [count, setCount] = useState(() => {
        const saved = localStorage.getItem('tasbeeh_count');
        return saved ? parseInt(saved, 10) : 0;
    });
    
    const [totalCount, setTotalCount] = useState(() => {
        const saved = localStorage.getItem('tasbeeh_total');
        return saved ? parseInt(saved, 10) : 0;
    });
    
    const [animate, setAnimate] = useState(false);

    // Save to LocalStorage whenever counts change
    useEffect(() => {
        localStorage.setItem('tasbeeh_count', count.toString());
        localStorage.setItem('tasbeeh_total', totalCount.toString());
    }, [count, totalCount]);

    useEffect(() => {
        const handleReset = () => setCount(0);
        window.addEventListener('reset-tasbeeh', handleReset);
        return () => window.removeEventListener('reset-tasbeeh', handleReset);
    }, []);

    const handleTap = useCallback(() => {
        // Haptic feedback if supported
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(50);
        }

        setCount(prev => {
            const next = prev + 1;
            // Stronger vibration at milestones (33, 66, 99)
            if (next % 33 === 0 && window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate([100, 50, 100]);
            }
            return next;
        });
        
        setTotalCount(prev => prev + 1);

        // Trigger ripple animation
        setAnimate(true);
        setTimeout(() => setAnimate(false), 300);
    }, []);

    const resetCount = () => {
        setCount(0);
    };

    return (
        <div className="w-full h-full overflow-y-auto hide-scroll px-6 py-12 pb-[calc(8rem+env(safe-area-inset-bottom))] flex flex-col items-center relative">
            {/* Header */}
            <div className="w-full flex items-center justify-between mb-8 relative z-20 animate-fade-down">
                <div className="flex items-center gap-3">
                    <GiPrayerBeads className="text-gold text-2xl" />
                    <h2 className="font-display text-3xl text-cream tracking-wide">Tasbeeh</h2>
                </div>
                <button onClick={resetCount} className="w-10 h-10 rounded-full border border-cream/10 flex items-center justify-center text-sage hover:text-gold hover:border-gold/30 hover:bg-white/10 transition-all shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] bg-white/5">
                    <FiRefreshCw className="text-xl" />
                </button>
            </div>

            {/* Interactive Counter */}
            <div className="flex-1 flex flex-col items-center justify-center w-full animate-fade-up anim-delay-200 z-10">
                
                {/* Milestone Indicator */}
                <div className="text-sage text-sm mb-12 tracking-widest uppercase flex flex-col items-center gap-2">
                    <span className="opacity-50 text-[10px]">Cycle</span>
                    <span className="text-gold text-lg font-display">{Math.floor(count / 33)}</span>
                </div>

                {/* Main Tap Area */}
                <div className="relative group cursor-pointer" onClick={handleTap}>
                    {/* Background Glow */}
                    <div className="absolute inset-0 bg-gold/10 rounded-full blur-3xl transition-opacity duration-500 group-hover:bg-gold/20"></div>
                    
                    {/* Ripple Effect Layer */}
                    <div className={`absolute inset-0 border border-gold rounded-full transition-all duration-300 ease-out pointer-events-none ${animate ? 'scale-150 opacity-0' : 'scale-100 opacity-50'}`}></div>

                    {/* The Button */}
                    <div className="w-64 h-64 rounded-full bg-white/5 border border-cream/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] flex items-center justify-center relative overflow-hidden transition-transform duration-75 active:scale-[0.97]">
                        {/* Inner Gradient Core */}
                        <div className="absolute inset-3 rounded-full bg-gradient-to-b from-white/5 to-white/0 border border-cream/5 flex flex-col items-center justify-center shadow-2xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
                            <span className="font-display text-7xl text-cream mb-2 transition-all select-none">{count}</span>
                            <span className="text-[10px] text-sage tracking-[0.2em] uppercase select-none">Total: {totalCount}</span>
                        </div>
                    </div>
                </div>

                <p className="text-sage/40 text-[11px] uppercase tracking-widest mt-16 font-light">Tap circle to count</p>
            </div>
        </div>
    );
};
