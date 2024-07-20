<script lang="ts">
	import {onDestroy, onMount} from "svelte";
	import buildpath from "$lib/buildpath.ts";
	import type JSZip from "@turbowarp/jszip";
	import SqueakFilesystem from "$lib/SqueakFilesystem.svelte";

	export let path: string = "";

	export let jszip: JSZip | null = null;
	let squeak: any = window.Squeak;
	let squeakjs: any = window.SqueakJS;

	let canvas: HTMLCanvasElement;
	let spinner: HTMLDivElement;
	let squeakDisplay: any;

	let loadingZip: Boolean = false;

	onMount(async () => {
		// make squeakjs use our jszip instead of theirs
		if (jszip) window.JSZip = jszip;

		squeak._fromRunner = true;
		const zippedPath = await extractZip();
		const options = {
			spinner: spinner,
			minWidth: 400,
			minHeight: 400,
		};
		document.body.classList.add("nomargin");
		if (!zippedPath) {
			if (path.startsWith("/")) {
				squeakDisplay = squeakjs.runSqueak(path, canvas, {
					appName: decodeURIComponent(path),
					...options,
				});
			} else {
				squeakDisplay = squeakjs.runSqueak(buildpath + path, canvas, {
					appName: decodeURIComponent(path),
					root: "/" + path.replaceAll("/", "_"),
					...options,
				});
			}
		} else {
			squeakDisplay = squeakjs.runSqueak(zippedPath, canvas, {
				appName: zippedPath,
				...options,
			});
		}
	});

	async function extractZip(): Promise<string | undefined> {
		if (!jszip || path.startsWith("/")) {
			return undefined;
		}
		loadingZip = true;
		const _path = decodeURIComponent(path).replaceAll("/", "_");
		try {
			const zip = await jszip.loadAsync(
				await (await fetch(buildpath + path)).arrayBuffer()
			);
			const promises = [];

			const files = Object.keys(zip.files);
			const imagePath = files.find((k) => k.endsWith(".image"));
			if (!imagePath) throw "No .image file in zip";
			for (const file of files) {
				promises.push(
					await new Promise<void>(async (res) => {
						const fullPath = _path + "/" + file;
						const dirName =
							"/" + fullPath.split("/").slice(0, -1).join("/");
						squeak.dirCreate(dirName, true);
						// not a directory
						if (!file.endsWith("/")) {
							const buf = await zip
								.file(file)
								?.async("arraybuffer");
							// trim path because some builds have a file named "Icon "
							// with a space at the end, and that messes up the filesystem
							const retVal = squeak.filePut(fullPath.trim(), buf, res);
							if (!retVal) {
								throw `Failed to write file ${fullPath}`;
							}
						} else {
							res();
						}
					})
				);
			}
			await Promise.all(promises);
			return "/" + _path + "/" + imagePath;
		} finally {
			loadingZip = false;
		}
	}

	onDestroy(() => {
		document.body.classList.remove("nomargin");
		squeakjs.quitSqueak();
		window.onbeforeunload = null;
		if (squeakDisplay) squeakDisplay.vm = null;
	});
</script>

<div>
	{#if loadingZip}
		<p>Loading zip...</p>
	{/if}
	<canvas bind:this={canvas} class="canvas"></canvas>
	<div bind:this={spinner} class="spinner"><div></div></div>
</div>

<SqueakFilesystem />

<style>
	.canvas {
		width: 100%;
		height: 100%;

		position: fixed;
		top: 0;
		left: 0;

		user-select: none;
	}
	.spinner {
		position: fixed;
		margin: auto;
		top: 0;
		left: 0;
		bottom: 0;
		right: 0;
		width: 100px;
		height: 100px;
		border-radius: 50px;
		background: rgba(0, 0, 0, 0.3);
		box-shadow: 0 0 5px 5px #f90;
		display: none;
		transform: rotate(30deg);
	}
	.spinner > div {
		position: absolute;
		top: 45px;
		left: 5px;
		width: 90px;
		height: 10px;
		border-radius: 5px;
		box-shadow: 0 0 5px 5px #f90;
	}

	:global(body.nomargin) {
		margin: 0;
		overflow: none;
	}
</style>
