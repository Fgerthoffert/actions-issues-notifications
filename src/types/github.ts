export interface GitHubNotification {
  id: number
  unread: boolean
  updated_at: string
  last_read_at: string
  reason: string
  subject: {
    title: string
    url: string
    type: string
  }
  repository: GitHubRepository
  url: string
}

export interface GitHubRepository {
  name: string
  url: string
  full_name: string
}
