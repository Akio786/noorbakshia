import React, { useState, useMemo } from 'react';
import moment from 'moment-hijri';
import { useApp } from '../AppContext';
import { getEventsForMonth, getEventsForHijriMonth } from '../utils/events';
import { FiArrowLeft, FiChevronLeft, FiChevronRight, FiStar } from 'react-icons/fi';
import { FaCalendarDays } from 'react-icons/fa6';

export const CalendarScreen = ({ setTab }) => {
    const { hijriOffset, updateHijriOffset, goBack } = useApp();
    const [calendarMode, setCalendarMode] = useState('gregorian'); // 'gregorian' or 'islamic'
    const m = moment.default || moment;
    
    // Decoupled state trackers for each calendar system
    const [gregorianDate, setGregorianDate] = useState(() => m().startOf('month'));
    const [hijriDate, setHijriDate] = useState(() => m().add(hijriOffset, 'days').iDate(1));

    // When offset changes, we might want to update the initial hijri view if we are still on "today's month"
    // For simplicity, just use offset in the isToday check and initialization

    if (!gregorianDate || !hijriDate) return <div className="text-red-500 p-4">Calendar Error</div>;

    const handlePrevMonth = () => {
        if (calendarMode === 'gregorian') {
            setGregorianDate(gregorianDate.clone().subtract(1, 'months').startOf('month'));
        } else {
            setHijriDate(hijriDate.clone().subtract(1, 'iMonth').iDate(1));
        }
    };

    const handleNextMonth = () => {
        if (calendarMode === 'gregorian') {
            setGregorianDate(gregorianDate.clone().add(1, 'months').startOf('month'));
        } else {
            setHijriDate(hijriDate.clone().add(1, 'iMonth').iDate(1));
        }
    };

    // Memoize event calculations to prevent double-evaluation
    const currentGregorianEvents = useMemo(() => {
        return getEventsForMonth(gregorianDate, hijriOffset);
    }, [gregorianDate, hijriOffset]);

    const currentHijriEvents = useMemo(() => {
        return getEventsForHijriMonth(hijriDate.iYear(), hijriDate.iMonth(), hijriOffset);
    }, [hijriDate, hijriOffset]);

    // Gregorian Grid Generator
    const generateGregorianGrid = () => {
        const year = gregorianDate.year();
        const month = gregorianDate.month();
        const startOfMonth = gregorianDate.clone().startOf('month');
        const daysInMonth = gregorianDate.daysInMonth();
        const firstDayOfWeek = startOfMonth.day(); // 0-6
        
        const days = [];
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(null);
        }

        for (let i = 1; i <= daysInMonth; i++) {
            const currentDay = m(`${year}-${month + 1}-${i}`, 'YYYY-MM-DD');
            const hasEvent = currentGregorianEvents.some(e => e.calculatedDate.date() === i);
            
            days.push({
                dayNumber: i,
                isToday: currentDay.format('YYYY-MM-DD') === m().format('YYYY-MM-DD'),
                hasEvent,
                hijriEquivalent: currentDay.clone().add(hijriOffset, 'days') // keep offset for hover info if any
            });
        }
        return days;
    };

    // Hijri Grid Generator
    const generateHijriGrid = () => {
        const iYear = hijriDate.iYear();
        const iMonth = hijriDate.iMonth(); // 0-11
        
        const startOfHijriMonth = hijriDate.clone().iDate(1);
        const daysInMonth = moment.iDaysInMonth(iYear, iMonth);
        const firstDayOfWeek = startOfHijriMonth.day(); // 0-6
        
        const days = [];
        for (let i = 0; i < firstDayOfWeek; i++) {
            days.push(null);
        }

        const todayWithOffset = m().add(hijriOffset, 'days').format('iYYYY-iMM-iDD');

        for (let i = 1; i <= daysInMonth; i++) {
            const currentDay = hijriDate.clone().iDate(i);
            const hasEvent = currentHijriEvents.some(e => e.day === i);
            
            days.push({
                dayNumber: i,
                isToday: currentDay.format('iYYYY-iMM-iDD') === todayWithOffset,
                hasEvent,
                gregorianDate: currentDay // currentDay is an extended moment object, we can subtract offset to get true greg date if needed later
            });
        }
        return days;
    };

    const daysGrid = useMemo(() => {
        return calendarMode === 'gregorian' ? generateGregorianGrid() : generateHijriGrid();
    }, [calendarMode, gregorianDate, hijriDate, currentGregorianEvents, currentHijriEvents]);

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Convert Hijri month index to name
    const getHijriMonthName = (monthIndex) => {
        const names = [
            'Muharram', 'Safar', 'Rabi ul Awal', 'Rabi ul Akhir',
            'Jumada al Ula', 'Jumada al Akhirah', 'Rajab', 'Sha\'ban',
            'Ramadan', 'Shawwal', 'Dhul Qadah', 'Dhul Hijjah'
        ];
        return names[monthIndex];
    };

    const displayTitle = calendarMode === 'gregorian' 
        ? gregorianDate.format('MMMM YYYY') 
        : `${getHijriMonthName(hijriDate.iMonth())} ${hijriDate.iYear()}`;

    // Active events list below the calendar
    const displayedEvents = calendarMode === 'gregorian' 
        ? currentGregorianEvents
        : currentHijriEvents;

    return (
        <div className="w-full h-full overflow-y-auto hide-scroll px-6 pb-[calc(8rem+env(safe-area-inset-bottom))] flex flex-col relative">
            
            {/* Top Header (Sticky Fade Mask) */}
            <div className="sticky top-0 -mx-6 px-6 pt-[calc(3rem+env(safe-area-inset-top))] pb-8 z-[100] pointer-events-none bg-gradient-to-b from-[#05110d] from-40% via-[#05110d]/90 to-transparent">
                <div className="w-full flex items-center justify-between animate-fade-down relative gap-4 pointer-events-auto">
                    <div className="flex items-center gap-3">
                        <button onClick={goBack} className="w-10 h-10 shrink-0 rounded-full border border-cream/10 flex items-center justify-center text-sage hover:text-gold hover:border-gold/30 transition-all shadow-inner bg-emerald-dark">
                            <FiArrowLeft className="text-xl" />
                        </button>
                        <FaCalendarDays className="text-gold text-2xl" />
                    </div>

                    {/* Pill Toggle */}
                    <div className="flex bg-emerald-dark/80 backdrop-blur-md rounded-full border border-cream/10 p-1">
                        <button 
                            onClick={() => setCalendarMode('gregorian')}
                            className={`px-4 py-1.5 rounded-full text-xs font-display transition-all ${calendarMode === 'gregorian' ? 'bg-gold text-forest shadow-md' : 'text-sage hover:text-cream'}`}
                        >
                            Gregorian
                        </button>
                        <button 
                            onClick={() => setCalendarMode('islamic')}
                            className={`px-4 py-1.5 rounded-full text-xs font-display transition-all ${calendarMode === 'islamic' ? 'bg-gold text-forest shadow-md' : 'text-sage hover:text-cream'}`}
                        >
                            Islamic
                        </button>
                    </div>
                </div>
            </div>

            {/* Dual Calendar Grid */}
            <div className="w-full mt-4 bg-[#05110d] border border-cream/10 rounded-3xl p-4 shadow-2xl relative overflow-hidden animate-fade-up anim-delay-200">
                
                {/* Month Navigator */}
                <div className="flex items-center justify-between mb-6">
                    <button onClick={handlePrevMonth} className="w-10 h-10 rounded-full border border-cream/5 flex items-center justify-center text-sage hover:text-gold hover:border-gold/30 transition-all bg-emerald-dark">
                        <FiChevronLeft className="text-xl" />
                    </button>
                    <div className="text-center">
                        <h3 className="font-display text-xl text-cream min-w-[150px]">{displayTitle}</h3>
                    </div>
                    <button onClick={handleNextMonth} className="w-10 h-10 rounded-full border border-cream/5 flex items-center justify-center text-sage hover:text-gold hover:border-gold/30 transition-all bg-emerald-dark">
                        <FiChevronRight className="text-xl" />
                    </button>
                </div>

                {/* Weekday Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(day => (
                        <div key={day} className="text-center text-sage/60 text-[10px] font-bold uppercase tracking-widest pb-2 border-b border-cream/5">
                            {day}
                        </div>
                    ))}
                </div>

                {/* The Grid */}
                <div className="grid grid-cols-7 gap-1">
                    {daysGrid.map((day, idx) => {
                        if (!day) return <div key={`empty-${idx}`} className="aspect-square opacity-20"></div>;

                        return (
                            <div 
                                key={idx} 
                                className={`aspect-square rounded-xl flex items-center justify-center relative border transition-colors
                                    ${day.isToday 
                                        ? 'bg-gold/10 border-gold/50 shadow-[inset_0_0_15px_rgba(201,168,76,0.15)]' 
                                        : 'bg-emerald-dark/30 border-transparent'
                                    }
                                `}
                            >
                                {/* Center Number */}
                                <span className={`font-display text-xl ${day.isToday ? 'text-gold' : 'text-cream'}`}>
                                    {day.dayNumber}
                                </span>

                                {/* Event Dot */}
                                {day.hasEvent && (
                                    <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(201,168,76,0.8)]"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Events List */}
            <div className="w-full mt-6 animate-fade-up anim-delay-300">
                <h3 className="font-display text-sage text-lg mb-3 px-1 flex items-center gap-2">
                    <FiStar className="text-gold" /> Events this Month
                </h3>
                <div className="space-y-3">
                    {displayedEvents.length === 0 ? (
                        <div className="text-center p-6 border border-cream/5 rounded-2xl bg-emerald-dark/20">
                            <p className="text-sage text-xs">No specific events this month.</p>
                        </div>
                    ) : (
                        displayedEvents.map(event => (
                            <div key={event.id} className="flex items-center justify-between p-4 rounded-2xl bg-[#05110d] border border-cream/5 shadow-sm">
                                <div>
                                    <h4 className="text-cream text-md font-display">{event.title}</h4>
                                    <p className="text-sage text-xs mt-1">{event.description}</p>
                                </div>
                                <div className="text-end flex flex-col items-end justify-center">
                                    {calendarMode === 'gregorian' ? (
                                        <>
                                            <span className="text-gold font-bold block text-lg leading-none">{event.calculatedDate?.date()}</span>
                                            <span className="text-sage text-[9px] uppercase tracking-widest mt-1">{event.calculatedDate?.format('MMM')}</span>
                                        </>
                                    ) : (
                                        <>
                                            <span className="text-gold font-bold block text-lg leading-none">{event.day}</span>
                                            <span className="text-sage text-[9px] uppercase tracking-widest mt-1">{getHijriMonthName(event.month).substring(0,3)}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

        </div>
    );
};
