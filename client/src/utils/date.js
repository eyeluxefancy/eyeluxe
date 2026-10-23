// All dates in this app are shop (India) business dates. Formatting a date
// with the browser's default timezone is unreliable — if the till/PC's OS
// timezone is misconfigured (a real issue seen in this shop), the SAME
// correct timestamp renders as the wrong calendar day. Pinning the
// timezone here makes the displayed date correct no matter what the
// machine's own clock/timezone settings are.
const IST = 'Asia/Kolkata';

export function formatDate(date, opts = {}) {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-GB', { timeZone: IST, ...opts });
}
