<script lang="ts">
	import {base} from "$app/paths";
	import {onMount, onDestroy} from "svelte";
	import {rawUrl, repo} from "$lib/scratch3.ts";

	export let file: string;
	let iframe: HTMLIFrameElement;

	let path: string;

	let evListener: (e: MessageEvent<any>) => void;

	const usedObjectURLs: string[] = [];

	onMount(async () => {
		document.body.classList.add("nomargin");

		const _file = file.replace("scratch3/", "");
		path = _file;
		if (!path.startsWith("/")) path = "/" + path;
		if (!path.endsWith("/")) path = path + "/";
		path = path.replace("/root/", "/");

		iframe.addEventListener("load", () => {
			evListener = async ({data, source}) => {
				if (data.command === "ready") {
					const html = await (
						await fetch(rawUrl + repo + path + "index.html")
					).text();
					source?.postMessage(
						{
							command: "runHtml",
							html: html,
							proxyUrl: rawUrl + repo + path,
						},
						{targetOrigin: "*"}
					);
				}
			};
			window.addEventListener("message", evListener);
		});
	});
	onDestroy(() => {
		if (evListener) {
			window.removeEventListener("message", evListener);
		}
		document.body.classList.remove("nomargin");
		for (const url of usedObjectURLs) {
			URL.revokeObjectURL(url);
		}
	});
</script>

<iframe src="{base}/_scratch3" title="Scratch" bind:this={iframe}></iframe>

<style>
	iframe {
		border: none;

		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		margin: 0;
	}

	:global(body.nomargin) {
		margin: 0;
		overflow: none;
	}
</style>
