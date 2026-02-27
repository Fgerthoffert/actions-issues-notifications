import type { GitHubNotification, MessageStyle } from '../../types/index.js'

import { convertApiUrlToBrowserUrl } from '../github/convertApiUrlToBrowserUrl.js'
import { getReasonPhrase } from '../getReasonPhrase.js'
import { formatDate } from './formatDate.js'

/**
 * Formats a single notification into a compact single-line Slack message.
 *
 * @param notification - The GitHub notification to format
 * @param style - The message style to use (defaults to 'slack')
 * @returns A formatted single-line string for Slack
 */
export const formatSingleNotification = (
  notification: GitHubNotification,
  style: MessageStyle = 'slack'
): string => {
  const reason = notification?.reason || 'unknown'
  const reasonPhrase = getReasonPhrase(reason)
  const subjectType = notification?.subject?.type || 'Unknown'
  const subjectTitle = notification?.subject?.title || 'No title'
  const subjectUrl = convertApiUrlToBrowserUrl(
    notification?.subject?.url || notification?.url || ''
  )
  const updatedAt = notification?.updated_at || 'N/A'

  if (style === 'slack') {
    const repoFullName =
      notification?.repository?.full_name || 'Unknown Repository'

    const subjectLink = subjectUrl
      ? `<${subjectUrl}|${subjectTitle}>`
      : subjectTitle

    return `${reasonPhrase} ${subjectType} *${subjectLink}* (${repoFullName}) on ${formatDate(updatedAt)}`
  } else {
    return `${reasonPhrase} ${subjectType}: "${subjectTitle}" on ${formatDate(updatedAt)} (URL: ${subjectUrl})`
  }
}
