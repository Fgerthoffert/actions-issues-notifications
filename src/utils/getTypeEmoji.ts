/**
 * Returns an emoji based on the notification subject type.
 *
 * @param type - The subject type (e.g., 'Issue', 'PullRequest', 'Release')
 * @returns An emoji representing the type
 */
export const getTypeEmoji = (type: string): string => {
  const emojiMap: Record<string, string> = {
    Issue: '🐛',
    PullRequest: '🔀',
    Release: '🚀',
    Commit: '💾',
    Discussion: '💬',
    CheckSuite: '✅',
    RepositoryVulnerabilityAlert: '🔒'
  }

  return emojiMap[type] || '📄'
}
