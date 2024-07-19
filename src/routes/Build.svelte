<script lang="ts">
	import iconInfo from "../assets/information.png";
	import iconDownload from "../assets/disk.png";
	import iconPlay from "../assets/control_play_blue.png";

	import buildpath from "$lib/buildpath.ts";
	import {getSize} from "$lib/utils.ts";

	export let name: string = "";
	export let folder: string = "";
	export let data: BuildInfo | null = null;
	export let special: SpecialBuildInfo | null = null;

	const isZip = name.endsWith(".zip") || name.endsWith(".xo");
	const canRun =
		folder !== "misc/" &&
		((folder === "scratch1/" && isZip) ||
			name.endsWith(".image") ||
			name.endsWith(".swf"));

	let lastModified: string = "";
	let notes: string = "";
	if (data) {
		lastModified =
			"Last modified: " + new Date(data.modified).toLocaleString();
		if (special) {
			if (special.nicknames) {
				notes += special.nicknames.join(", ");
			}
			if (special.notes) {
				if (special.nicknames) notes += ". ";
				notes += special.notes;
			}
			if (notes && special.infoLink) {
				notes += "; ";
			}
		}
	}
</script>

<li>
	<img
		class="info-icon"
		src={iconInfo}
		alt="Info"
		title={lastModified}
		draggable="false"
	/>
	<a download={name} href={buildpath + folder + name}
		><img src={iconDownload} alt="Download" draggable="false" /></a
	>
	{#if canRun}
		<a href="/run#{folder + name}"
			><img src={iconPlay} alt="Run" draggable="false" /> {name}</a>
	{:else}
		<a href={buildpath + folder + name}>{name}</a>
	{/if}
	{#if notes || special?.infoLink}
		({notes}{#if special?.infoLink}<a
				href={special.infoLink}
				target="_blank">more info</a
			>{/if})
	{/if}
	<span class="filesize">({getSize(data?.size || 0)})</span>
</li>

<style>
	.info-icon {
		cursor: help;
	}
	.filesize {
		color: #666;
	}
</style>
