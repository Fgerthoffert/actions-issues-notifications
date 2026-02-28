import * as core from '@actions/core'
import { Octokit } from '@octokit/core'
import { paginateRest } from '@octokit/plugin-paginate-rest'
import { restEndpointMethods } from '@octokit/plugin-rest-endpoint-methods'

import type { GitHubNotification } from '../../types/github.js'

export const getNotifications = async ({
  githubToken
}: {
  githubToken: string
}): Promise<GitHubNotification[]> => {
  const MyOctokit = Octokit.plugin(paginateRest, restEndpointMethods)
  const octokit = new MyOctokit({ auth: githubToken })

  const notifications = await octokit.paginate(
    octokit.rest.activity.listNotificationsForAuthenticatedUser,
    {
      per_page: 50,
      headers: {
        'X-GitHub-Api-Version': '2022-11-28'
      }
    }
  )

  core.info(
    `Fetched a total of ${notifications.length} notifications from GitHub`
  )

  core.info(JSON.stringify(notifications, null, 2))

  return notifications as unknown as GitHubNotification[]
}
