import React, { useState, useEffect } from 'react';

export const LandscapeOverlay = () => {
    const [isLandscape, setIsLandscape] = useState(false);

    useEffect(() => {
        const checkOrientation = () => {
            // Use screen.orientation API if available, fallback to window dimensions
            if (window.screen?.orientation) {
                const type = window.screen.orientation.type;
                setIsLandscape(type.includes('landscape'));
            } else {
                setIsLandscape(window.innerWidth > window.innerHeight);
            }
        };

        checkOrientation();

        window.addEventListener('resize', checkOrientation);
        window.screen?.orientation?.addEventListener('change', checkOrientation);

        return () => {
            window.removeEventListener('resize', checkOrientation);
            window.screen?.orientation?.removeEventListener('change', checkOrientation);
        };
    }, []);

    if (!isLandscape) return null;

    return (
        <div className="fixed inset-0 z-[9999] bg-[#05110d] flex flex-col items-center justify-center gap-8 p-8">
            
            {/* Animated Phone Icon */}
            <div className="relative w-20 h-32 animate-landscape-rotate">
                {/* Phone body */}
                <div className="w-full h-full rounded-2xl border-2 border-cream/30 bg-cream/5 backdrop-blur-sm flex items-center justify-center">
                    {/* Screen area */}
                    <div className="w-14 h-24 rounded-lg bg-cream/10 border border-cream/10"></div>
                </div>
                {/* Notch */}
                <div className="absolute top-2 left-1/2 -translate-x-1/2 w-6 h-1 rounded-full bg-cream/20"></div>
                {/* Home indicator */}
                <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-8 h-1 rounded-full bg-cream/15"></div>
            </div>

            {/* Text */}
            <div className="text-center animate-fade-up">
                <h2 className="font-display text-2xl text-cream tracking-widest uppercase mb-3">Rotate Your Device</h2>
                <p className="text-sage/70 text-sm tracking-wide max-w-[260px]">
                    This app is designed for portrait mode. Please rotate your phone vertically.
                </p>
            </div>

            {/* Decorative glow */}
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full bg-gold/5 blur-[100px] pointer-events-none"></div>
        </div>
    );
};
