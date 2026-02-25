/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * Note: These tests validate core error handling behavior.
 * The main function's full workflow requires GitHub API mocking
 * which is complex with ESM modules.
 */
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'

jest.unstable_mockModule('@actions/core', () => core)

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

describe('main.ts', () => {
  beforeEach(() => {
    // Set up default input mocks
    core.getInput.mockImplementation((name: string) => {
      const inputs: Record<string, string> = {
        github_token: 'test-token',
        reasons: 'mention,assign',
        message_style: 'slack',
        max_notifications: '50',
        notification_action: 'none'
      }
      return inputs[name] || ''
    })
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it('handles GitHub API errors gracefully', async () => {
    await run()

    // The action should fail with a meaningful error message when API call fails
    // (Since we're using a fake token, GitHub API returns an auth error)
    expect(core.setFailed).toHaveBeenCalled()
    const errorArg = core.setFailed.mock.calls[0]?.[0]
    expect(typeof errorArg).toBe('string')
    expect(errorArg).toContain('credentials')
  })

  it('reads inputs from action configuration', async () => {
    await run()

    // Should have read the required inputs
    expect(core.getInput).toHaveBeenCalledWith('github_token')
    expect(core.getInput).toHaveBeenCalledWith('reasons')
    expect(core.getInput).toHaveBeenCalledWith('message_style')
    expect(core.getInput).toHaveBeenCalledWith('max_notifications')
    expect(core.getInput).toHaveBeenCalledWith('notification_action')
  })
})
