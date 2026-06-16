import moment from 'moment-hijri';

export const EVENTS_DATA = [
    { id: '1', type: 'hijri', month: 8, day: 27, title: 'Laylatul Qadr', description: 'Night of Power' },
    { id: '2', type: 'hijri', month: 9, day: 1, title: 'Eid ul Fitr', description: 'Festival of Breaking the Fast' },
    { id: '3', type: 'hijri', month: 11, day: 10, title: 'Eid ul Adha', description: 'Festival of Sacrifice' },
    { id: '4', type: 'hijri', month: 0, day: 10, title: 'Day of Ashura', description: '10th of Muharram' },
    { id: '5', type: 'hijri', month: 2, day: 12, title: 'Mawlid al-Nabi', description: 'Birth of the Prophet (SAW)' },
    { id: '6', type: 'hijri', month: 6, day: 27, title: 'Isra and Mi\'raj', description: 'The Night Journey' },
    { id: '7', type: 'hijri', month: 7, day: 15, title: 'Mid-Sha\'ban', description: 'Night of Records' },
    { id: '8', type: 'hijri', month: 8, day: 1, title: 'Start of Ramadan', description: 'Month of Fasting begins' },
];

/**
 * Returns all events occurring in the specified Gregorian month and year.
 * @param {moment} viewDate - The currently viewed Gregorian month (moment object)
 * @param {number} offset - Hijri offset from settings
 * @returns {Array} List of events for that month with calculated moment dates
 */
export const getEventsForMonth = (viewDate, offset = 0) => {
    const m = moment.default || moment;
    const year = viewDate.year();
    const month = viewDate.month(); // 0-11
    const daysInMonth = viewDate.daysInMonth();
    
    let eventsFound = [];

    for (let i = 1; i <= daysInMonth; i++) {
        const gregorianDate = m(`${year}-${month + 1}-${i}`, 'YYYY-MM-DD');
        const hijriEquivalent = gregorianDate.clone().add(offset, 'days');
        
        const hMonth = hijriEquivalent.iMonth();
        const hDay = hijriEquivalent.iDate();

        EVENTS_DATA.forEach(event => {
            if (event.type === 'hijri' && event.month === hMonth && event.day === hDay) {
                eventsFound.push({
                    ...event,
                    calculatedDate: gregorianDate
                });
            }
        });
    }

    return eventsFound;
};

/**
 * Returns all events occurring in a specific Hijri month and year.
 * @param {number} iYear - Hijri Year
 * @param {number} iMonth - Hijri Month (0-11)
 * @param {number} offset - Hijri offset from settings (used if we need exact gregorian conversion, but Hijri match is direct)
 * @returns {Array} List of events for that Hijri month
 */
export const getEventsForHijriMonth = (iYear, iMonth, offset = 0) => {
    let eventsFound = [];
    
    EVENTS_DATA.forEach(event => {
        if (event.type === 'hijri' && event.month === iMonth) {
            eventsFound.push({ ...event });
        }
    });

    return eventsFound;
};

/**
 * Calculates the next 'limit' upcoming events based on the exact chronological distance from today.
 * @param {number} limit - Number of events to return
 * @param {number} offset - Hijri offset from settings
 * @returns {Array} Sorted list of the next upcoming events with calculated moment dates
 */
export const getUpcomingEvents = (limit = 3, offset = 0) => {
    const m = moment.default || moment;
    const today = m().add(offset, 'days');
    const currentYear = today.iYear();
    
    let upcoming = [];

    // Calculate the absolute date for each event for THIS year and NEXT year
    // to handle wrap-arounds (e.g. today is month 11, next event is month 0)
    EVENTS_DATA.forEach(event => {
        if (event.type === 'hijri') {
            // Try this year
            const dateThisYear = m(`${currentYear}/${event.month + 1}/${event.day}`, 'iYYYY/iM/iD');
            // Try next year
            const dateNextYear = m(`${currentYear + 1}/${event.month + 1}/${event.day}`, 'iYYYY/iM/iD');
            
            // Only add if it's in the future (or today)
            // We strip time to safely compare dates
            const todayStr = today.format('YYYY-MM-DD');
            if (dateThisYear.format('YYYY-MM-DD') >= todayStr) {
                upcoming.push({ ...event, calculatedDate: dateThisYear });
            } else {
                upcoming.push({ ...event, calculatedDate: dateNextYear });
            }
        }
    });

    // Sort chronologically by the absolute Gregorian underlying date
    upcoming.sort((a, b) => a.calculatedDate.valueOf() - b.calculatedDate.valueOf());

    return upcoming.slice(0, limit);
};
