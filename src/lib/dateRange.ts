/**
 * Date range utility functions for analytics
 * 
 * IMPORTANT: All date operations use LOCAL timezone, not UTC.
 * We construct dates using new Date(y, m, d, 0, 0, 0, 0) to avoid timezone issues.
 */

/**
 * Get start of day in local timezone as ISO string (for timestamptz)
 * Uses local date components to avoid timezone parsing issues
 */
export function startOfDayLocal(date: Date): Date {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  return new Date(year, month, day, 0, 0, 0, 0);
}

/**
 * Add days to a date in local timezone
 */
export function addDaysLocal(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Get start of day in local timezone as ISO string (for timestamptz)
 * Returns ISO string via toISOString() - the Date object is constructed in local time,
 * so toISOString() correctly converts it to UTC representing that local moment
 */
export function getStartOfDay(date: Date): string {
  const localStart = startOfDayLocal(date);
  return localStart.toISOString();
}

/**
 * Get start of next day (exclusive end for date ranges)
 * Returns ISO string via toISOString() - ensures [start, end) exclusive range
 */
export function getStartOfNextDay(date: Date): string {
  const nextDay = addDaysLocal(date, 1);
  const localStart = startOfDayLocal(nextDay);
  return localStart.toISOString();
}

/**
 * Get today's date range (start of today to start of tomorrow)
 * Today = [today 00:00 local, tomorrow 00:00 local) - end is exclusive
 * Returns ISO strings via toISOString()
 */
export function getTodayRange(): { start: string; end: string } {
  const today = new Date();
  const start = getStartOfDay(today); // today 00:00 local -> ISO string
  const end = getStartOfNextDay(today); // tomorrow 00:00 local -> ISO string (exclusive)
  return { start, end };
}

/**
 * Get yesterday's date range (start of yesterday to start of today)
 * Yesterday = [yesterday 00:00 local, today 00:00 local) - end is exclusive
 * Returns ISO strings via toISOString()
 */
export function getYesterdayRange(): { start: string; end: string } {
  const today = new Date();
  const yesterday = addDaysLocal(today, -1);
  const start = getStartOfDay(yesterday); // yesterday 00:00 local -> ISO string
  const end = getStartOfDay(today); // today 00:00 local -> ISO string (exclusive)
  return { start, end };
}

/**
 * Get custom date range (start of from date to start of (to + 1 day))
 * Custom = [from 00:00 local, (to+1) 00:00 local) - end is exclusive
 * Returns ISO strings via toISOString()
 */
export function getCustomRange(from: Date, to: Date): { start: string; end: string } {
  const start = getStartOfDay(from); // from 00:00 local -> ISO string
  const end = getStartOfNextDay(to); // (to+1) 00:00 local -> ISO string (exclusive)
  return { start, end };
}

/**
 * Get date range for preset (24h, 7d, 30d)
 * Returns range from (now - interval) to now (both as ISO strings)
 */
export function getPresetRange(hours: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date(end.getTime() - hours * 60 * 60 * 1000);
  return {
    start: start.toISOString(),
    end: end.toISOString(),
  };
}

/**
 * Format date range for display
 */
export function formatDateRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const endDateMinusOne = new Date(endDate);
  endDateMinusOne.setDate(endDateMinusOne.getDate() - 1);

  const startStr = startDate.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  const endStr = endDateMinusOne.toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  if (startStr === endStr) {
    return startStr;
  }

  return `${startStr} - ${endStr}`;
}
