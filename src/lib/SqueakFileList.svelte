<script lang="ts">
	import SqueakFile from "./SqueakFile.svelte";

	export let path: string = "";
	export let squeak: any = null;

	let files: SqueakFileArr[] | null = null;

	reload();
	function reload() {
		const dir = squeak.dirList(path);
		files = dir ? Object.values(dir) : null;
	}

	function recursiveDelete(isDirectory: boolean, path: string): void {
		if (isDirectory) {
			for (const file of Object.values(
				squeak.dirList(path, true) || {}
			) as any[]) {
				recursiveDelete(file[3], path + "/" + file[0]);
			}
			squeak.dirDelete(path);
		} else {
			squeak.fileDelete(path);
		}
	}

	export const addFolder = function() {
		const name = prompt("Folder name:")?.trim();
		if (!name) return;
		if (name.startsWith("/") || name.endsWith("/")) {
			alert("Invalid folder name!");
			return;
		}
		squeak.dirCreate(path + "/" + name, true);
		reload();
	}
	export const addFile = function() {
		const input = document.createElement("input");
		document.body.appendChild(input);
		input.style.display = "none";
		input.type = "file";
		input.multiple = true;
		input.addEventListener("change", async (e: Event) => {
			const promises = [];
			for (const file of (input.files || [])) {
				promises.push(new Promise<void>(async (res) => {
					if (!squeak.filePut(path + "/" + file.name, await file.arrayBuffer(), res)) {
						res();
						console.error("Could not upload file: " + path + "/" + file.name);
					}
				}));
			}
			await Promise.all(promises);
			reload();
		});
		input.click();
		input.remove();
	}
</script>

<!-- idk -->
<div class:fullsize={path === ""} role="directory">
	{#if files}
		{#each files as file (file[0])}
			<SqueakFile
				{squeak}
				{path}
				fileObj={file}
				onRemove={() => {
					recursiveDelete(file[3], path + "/" + file[0]);

					if (!files) return;
					const fileIndex = files.indexOf(file);
					if (fileIndex !== -1) files.splice(fileIndex, 1);
					// make svelte update the component
					files = files;
				}}
			></SqueakFile>
		{/each}
	{:else}
		Folder is null.
	{/if}
	{#if path === ""}
		<div class="padding"></div>
	{/if}
</div>

<style>
	.fullsize {
		height: 100%;
		width: 100%;
	}
	.padding {
		height: 48px;
	}
</style>
