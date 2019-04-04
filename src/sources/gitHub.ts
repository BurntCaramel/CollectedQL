export async function fetchTextFromGitHub({
  owner,
  repo,
  tagOrCommit,
  path
}: {
  owner: string;
  repo: string;
  tagOrCommit: string;
  path: string;
}) {
  const url = `https://cdn.jsdelivr.net/gh/${owner}/${repo}@${tagOrCommit}/${path}`;
  const response = await fetch(url);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error(`GitHub repo or file not found: ${url}`);
    }

    throw new Error(`GitHub repo or file could not be loaded: ${url}`);
  }
  return response.text();
}
