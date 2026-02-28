import * as core from '@actions/core'
import * as github from '@actions/github'

import type { GitHubNotification } from '../../types/github.js'

export const markNotificationThreadAsDone = async ({
  githubToken,
  notification
}: {
  githubToken: string
  notification: GitHubNotification
}): Promise<void> => {
  const octokit = github.getOctokit(githubToken)

  await octokit.request('DELETE /notifications/threads/{thread_id}', {
    thread_id: notification.id,
    headers: {
      'X-GitHub-Api-Version': '2022-11-28'
    }
  })

  core.info(
    `Marked notification thread "${notification.subject?.title || 'No title'}" (ID: ${notification.id}, reason: ${notification.reason}, type: ${notification.subject?.type || 'Unknown'}) as done on GitHub`
  )

  return
}
