import { useState, useEffect } from 'react';
import { Coordinates, CalculationMethod, PrayerTimes, Madhab, SunnahTimes } from 'adhan';
import { useApp } from '../AppContext';
import { useStore } from '../store/useStore';

export const usePrayerTimes = () => {
    const { locationCoords, locationError, locationName } = useApp();
    const { prayerSettings } = useStore();
    const [nextPrayerName, setNextPrayerName] = useState('...');
    const [countdown, setCountdown] = useState('--:--:--');
    const [isLoading, setIsLoading] = useState(true);
    const [prayersList, setPrayersList] = useState([]);

    useEffect(() => {
        if (locationName === 'Locating...') {
            setIsLoading(true);
            return;
        }

        // Fallback coordinates (Skardu, PK) if GPS is denied/unavailable
        const coords = locationCoords || { lat: 35.2971, lng: 75.6333 };
        const coordinates = new Coordinates(coords.lat, coords.lng);
        
        // Dynamic Calculation Method from Settings
        const methodKey = prayerSettings?.calculationMethod || 'Karachi';
        const params = CalculationMethod[methodKey] ? CalculationMethod[methodKey]() : CalculationMethod.Karachi();
        
        // Dynamic Asr Madhab from Settings
        params.madhab = prayerSettings?.madhab === 'Shafi' ? Madhab.Shafi : Madhab.Hanafi;

        // Calculate initial times
        const date = new Date();
        let prayerTimes = new PrayerTimes(coordinates, date, params);
        
        let yesterday = new Date(date);
        yesterday.setDate(yesterday.getDate() - 1);
        let yesterdayTimes = new PrayerTimes(coordinates, yesterday, params);

        const updateTimer = () => {
            const now = new Date();
            
            // Midnight Rollover Check: If the day changed, recalculate
            if (now.getDate() !== date.getDate()) {
                date.setTime(now.getTime());
                prayerTimes = new PrayerTimes(coordinates, date, params);
                
                yesterday = new Date(date);
                yesterday.setDate(yesterday.getDate() - 1);
                yesterdayTimes = new PrayerTimes(coordinates, yesterday, params);
            }

            let tomorrow = new Date(date);
            tomorrow.setDate(tomorrow.getDate() + 1);
            let tomorrowTimes = new PrayerTimes(coordinates, tomorrow, params);

            const events = [
                { name: 'Fajr', time: prayerTimes.fajr },
                { name: 'Dhuhr', time: prayerTimes.dhuhr },
                { name: 'Asr', time: prayerTimes.asr },
                { name: 'Maghrib', time: prayerTimes.maghrib },
                { name: 'Isha', time: prayerTimes.isha }
            ];

            // Find the true next event
            let nextEvent = events.find(e => e.time.getTime() > now.getTime());
            
            // Handle Edge Case: If after Isha, the next event is tomorrow's Fajr
            if (!nextEvent) {
                nextEvent = { name: 'Fajr', time: tomorrowTimes.fajr };
            }

            setNextPrayerName(nextEvent.name);

            if (nextEvent.time) {
                const diffMs = nextEvent.time.getTime() - now.getTime();
                if (diffMs > 0) {
                    const totalSeconds = Math.floor(diffMs / 1000);
                    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
                    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
                    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
                    setCountdown(`${hours}:${minutes}:${seconds}`);
                } else {
                    setCountdown('00:00:00');
                }
            }

            // Generate daily timeline list
            const formatter = new Intl.DateTimeFormat('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true
            });

            const currentList = events.map((e, idx) => {
                let nextEventTime = events[idx + 1] ? events[idx + 1].time : tomorrowTimes.fajr;
                
                // Fajr ends at Sunrise
                if (e.name === 'Fajr') {
                    nextEventTime = prayerTimes.sunrise;
                }
                
                let isCurrent = now >= e.time && now < nextEventTime;
                
                // Edge case: Between midnight and today's Fajr, yesterday's Isha is still the active current prayer
                if (e.name === 'Isha' && now < events[0].time) {
                    isCurrent = true;
                }
                
                return {
                    name: e.name,
                    time: formatter.format(e.time),
                    endTime: formatter.format(nextEventTime),
                    passed: now >= nextEventTime && !isCurrent,
                    current: isCurrent,
                    next: nextEvent.time.getTime() === e.time.getTime()
                };
            });

            setPrayersList(currentList);
            setIsLoading(false);
        };

        // Run immediately then every second
        updateTimer();
        const intervalId = setInterval(updateTimer, 1000);

        // Crucial teardown to prevent memory leaks
        return () => clearInterval(intervalId);

    }, [locationCoords, locationName, prayerSettings?.calculationMethod, prayerSettings?.madhab]); // Re-run if location or settings update

    return { nextPrayerName, countdown, isLoading, prayersList };
};
