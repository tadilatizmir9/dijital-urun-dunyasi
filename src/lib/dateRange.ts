/**
 * Date range utility functions for analytics
 */

/**
 * Get start of day in local timezone as ISO string (for timestamptz)
 */
export function getStartOfDay(date: Date): string {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Get start of next day (exclusive end for date ranges)
 */
export function getStartOfNextDay(date: Date): string {
  const d = new Date(date);
  d.setDate(d.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

/**
 * Get today's date range (start of today to start of tomorrow)
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
 */
export function getYesterdayRange(): { start: string; end: string } {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return {
    start: getStartOfDay(yesterday),
    end: getStartOfDay(new Date()),
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
 * Returns range from (now - days) to now
 */
export function getPresetRange(days: number): { start: string; end: string } {
  const end = new Date();
  const start = new Date();
  start.setDate(start.getDate() - days);
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
