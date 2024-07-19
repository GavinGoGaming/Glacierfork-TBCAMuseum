<script lang="ts">
	import {browser} from "$app/environment";

	import iconFolder from "../assets/folder.png";
	import iconFolderAdd from "../assets/folder_add.png";
	import iconFileAdd from "../assets/page_add.png";
	import iconRefresh from "../assets/arrow_refresh.png";
	import SqueakFileList from "./SqueakFileList.svelte";

	export let squeak: any = null;
	let loadingSqueak: boolean = false;

	let fsButton: any = null;
	let fsDiv: any = null;

	let enabled: boolean = false;
	let opened: boolean = false;

	let rootFileList: any = null;

	if (browser) {
		squeak = globalThis?.Squeak;
		enabled = true;
	}

	async function toggleFs() {
		opened = !opened;
		if (opened && !loadingSqueak) {
			if (!squeak) {
				try {
					loadingSqueak = true;
					await import("./external/squeak_bundle.js");
					squeak = window.Squeak;
				} catch(e) {
					console.error(e);
				}
			}
			loadingSqueak = false;
			refresh();
		}
	}
	function hideFs() {
		enabled = false;
	}

	function refresh() {}

	function onPageClick(e: MouseEvent) {
		let shouldHide = true;
		if (fsButton && fsButton.contains(e.target)) shouldHide = false;
		else if (fsDiv && fsDiv.contains(e.target)) shouldHide = false;
		if (shouldHide) opened = false;
	}
</script>

<svelte:body on:mousedown={onPageClick} />

{#if enabled}
	<button
		bind:this={fsButton}
		title="Filesystem"
		class="fs-button"
		on:click={toggleFs}
		><img
			class="fs-icon"
			src={iconFolder}
			alt="Filesystem"
			draggable="false"
		/></button
	>
	{#if opened}
		<div bind:this={fsDiv} class="fs">
			{#if loadingSqueak}
				<div class="fs-loading">Loading SqueakJS...</div>
			{:else}
				<div class="fs-header">
					<button
						on:click={hideFs}
						title="Hide the filesystem completely until you refresh the page."
						>Hide Completely</button
					>
					<div class="flex-grow"></div>
					<button title="Refresh" on:click={() => rootFileList.reload()}>
						<img src={iconRefresh} alt="Refresh">
					</button>
					<button title="Add Folder" on:click={() => rootFileList.addFolder()}>
						<img src={iconFolderAdd} alt="Add Folder">
					</button>
					<button title="Import File" on:click={() => rootFileList.addFile()}>
						<img src={iconFileAdd} alt="Import File">
					</button>
				</div>
				<div class="fs-body">
					<SqueakFileList bind:this={rootFileList} {squeak}></SqueakFileList>
				</div>
			{/if}
		</div>
	{/if}
{/if}

<style>
	button,
	.fs {
		border: solid 1px #aaa6;
		border-radius: 8px;
	}

	button {
		font-family: inherit;
		background-color: #0005;
		padding: 0 0.5em;
		min-height: 2em;

		cursor: pointer;
	}
	button:hover {
		background-color: #2227;
	}
	button:focus-visible {
		background-color: #3339;
	}
	button:active {
		background-color: #555d;
	}

	.fs-button {
		background-color: #0005;
		position: fixed;
		bottom: 16px;
		right: 16px;
		z-index: 10;

		width: 36px;
		height: 36px;
		padding: 0;
		cursor: pointer;

		display: flex;
		align-items: center;
		justify-content: center;
	}

	.fs-icon {
		image-rendering: pixelated;
		width: 32px;
		height: 32px;
	}

	.fs {
		background-color: #000c;
		position: fixed;
		bottom: calc(16px + 36px + 16px);
		right: 16px;

		width: 30em;
		max-width: calc(100vw - 32px);
		height: calc(100vh - 16px - 36px - 32px);
		box-sizing: border-box;

		display: flex;
		flex-direction: column-reverse;
		user-select: none;
	}

	.fs-header {
		padding: 0.5em;
		flex-grow: 0;
		flex-shrink: 0;
		border-top: solid 1px #aaa6;

		display: flex;
		flex-wrap: nowrap;
		gap: 0.5em;
	}
	.fs-body {
		color-scheme: dark;
		scrollbar-color: #444 black;
		overscroll-behavior: contain;

		padding: 0.25em 0;
		flex-grow: 1;
		flex-shrink: 1;
		overflow: auto;
	}
	.fs-loading {
		flex-grow: 1;
		padding: 0.5em;
	}

	.fs-header button {
		flex-shrink: 0;
		flex-grow: 0;
	}
	.flex-grow {
		flex-grow: 1;
	}

	button img {
		vertical-align: middle;
	}
</style>
