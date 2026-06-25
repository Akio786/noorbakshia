import React from 'react';
import { BsSunFill, BsFillMoonStarsFill } from 'react-icons/bs';

const PrayerAtmosphere = ({ currentPrayer }) => {
    const getTheme = () => {
        const p = (currentPrayer || '').toLowerCase();
        switch (p) {
            case 'fajr':
                return {
                    sky: 'from-[#0b1021] via-[#1b1b3a] to-[#d88c6b]/80',
                    sun: false,
                    moon: true,
                    celestialClass: 'text-cream/80 bottom-8 right-10 drop-shadow-[0_0_25px_rgba(245,230,200,0.6)] scale-125',
                    cloudColor: 'text-[#d88c6b]/20',
                    stars: true,
                };
            case 'dhuhr':
                return {
                    sky: 'from-[#1e5eb3] via-[#4a90e2] to-[#8fd3f4]',
                    sun: true,
                    moon: false,
                    celestialClass: 'text-[#fdf2b3] top-8 right-8 drop-shadow-[0_0_40px_rgba(253,242,179,1)] scale-150',
                    cloudColor: 'text-white/30',
                    stars: false,
                };
            case 'asr':
                return {
                    sky: 'from-[#2b5876] via-[#4e4376] to-[#e0a96d]',
                    sun: true,
                    moon: false,
                    celestialClass: 'text-[#ffd380] top-1/2 right-8 -translate-y-1/2 drop-shadow-[0_0_45px_rgba(255,211,128,0.9)] scale-150',
                    cloudColor: 'text-[#ffd380]/20',
                    stars: false,
                };
            case 'maghrib':
                return {
                    sky: 'from-[#1a0b2e] via-[#6b1f38] to-[#e85d04]',
                    sun: true,
                    moon: false,
                    celestialClass: 'text-[#ff9e00] bottom-6 right-10 drop-shadow-[0_0_40px_rgba(255,158,0,0.8)] scale-125',
                    cloudColor: 'text-[#ff9e00]/20',
                    stars: false,
                };
            case 'isha':
            case 'qiyam':
                return {
                    sky: 'from-[#030706] via-[#081210] to-[#0a1a2f]',
                    sun: false,
                    moon: true,
                    celestialClass: 'text-[#e2e8f0]/90 top-10 right-10 drop-shadow-[0_0_30px_rgba(226,232,240,0.5)] scale-110',
                    cloudColor: 'text-[#94a3b8]/5',
                    stars: true,
                };
            default:
                return {
                    sky: 'from-[#05110d] to-[#0a1f18]',
                    sun: false,
                    moon: false,
                    celestialClass: 'hidden',
                    cloudColor: 'hidden',
                    stars: false,
                };
        }
    };

    const theme = getTheme();

    return (
        <div className={`absolute inset-0 bg-gradient-to-b ${theme.sky} transition-colors duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] z-0 overflow-hidden`}>
            
            {/* Subtle Noise Texture for Premium Feel */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay pointer-events-none" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>

            {/* Stars */}
            {theme.stars && (
                <div className="absolute inset-0 z-0 opacity-80">
                    <div className="absolute top-6 left-10 w-1 h-1 bg-white rounded-full animate-twinkle"></div>
                    <div className="absolute top-12 left-1/3 w-1.5 h-1.5 bg-white rounded-full animate-twinkle" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-8 right-16 w-[2px] h-[2px] bg-white rounded-full animate-twinkle" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute top-20 right-1/4 w-2 h-2 bg-white rounded-full animate-twinkle" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute bottom-1/2 left-8 w-[3px] h-[3px] bg-white rounded-full animate-twinkle" style={{ animationDelay: '1.5s' }}></div>
                </div>
            )}

            {/* Celestial Body (Sun/Moon) */}
            <div className={`absolute transition-all duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] ${theme.celestialClass}`}>
                {theme.sun && <BsSunFill className="text-4xl" />}
                {theme.moon && <BsFillMoonStarsFill className="text-3xl" />}
            </div>

            {/* Clouds */}
            <div className={`absolute top-2 left-0 right-0 z-0 ${theme.cloudColor} opacity-70`}>
                <svg className="w-32 h-auto animate-pan-slower absolute top-2 -left-10 blur-[1px]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.5 19c-2.485 0-4.5-2.015-4.5-4.5 0-.156.008-.31.023-.46A5.5 5.5 0 0 0 7.5 14a5.485 5.485 0 0 0-4.04 1.83 3.501 3.501 0 0 1 .04-5.83A5.485 5.485 0 0 1 7.5 8c2.612 0 4.814 1.82 5.344 4.256A4.5 4.5 0 0 1 17.5 10c2.485 0 4.5 2.015 4.5 4.5S19.985 19 17.5 19z"/>
                </svg>
                <svg className="w-48 h-auto animate-pan-slow absolute top-8 -left-32 opacity-80 blur-[2px]" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.5 19c-2.485 0-4.5-2.015-4.5-4.5 0-.156.008-.31.023-.46A5.5 5.5 0 0 0 7.5 14a5.485 5.485 0 0 0-4.04 1.83 3.501 3.501 0 0 1 .04-5.83A5.485 5.485 0 0 1 7.5 8c2.612 0 4.814 1.82 5.344 4.256A4.5 4.5 0 0 1 17.5 10c2.485 0 4.5 2.015 4.5 4.5S19.985 19 17.5 19z"/>
                </svg>
            </div>

            {/* Mosque Silhouette - Enhanced & Realistic */}
            <div className="absolute bottom-0 left-0 right-0 z-0 text-[#030a07] opacity-[0.65] mix-blend-multiply drop-shadow-2xl">
                <svg viewBox="0 0 800 200" className="w-full h-auto translate-y-2 scale-105 transform origin-bottom" fill="currentColor" preserveAspectRatio="none">
                    
                    {/* Layer 1: Background Rolling Hills */}
                    <path d="M 0 180 Q 200 120 450 160 T 800 140 L 800 200 L 0 200 Z" opacity="0.4" />
                    <path d="M 0 200 Q 150 150 350 180 T 800 160 L 800 200 L 0 200 Z" opacity="0.6" />

                    {/* Layer 2: Main Mosque Structure */}
                    <g transform="translate(0, 5)">
                        {/* Center Main Building */}
                        <rect x="300" y="110" width="200" height="90" />
                        
                        {/* Side Buildings */}
                        <rect x="230" y="130" width="70" height="70" />
                        <rect x="500" y="130" width="70" height="70" />

                        {/* Main Dome */}
                        <path d="M 320 110 Q 320 40 400 10 Q 480 40 480 110 Z" />
                        
                        {/* Main Dome Crescent */}
                        <path d="M 400 10 L 400 0" stroke="currentColor" strokeWidth="2" />
                        <path d="M 404 -8 A 6 6 0 1 0 395 -12 A 5 5 0 1 1 404 -8 Z" />

                        {/* Left Side Dome */}
                        <path d="M 240 130 Q 240 80 265 60 Q 290 80 290 130 Z" />
                        <path d="M 265 60 L 265 50" stroke="currentColor" strokeWidth="2" />
                        
                        {/* Right Side Dome */}
                        <path d="M 510 130 Q 510 80 535 60 Q 560 80 560 130 Z" />
                        <path d="M 535 60 L 535 50" stroke="currentColor" strokeWidth="2" />

                        {/* Left Minaret */}
                        <rect x="190" y="50" width="16" height="150" />
                        <polygon points="185,50 211,50 206,40 190,40" />
                        <polygon points="190,40 206,40 198,10" />
                        <path d="M 198 10 L 198 0" stroke="currentColor" strokeWidth="2" />

                        {/* Right Minaret */}
                        <rect x="594" y="50" width="16" height="150" />
                        <polygon points="589,50 615,50 610,40 594,40" />
                        <polygon points="594,40 610,40 602,10" />
                        <path d="M 602 10 L 602 0" stroke="currentColor" strokeWidth="2" />
                        
                        {/* Archway details (Doors/Windows) */}
                        <path d="M 370 200 L 370 150 A 30 30 0 0 1 430 150 L 430 200 Z" fill="#05110d" opacity="0.3" />
                        <path d="M 250 200 L 250 160 A 15 15 0 0 1 280 160 L 280 200 Z" fill="#05110d" opacity="0.3" />
                        <path d="M 520 200 L 520 160 A 15 15 0 0 1 550 160 L 550 200 Z" fill="#05110d" opacity="0.3" />
                    </g>
                    
                    {/* Layer 3: Foreground Base */}
                    <rect x="0" y="200" width="800" height="5" />
                </svg>
            </div>

            {/* Tinted glass overlay for text legibility (Deep fade up) */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#05110d] via-[#05110d]/50 to-transparent z-10 pointer-events-none"></div>
        </div>
    );
};

export default PrayerAtmosphere;
