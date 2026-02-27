import type { GitHubNotification, MessageStyle } from '../types/index.js'

import { formatSingleNotification } from './formatters/formatSingleNotification.js'

/**
 * Formats an array of GitHub notifications into a message based on the specified style.
 *
 * @param notifications - Array of GitHub notifications to format
 * @param style - The message style to use (defaults to 'slack')
 * @returns A formatted string message
 */
export const prepareMessage = (
  notifications: GitHubNotification[],
  style: MessageStyle = 'slack'
): string => {
  if (!notifications || notifications.length === 0) {
    return 'No notifications found.'
  }

  if (notifications.length === 1) {
    try {
      return formatSingleNotification(notifications[0], style)
    } catch {
      return '⚠️ Error processing notification'
    }
  }

  // Multiple notifications: full details with header
  let header = `📬 *GitHub Notifications* (${notifications.length})\n\n`
  if (style === 'raw') {
    header = `GitHub Notifications (${notifications.length}):\n\n`
  }

  const formattedNotifications = notifications
    .map((notification, index) => {
      try {
        return `${index + 1}. ${formatSingleNotification(notification, style)}`
      } catch {
        return `${index + 1}. ⚠️ Error processing notification`
      }
    })
    .join('\n\n')

  return header + formattedNotifications
}
