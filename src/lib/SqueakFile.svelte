<script lang="ts">
	import iconFolder from "../assets/folder.png";
	import iconFile from "../assets/page.png";
	import iconApp from "../assets/application_xp.png";
	import iconDelete from "../assets/delete.png";
	import iconDisk from "../assets/disk.png";
	import iconFolderAdd from "../assets/folder_add.png";
	import iconFileAdd from "../assets/page_add.png";

	import SqueakFileList from "./SqueakFileList.svelte";
	import {goto} from "$app/navigation";
	import {base} from "$app/paths";
	import {getSize} from "$lib/utils.ts";


	export let squeak: any = null;

	export let path: string = "";
	export let fileObj: SqueakFileArr;

	export let onRemove: () => void = () => {};

	let folderFileList: any;

	const FILENAME = 0;
	const MODIFIED = 1;
	const CREATED = 2;
	const IS_FOLDER = 3;
	const FILESIZE = 4;

	$: fullPath = path + "/" + fileObj[FILENAME];
	$: isImage = fileObj[FILENAME].endsWith(".image") && !fileObj[IS_FOLDER];

	let icon: string = fileObj[IS_FOLDER]
		? iconFolder
		: fileObj[FILENAME].endsWith(".image")
			? iconApp
			: iconFile;

	function downloadMe(e: MouseEvent): void {
		squeak.fileGet(
			fullPath,
			(data: any) => {
				const url = URL.createObjectURL(new Blob([data]));
				const a = document.createElement("a");
				document.body.appendChild(a);
				a.style.display = "none";
				a.href = url;
				a.download = fileObj[FILENAME];
				a.click();
				URL.revokeObjectURL(url);
				a.remove();
			},
			(err: any) => {
				alert(`Could not download ${fullPath}:
${err}`);
			}
		);
	}
	function deleteMe(e: MouseEvent): void {
		if (
			!e.shiftKey &&
			!confirm(
				`Delete ${fileObj[FILENAME]}? (Hold Shift to bypass this warning.)`
			)
		)
			return;
		onRemove();
	}

	function addFileMe(e: MouseEvent): void {
		if (folderFileList) folderFileList.addFile();
	}
	function addFolderMe(e: MouseEvent): void {
		if (folderFileList) folderFileList.addFolder();
	}
</script>

<svelte:element this={fileObj[IS_FOLDER] ? "details" : "div"} class="file">
	<summary
		class="file-inner"
		class:clickable={isImage || fileObj[IS_FOLDER]}
		title={isImage ? "Click to run .image" : ""}
		on:click={() => {
			if (isImage) {
				goto(`${base}/run#${fullPath}`);
				location.hash = "#" + fullPath;
			}
		}}
	>
		<img class="icon" src={icon} alt="" draggable="false" />
		<div class="filename">{fileObj[FILENAME]}</div>
		{#if !fileObj[IS_FOLDER]}
			<button title="Download ({getSize(fileObj[FILESIZE])})" on:click={downloadMe}
				><img src={iconDisk} alt="Download" draggable="false" /></button
			>
		{:else}
			<button title="Add Folder" on:click={addFolderMe}
				><img src={iconFolderAdd} alt="Add Folder" draggable="false" /></button
			>
			<button title="Import File" on:click={addFileMe}
				><img src={iconFileAdd} alt="Import File" draggable="false" /></button
			>
		{/if}
		<button title="Delete" on:click={deleteMe}
			><img src={iconDelete} alt="Delete" draggable="false" /></button
		>
	</summary>
	{#if fileObj[IS_FOLDER]}
		<div class="folder-files">
			<SqueakFileList bind:this={folderFileList} {squeak} path={fullPath} />
		</div>
	{/if}
</svelte:element>

<style>
	.file {
		margin: 0;
		position: relative;
		--folder-padding: var(--folder-padding-2, 0.5em);
	}
	.clickable {
		cursor: pointer;
	}
	.file-inner {
		padding-left: 0.5em;
		box-sizing: border-box;

		display: flex;
		flex-direction: row;
		flex-wrap: nowrap;
		align-items: center;
		width: 100%;

		position: relative;

		border-bottom: solid 1px #aaa5;
		padding-left: var(--folder-padding, 0.5em);
	}
	.folder-files {
		--folder-padding-2: calc(var(--folder-padding) + 16px);
	}

	.icon {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
		flex-grow: 0;
		margin-right: 0.25em;
	}
	.filename {
		flex-grow: 1;
		flex-shrink: 1;
	}

	button {
		background: none;
		border: none;
		padding: 0;
		cursor: pointer;
		border-left: solid 1px #aaa5;

		padding: 0 4px;
		margin: 0;
		height: 100%;
	}
	button img {
		vertical-align: middle;
	}

	.icon {
		transition: transform 0.1s cubic-bezier(.22,.61,.36,1);
	}
	.file:global([open]) > summary > .icon {
		transform: rotate(90deg);
	}
</style>
