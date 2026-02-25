/**
 * Unit tests for the getTypeEmoji utility function
 */
import { getTypeEmoji } from '../src/utils/getTypeEmoji.js'

describe('getTypeEmoji', () => {
  it('returns bug emoji for Issue type', () => {
    expect(getTypeEmoji('Issue')).toBe('🐛')
  })

  it('returns merge emoji for PullRequest type', () => {
    expect(getTypeEmoji('PullRequest')).toBe('🔀')
  })

  it('returns rocket emoji for Release type', () => {
    expect(getTypeEmoji('Release')).toBe('🚀')
  })

  it('returns disk emoji for Commit type', () => {
    expect(getTypeEmoji('Commit')).toBe('💾')
  })

  it('returns speech balloon emoji for Discussion type', () => {
    expect(getTypeEmoji('Discussion')).toBe('💬')
  })

  it('returns checkmark emoji for CheckSuite type', () => {
    expect(getTypeEmoji('CheckSuite')).toBe('✅')
  })

  it('returns lock emoji for RepositoryVulnerabilityAlert type', () => {
    expect(getTypeEmoji('RepositoryVulnerabilityAlert')).toBe('🔒')
  })

  it('returns default document emoji for unknown type', () => {
    expect(getTypeEmoji('UnknownType')).toBe('📄')
  })

  it('returns default document emoji for empty string', () => {
    expect(getTypeEmoji('')).toBe('📄')
  })
})
