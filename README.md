<!-- markdownlint-disable MD041 MD033 -->
<p align="center">
  <img alt="ZenCrepesLogo" src="docs/zencrepes-logo.png" height="140" />
  <h2 align="center">GitHub Issues Notifications Action</h2>
    <p align="center">A GitHub Action to collect GitHub notifications and
    prepare a message that can be then forwarded to messaging
    platforms like Slack. Aims at covering for the fact that Scheduled
    Reminders only work for Pull Requests, not Issues.</p>
</p>

---

<div align="center">

![Linter](https://github.com/fgerthoffert/actions-issues-notifications//actions/workflows/linter.yml/badge.svg)
![CI](https://github.com/fgerthoffert/actions-issues-notifications//actions/workflows/ci.yml/badge.svg)
![Check dist/](https://github.com/fgerthoffert/actions-issues-notifications//actions/workflows/check-dist.yml/badge.svg)
![CodeQL](https://github.com/fgerthoffert/actions-issues-notifications//actions/workflows/codeql-analysis.yml/badge.svg)
![Coverage](./badges/coverage.svg)

</div>

---

This action was created specifically to receive notifications about events in
**Issues**, providing an alternative to
[GitHub Scheduled Reminders](https://docs.github.com/en/account-and-profile/setting-up-and-managing-your-personal-account-on-github/managing-your-membership-in-organizations/managing-your-scheduled-reminders)
which sadly only works for Pull Requests, not Issues.

Its role is to act as a bridge between GitHub's Notifications API and messaging
platforms like Slack, allowing you to stay informed about important updates
without having to constantly check your GitHub notifications dashboard.

## Why This Action?

GitHub's built-in Scheduled Reminders are great, but they only support Pull
Requests. If you rely heavily on Issues for project management and want to
receive timely notifications in Slack (or other messaging platforms), this
action fills that gap.

## ⚠️ Start with a Clean Inbox

This action uses pagination to fetch all your notifications, which could be a
large number if you have a backlog. **Before using this action**, we strongly
recommend clearing your notifications by marking them all as done in your
[GitHub Notifications dashboard](https://github.com/notifications).

As a safeguard, the `max_notifications_action` parameter defaults to `50`,
limiting how many notifications can be marked as read/done per action run.

## Resource Considerations

Please be mindful of resource usage when configuring this action. GitHub Actions
minutes are a shared resource, and running workflows too frequently is wasteful.
Consider:

- **Limit runs to working hours**: There's no need to receive notifications
  overnight or on weekends
- **Choose an appropriate frequency**: Hourly digests are often sufficient;
  real-time notifications every 10 minutes should be reserved for critical needs
- **Use `ubuntu-slim`**: This smaller runner image is faster to start and uses
  fewer resources

The example workflows below are configured to run only during extended working
hours (7 AM - 8 PM UTC) to balance responsiveness with resource efficiency.

## Use Cases

### 1. Batch Notifications (Hourly Digest)

Receive a summary of all your notifications at regular intervals (e.g., once per
hour). This is ideal for staying informed without constant interruptions.

```yaml
on:
  schedule:
    # Every hour during extended working hours (7 AM - 8 PM UTC, Mon-Fri)
    - cron: '0 7-20 * * 1-5'
```

### 2. Pseudo Real-Time Notifications (One at a Time)

Run the workflow more frequently (e.g., every 10 minutes) but process only one
notification at a time. This prevents being overwhelmed while still receiving
timely updates.

```yaml
on:
  schedule:
    # Every 10 minutes during extended working hours (7 AM - 8 PM UTC, Mon-Fri)
    - cron: '*/10 7-20 * * 1-5'

# ... with input:
max_notifications: '1'
notification_action: 'done' # Mark as done after processing
```

## Inputs

| Input                      | Description                                                                                                        | Required | Default          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------ | -------- | ---------------- |
| `github_token`             | GitHub token with notifications read access                                                                        | Yes      | -                |
| `reasons`                  | Comma-separated list of notification reasons to filter (e.g., `mention,assign`)                                    | No       | `mention,assign` |
| `types`                    | Comma-separated list of notification subject types to filter (e.g., `Issue,PullRequest`)                           | No       | `Issue`          |
| `message_style`            | Output format: `slack` for Slack-compatible formatting with emojis and links, or `raw` for plain text              | No       | `slack`          |
| `max_notifications`        | Maximum number of notifications to include. Set to `0` for unlimited                                               | No       | `0`              |
| `notification_action`      | Action to perform on processed notifications: `none` (do nothing), `read` (mark as read), or `done` (mark done)    | No       | `none`           |
| `max_notifications_action` | Maximum number of notifications to apply `notification_action` to per run. Prevents mass updates on large backlogs | No       | `50`             |
| `apply_action_to_excluded` | If `true`, also apply `notification_action` to notifications excluded by the reasons filter                        | No       | `false`          |

**Note**: Notification actions (`read` or `done`) are applied individually to
each notification thread, not in batch.

**Why `apply_action_to_excluded`?** When filtering notifications by specific
reasons (e.g., only `mention` and `assign`), other notifications like
`subscribed` or `state_change` will accumulate in your inbox over time. By
enabling this option, those excluded notifications are automatically marked as
read or done (as per `notification_action`), keeping your GitHub notifications
dashboard clean without manual intervention.

## Outputs

| Output    | Description                                 |
| --------- | ------------------------------------------- |
| `message` | Formatted message listing all notifications |

## Notification Reasons

GitHub notifications can be triggered for various reasons. You can filter which
ones to include using the `reasons` input. Common reasons include:

- `mention` - You were mentioned in the content
- `assign` - You were assigned to the issue
- `author` - You created the thread
- `comment` - You commented on the thread
- `review_requested` - You were requested to review a pull request
- `team_mention` - A team you're a member of was mentioned
- `state_change` - The thread state changed (e.g., issue closed)
- `subscribed` - You're watching the repository

For the complete list, see
[GitHub's Notifications API documentation](https://docs.github.com/en/rest/activity/notifications?apiVersion=2022-11-28#about-notification-reasons).

## Setup Guide

### Step 1: Create a GitHub Personal Access Token

1. Go to
   [GitHub Settings → Developer settings → Personal access tokens → Fine-grained tokens](https://github.com/settings/tokens?type=beta)
1. Click **Generate new token**
1. Give it a descriptive name (e.g., "Notifications Action")
1. Set the expiration as needed
1. Under **Repository access**, select the repositories you want notifications
   for
1. Under **Permissions**, grant:
   - **Notifications**: Read and Write
   - **Metadata**: Read-only (automatically selected)
1. Click **Generate token** and copy it

### Step 2: Create a Slack Bot Token

1. Go to [Slack API Apps](https://api.slack.com/apps) and click **Create New
   App**
1. Choose **From scratch**, name your app, and select your workspace
1. Go to **OAuth & Permissions** in the sidebar
1. Under **Scopes → Bot Token Scopes**, add:
   - `chat:write` - To send messages
   - `chat:write.public` - To send to public channels without joining
1. Click **Install to Workspace** and authorize
1. Copy the **Bot User OAuth Token** (starts with `xoxb-`)

For more details, see
[Slack's Getting Started Guide](https://api.slack.com/start/quickstart).

### Step 3: Add Secrets to Your Repository

1. Go to your repository → **Settings** → **Secrets and variables** →
   **Actions**
1. Add the following secrets:
   - `NOTIFICATIONS_GITHUB_TOKEN` - Your GitHub Personal Access Token
   - `SLACK_BOT_TOKEN` - Your Slack Bot OAuth Token

### Step 4: Create the Workflow

Create `.github/workflows/notifications.yml` in your repository:

```yaml
name: GitHub Notifications to Slack

on:
  schedule:
    # Every hour during extended working hours (7 AM - 8 PM UTC, Mon-Fri)
    - cron: '0 7-20 * * 1-5'
  # Allow manual triggering for testing
  workflow_dispatch:
    inputs:
      slack_channel:
        description: 'Slack channel or user ID (e.g., #general or U01234567)'
        required: true
        type: string

jobs:
  notifications:
    runs-on: ubuntu-slim

    steps:
      - name: Get GitHub Notifications
        uses: fgerthoffert/actions-issues-notifications@v1
        id: notifications
        with:
          github_token: ${{ secrets.NOTIFICATIONS_GITHUB_TOKEN }}
          reasons: 'mention,assign'
          message_style: 'slack'
          max_notifications: '1'
          notification_action: 'done'

      - name: Send to Slack
        if: steps.notifications.outputs.message != ''
        uses: slackapi/slack-github-action@v2.1.0
        with:
          method: chat.postMessage
          token: ${{ secrets.SLACK_BOT_TOKEN }}
          payload: |
            {
              "channel": "${{ inputs.slack_channel || 'CHANNEL_ID' }}",
              "text": ${{ toJSON(steps.notifications.outputs.message) }}
            }
```

> **Important**: Replace `CHANNEL_ID` with your actual Slack channel ID (e.g.,
> `C01234567`) or user ID for direct messages (e.g., `U01234567`).

## Example Workflows

### Hourly Digest to a Channel

```yaml
name: Hourly Notifications Digest

on:
  schedule:
    # Every hour during extended working hours (7 AM - 8 PM UTC, Mon-Fri)
    - cron: '0 7-20 * * 1-5'

jobs:
  notify:
    runs-on: ubuntu-slim
    steps:
      - uses: fgerthoffert/actions-issues-notifications@v1
        id: notifications
        with:
          github_token: ${{ secrets.NOTIFICATIONS_GITHUB_TOKEN }}
          reasons: 'mention,assign,review_requested'
          notification_action: 'read'

      - uses: slackapi/slack-github-action@v2.1.0
        if: steps.notifications.outputs.message != ''
        with:
          method: chat.postMessage
          token: ${{ secrets.SLACK_BOT_TOKEN }}
          payload: |
            {
              "channel": "C0123456789",
              "text": ${{ toJSON(steps.notifications.outputs.message) }}
            }
```

### Real-Time One-by-One Notifications

```yaml
name: Real-Time Notifications

on:
  schedule:
    # Every 10 minutes during extended working hours (7 AM - 8 PM UTC, Mon-Fri)
    - cron: '*/10 7-20 * * 1-5'

jobs:
  notify:
    runs-on: ubuntu-slim
    steps:
      - uses: fgerthoffert/actions-issues-notifications@v1
        id: notifications
        with:
          github_token: ${{ secrets.NOTIFICATIONS_GITHUB_TOKEN }}
          reasons: 'mention,assign'
          max_notifications: '1'
          notification_action: 'done'

      - uses: slackapi/slack-github-action@v2.1.0
        if: steps.notifications.outputs.message != ''
        with:
          method: chat.postMessage
          token: ${{ secrets.SLACK_BOT_TOKEN }}
          payload: |
            {
              "channel": "U0123456789",
              "text": ${{ toJSON(steps.notifications.outputs.message) }}
            }
```

## Message Format

### Slack Format (`message_style: 'slack'`)

```text
📬 *GitHub Notifications* (2)

1. 🐛 *<https://github.com/org/repo/issues/123|Fix login bug>*
    📂 Repository: <https://github.com/org/repo|org/repo>
    📌 Type: Issue
    🔔 Reason: mention
    🕒 Updated: Feb 25, 2026, 10:30 AM

2. 🔀 *<https://github.com/org/repo/pull/456|Add new feature>*
    📂 Repository: <https://github.com/org/repo|org/repo>
    📌 Type: PullRequest
    🔔 Reason: assign
    🕒 Updated: Feb 25, 2026, 09:15 AM
```

### Raw Format (`message_style: 'raw'`)

```text
GitHub Notifications (2)
========================================

1. Fix login bug
   Repository: org/repo
   Repo URL: https://github.com/org/repo
   Type: Issue
   Reason: mention
   Updated: Feb 25, 2026, 10:30 AM
   URL: https://github.com/org/repo/issues/123
```

## Finding Your Slack Channel/User ID

- **Channel ID**: Open Slack, right-click the channel → **View channel details**
  → scroll to the bottom to find the Channel ID (starts with `C`)
- **User ID**: Click on a user's profile → **More** → **Copy member ID** (starts
  with `U`)

## Troubleshooting

### No notifications are being sent

- Verify your GitHub token has the `notifications` scope
- Check that you have unread notifications matching the specified `reasons`
- Ensure the workflow is running (check the Actions tab)

### Message appears on a single line in Slack

Make sure to use `toJSON()` when passing the message to Slack:

```yaml
'text': ${{ toJSON(steps.notifications.outputs.message) }}
```

### Token errors

- GitHub token: Ensure it hasn't expired and has the correct permissions
- Slack token: Verify it's a Bot User OAuth Token (starts with `xoxb-`)

## Resources

- [GitHub Notifications API](https://docs.github.com/en/rest/activity/notifications)
- [Slack API Documentation](https://api.slack.com/methods/chat.postMessage)
- [Slack GitHub Action](https://github.com/slackapi/slack-github-action)
- [GitHub Actions Cron Syntax](https://docs.github.com/en/actions/using-workflows/events-that-trigger-workflows#schedule)

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

# How to Contribute

- Fork the repository
- Run `npm install`
- Rename `.env.example` to `.env`
- Update the `INPUT_` variables
- Make your changes
- Run `npx local-action . src/main.ts .env`
- Run `npm run bundle`
- Run `npm test`
- Submit a PR to this repository, detailing your changes

More details about GitHub TypeScript actions are
[available here](https://github.com/actions/typescript-action)
