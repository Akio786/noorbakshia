import React, { useEffect, useState } from 'react';
import { FiMoon } from 'react-icons/fi';

export const SplashScreen = ({ onComplete }) => {
    const [phase, setPhase] = useState(0);

    useEffect(() => {
        // Orchestrate the loading animation phases
        const timers = [
            setTimeout(() => setPhase(1), 800),  // Show logo
            setTimeout(() => setPhase(2), 2000), // Reveal text
            setTimeout(() => setPhase(3), 3500), // Fade out
            setTimeout(() => onComplete(), 4200) // Unmount
        ];

        return () => timers.forEach(clearTimeout);
    }, [onComplete]);

    return (
        <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#05110d] transition-opacity duration-700 ${phase === 3 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}>
            
            {/* Ethereal Glow Background */}
            <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gold/10 rounded-full blur-[100px] transition-all duration-1000 ${phase >= 1 ? 'scale-150 opacity-100' : 'scale-50 opacity-0'}`}></div>

            <div className="relative z-10 flex flex-col items-center">
                {/* Logo Icon */}
                <div className={`w-24 h-24 rounded-full border border-gold/30 flex items-center justify-center mb-8 shadow-[0_0_50px_rgba(201,168,76,0.15)] transition-all duration-1000 ease-out ${phase >= 1 ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-10 opacity-0 scale-90'}`}>
                    <FiMoon className="text-5xl text-gold" />
                </div>

                {/* Typography */}
                <div className={`text-center transition-all duration-1000 ease-out ${phase >= 2 ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                    <h1 className="font-display text-4xl text-cream tracking-wide mb-3">Noorbakhshia</h1>
                    <div className="flex items-center justify-center gap-4">
                        <div className="h-px w-8 bg-gold/50"></div>
                        <span className="font-display text-gold tracking-[0.3em] uppercase text-xs">365</span>
                        <div className="h-px w-8 bg-gold/50"></div>
                    </div>
                </div>
            </div>
        </div>
    );
};
