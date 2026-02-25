/**
 * Unit tests for the convertApiUrlToBrowserUrl utility function
 */
import { convertApiUrlToBrowserUrl } from '../src/utils/github/convertApiUrlToBrowserUrl.js'

describe('convertApiUrlToBrowserUrl', () => {
  describe('repository URLs', () => {
    it('converts API repo URL to browser URL', () => {
      const apiUrl = 'https://api.github.com/repos/owner/repo'
      const result = convertApiUrlToBrowserUrl(apiUrl)

      expect(result).toBe('https://github.com/owner/repo')
    })

    it('converts API repo URL with org name', () => {
      const apiUrl = 'https://api.github.com/repos/my-org/my-repo'
      const result = convertApiUrlToBrowserUrl(apiUrl)

      expect(result).toBe('https://github.com/my-org/my-repo')
    })
  })

  describe('issue URLs', () => {
    it('converts API issue URL to browser URL', () => {
      const apiUrl = 'https://api.github.com/repos/owner/repo/issues/123'
      const result = convertApiUrlToBrowserUrl(apiUrl)

      expect(result).toBe('https://github.com/owner/repo/issues/123')
    })

    it('converts API issue URL with large number', () => {
      const apiUrl = 'https://api.github.com/repos/owner/repo/issues/99999'
      const result = convertApiUrlToBrowserUrl(apiUrl)

      expect(result).toBe('https://github.com/owner/repo/issues/99999')
    })
  })

  describe('pull request URLs', () => {
    it('converts API pulls URL to browser pull URL', () => {
      const apiUrl = 'https://api.github.com/repos/owner/repo/pulls/456'
      const result = convertApiUrlToBrowserUrl(apiUrl)

      expect(result).toBe('https://github.com/owner/repo/pull/456')
    })

    it('handles single digit PR number', () => {
      const apiUrl = 'https://api.github.com/repos/owner/repo/pulls/1'
      const result = convertApiUrlToBrowserUrl(apiUrl)

      expect(result).toBe('https://github.com/owner/repo/pull/1')
    })
  })

  describe('commit URLs', () => {
    it('converts API commits URL to browser commit URL', () => {
      const apiUrl =
        'https://api.github.com/repos/owner/repo/commits/abc123def456'
      const result = convertApiUrlToBrowserUrl(apiUrl)

      expect(result).toBe('https://github.com/owner/repo/commit/abc123def456')
    })

    it('converts full SHA commit URL', () => {
      const apiUrl =
        'https://api.github.com/repos/owner/repo/commits/abcdef1234567890abcdef1234567890abcdef12'
      const result = convertApiUrlToBrowserUrl(apiUrl)

      expect(result).toBe(
        'https://github.com/owner/repo/commit/abcdef1234567890abcdef1234567890abcdef12'
      )
    })
  })

  describe('release URLs', () => {
    it('converts API release URL to browser releases URL', () => {
      const apiUrl = 'https://api.github.com/repos/owner/repo/releases/789'
      const result = convertApiUrlToBrowserUrl(apiUrl)

      expect(result).toBe('https://github.com/owner/repo/releases')
    })

    it('removes release ID from URL', () => {
      const apiUrl = 'https://api.github.com/repos/owner/repo/releases/12345'
      const result = convertApiUrlToBrowserUrl(apiUrl)

      expect(result).toBe('https://github.com/owner/repo/releases')
    })
  })

  describe('edge cases', () => {
    it('returns empty string for empty input', () => {
      const result = convertApiUrlToBrowserUrl('')

      expect(result).toBe('')
    })

    it('returns original URL if not an API URL', () => {
      const browserUrl = 'https://github.com/owner/repo'
      const result = convertApiUrlToBrowserUrl(browserUrl)

      expect(result).toBe('https://github.com/owner/repo')
    })

    it('handles URL with http instead of https', () => {
      const apiUrl = 'http://api.github.com/repos/owner/repo'
      const result = convertApiUrlToBrowserUrl(apiUrl)

      expect(result).toBe('https://github.com/owner/repo')
    })
  })
})
