import * as core from '@actions/core'

import type { MessageStyle, NotificationAction } from './types/index.js'

import { getConnectedUser } from './utils/github/getConnectedUser.js'
import { getNotifications } from './utils/github/getNotifications.js'
import { markNotificationThreadAsDone } from './utils/github/markNotificationThreadAsDone.js'
import { markNotificationThreadAsRead } from './utils/github/markNotificationThreadAsRead.js'
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
    const inputMessageStyle = core.getInput('message_style') as MessageStyle
    const inputMaxNotifications = parseInt(
      core.getInput('max_notifications') || '0',
      10
    )
    const inputNotificationAction = core.getInput(
      'notification_action'
    ) as NotificationAction

    // Simple API call to ensure the provided token is valid and display the associated username
    await getConnectedUser({ githubToken: inputGithubToken })

    // Retrieve the raw list of notifications from GitHub based on the provided reasons
    let notifications = await getNotifications({
      githubToken: inputGithubToken,
      reasons: inputReasons.split(',').map((reason) => reason.trim())
    })

    if (notifications.length === 0) {
      core.info('No notifications found, exiting the action')
      return
    }

    // Limit the number of notifications if max_notifications is set
    // This is useful in setup where users might not want to receive more than X notifications at once.
    if (
      inputMaxNotifications > 0 &&
      notifications.length > inputMaxNotifications
    ) {
      core.info(
        `Limiting notifications from ${notifications.length} to ${inputMaxNotifications}`
      )
      notifications = notifications.slice(0, inputMaxNotifications)
    }

    const preparedMessage = prepareMessage(notifications, inputMessageStyle)

    core.setOutput('message', preparedMessage)

    // Process notification actions (mark as read or done) if configured
    if (inputNotificationAction === 'read') {
      core.info('Marking processed notifications as read...')
      for (const notification of notifications) {
        await markNotificationThreadAsRead({
          githubToken: inputGithubToken,
          notification
        })
      }
    } else if (inputNotificationAction === 'done') {
      core.info('Marking processed notifications as done...')
      for (const notification of notifications) {
        await markNotificationThreadAsDone({
          githubToken: inputGithubToken,
          notification
        })
      }
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
