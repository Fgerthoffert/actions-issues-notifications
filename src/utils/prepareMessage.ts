import type { GitHubNotification } from '../types/github.js'

import { convertApiUrlToBrowserUrl } from './github/convertApiUrlToBrowserUrl.js'
import { getTypeEmoji } from './getTypeEmoji.js'

/**
 * Formats an array of GitHub notifications into a readable message for instant messaging platforms.
 *
 * @param notifications - Array of GitHub notifications to format
 * @returns A formatted string message listing all notifications
 */
export const prepareMessage = (notifications: GitHubNotification[]): string => {
  if (!notifications || notifications.length === 0) {
    return 'No notifications found.'
  }

  const header = `📬 *GitHub Notifications* (${notifications.length})\n\n`

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

        // Format the repository link
        const repoLink = repoUrl ? `<${repoUrl}|${repoFullName}>` : repoFullName

        // Format the subject link
        const subjectLink = subjectUrl
          ? `<${subjectUrl}|${subjectTitle}>`
          : subjectTitle

        // Format the date
        let formattedDate = updatedAt
        try {
          const date = new Date(updatedAt)
          if (!isNaN(date.getTime())) {
            formattedDate = date.toLocaleString('en-US', {
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

        // Get emoji based on subject type
        const typeEmoji = getTypeEmoji(subjectType)

        // Build the notification message
        return (
          `${index + 1}. ${typeEmoji} *${subjectLink}*\n` +
          `   📂 Repository: ${repoLink}\n` +
          `   📌 Type: ${subjectType}\n` +
          `   🔔 Reason: ${reason}\n` +
          `   🕒 Updated: ${formattedDate}`
        )
      } catch (error) {
        // If any error occurs processing this notification, return a safe fallback
        return `${index + 1}. ⚠️  Error processing notification`
      }
    })
    .join('\n\n')

  return header + formattedNotifications
}
