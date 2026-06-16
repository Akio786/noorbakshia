import moment from 'moment-hijri';

try {
    console.log("iDaysInMonth test 1:", moment.iDaysInMonth(1445, 0)); // Muharram 1445
} catch (e) {
    console.log("Error:", e.message);
}

const date = moment();
console.log("Current iMonth:", date.iMonth());
console.log("Current iYear:", date.iYear());
