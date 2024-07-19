<script lang="ts">
	import {onMount, onDestroy} from "svelte";
	import buildpath from "$lib/buildpath.ts";
	
	export let path: string = "";

	onMount(() => {
		document.body.classList.add("nomargin");
	})
	onDestroy(() => {
		document.body.classList.remove("nomargin");
	});
</script>

<object class="player-container" aria-label="Flash Player">
	<embed class="player" src={buildpath + path} />
</object>

<style>
	.player {
		width: 100vw;
		height: 100vh;
	}

	:global(body.nomargin) {
		margin: 0;
		overflow: hidden;
	}
</style>