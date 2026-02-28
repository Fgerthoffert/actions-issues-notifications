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
    const inputTypes = core.getInput('types')
    const inputMessageStyle = core.getInput('message_style') as MessageStyle
    const inputMaxNotifications = parseInt(
      core.getInput('max_notifications') || '0',
      10
    )
    const inputNotificationAction = core.getInput(
      'notification_action'
    ) as NotificationAction
    const inputMaxNotificationsAction = parseInt(
      core.getInput('max_notifications_action') || '0',
      10
    )
    const inputApplyActionToExcluded =
      core.getInput('apply_action_to_excluded') === 'true'

    // Simple API call to ensure the provided token is valid and display the associated username
    await getConnectedUser({ githubToken: inputGithubToken })

    // Retrieve the raw list of notifications from GitHub
    let notifications = await getNotifications({
      githubToken: inputGithubToken
    })

    let filteredNotifications = []
    if (inputReasons !== 'all') {
      filteredNotifications = notifications.filter((notification) =>
        inputReasons
          .split(',')
          .map((reason) => reason.trim())
          .includes(notification.reason)
      )
    } else {
      filteredNotifications = notifications
    }

    if (inputTypes !== 'all') {
      filteredNotifications = filteredNotifications.filter((notification) =>
        inputTypes
          .split(',')
          .map((type) => type.trim())
          .includes(notification.subject.type)
      )
    }

    core.info(
      `Fetched a total of ${filteredNotifications.length} notifications from GitHub after filtering by reasons: ${inputReasons
        .split(',')
        .map((reason) => reason.trim())
        .join(', ')} and types: ${inputTypes
        .split(',')
        .map((type) => type.trim())
        .join(', ')}`
    )

    let notificationsActionsCount = 0

    // To avoid the notifications from cluttering the user's inbox, we can optionally
    //  apply the configured action (mark as read or done) to the excluded notifications as well.
    if (inputApplyActionToExcluded) {
      // Get the list of all notifications that are not included in the filtered list
      const excludedNotifications = notifications.filter(
        (notification) =>
          !filteredNotifications.some((n) => n.id === notification.id)
      )
      core.info(
        `Setting ${excludedNotifications.length} excluded notification(s) (not covered by filters) as done or read as per configuration...`
      )

      for (const notification of excludedNotifications) {
        if (
          inputMaxNotificationsAction > 0 &&
          notificationsActionsCount >= inputMaxNotificationsAction
        ) {
          core.info(
            `Reached the maximum number of notifications to apply the action to (${inputMaxNotificationsAction}), skipping remaining excluded notifications.`
          )
          break
        }
        if (inputNotificationAction === 'read') {
          await markNotificationThreadAsRead({
            githubToken: inputGithubToken,
            notification
          })
          notificationsActionsCount++
        } else if (inputNotificationAction === 'done') {
          await markNotificationThreadAsDone({
            githubToken: inputGithubToken,
            notification
          })
          notificationsActionsCount++
        }
      }
    }

    if (filteredNotifications.length === 0) {
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
    core.info('Marking processed notifications as read...')

    // Reset the notifications actions count before processing the filtered notifications
    notificationsActionsCount = 0

    for (const notification of notifications) {
      if (
        inputMaxNotificationsAction > 0 &&
        notificationsActionsCount >= inputMaxNotificationsAction
      ) {
        core.info(
          `Reached the maximum number of notifications to apply the action to (${inputMaxNotificationsAction}), skipping remaining excluded notifications.`
        )
        break
      }
      if (inputNotificationAction === 'read') {
        await markNotificationThreadAsRead({
          githubToken: inputGithubToken,
          notification
        })
        notificationsActionsCount++
      } else if (inputNotificationAction === 'done') {
        await markNotificationThreadAsDone({
          githubToken: inputGithubToken,
          notification
        })
        notificationsActionsCount++
      }
    }
  } catch (error) {
    // Fail the workflow run if an error occurs
    if (error instanceof Error) core.setFailed(error.message)
  }
}
