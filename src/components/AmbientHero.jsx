import React, { useState, useEffect } from 'react';

const AmbientHero = () => {
    const [isDay, setIsDay] = useState(true);

    useEffect(() => {
        // Calculate once on mount to prevent hydration mismatch
        const hours = new Date().getHours();
        setIsDay(hours >= 6 && hours < 18);
    }, []);

    // Helper to generate random positions and delays for particles
    const generateParticles = (count) => {
        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            left: `${Math.floor(Math.random() * 80) + 10}%`,
            top: `${Math.floor(Math.random() * 80) + 10}%`,
            delay: `${(Math.random() * 5).toFixed(1)}s`,
            size: `${Math.floor(Math.random() * 4) + 2}px`,
        }));
    };

    // Memoize the particles so they don't jump around on re-renders
    const [particles] = useState(() => generateParticles(6));

    if (isDay) {
        return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 rounded-[32px]">
                {/* Massive Day Glow Orb */}
                <div className="absolute inset-0 bg-gold/20 blur-[50px] animate-pulse-slow"></div>
                
                {/* Floating Dust Motes */}
                {particles.map((p) => (
                    <div 
                        key={`day-${p.id}`}
                        className="absolute bg-gold/50 rounded-full animate-float blur-[1px] will-change-transform opacity-0"
                        style={{
                            left: p.left,
                            top: p.top,
                            width: p.size,
                            height: p.size,
                            animationDelay: p.delay,
                        }}
                    ></div>
                ))}
            </div>
        );
    }

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10 rounded-[32px]">
            {/* Massive Night Glow Orb */}
            <div className="absolute inset-0 bg-cyan-900/40 blur-[50px] animate-pulse-slow"></div>
            
            {/* Twinkling Stars */}
            {particles.map((p) => (
                <div 
                    key={`night-${p.id}`}
                    className="absolute bg-cream/70 rounded-full animate-twinkle blur-[0.5px] will-change-opacity opacity-0"
                    style={{
                        left: p.left,
                        top: p.top,
                        width: p.size,
                        height: p.size,
                        animationDelay: p.delay,
                    }}
                ></div>
            ))}
        </div>
    );
};

export default AmbientHero;
