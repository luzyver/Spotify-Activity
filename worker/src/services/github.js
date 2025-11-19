import { base64ToUtf8, utf8ToBase64 } from '../utils/encoding.js';

const GITHUB_API_BASE = 'https://api.github.com';
const USER_AGENT = 'Rezz-Spotify-Worker/1.0';

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

export async function getCommit(repo, sha, token) {
	// Use the Git data API so we can access the commit's tree SHA directly
	const url = `${GITHUB_API_BASE}/repos/${repo}/git/commits/${sha}`;
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

export async function updateMultipleGitHubFiles(repo, files, message, token) {
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

	// Resolve the base tree from the latest commit so we can create a new tree
	const latestCommit = await getCommit(repo, latestCommitSha, token);
	const baseTreeSha = latestCommit?.tree?.sha;

	if (!baseTreeSha) {
		throw new Error('Failed to resolve base tree for latest commit');
	}

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

	// Create a tree based on the latest commit's tree
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
				base_tree: baseTreeSha,
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

export async function listGitHubDirectory(repo, path, token) {
	const url = `${GITHUB_API_BASE}/repos/${repo}/contents/${path}`;
	console.log(`Listing directory: ${url}`);

	const response = await fetch(url, {
		headers: {
			Authorization: `Bearer ${token}`,
			Accept: 'application/vnd.github.v3+json',
			'User-Agent': USER_AGENT,
		},
	});

	if (response.status === 404) {
		console.log(`Directory not found: ${path}`);
		return [];
	}

	if (!response.ok) {
		const errorBody = await response.text();
		console.error(`GitHub API Error: ${response.status} - ${errorBody}`);
		throw new Error(`Failed to list directory: ${response.statusText}`);
	}

	const data = await response.json();
	return Array.isArray(data) ? data : [];
}
