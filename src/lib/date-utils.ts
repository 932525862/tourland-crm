const MONTHS_UZ = [
  "Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun",
  "Iyul", "Avgust", "Sentyabr", "Oktyabr", "Noyabr", "Dekabr"
];

const WEEKDAYS_UZ = [
  "Yakshanba", "Dushanba", "Seshanba", "Chorshanba", "Payshanba", "Juma", "Shanba"
];

const WEEKDAYS_SHORT_UZ = [
  "Yak", "Du", "Se", "Chor", "Pay", "Ju", "Sha"
];

/**
 * Formats a date string or object to Uzbek long format: "18 May, 2026"
 */
export function formatUzDate(date: string | Date, options: { includeYear?: boolean; includeWeekday?: boolean; shortWeekday?: boolean } = {}) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";

  const day = d.getDate();
  const month = MONTHS_UZ[d.getMonth()];
  const year = d.getFullYear();
  
  let res = `${day} ${month}`;
  if (options.includeYear) res += `, ${year}`;
  
  if (options.includeWeekday) {
    const wd = options.shortWeekday ? WEEKDAYS_SHORT_UZ[d.getDay()] : WEEKDAYS_UZ[d.getDay()];
    res += ` (${wd})`;
  }

  return res;
}

/**
 * Formats a YYYY-MM string to Uzbek: "May, 2026"
 */
export function formatUzMonth(ym: string) {
  if (!ym || !ym.includes("-")) return ym;
  const [y, m] = ym.split("-");
  const monthIdx = parseInt(m, 10) - 1;
  return `${MONTHS_UZ[monthIdx]} ${y}`;
}

/**
 * Formats a date to "18 May" (bold) and "Dushanba" (small)
 */
export function formatUzDateTable(date: string | Date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return { day: "—", weekday: "—" };

  const day = d.getDate();
  const month = MONTHS_UZ[d.getMonth()];
  const weekday = WEEKDAYS_UZ[d.getDay()];

  return {
    main: `${day} ${month}`,
    sub: weekday
  };
}
