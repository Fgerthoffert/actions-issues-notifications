/**
 * Converts a GitHub notification reason to a human-readable phrase.
 * The phrase explains WHY you're receiving the notification (your past relationship
 * with the item), not what action just happened.
 *
 * @see https://docs.github.com/en/rest/activity/notifications#about-notification-reasons
 * @param reason - The notification reason from GitHub API
 * @returns A human-readable phrase describing why you're notified
 */
export const getReasonPhrase = (reason: string): string => {
  const reasonPhrases: Record<string, string> = {
    approval_requested: 'Approval requested on',
    assign: 'Assigned to',
    author: 'Activity on your',
    ci_activity: 'CI completed for',
    comment: 'Activity on commented',
    invitation: 'Invitation to',
    manual: 'Activity on subscribed',
    member_feature_requested: 'Feature request in',
    mention: 'Mentioned in',
    review_requested: 'Review requested on',
    security_advisory_credit: 'Credit for advisory on',
    security_alert: 'Security alert on',
    state_change: 'Activity after state change on',
    subscribed: 'Activity on watched',
    team_mention: 'Activity after team mention in'
  }

  return reasonPhrases[reason] || 'Notification for'
}
