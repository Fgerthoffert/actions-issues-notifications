/**
 * Unit tests for the prepareMessage utility function
 */
import type { GitHubNotification } from '../src/types/github.js'

import { prepareMessage } from '../src/utils/prepareMessage.js'

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

describe('prepareMessage', () => {
  describe('empty notifications', () => {
    it('returns "No notifications found." for empty array', () => {
      const result = prepareMessage([])

      expect(result).toBe('No notifications found.')
    })

    it('returns "No notifications found." for null/undefined', () => {
      const result = prepareMessage(null as unknown as GitHubNotification[])

      expect(result).toBe('No notifications found.')
    })
  })

  describe('slack style (default)', () => {
    it('formats single notification in slack style by default', () => {
      const notifications = [createMockNotification()]
      const result = prepareMessage(notifications)

      // Should contain Slack formatting elements
      expect(result).toContain('🐛') // Issue emoji
      expect(result).toContain('*') // Bold markers
      expect(result).toContain('Test Issue')
      expect(result).toContain('owner/repo')
    })

    it('formats multiple notifications with header', () => {
      const notifications = [
        createMockNotification({ id: 1 }),
        createMockNotification({
          id: 2,
          subject: { title: 'Second Issue', url: '', type: 'PullRequest' }
        })
      ]
      const result = prepareMessage(notifications, 'slack')

      expect(result).toContain('📬 *GitHub Notifications* (2)')
      expect(result).toContain('1.')
      expect(result).toContain('2.')
    })

    it('explicitly uses slack style when specified', () => {
      const notifications = [createMockNotification()]
      const result = prepareMessage(notifications, 'slack')

      expect(result).toContain('📂') // Repository emoji
      expect(result).toContain('📌') // Type emoji
      expect(result).toContain('🔔') // Reason emoji
      expect(result).toContain('🕒') // Time emoji
    })
  })

  describe('raw style', () => {
    it('formats notification in raw style', () => {
      const notifications = [createMockNotification()]
      const result = prepareMessage(notifications, 'raw')

      // Should NOT contain Slack formatting
      expect(result).not.toContain('📬')
      expect(result).not.toContain('*GitHub Notifications*')

      // Should contain plain text elements
      expect(result).toContain('Test Issue')
      expect(result).toContain('Issue')
      expect(result).toContain('mention')
    })

    it('formats multiple notifications in raw style', () => {
      const notifications = [
        createMockNotification({ id: 1 }),
        createMockNotification({ id: 2 })
      ]
      const result = prepareMessage(notifications, 'raw')

      expect(result).toContain('1.')
      expect(result).toContain('2.')
    })
  })

  describe('different notification types', () => {
    it('handles PullRequest type', () => {
      const notifications = [
        createMockNotification({
          subject: {
            title: 'PR Title',
            url: 'https://api.github.com/repos/owner/repo/pulls/1',
            type: 'PullRequest'
          }
        })
      ]
      const result = prepareMessage(notifications, 'slack')

      expect(result).toContain('🔀') // PR emoji
      expect(result).toContain('PullRequest')
    })

    it('handles Release type', () => {
      const notifications = [
        createMockNotification({
          subject: {
            title: 'v1.0.0',
            url: 'https://api.github.com/repos/owner/repo/releases/1',
            type: 'Release'
          }
        })
      ]
      const result = prepareMessage(notifications, 'slack')

      expect(result).toContain('🚀') // Release emoji
    })
  })

  describe('different reasons', () => {
    it('includes assign reason', () => {
      const notifications = [createMockNotification({ reason: 'assign' })]
      const result = prepareMessage(notifications, 'slack')

      expect(result).toContain('assign')
    })

    it('includes review_requested reason', () => {
      const notifications = [
        createMockNotification({ reason: 'review_requested' })
      ]
      const result = prepareMessage(notifications, 'slack')

      expect(result).toContain('review_requested')
    })
  })
})
