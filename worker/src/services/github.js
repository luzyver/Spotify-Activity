import { base64ToUtf8, utf8ToBase64 } from '../utils/encoding.js';

const GITHUB_API = 'https://api.github.com';
const USER_AGENT = 'Rezz-Spotify-Worker/1.0';

const headers = (token) => ({
	Authorization: `Bearer ${token}`,
	Accept: 'application/vnd.github.v3+json',
	'User-Agent': USER_AGENT,
});

const jsonHeaders = (token) => ({
	...headers(token),
	'Content-Type': 'application/json',
});

export async function getGitHubFile(repo, path, token) {
	const url = `${GITHUB_API}/repos/${repo}/contents/${path}`;
	const response = await fetch(url, { headers: headers(token) });

	if (response.status === 404) {
		return { content: null, sha: null };
	}

	if (!response.ok) {
		const body = await response.text();
		throw new Error(`GitHub GET failed: ${response.status} - ${body}`);
	}

	const data = await response.json();
	const content = JSON.parse(base64ToUtf8(data.content));
	return { content, sha: data.sha };
}

export async function getCommit(repo, sha, token) {
	const url = `${GITHUB_API}/repos/${repo}/git/commits/${sha}`;
	const response = await fetch(url, { headers: headers(token) });

	if (!response.ok) {
		const body = await response.text();
		throw new Error(`Get commit failed: ${response.status} - ${body}`);
	}

	return response.json();
}

export async function updateMultipleGitHubFiles(repo, files, message, token) {
	// Get latest commit
	const branchRes = await fetch(`${GITHUB_API}/repos/${repo}/git/refs/heads/master`, {
		headers: headers(token),
	});

	if (!branchRes.ok) throw new Error(`Get branch failed: ${branchRes.statusText}`);

	const branchData = await branchRes.json();
	const latestCommitSha = branchData.object.sha;

	// Get base tree
	const latestCommit = await getCommit(repo, latestCommitSha, token);
	const baseTreeSha = latestCommit?.tree?.sha;
	if (!baseTreeSha) throw new Error('Failed to get base tree');

	// Create blobs in parallel
	const blobs = await Promise.all(
		files.map(async (file) => {
			const blobRes = await fetch(`${GITHUB_API}/repos/${repo}/git/blobs`, {
				method: 'POST',
				headers: jsonHeaders(token),
				body: JSON.stringify({
					content: utf8ToBase64(JSON.stringify(file.content, null, 2)),
					encoding: 'base64',
				}),
			});

			if (!blobRes.ok) throw new Error(`Create blob failed: ${blobRes.statusText}`);

			const blobData = await blobRes.json();
			return { path: file.path, mode: '100644', type: 'blob', sha: blobData.sha };
		})
	);

	// Create tree
	const treeRes = await fetch(`${GITHUB_API}/repos/${repo}/git/trees`, {
		method: 'POST',
		headers: jsonHeaders(token),
		body: JSON.stringify({ base_tree: baseTreeSha, tree: blobs }),
	});

	if (!treeRes.ok) throw new Error(`Create tree failed: ${treeRes.statusText}`);
	const treeData = await treeRes.json();

	// Create commit
	const commitRes = await fetch(`${GITHUB_API}/repos/${repo}/git/commits`, {
		method: 'POST',
		headers: jsonHeaders(token),
		body: JSON.stringify({ message, tree: treeData.sha, parents: [latestCommitSha] }),
	});

	if (!commitRes.ok) throw new Error(`Create commit failed: ${commitRes.statusText}`);
	const commitData = await commitRes.json();

	// Update ref
	const updateRes = await fetch(`${GITHUB_API}/repos/${repo}/git/refs/heads/master`, {
		method: 'PATCH',
		headers: jsonHeaders(token),
		body: JSON.stringify({ sha: commitData.sha }),
	});

	if (!updateRes.ok) throw new Error(`Update ref failed: ${updateRes.statusText}`);
	return updateRes.json();
}

export async function listGitHubDirectory(repo, path, token) {
	const url = `${GITHUB_API}/repos/${repo}/contents/${path}`;
	const response = await fetch(url, { headers: headers(token) });

	if (response.status === 404) return [];
	if (!response.ok) {
		const body = await response.text();
		throw new Error(`List directory failed: ${response.status} - ${body}`);
	}

	const data = await response.json();
	return Array.isArray(data) ? data : [];
}
