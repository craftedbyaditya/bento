/**
 * Utility functions for handling dates and timezones
 */

/**
 * Converts UTC timestamp to local date object
 */
const utcToLocal = (utcTimestamp: string): Date => {
  const date = new Date(utcTimestamp);
  const localOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - localOffset);
};

/**
 * Gets the user's current timezone
 */
export const getUserTimezone = (): string => {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
};

/**
 * Formats a UTC date string to local date-time string
 */
export const formatLocalDateTime = (utcDateString: string): string => {
  try {
    if (!utcDateString) return 'N/A';
    
    // Convert UTC to local time
    const localDate = utcToLocal(utcDateString);
    
    // Check if date is valid
    if (isNaN(localDate.getTime())) {
      console.error('Invalid date:', utcDateString);
      return 'Invalid Date';
    }

    // Format in local timezone
    return localDate.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
      timeZoneName: 'short'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Invalid Date';
  }
};
