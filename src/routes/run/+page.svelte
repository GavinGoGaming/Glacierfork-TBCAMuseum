<script lang="ts">
	import {browser} from "$app/environment";
	import RunnerFlash from "./RunnerFlash.svelte";
	import RunnerSqueak from "./RunnerSqueak.svelte";

	let imports: Promise<any>;
	let file: string = "";
	let title: string = "";

	const enum RunType {
		NONE,
		NONEXISTENT,
		SQUEAK,
		FLASH,
	}
	let runType: RunType = RunType.NONE;

	if (browser) {
		window.RufflePlayer = window.RufflePlayer || {};
		
		window.RufflePlayer.config = {
			publicPath: "https://unpkg.com/@ruffle-rs/ruffle/",
			autoplay: "on",
			unmuteOverlay: "hidden",
		};
		reload();
	}

	function reload() {
		runType = RunType.NONE;

		file = location.hash.substring(1);
		const isZip = file.endsWith(".zip") || file.endsWith(".xo");

		title = decodeURIComponent(file.split("/").at(-1) || "");

		if (
			(file.startsWith("scratch1/") &&
			(isZip || file.endsWith(".image"))) || (
				file.startsWith("/") && file.endsWith(".image")
			)
		) {
			runType = RunType.SQUEAK;
			imports = Promise.all([
				isZip ? import("@turbowarp/jszip") : null,
				import("$lib/external/squeak_bundle.js"),
			]);
		} else if (
			file.startsWith("scratch2/") && file.endsWith(".swf")
		) {
			runType = RunType.FLASH;
			imports = import("https://unpkg.com/@ruffle-rs/ruffle");
		} else {
			runType = RunType.NONEXISTENT;
		}
	}
</script>

<svelte:window on:hashchange={() => {
	if (location.hash) reload();
}} />

<svelte:head>
	{#if title}
		<title>TBCA Museum: {title}</title>
	{:else}
		<title>TBCA Museum</title>
	{/if}
</svelte:head>

{#if runType == RunType.NONE}
	<noscript>The Run page requires JavaScript.</noscript>
{:else if runType == RunType.NONEXISTENT}
	<p>File not found: {file}</p>
{:else}
	{#await imports}
		<p>Loading libraries...</p>
	{:then imported}
		{#if runType == RunType.SQUEAK}
			<RunnerSqueak jszip={imported[0]} path={file}></RunnerSqueak>
		{:else if runType == RunType.FLASH}
			<RunnerFlash path={file}></RunnerFlash>
		{/if}
	{:catch error}
		<p>Something went wrong: {error.message}</p>
	{/await}
{/if}
