import React from 'react';
import { DoubleBezelCard } from '../components/DoubleBezelCard';
import { Eyebrow } from '../components/Eyebrow';
import AmbientHero from '../components/AmbientHero';
import PrayerAtmosphere from '../components/PrayerAtmosphere';
import { useApp } from '../AppContext';
import { getUpcomingEvents } from '../utils/events';
import { getDailyName } from '../data/asmaulHusna';
import { getCurrentDua } from '../data/contextualDuas';
import { usePrayerTimes } from '../hooks/usePrayerTimes';

import { BsFillMoonStarsFill, BsFillSunriseFill, BsSunFill, BsCloudSunFill } from 'react-icons/bs';
import { FaCalendarAlt, FaHeart, FaEnvelope } from 'react-icons/fa';
import { FaLocationDot, FaBuildingColumns } from 'react-icons/fa6';
import { FiChevronRight, FiArrowUpRight } from 'react-icons/fi';

import moment from 'moment-hijri';

export const HomeScreen = ({ setTab }) => {
    const { setSearchOpen, hijriOffset, navigateTo, locationName, locationError } = useApp();

    // Strict English transliteration array to fix moment-hijri's Arabic default
    const HIJRI_MONTHS_EN = [
        'Muharram', 'Safar', "Rabi' al-Awwal", "Rabi' al-Thani", 
        'Jumada al-Ula', 'Jumada al-Akhirah', 'Rajab', "Sha'ban", 
        'Ramadan', 'Shawwal', "Dhu'l-Qa'dah", "Dhu'l-Hijjah"
    ];

    // Calculate dates with offset
    const m = moment.default || moment;
    const today = m().add(hijriOffset, 'days');
    const hijriDateStr = `${today.iDate()} ${HIJRI_MONTHS_EN[today.iMonth()]} ${today.iYear()}`;
    
    const upcomingEvents = getUpcomingEvents(3, hijriOffset);
    
    const currentDua = getCurrentDua();
    const dailyName = getDailyName();
    
    const getGregorianDate = () => {
        return new Intl.DateTimeFormat('en-GB', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        }).format(new Date());
    };

    const { nextPrayerName, countdown, isLoading, prayersList } = usePrayerTimes();

    const activePrayer = prayersList.find(p => p.current);
    const currentPrayerName = activePrayer ? activePrayer.name : 'Isha';

    // Massive Background Weather Icon
    const getMassiveWeatherIcon = () => {
        switch(nextPrayerName.toLowerCase()) {
            case 'fajr': return <BsFillSunriseFill className="text-[240px] text-sage/10 drop-shadow-[0_0_30px_rgba(143,175,154,0.2)] animate-float absolute" />;
            case 'dhuhr': return <BsSunFill className="text-[280px] text-gold/10 drop-shadow-[0_0_40px_rgba(201,168,76,0.3)] animate-spin-slow origin-center absolute" />;
            case 'asr': return <BsSunFill className="text-[280px] text-gold/10 drop-shadow-[0_0_40px_rgba(201,168,76,0.2)] animate-spin-slow origin-center absolute opacity-80" />;
            case 'maghrib': return <BsCloudSunFill className="text-[240px] text-orange-400/10 drop-shadow-[0_0_30px_rgba(251,146,60,0.2)] animate-float absolute" />;
            case 'isha': return <BsFillMoonStarsFill className="text-[240px] text-cream/10 drop-shadow-[0_0_30px_rgba(245,230,200,0.2)] animate-float absolute" />;
            default: return <BsSunFill className="text-[280px] text-gold/10 drop-shadow-[0_0_40px_rgba(201,168,76,0.3)] animate-spin-slow origin-center absolute" />;
        }
    };

    return (
        <div className="w-full h-full overflow-y-auto hide-scroll px-6 pt-0 pb-[calc(10rem+env(safe-area-inset-bottom))] flex flex-col gap-6">
            {/* Top Header (Sticky Fade Mask) */}
            <div className="self-stretch sticky -top-10 -mx-6 px-6 -mt-10 pt-[calc(3.5rem+env(safe-area-inset-top))] pb-6 z-[100] pointer-events-none bg-gradient-to-b from-[#05110d] from-40% via-[#05110d]/90 to-transparent">
                <div className="w-full flex justify-between items-center animate-fade-down relative">
                    {/* Left: Date Pill */}
                    <button onClick={() => navigateTo('calendar')} className="bg-cream/5 border border-cream/10 rounded-full px-3 py-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-sage hover:bg-cream/10 transition-colors pointer-events-auto shadow-inner">
                        <FaCalendarAlt className="text-gold" />
                        <span>{hijriDateStr}</span>
                    </button>

                    {/* Right: Location Pill */}
                    <div className="bg-cream/5 border border-cream/10 rounded-full px-3 py-1.5 flex items-center gap-1.5 text-[10px] uppercase tracking-widest text-sage pointer-events-auto shadow-inner">
                        {locationError ? (
                            <FaLocationDot className="text-sage" />
                        ) : (
                            <FaLocationDot className="text-gold animate-pulse" />
                        )}
                        <span>{locationName}</span>
                    </div>
                </div>
            </div>

            {/* Compact Next Prayer Hero */}
            <div className="w-full relative animate-fade-down pt-[calc(1rem+env(safe-area-inset-top))] pb-2 z-10">
                {/* Dynamic Ambient Atmosphere for Hero Focus */}
                <AmbientHero />
                
                <DoubleBezelCard className="!p-0">
                    <PrayerAtmosphere currentPrayer={currentPrayerName} />
                    <div className="flex flex-col items-start w-full relative z-10 pt-8 pb-6 px-6">
                        <span className="text-[10px] text-sage/90 uppercase tracking-[0.3em] mb-1 font-bold drop-shadow-md">NEXT PRAYER</span>
                        <h2 className="font-display text-4xl text-cream uppercase tracking-widest leading-none drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] mb-3">
                            {isLoading ? '...' : nextPrayerName}
                        </h2>
                        
                        <div className="flex items-end gap-2 mt-1">
                            <span className="font-body text-2xl text-gold font-bold tracking-widest drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                                {countdown}
                            </span>
                        </div>
                    </div>
                </DoubleBezelCard>
            </div>

            {/* Compact Prayer Timeline */}
            <div className="w-full animate-fade-up mt-2 shrink-0">
                <DoubleBezelCard>
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-display text-cream text-lg">Today's Timeline</h3>
                        <span className="text-[10px] text-sage uppercase tracking-widest">{getGregorianDate()}</span>
                    </div>
                    <div className="flex flex-col relative w-full">
                        <div className="absolute start-2 top-2 bottom-2 w-px bg-sage/10"></div>
                        {prayersList.length > 0 ? prayersList.map(prayer => (
                            <div key={prayer.name} className="flex items-center py-2 relative group w-full">
                                {/* Timeline Dot */}
                                <div className={`w-4 h-4 rounded-full border-2 absolute start-0 flex items-center justify-center transition-all duration-500 z-10
                                    ${prayer.current ? 'border-gold bg-gold shadow-[0_0_15px_rgba(201,168,76,0.5)]' : 
                                      (prayer.next ? 'border-emerald-400 bg-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.4)]' : 
                                      (prayer.passed ? 'border-sage/10 bg-[#05110d]' : 'border-sage/30 bg-[#05110d]'))}
                                `}>
                                    {prayer.current && <div className="w-2 h-2 bg-[#05110d] rounded-full animate-pulse"></div>}
                                    {prayer.next && <div className="w-1.5 h-1.5 bg-[#05110d] rounded-full"></div>}
                                </div>
                                
                                <div className="ms-6 flex justify-between items-center w-full flex-1">
                                    <div className="flex items-center gap-2">
                                        <span className={`text-sm tracking-widest uppercase transition-colors 
                                            ${prayer.current ? 'text-gold font-bold' : 
                                              (prayer.next ? 'text-cream font-bold' : 
                                              (prayer.passed ? 'text-sage/30' : 'text-sage/70'))}
                                        `}>
                                            {prayer.name}
                                        </span>
                                        {prayer.current && <span className="text-[8px] bg-gold/10 text-gold px-1.5 py-0.5 rounded border border-gold/20 tracking-wider">NOW</span>}
                                        {prayer.next && <span className="text-[8px] bg-emerald-400/10 text-emerald-400 px-1.5 py-0.5 rounded border border-emerald-400/20 tracking-wider">NEXT</span>}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`font-display transition-colors
                                            ${prayer.current ? 'text-xl text-gold' : 
                                              (prayer.next ? 'text-lg text-cream' : 
                                              (prayer.passed ? 'text-md text-sage/30' : 'text-md text-sage/70'))}
                                        `}>
                                            {prayer.time}
                                        </span>
                                        <span className={`text-[9px] uppercase tracking-widest mt-0.5 font-medium transition-colors
                                            ${prayer.current ? 'text-gold/70' : 
                                              (prayer.next ? 'text-sage/70' : 'text-sage/30')}
                                        `}>
                                            Ends {prayer.endTime}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="text-center text-sage/50 text-sm py-4 tracking-widest uppercase animate-pulse">Calculating Times...</div>
                        )}
                    </div>
                </DoubleBezelCard>
            </div>

            {/* Compact Calendar Events Slider */}
            <div className="w-full animate-fade-up anim-delay-100 mt-2">
                <DoubleBezelCard>
                    <div 
                        className="flex justify-between items-center mb-4 cursor-pointer group" 
                        onClick={() => navigateTo('calendar')}
                    >
                        <h3 className="font-display text-cream text-lg group-hover:text-gold transition-colors">Upcoming Events</h3>
                        <div className="flex items-center gap-1 text-sage group-hover:text-gold transition-colors">
                            <span className="text-[10px] uppercase tracking-widest">View Calendar</span>
                            <FiChevronRight className="text-xs" />
                        </div>
                    </div>
                    <div className="flex gap-4 overflow-x-auto hide-scroll pb-2 -mx-6 px-6 snap-x">
                        {upcomingEvents.map((event) => (
                            <div 
                                key={event.id} 
                                className="snap-center shrink-0 w-[140px] p-3 rounded-2xl bg-[#05110d] border border-cream/5 cursor-pointer hover:border-gold/30 transition-colors"
                                onClick={() => navigateTo('calendar')}
                            >
                                <h4 className="font-display text-cream text-md truncate">{event.title}</h4>
                                <span className="text-[9px] text-sage uppercase tracking-widest block truncate">
                                    {event.calculatedDate.format('iD iMMMM')}
                                </span>
                            </div>
                        ))}
                    </div>
                </DoubleBezelCard>
            </div>

            {/* Contextual Dua Widget */}
            <div className="w-full animate-fade-up anim-delay-200 mt-2">
                <DoubleBezelCard className="w-full">
                    <span className="absolute top-4 -start-4 text-[90px] font-display text-white opacity-[0.03] leading-none select-none tracking-tighter z-0 whitespace-nowrap pointer-events-none">
                        SUPPLICATION
                    </span>
                    <div className="relative z-10 w-full pt-[calc(1rem+env(safe-area-inset-top))] flex flex-col h-full">
                        <div className="flex items-center gap-2 mb-4">
                            {currentDua.Icon && <currentDua.Icon className={`text-xl ${currentDua.color}`} />}
                            <span className="text-sage text-[10px] uppercase tracking-widest font-bold">{currentDua.title}</span>
                        </div>
                        
                        <p className="text-cream text-3xl font-arabic-display text-right leading-[2.2] mb-6" dir="rtl">
                            {currentDua.arabic}
                        </p>
                        
                        <p className="text-sage text-xs font-body font-light italic mb-2 text-left">
                            {currentDua.transliteration}
                        </p>
                        
                        <p className="text-cream text-sm font-body font-light leading-relaxed text-left mb-3">
                            "{currentDua.english}"
                        </p>

                        {currentDua.urdu && (
                            <p className="text-gold text-xl font-urdu leading-[2.2] text-right border-t border-cream/5 pt-3" dir="rtl">
                                {currentDua.urdu}
                            </p>
                        )}
                    </div>
                </DoubleBezelCard>
            </div>

            {/* 99 Names Widget */}
            <div className="w-full animate-fade-up anim-delay-300 mt-2 mb-8">
                <DoubleBezelCard className="w-full">
                    <div className="relative z-10 w-full py-6 flex flex-col items-center justify-center text-center">
                        <span className="text-sage text-[10px] uppercase tracking-widest mb-6 block w-full text-start font-bold">ASMA-UL-HUSNA</span>
                        
                        {/* Glow effect behind Arabic text */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-gold/10 blur-[40px] rounded-full pointer-events-none z-0"></div>
                        
                        <h2 className="text-gold text-7xl font-arabic-display leading-none mb-4 relative z-10 drop-shadow-md" dir="rtl">
                            {dailyName.arabic}
                        </h2>
                        
                        <h3 className="text-cream font-display text-2xl tracking-wide mb-1 relative z-10">
                            {dailyName.transliteration}
                        </h3>
                        
                        <p className="text-sage text-sm font-light relative z-10">
                            {dailyName.meaning}
                        </p>

                        {dailyName.urdu && (
                            <p className="text-gold text-sm font-urdu mt-3 relative z-10" dir="rtl">
                                {dailyName.urdu}
                            </p>
                        )}
                    </div>
                </DoubleBezelCard>
            </div>

            {/* Support the Developer Widget */}
            <div className="w-full animate-fade-up anim-delay-400 mt-2 mb-12">
                <DoubleBezelCard className="w-full relative overflow-hidden">
                    <div className="absolute top-0 end-0 w-40 h-40 bg-gold/5 rounded-full blur-3xl pointer-events-none"></div>
                    <div className="relative z-10 w-full p-2 flex flex-col">
                        <div className="text-center mb-6 mt-2">
                            <FaHeart className="text-rose-500 text-2xl mb-2 inline-block animate-pulse-slow drop-shadow-[0_0_15px_rgba(244,63,94,0.3)]" />
                            <h3 className="font-display text-xl text-cream mb-1">Created with Love</h3>
                            <p className="text-sage text-xs font-light">
                                Designed & Developed by <strong className="text-gold font-medium">Muhammad Akram</strong>
                            </p>
                        </div>
                        
                        {/* Contact */}
                        <a href="mailto:muhammdd.akram@gmail.com" className="flex items-center justify-between bg-[#071510] border border-cream/5 rounded-xl p-3 mb-3 hover:border-gold/30 transition-all group">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-emerald-mid flex items-center justify-center shrink-0">
                                    <FaEnvelope className="text-gold" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sage text-[9px] uppercase tracking-widest font-bold">Feedback & Bugs</span>
                                    <span className="text-cream text-xs">muhammdd.akram@gmail.com</span>
                                </div>
                            </div>
                            <FiArrowUpRight className="text-sage group-hover:text-gold transition-colors" />
                        </a>

                        {/* Donate */}
                        <div className="bg-[#071510] border border-gold/20 rounded-xl p-4 shadow-[0_0_15px_rgba(201,168,76,0.05)]">
                            <p className="text-sage text-xs font-light text-center mb-4 leading-relaxed">
                                Donations are absolutely not required, but they are deeply appreciated and help with ongoing development. <strong className="text-cream font-medium">100% of all donations</strong> will be used exclusively for app development.
                            </p>
                            <div className="flex items-center justify-between bg-emerald-dark/50 border border-gold/10 rounded-lg p-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-emerald-mid flex items-center justify-center border border-gold/30 shrink-0">
                                        <FaBuildingColumns className="text-gold" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-gold/80 text-[9px] uppercase tracking-widest font-bold">Easypaisa Account</span>
                                        <span className="text-gold text-sm tracking-wider font-mono font-medium">03422291322</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </DoubleBezelCard>
            </div>

        </div>
    );
};
