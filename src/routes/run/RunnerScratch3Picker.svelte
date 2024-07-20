<script lang="ts">
	import {onMount, onDestroy} from "svelte";
	import {repo, pagesBranch, PAT_KEY, ghFetch} from "$lib/scratch3.ts";

	export let file: string;
	export let onProceed: () => void = () => {};

	// omg bfdi branches reference
	let onBranches: boolean = false;

	let commit: string = "";

	let refresh: number = 0;
	let page: number = 1;
	let maxPage: number = 1;

	const MAX_PAGE_REGEX = /(\d+)>;\s*rel="last"/i;
	// branches to add at the start of the list instead of the end
	const PRIORITIZED_BRANCHES: string[] = ["master", "develop"];
	const ROOT_FILES: string[] = ["gui.js", "lib.min.js"];

	function init() {
		const version = file.replace("scratch3/", "");
		const slashIndex = version.indexOf("/");
		onBranches = false;
		if (slashIndex >= 0 && slashIndex < version.length + 1) {
			// specified a commit and branch, proceed!
			onProceed();
			return;
		} else if (version.trim()) {
			// specified a commit only, branch list
			commit = version;
			onBranches = true;
			return;
		}
		// commit list, do nothing
	}

	async function makePageRequest(_page: number) {
		page = Math.max(1, Math.min(page ?? 1, maxPage));
		_page = page;

		const res = await ghFetch(
			`https://api.github.com/repos/${repo}/commits?sha=${pagesBranch}&page=${page}`
		);
		if (!res.ok) throw await getError(res);

		const maxPageMatch = res.headers.get("link")?.match(MAX_PAGE_REGEX);
		if (maxPageMatch) maxPage = Number(maxPageMatch[1] || 0) || 0;
		const json = await res.json();
		return json;
	}

	async function getBranches(_page: number): Promise<string[]> {
		const branches: string[] = [];

		const res = await ghFetch(
			`https://api.github.com/repos/${repo}/contents/?ref=${commit}`
		);
		if (!res.ok) throw await getError(res);
		const json = await res.json();

		let addedRoot = false;
		for (const file of json) {
			if (file.type === "dir") {
				if (file.name !== "static" && file.name !== "chunks") {
					if (PRIORITIZED_BRANCHES.includes(file.name)) {
						branches.unshift(file.name);
					} else {
						branches.push(file.name);
					}
				}
			} else if (ROOT_FILES.includes(file.name)) {
				addedRoot = true;
			}
		}
		if (addedRoot) {
			// the root "branch" exists,
			// add it at the start
			branches.unshift("root");
		}

		// only one branch, so run it automatically
		if (branches.length === 1 && branches[0] === "root") {
			onProceed();
		}
		return branches;
	}

	async function getError(res: Response): Promise<string> {
		const text = await res.text();
		if (
			(res.status === 403 &&
				text.includes("API rate limit exceeded for")) ||
			res.status === 429
		) {
			const timeRemaining =
				Number(res.headers.get("x-ratelimit-reset")) -
				Date.now() / 1000;
			let timeText = `${Math.ceil(timeRemaining / 60)} minutes`;
			if (timeRemaining < 60) {
				timeText = `${Math.ceil(timeRemaining)} seconds`;
			}
			if (timeText === "1 minutes") timeText = "1 minute";

			return `Exceeded GitHub's API rate limit, please wait ${timeText} (or use a personal access token with the button at the bottom) then try again.`;
		}
		return `Got response ${res.status} ${res.statusText}:
${text}`;
	}

	function setPage(e: any) {
		page = Number(e?.target?.value) ?? 1;
	}

	init();

	onMount(() => {
		document.body.classList.add("gutter");
	});
	onDestroy(() => {
		document.body.classList.remove("gutter");
	});
</script>

{#if onBranches}
	{#key refresh}
		{#await getBranches(page)}
			<h1>Scratch 3.0 builds</h1>
			<p>Loading...</p>
		{:then branches}
			<h1>Select a branch for commit <code>{commit}</code></h1>
			<ul>
				{#each branches as branch}
					<li>
						<a
							href="#scratch3/{commit}/{branch}"
							on:click={() => {
								location.hash = `#scratch3/${commit}/${branch}`;
								onProceed();
							}}
							><code>{branch === "root" ? "(root)" : branch}</code
							></a
						>
					</li>
				{/each}
			</ul>
		{:catch e}
			<p>Error! {e}</p>
		{/await}
	{/key}
{:else}
	<h1>Scratch 3.0 builds</h1>
	<p>
		NOTE: The Scratch 3.0 archives are experimental, they might have bugs!
	</p>
	<p>
		They are gotten from <a
			href="https://github.com/{repo}/tree/{pagesBranch}"
			target="_blank">scratch-gui's {pagesBranch} branch</a
		>'s commit history on GitHub.
	</p>

	<button
		title="Go to first page"
		on:click={() => {
			page = 0;
		}}>&lt;&lt;</button
	>
	<button
		title="Go to previous page"
		on:click={() => {
			page = Math.max(1, page - 1);
		}}>&lt;</button
	>
	Page
	<input
		type="number"
		min="1"
		max={maxPage}
		value={page}
		on:change={setPage}
	/>
	/<span class="max-pages">{maxPage}</span>
	<button
		title="Go to next page"
		on:click={() => {
			page = Math.min(maxPage, page + 1);
		}}>&gt;</button
	>
	<button
		title="Go to last page"
		on:click={() => {
			page = maxPage;
		}}>&gt;&gt;</button
	>

	{#key refresh}
		{#await makePageRequest(page)}
			<p>Loading...</p>
		{:then commits}
			<ul>
				{#each commits as commit}
					<li>
						<a href="#scratch3/{commit.sha}">
							{new Date(
								commit.commit.committer.date
							).toLocaleString()}
						</a>
						(<a
							href={commit.html_url.replace("/commit/", "/tree/")}
							target="_blank">GitHub</a
						>) <span class="commit-hash">({commit.sha})</span>
					</li>
				{/each}
			</ul>
		{:catch e}
			<p>Error! {e}</p>
		{/await}
	{/key}

	<button
		title="Go to first page"
		on:click={() => {
			page = 0;
		}}>&lt;&lt;</button
	>
	<button
		title="Go to previous page"
		on:click={() => {
			page = Math.max(1, page - 1);
		}}>&lt;</button
	>
	Page
	<input
		type="number"
		min="1"
		max={maxPage}
		value={page}
		on:change={setPage}
	/>
	/<span class="max-pages">{maxPage}</span>
	<button
		title="Go to next page"
		on:click={() => {
			page = Math.min(maxPage, page + 1);
		}}>&gt;</button
	>
	<button
		title="Go to last page"
		on:click={() => {
			page = maxPage;
		}}>&gt;&gt;</button
	>
{/if}

<p>
	<button
		on:click={() => {
			const text =
				prompt(`Enter a personal access token you created here to increase GitHub's ratelimits:
(Leave empty to remove, press Cancel to cancel)
To create one: https://github.com/settings/personal-access-tokens/new
(you don't need to set any permissions other than reading the scratchfoundation/scratch-gui repository)`);
			if (!text && text !== "") return;
			if (!text) {
				localStorage.removeItem(PAT_KEY);
			} else {
				localStorage.setItem(PAT_KEY, text);
			}
			refresh++;
		}}>Set GitHub personal access token</button
	>
</p>

<style>
	:global(body.gutter) {
		overflow-y: scroll;
	}

	input {
		width: 5em;
	}
	.max-pages {
		display: inline-block;
		min-width: 2em;
	}
	.commit-hash {
		color: #666;
	}
</style>
