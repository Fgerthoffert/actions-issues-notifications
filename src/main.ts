import * as core from '@actions/core'

import { getConnectedUser } from './utils/github/getConnectedUser.js'
import { getNotifications } from './utils/github/getNotifications.js'
import { prepareMessage } from './utils/prepareMessage.js'

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const inputGithubToken = core.getInput('github_token')
    const inputReasons = core.getInput('reasons')

    // Simple API call to ensure the provided token is valid and display the associated username
    await getConnectedUser({ githubToken: inputGithubToken })

    // Retrieve the raw list of notifications from GitHub based on the provided reasons
    const notifications = await getNotifications({
      githubToken: inputGithubToken,
      reasons: inputReasons.split(',').map((reason) => reason.trim())
    })

    const preparedMessage = prepareMessage(notifications)

    core.setOutput('message', preparedMessage)
    // core.setOutput('notifications', JSON.stringify(notifications))
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
