import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Tashkent");

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

  // Use Intl to get parts in Tashkent timezone
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tashkent",
    day: "numeric",
    month: "numeric",
    year: "numeric",
    weekday: "long"
  }).formatToParts(d);

  const getPart = (type: string) => parts.find(p => p.type === type)?.value;
  
  const day = getPart("day");
  const monthNum = parseInt(getPart("month") || "1", 10);
  const year = getPart("year");
  const weekdayName = getPart("weekday"); // English weekday

  const month = MONTHS_UZ[monthNum - 1];
  
  let res = `${day} ${month}`;
  if (options.includeYear) res += `, ${year}`;
  
  if (options.includeWeekday) {
    // We need to map English weekday to Uzbek since Intl doesn't always have uz-LATN support consistent
    // Actually d.getDay() is still local. Let's use a safe way.
    // Better: get day of week index from Tashkent time
    const tashkentDate = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Tashkent" }));
    const wdIndex = tashkentDate.getDay();
    const wd = options.shortWeekday ? WEEKDAYS_SHORT_UZ[wdIndex] : WEEKDAYS_UZ[wdIndex];
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
  if (isNaN(d.getTime())) return { main: "—", sub: "—" };

  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tashkent",
    day: "numeric",
    month: "numeric"
  });
  const parts = formatter.formatToParts(d);
  const day = parts.find(p => p.type === "day")?.value;
  const monthNum = parseInt(parts.find(p => p.type === "month")?.value || "1", 10);
  
  const tashkentDate = new Date(d.toLocaleString("en-US", { timeZone: "Asia/Tashkent" }));
  const weekday = WEEKDAYS_UZ[tashkentDate.getDay()];

  return {
    main: `${day} ${MONTHS_UZ[monthNum - 1]}`,
    sub: weekday
  };
}

/**
 * Translates internal status codes to Uzbek
 */
export function formatUzStatus(status: string) {
  if (!status) return "—";
  const s = status.toLowerCase();
  const map: Record<string, string> = {
    new: "Yangi",
    todo: "Yangi",
    in_progress: "Jarayonda",
    pending: "Tekshiruvda",
    done: "Bajarildi",
    approved: "Bajarildi",
    rejected: "Rad etildi",
    incomplete: "Tugallanmagan",
  };
  return map[s] || status;
}

/**
 * Formats date and time: "18 May, 22:57"
 */
export function formatUzDateTime(date: string | Date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tashkent",
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  });
  const parts = formatter.formatToParts(d);
  const day = parts.find(p => p.type === "day")?.value;
  const monthNum = parseInt(parts.find(p => p.type === "month")?.value || "1", 10);
  const hour = parts.find(p => p.type === "hour")?.value;
  const minute = parts.find(p => p.type === "minute")?.value;

  return `${day} ${MONTHS_UZ[monthNum - 1]}, ${hour}:${minute}`;
}

/**
 * Formats time in Tashkent timezone (GMT+5)
 */
export function formatUzTime(date: string | Date) {
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tashkent",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(d);
}
