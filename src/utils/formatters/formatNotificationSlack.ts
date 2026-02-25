import type { GitHubNotification } from '../../types/github.js'

import { convertApiUrlToBrowserUrl } from '../github/convertApiUrlToBrowserUrl.js'
import { getTypeEmoji } from '../getTypeEmoji.js'
import { formatDate } from './formatDate.js'

/**
 * Formats an array of GitHub notifications into a Slack-style message.
 *
 * @param notifications - Array of GitHub notifications to format
 * @returns A formatted string message for Slack
 */
export const formatNotificationSlack = (
  notifications: GitHubNotification[]
): string => {
  const hasMultiple = notifications.length > 1
  const header = hasMultiple
    ? `📬 *GitHub Notifications* (${notifications.length})\n\n`
    : ''

  const formattedNotifications = notifications
    .map((notification, index) => {
      try {
        // Safely extract values with fallbacks
        const repoFullName =
          notification?.repository?.full_name || 'Unknown Repository'
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

        // Format the repository link (Slack style)
        const repoLink = repoUrl ? `<${repoUrl}|${repoFullName}>` : repoFullName

        // Format the subject link (Slack style)
        const subjectLink = subjectUrl
          ? `<${subjectUrl}|${subjectTitle}>`
          : subjectTitle

        // Get emoji based on subject type
        const typeEmoji = getTypeEmoji(subjectType)

        // Build the notification message with proper Slack formatting
        const prefix = hasMultiple ? `${index + 1}. ` : ''
        return (
          `${prefix}${typeEmoji} *${subjectLink}*\n` +
          `📂 Repository: ${repoLink}\n` +
          `📌 Type: ${subjectType}\n` +
          `🔔 Reason: ${reason}\n` +
          `🕒 Updated: ${formatDate(updatedAt)}`
        )
      } catch {
        // If any error occurs processing this notification, return a safe fallback
        const prefix = hasMultiple ? `${index + 1}. ` : ''
        return `${prefix}⚠️ Error processing notification`
      }
    })
    .join('\n\n')

  return header + formattedNotifications
}
