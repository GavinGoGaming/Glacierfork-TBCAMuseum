// scratch 3 data

export const rawUrl = "https://raw.githubusercontent.com/";
export const repo = "scratchfoundation/scratch-gui";
export const pagesBranch = "gh-pages";

export const PAT_KEY = "githubpat";
// fetch but it uses your personal access token if available
export function ghFetch(url: any) {
	const pat = localStorage.getItem(PAT_KEY);

	const headers: any = {};
	if (pat) {
		headers["Authorization"] = `Bearer ${pat}`;
	}
	headers["X-GitHub-Api-Version"] = "2022-11-28";
	
	return fetch(url, {
		headers
	});
}