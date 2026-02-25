import type { GitHubNotification, MessageStyle } from '../types/index.js'

import { formatNotificationRaw } from './formatters/formatNotificationRaw.js'
import { formatNotificationSlack } from './formatters/formatNotificationSlack.js'

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

  if (style === 'slack') {
    return formatNotificationSlack(notifications)
  }

  return formatNotificationRaw(notifications)
}
