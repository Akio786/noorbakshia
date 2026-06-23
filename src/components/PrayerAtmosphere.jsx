import React from 'react';
import { BsSunFill, BsFillMoonStarsFill } from 'react-icons/bs';

const PrayerAtmosphere = ({ currentPrayer }) => {
    const getTheme = () => {
        const p = (currentPrayer || '').toLowerCase();
        switch (p) {
            case 'fajr':
                return {
                    sky: 'from-indigo-950 via-indigo-900 to-orange-400/80',
                    sun: false,
                    moon: true,
                    celestialClass: 'text-cream/70 bottom-4 right-8 drop-shadow-[0_0_15px_rgba(245,230,200,0.3)]',
                    cloudColor: 'text-purple-300/10',
                    stars: true,
                };
            case 'dhuhr':
                return {
                    sky: 'from-sky-400 via-sky-300 to-cyan-100',
                    sun: true,
                    moon: false,
                    celestialClass: 'text-yellow-200 top-4 right-4 drop-shadow-[0_0_30px_rgba(253,224,71,0.8)]',
                    cloudColor: 'text-white/40',
                    stars: false,
                };
            case 'asr':
                return {
                    sky: 'from-blue-400 via-sky-300 to-amber-200',
                    sun: true,
                    moon: false,
                    celestialClass: 'text-gold top-1/2 right-4 -translate-y-1/2 drop-shadow-[0_0_40px_rgba(201,168,76,0.6)]',
                    cloudColor: 'text-white/30',
                    stars: false,
                };
            case 'maghrib':
                return {
                    sky: 'from-indigo-800 via-purple-600 to-orange-500',
                    sun: true,
                    moon: false,
                    celestialClass: 'text-orange-400 bottom-4 right-6 drop-shadow-[0_0_30px_rgba(251,146,60,0.8)]',
                    cloudColor: 'text-orange-200/20',
                    stars: false,
                };
            case 'isha':
            case 'qiyam':
                return {
                    sky: 'from-[#05110d] via-[#091a14] to-indigo-950',
                    sun: false,
                    moon: true,
                    celestialClass: 'text-cream/90 top-6 right-6 drop-shadow-[0_0_20px_rgba(245,230,200,0.4)]',
                    cloudColor: 'text-slate-500/10',
                    stars: true,
                };
            default:
                return {
                    sky: 'from-emerald-dark to-emerald-mid',
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
        <div className={`absolute inset-0 bg-gradient-to-b ${theme.sky} transition-colors duration-1000 ease-fluid z-0`}>
            
            {/* Stars */}
            {theme.stars && (
                <div className="absolute inset-0 z-0">
                    <div className="absolute top-4 left-8 w-1 h-1 bg-white rounded-full animate-twinkle"></div>
                    <div className="absolute top-10 left-1/3 w-1.5 h-1.5 bg-white rounded-full animate-twinkle" style={{ animationDelay: '1s' }}></div>
                    <div className="absolute top-6 right-12 w-1 h-1 bg-white rounded-full animate-twinkle" style={{ animationDelay: '0.5s' }}></div>
                    <div className="absolute top-16 right-1/4 w-2 h-2 bg-white rounded-full animate-twinkle" style={{ animationDelay: '2s' }}></div>
                    <div className="absolute bottom-1/3 left-4 w-1 h-1 bg-white rounded-full animate-twinkle" style={{ animationDelay: '1.5s' }}></div>
                </div>
            )}



            {/* Clouds */}
            <div className={`absolute top-2 left-0 right-0 z-0 ${theme.cloudColor} opacity-70`}>
                <svg className="w-24 h-auto animate-pan-slower absolute top-0 -left-10" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.5 19c-2.485 0-4.5-2.015-4.5-4.5 0-.156.008-.31.023-.46A5.5 5.5 0 0 0 7.5 14a5.485 5.485 0 0 0-4.04 1.83 3.501 3.501 0 0 1 .04-5.83A5.485 5.485 0 0 1 7.5 8c2.612 0 4.814 1.82 5.344 4.256A4.5 4.5 0 0 1 17.5 10c2.485 0 4.5 2.015 4.5 4.5S19.985 19 17.5 19z"/>
                </svg>
                <svg className="w-32 h-auto animate-pan-slow absolute top-6 -left-32 opacity-80" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.5 19c-2.485 0-4.5-2.015-4.5-4.5 0-.156.008-.31.023-.46A5.5 5.5 0 0 0 7.5 14a5.485 5.485 0 0 0-4.04 1.83 3.501 3.501 0 0 1 .04-5.83A5.485 5.485 0 0 1 7.5 8c2.612 0 4.814 1.82 5.344 4.256A4.5 4.5 0 0 1 17.5 10c2.485 0 4.5 2.015 4.5 4.5S19.985 19 17.5 19z"/>
                </svg>
            </div>

            {/* Mosque Silhouette */}
            <div className="absolute bottom-0 left-0 right-0 z-0 opacity-40 text-black">
                <svg viewBox="0 0 800 200" className="w-full h-auto translate-y-1" fill="currentColor" preserveAspectRatio="none">
                    {/* Domes */}
                    <path d="M0,200 L0,160 L40,160 L40,120 A 40 40 0 0 1 120 120 L120,160 L200,160 L200,90 A 30 30 0 0 1 260 90 L260,160 L320,160 L320,70 A 50 50 0 0 1 420 70 L420,160 L480,160 L480,90 A 30 30 0 0 1 540 90 L540,160 L620,160 L620,120 A 40 40 0 0 1 700 120 L700,160 L800,160 L800,200 Z" />
                    {/* Minarets */}
                    <path d="M150,160 L150,50 L160,30 L170,50 L170,160 Z M630,160 L630,50 L640,30 L650,50 L650,160 Z M30,160 L30,80 L35,60 L40,80 L40,160 Z M750,160 L750,80 L755,60 L760,80 L760,160 Z" />
                </svg>
            </div>

            {/* Tinted glass overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#05110d]/90 via-[#05110d]/40 to-transparent z-10 pointer-events-none"></div>
        </div>
    );
};

export default PrayerAtmosphere;
