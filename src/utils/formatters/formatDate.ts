/**
 * Formats an ISO date string into a human-readable format.
 *
 * @param dateString - The ISO date string to format
 * @returns A formatted date string or the original string if parsing fails
 */
export const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString)
    if (!isNaN(date.getTime())) {
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  } catch {
    // Keep original date string if parsing fails
  }

  return dateString
}
