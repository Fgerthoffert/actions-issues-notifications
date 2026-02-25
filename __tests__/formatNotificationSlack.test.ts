/**
 * Unit tests for the formatNotificationSlack utility function
 */
import type { GitHubNotification } from '../src/types/github.js'

import { formatNotificationSlack } from '../src/utils/formatters/formatNotificationSlack.js'

// Helper to create a mock notification
const createMockNotification = (
  overrides: Partial<GitHubNotification> = {}
): GitHubNotification => ({
  id: 1,
  unread: true,
  updated_at: '2026-02-25T10:30:00Z',
  last_read_at: '2026-02-24T10:30:00Z',
  reason: 'mention',
  subject: {
    title: 'Test Issue',
    url: 'https://api.github.com/repos/owner/repo/issues/1',
    type: 'Issue'
  },
  repository: {
    name: 'repo',
    url: 'https://api.github.com/repos/owner/repo',
    full_name: 'owner/repo'
  },
  url: 'https://api.github.com/notifications/threads/1',
  ...overrides
})

describe('formatNotificationSlack', () => {
  describe('single notification', () => {
    it('formats without header for single notification', () => {
      const notifications = [createMockNotification()]
      const result = formatNotificationSlack(notifications)

      // Should NOT have the header with count
      expect(result).not.toContain('📬 *GitHub Notifications*')
    })

    it('includes all required fields', () => {
      const notifications = [createMockNotification()]
      const result = formatNotificationSlack(notifications)

      expect(result).toContain('🐛') // Type emoji
      expect(result).toContain('Test Issue') // Subject title
      expect(result).toContain('📂 Repository:') // Repository label
      expect(result).toContain('owner/repo') // Repository name
      expect(result).toContain('📌 Type:') // Type label
      expect(result).toContain('Issue') // Subject type
      expect(result).toContain('🔔 Reason:') // Reason label
      expect(result).toContain('mention') // Reason
      expect(result).toContain('🕒 Updated:') // Date label
    })

    it('converts API URLs to browser URLs', () => {
      const notifications = [createMockNotification()]
      const result = formatNotificationSlack(notifications)

      // Should contain browser URL format, not API URL
      expect(result).toContain('https://github.com/owner/repo')
      expect(result).not.toContain('api.github.com')
    })

    it('formats links in Slack style', () => {
      const notifications = [createMockNotification()]
      const result = formatNotificationSlack(notifications)

      // Slack link format: <url|text>
      expect(result).toMatch(/<https:\/\/github\.com\/[^|]+\|[^>]+>/)
    })
  })

  describe('multiple notifications', () => {
    it('includes header with count for multiple notifications', () => {
      const notifications = [
        createMockNotification({ id: 1 }),
        createMockNotification({ id: 2 })
      ]
      const result = formatNotificationSlack(notifications)

      expect(result).toContain('📬 *GitHub Notifications* (2)')
    })

    it('numbers each notification', () => {
      const notifications = [
        createMockNotification({ id: 1 }),
        createMockNotification({ id: 2 }),
        createMockNotification({ id: 3 })
      ]
      const result = formatNotificationSlack(notifications)

      expect(result).toContain('1.')
      expect(result).toContain('2.')
      expect(result).toContain('3.')
    })

    it('separates notifications with blank lines', () => {
      const notifications = [
        createMockNotification({ id: 1 }),
        createMockNotification({ id: 2 })
      ]
      const result = formatNotificationSlack(notifications)

      // Should have double newline between notifications
      expect(result).toContain('\n\n')
    })
  })

  describe('different subject types', () => {
    it('uses correct emoji for PullRequest', () => {
      const notifications = [
        createMockNotification({
          subject: { title: 'PR', url: '', type: 'PullRequest' }
        })
      ]
      const result = formatNotificationSlack(notifications)

      expect(result).toContain('🔀')
    })

    it('uses correct emoji for Release', () => {
      const notifications = [
        createMockNotification({
          subject: { title: 'Release', url: '', type: 'Release' }
        })
      ]
      const result = formatNotificationSlack(notifications)

      expect(result).toContain('🚀')
    })

    it('uses default emoji for unknown type', () => {
      const notifications = [
        createMockNotification({
          subject: { title: 'Unknown', url: '', type: 'SomethingNew' }
        })
      ]
      const result = formatNotificationSlack(notifications)

      expect(result).toContain('📄')
    })
  })

  describe('missing data handling', () => {
    it('handles missing subject title', () => {
      const notifications = [
        createMockNotification({
          subject: { title: '', url: '', type: 'Issue' }
        })
      ]
      const result = formatNotificationSlack(notifications)

      expect(result).toContain('No title')
    })

    it('handles missing repository full_name', () => {
      const notifications = [
        createMockNotification({
          repository: { name: 'repo', url: '', full_name: '' }
        })
      ]
      const result = formatNotificationSlack(notifications)

      expect(result).toContain('Unknown Repository')
    })

    it('handles missing reason', () => {
      const notifications = [createMockNotification({ reason: '' })]
      const result = formatNotificationSlack(notifications)

      expect(result).toContain('unknown')
    })
  })

  describe('edge cases', () => {
    it('handles null notification gracefully with fallback values', () => {
      // The formatter handles null gracefully using fallback values
      const notifications = [null as unknown as GitHubNotification]
      const result = formatNotificationSlack(notifications)

      // Should contain fallback values instead of crashing
      expect(result).toContain('No title')
      expect(result).toContain('Unknown Repository')
      expect(result).toContain('Unknown')
    })
  })
})
