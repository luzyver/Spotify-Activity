/**
 * GitHub API Service
 * Handles all GitHub API interactions for file storage
 */

import { base64ToUtf8, utf8ToBase64 } from '../utils/encoding.js';

const GITHUB_API_BASE = 'https://api.github.com';
const USER_AGENT = 'Rezz-Spotify-Worker/1.0';

/**
 * Get file content from GitHub repository
 * @param {string} repo - Repository in format "owner/repo"
 * @param {string} path - File path in repository
 * @param {string} token - GitHub access token
 * @returns {Promise<{content: Object|null, sha: string|null}>} File content and SHA
 */
export async function getGitHubFile(repo, path, token) {
	const url = `${GITHUB_API_BASE}/repos/${repo}/contents/${path}`;
	console.log(`Fetching: ${url}`);

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github.v3+json',
			'User-Agent': USER_AGENT,
		},
	});

	console.log(`Response status: ${response.status}`);

	if (response.status === 404) {
		console.log(`File not found: ${path}, will create new`);
		return { content: null, sha: null };
	}

	if (!response.ok) {
		const errorBody = await response.text();
		console.error(`GitHub API Error: ${response.status} - ${errorBody}`);
		throw new Error(`Failed to get file: ${response.statusText} - ${errorBody}`);
	}

	const data = await response.json();
	const jsonString = base64ToUtf8(data.content);
	const content = JSON.parse(jsonString);
	return { content, sha: data.sha };
}

/**
 * Get commit information by SHA
 * @param {string} repo - Repository in format "owner/repo"
 * @param {string} sha - Commit SHA
 * @param {string} token - GitHub access token
 * @returns {Promise<Object>} Commit data
 */
export async function getCommit(repo, sha, token) {
	const url = `${GITHUB_API_BASE}/repos/${repo}/commits/${sha}`;
	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github.v3+json',
			'User-Agent': USER_AGENT,
		},
	});
	if (!response.ok) {
		const body = await response.text();
		throw new Error(`Failed to get commit: ${response.status} - ${body}`);
	}
	return await response.json();
}

/**
 * Get file content from GitHub repository at a specific ref (branch, tag, or commit SHA)
 * @param {string} repo - Repository in format "owner/repo"
 * @param {string} path - File path in repository
 * @param {string} ref - A valid Git reference (branch, tag, or commit SHA)
 * @param {string} token - GitHub access token
 * @returns {Promise<{content: Object|null, sha: string|null}>} File content and SHA
 */
export async function getGitHubFileAtRef(repo, path, ref, token) {
	const url = `${GITHUB_API_BASE}/repos/${repo}/contents/${path}?ref=${encodeURIComponent(ref)}`;
	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github.v3+json',
			'User-Agent': USER_AGENT,
		},
	});
	if (response.status === 404) {
		return { content: null, sha: null };
	}
	if (!response.ok) {
		const body = await response.text();
		throw new Error(`Failed to get file at ref: ${response.status} - ${body}`);
	}
	const data = await response.json();
	const jsonString = base64ToUtf8(data.content);
	const content = JSON.parse(jsonString);
	return { content, sha: data.sha };
}


/**
 * Update a single file in GitHub repository
 * @param {string} repo - Repository in format "owner/repo"
 * @param {string} path - File path in repository
 * @param {Object} content - Content to write (will be JSON.stringify'd)
 * @param {string} message - Commit message
 * @param {string|null} sha - Current file SHA (null for new files)
 * @param {string} token - GitHub access token
 * @returns {Promise<Object>} GitHub API response
 */
export async function updateGitHubFile(repo, path, content, message, sha, token) {
	const response = await fetch(
		`${GITHUB_API_BASE}/repos/${repo}/contents/${path}`,
		{
			method: 'PUT',
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github.v3+json',
				'Content-Type': 'application/json',
				'User-Agent': USER_AGENT,
			},
			body: JSON.stringify({
				message,
				content: utf8ToBase64(JSON.stringify(content, null, 2)),
				sha,
			}),
		}
	);

	if (!response.ok) {
		throw new Error(`Failed to update file: ${response.statusText}`);
	}

	return await response.json();
}

/**
 * Update multiple files in a single commit using GitHub Git API
 * @param {string} repo - Repository in format "owner/repo"
 * @param {Array<{path: string, content: Object}>} files - Files to update
 * @param {string} message - Commit message
 * @param {string} token - GitHub access token
 * @returns {Promise<Object>} GitHub API response
 */
export async function updateMultipleGitHubFiles(repo, files, message, token) {
	// Get the latest commit SHA
	const branchResponse = await fetch(
		`${GITHUB_API_BASE}/repos/${repo}/git/refs/heads/main`,
		{
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github.v3+json',
				'User-Agent': USER_AGENT,
			},
		}
	);

	if (!branchResponse.ok) {
		throw new Error(`Failed to get branch: ${branchResponse.statusText}`);
	}

	const branchData = await branchResponse.json();
	const latestCommitSha = branchData.object.sha;

	// Create blobs for each file
	const blobs = await Promise.all(
		files.map(async (file) => {
			const blobResponse = await fetch(
				`${GITHUB_API_BASE}/repos/${repo}/git/blobs`,
				{
					method: 'POST',
					headers: {
						Authorization: `Bearer ${token}`,
						Accept: 'application/vnd.github.v3+json',
						'Content-Type': 'application/json',
						'User-Agent': USER_AGENT,
					},
					body: JSON.stringify({
						content: utf8ToBase64(JSON.stringify(file.content, null, 2)),
						encoding: 'base64',
					}),
				}
			);

			if (!blobResponse.ok) {
				throw new Error(`Failed to create blob: ${blobResponse.statusText}`);
			}

			const blobData = await blobResponse.json();
			return {
				path: file.path,
				mode: '100644',
				type: 'blob',
				sha: blobData.sha,
			};
		})
	);

	// Create a tree
	const treeResponse = await fetch(
		`${GITHUB_API_BASE}/repos/${repo}/git/trees`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github.v3+json',
				'Content-Type': 'application/json',
				'User-Agent': USER_AGENT,
			},
			body: JSON.stringify({
				base_tree: latestCommitSha,
				tree: blobs,
			}),
		}
	);

	if (!treeResponse.ok) {
		throw new Error(`Failed to create tree: ${treeResponse.statusText}`);
	}

	const treeData = await treeResponse.json();

	// Create a commit
	const commitResponse = await fetch(
		`${GITHUB_API_BASE}/repos/${repo}/git/commits`,
		{
			method: 'POST',
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github.v3+json',
				'Content-Type': 'application/json',
				'User-Agent': USER_AGENT,
			},
			body: JSON.stringify({
				message,
				tree: treeData.sha,
				parents: [latestCommitSha],
			}),
		}
	);

	if (!commitResponse.ok) {
		throw new Error(`Failed to create commit: ${commitResponse.statusText}`);
	}

	const commitData = await commitResponse.json();

	// Update the reference
	const updateRefResponse = await fetch(
		`${GITHUB_API_BASE}/repos/${repo}/git/refs/heads/main`,
		{
			method: 'PATCH',
			headers: {
				Authorization: `Bearer ${token}`,
				Accept: 'application/vnd.github.v3+json',
				'Content-Type': 'application/json',
				'User-Agent': USER_AGENT,
			},
			body: JSON.stringify({
				sha: commitData.sha,
			}),
		}
	);

	if (!updateRefResponse.ok) {
		throw new Error(`Failed to update ref: ${updateRefResponse.statusText}`);
	}

	return await updateRefResponse.json();
}
