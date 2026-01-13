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
 * Convert local Date to ISO string (for timestamptz)
 * This preserves the local time but sends it as ISO string
 */
function toISOStringLocal(date: Date): string {
  // Get local time components
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  const ms = String(date.getMilliseconds()).padStart(3, '0');
  
  // Get timezone offset
  const offset = -date.getTimezoneOffset();
  const offsetHours = String(Math.floor(Math.abs(offset) / 60)).padStart(2, '0');
  const offsetMinutes = String(Math.abs(offset) % 60).padStart(2, '0');
  const offsetSign = offset >= 0 ? '+' : '-';
  
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.${ms}${offsetSign}${offsetHours}:${offsetMinutes}`;
}

/**
 * Get start of day in local timezone as ISO string (for timestamptz)
 */
export function getStartOfDay(date: Date): string {
  const localStart = startOfDayLocal(date);
  return toISOStringLocal(localStart);
}

/**
 * Get start of next day (exclusive end for date ranges)
 */
export function getStartOfNextDay(date: Date): string {
  const nextDay = addDaysLocal(date, 1);
  const localStart = startOfDayLocal(nextDay);
  return toISOStringLocal(localStart);
}

/**
 * Get today's date range (start of today to start of tomorrow)
 * Today = [today 00:00 local, tomorrow 00:00 local)
 */
export function getTodayRange(): { start: string; end: string } {
  const today = new Date();
  return {
    start: getStartOfDay(today),
    end: getStartOfNextDay(today),
  };
}

/**
 * Get yesterday's date range (start of yesterday to start of today)
 * Yesterday = [yesterday 00:00 local, today 00:00 local)
 */
export function getYesterdayRange(): { start: string; end: string } {
  const today = new Date();
  const yesterday = addDaysLocal(today, -1);
  return {
    start: getStartOfDay(yesterday),
    end: getStartOfDay(today),
  };
}

/**
 * Get custom date range (start of from date to start of (to + 1 day))
 */
export function getCustomRange(from: Date, to: Date): { start: string; end: string } {
  return {
    start: getStartOfDay(from),
    end: getStartOfNextDay(to),
  };
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
