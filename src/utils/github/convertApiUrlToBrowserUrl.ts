/**
 * Converts a GitHub API URL to a browser-accessible URL.
 *
 * @param apiUrl - The GitHub API URL (e.g., https://api.github.com/repos/owner/repo)
 * @returns The browser-accessible GitHub URL (e.g., https://github.com/owner/repo)
 */
export const convertApiUrlToBrowserUrl = (apiUrl: string): string => {
  if (!apiUrl) return ''

  try {
    // Convert repository URLs: https://api.github.com/repos/owner/repo -> https://github.com/owner/repo
    let browserUrl = apiUrl.replace(
      /^https?:\/\/api\.github\.com\/repos\//,
      'https://github.com/'
    )

    // Convert issue/PR API URLs to browser URLs
    // https://api.github.com/repos/owner/repo/issues/123 -> https://github.com/owner/repo/issues/123
    // https://api.github.com/repos/owner/repo/pulls/123 -> https://github.com/owner/repo/pull/123
    browserUrl = browserUrl.replace(/\/pulls\/(\d+)$/, '/pull/$1')

    // Convert commit API URLs
    // https://api.github.com/repos/owner/repo/commits/sha -> https://github.com/owner/repo/commit/sha
    browserUrl = browserUrl.replace(/\/commits\/([a-f0-9]+)$/, '/commit/$1')

    // Convert release API URLs
    // https://api.github.com/repos/owner/repo/releases/123 -> https://github.com/owner/repo/releases
    browserUrl = browserUrl.replace(/\/releases\/\d+$/, '/releases')

    return browserUrl
  } catch {
    return apiUrl
  }
}
