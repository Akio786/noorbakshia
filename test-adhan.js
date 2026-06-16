import { Coordinates, CalculationMethod, PrayerTimes } from 'adhan';

const coords = new Coordinates(24.8607, 67.0011);
const date = new Date(2026, 5, 14); // June 14, 2026
const params = CalculationMethod.Karachi();
const prayerTimes = new PrayerTimes(coords, date, params);

const formatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Karachi'
});

console.log("Fajr: " + formatter.format(prayerTimes.fajr));
console.log("Dhuhr: " + formatter.format(prayerTimes.dhuhr));
console.log("Asr: " + formatter.format(prayerTimes.asr));
console.log("Maghrib: " + formatter.format(prayerTimes.maghrib));
console.log("Isha: " + formatter.format(prayerTimes.isha));
