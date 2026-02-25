import type { GitHubNotification } from '../../types/github.js'

import { convertApiUrlToBrowserUrl } from '../github/convertApiUrlToBrowserUrl.js'
import { formatDate } from './formatDate.js'

/**
 * Formats an array of GitHub notifications into a raw plain-text message.
 *
 * @param notifications - Array of GitHub notifications to format
 * @returns A formatted plain-text string message
 */
export const formatNotificationRaw = (
  notifications: GitHubNotification[]
): string => {
  const header = `\n`

  const formattedNotifications = notifications
    .map((notification, index) => {
      try {
        // Safely extract values with fallbacks
        const repoUrl = convertApiUrlToBrowserUrl(
          notification?.repository?.url || ''
        )
        const reason = notification?.reason || 'unknown'
        const updatedAt = notification?.updated_at || 'N/A'
        const subjectTitle = notification?.subject?.title || 'No title'
        const subjectType = notification?.subject?.type || 'Unknown'
        const subjectUrl = convertApiUrlToBrowserUrl(
          notification?.subject?.url || notification?.url || ''
        )

        // Build the notification message (plain text, no special formatting)
        const prefix = notifications.length > 1 ? `${index + 1}. ` : ''
        const lines = [
          `${prefix}${subjectType}(${reason}): ${subjectTitle} `,
          subjectUrl ? `   URL: ${subjectUrl}` : null,
          repoUrl ? `   Repository: ${repoUrl}` : null,
          `   Date: ${formatDate(updatedAt)}`
        ]

        return lines.filter(Boolean).join('\n')
      } catch {
        // If any error occurs processing this notification, return a safe fallback
        return `${index + 1}. Error processing notification`
      }
    })
    .join('\n\n')

  return header + formattedNotifications
}
