import * as core from '@actions/core'
import * as github from '@actions/github'

import type { GitHubNotification } from '../../types/github.js'

export const getNotifications = async ({
  githubToken,
  reasons
}: {
  githubToken: string
  reasons: string[]
}): Promise<GitHubNotification[]> => {
  const octokit = github.getOctokit(githubToken)

  const notifications = await octokit.request(
    'GET /notifications?participating=true',
    {
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )

  core.info(
    `Fetched a total of ${notifications.data.length} notifications from GitHub`
  )

  // Filter notifications based on the specified reasons
  const filteredNotifications = notifications.data.filter(
    (notification: GitHubNotification) => reasons.includes(notification.reason)
  )

  core.info(
    `Fetched a total of ${filteredNotifications.length} notifications from GitHub after filtering by reasons: ${reasons.join(', ')}`
  )

  return filteredNotifications
}
