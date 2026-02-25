/**
 * Unit tests for the formatNotificationRaw utility function
 */
import type { GitHubNotification } from '../src/types/github.js'

import { formatNotificationRaw } from '../src/utils/formatters/formatNotificationRaw.js'

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

describe('formatNotificationRaw', () => {
  describe('single notification', () => {
    it('formats without numbering for single notification', () => {
      const notifications = [createMockNotification()]
      const result = formatNotificationRaw(notifications)

      // Should NOT start with "1." for single notification
      expect(result).not.toMatch(/^1\./)
    })

    it('includes all required fields', () => {
      const notifications = [createMockNotification()]
      const result = formatNotificationRaw(notifications)

      expect(result).toContain('Test Issue') // Subject title
      expect(result).toContain('Issue') // Subject type
      expect(result).toContain('mention') // Reason
      expect(result).toContain('URL:') // URL label
      expect(result).toContain('Repository:') // Repository label
      expect(result).toContain('Date:') // Date label
    })

    it('does NOT include emojis', () => {
      const notifications = [createMockNotification()]
      const result = formatNotificationRaw(notifications)

      expect(result).not.toContain('🐛')
      expect(result).not.toContain('📂')
      expect(result).not.toContain('📌')
      expect(result).not.toContain('🔔')
      expect(result).not.toContain('🕒')
    })

    it('converts API URLs to browser URLs', () => {
      const notifications = [createMockNotification()]
      const result = formatNotificationRaw(notifications)

      expect(result).toContain('https://github.com/owner/repo')
      expect(result).not.toContain('api.github.com')
    })

    it('does NOT use Slack link format', () => {
      const notifications = [createMockNotification()]
      const result = formatNotificationRaw(notifications)

      // Should NOT contain Slack link format: <url|text>
      expect(result).not.toMatch(/<[^>]+\|[^>]+>/)
    })
  })

  describe('multiple notifications', () => {
    it('numbers each notification', () => {
      const notifications = [
        createMockNotification({ id: 1 }),
        createMockNotification({ id: 2 }),
        createMockNotification({ id: 3 })
      ]
      const result = formatNotificationRaw(notifications)

      expect(result).toContain('1.')
      expect(result).toContain('2.')
      expect(result).toContain('3.')
    })

    it('separates notifications with blank lines', () => {
      const notifications = [
        createMockNotification({ id: 1 }),
        createMockNotification({ id: 2 })
      ]
      const result = formatNotificationRaw(notifications)

      expect(result).toContain('\n\n')
    })
  })

  describe('different subject types', () => {
    it('includes PullRequest type', () => {
      const notifications = [
        createMockNotification({
          subject: { title: 'PR Title', url: '', type: 'PullRequest' }
        })
      ]
      const result = formatNotificationRaw(notifications)

      expect(result).toContain('PullRequest')
    })

    it('includes Release type', () => {
      const notifications = [
        createMockNotification({
          subject: { title: 'v1.0.0', url: '', type: 'Release' }
        })
      ]
      const result = formatNotificationRaw(notifications)

      expect(result).toContain('Release')
    })
  })

  describe('missing data handling', () => {
    it('handles missing subject title', () => {
      const notifications = [
        createMockNotification({
          subject: { title: '', url: '', type: 'Issue' }
        })
      ]
      const result = formatNotificationRaw(notifications)

      expect(result).toContain('No title')
    })

    it('handles missing reason', () => {
      const notifications = [createMockNotification({ reason: '' })]
      const result = formatNotificationRaw(notifications)

      expect(result).toContain('unknown')
    })

    it('handles missing updated_at', () => {
      const notifications = [createMockNotification({ updated_at: '' })]
      const result = formatNotificationRaw(notifications)

      expect(result).toContain('Date:')
    })
  })

  describe('edge cases', () => {
    it('handles null notification gracefully with fallback values', () => {
      // The formatter handles null gracefully using fallback values
      const notifications = [null as unknown as GitHubNotification]
      const result = formatNotificationRaw(notifications)

      // Should contain fallback values instead of crashing
      expect(result).toContain('No title')
      expect(result).toContain('unknown')
    })
  })
})
