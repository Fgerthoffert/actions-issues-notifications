import * as core from '@actions/core'
import * as github from '@actions/github'

import type { GitHubNotification } from '../../types/github.js'

export const getNotifications = async ({
  githubToken
}: {
  githubToken: string
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

  return notifications.data
}
