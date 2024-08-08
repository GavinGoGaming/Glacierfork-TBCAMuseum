<script lang="ts">
	import iconFolder from "../assets/folder.png";
	import iconInfo from "../assets/information.png";
	import Build from "./Build.svelte";
	import Changelog from "./Changelog.svelte";
	import _builddata from "$lib/builddata.json";
	import specialBuilddata from "$lib/specialbuilddata.ts";
	import SqueakFilesystem from "$lib/SqueakFilesystem.svelte";

	const builddata = _builddata as BuilddataJSON;
</script>

<svelte:head>
	<title>TCBA Glacier fork</title>
</svelte:head>

<h1>TBCA for Glacier</h1>
<h2 id="scratch1">Scratch 1.x builds</h2>
<ul>
	<li>
		When you run a build, it gets downloaded into the <em>filesystem</em>,
		which is stored in browser storage. You can access it by clicking the
		<img src={iconFolder} alt="folder" /> button in the bottom right corner.
		You can use this to clean up unused versions, upload/download projects you've
		saved or rerun versions you've run before.
	</li>
	<li>
		.zip files usually contain a .image and .changes file. These can be
		opened with a Squeak VM like the Scratch 1.4 .exe by dragging and
		dropping the .image onto the .exe.
	</li>
	<li>
		Lone .image files can also be opened in a Squeak VM, but they don't
		contain the full source code or version history.
	</li>
	<li>.exe files are installers.</li>
	<li>.sit and .dmg files are for Mac OS.</li>
	<li>
		.tgz files are for Linux, but the .image file inside can still be run
		after extracting it.
	</li>
	<li>
		.xo files are for the <a
			href="https://en.wikipedia.org/wiki/OLPC_XO"
			target="_blank">OLPC XO</a
		>, but the .image file inside can still be run after extracting it (it's
		just a zip file).
	</li>
	<li>
		.zip, .image and .xo files are run online using <a
			href="https://squeak.js.org/"
			target="_blank">SqueakJS</a
		>.
	</li>
</ul>
<ul>
	{#each builddata.scratch1order as build}
		<Build
			name={build}
			folder="scratch1/"
			data={builddata.scratch1[build]}
			special={specialBuilddata["scratch1/" + build]}
		/>
	{/each}
</ul>

<h2 id="scratch2">Scratch 2.0 builds</h2>
<ul>
	<li>
		.swf files are run online using <a
			href="https://ruffle.rs"
			target="_blank">Ruffle</a
		>. While it kinda works now, there still are issues (e.g sound is
		missing). You can instead download the .swf files and run them in a
		standalone Flash player, which you can download from e.g here:
		<a
			href="https://archive.org/details/flashplayer_32_sa_202107"
			target="_blank"
			>https://archive.org/details/flashplayer_32_sa_202107</a
		>
	</li>
	<li>
		All the "Scratch Unlabelled" builds and Scratch Raspberry Pi.swf were
		originally called just Scratch.swf, and renamed by me. I added the
		suffix to make it clearer.
	</li>
</ul>
<ul>
	{#each builddata.scratch2order as build}
		<Build
			name={build}
			folder="scratch2/"
			data={builddata.scratch2[build]}
			special={specialBuilddata["scratch2/" + build]}
		/>
	{/each}
</ul>

<h2 id="scratch3">Scratch 3.0 builds</h2>
Browse the Scratch 3.0 archives
<a href="./run#scratch3/">here</a>
(experimental).

<h2 id="misc">Miscellaneous files</h2>
<p>
	See also: <a
		href="https://tbca.nukley.com/files/Other%20Media/Other/HowToLBLisp.html"
		target="_blank">How to Run Logo Blocks .lisp Files</a
	>
	by
	<a href="https://scratch.mit.edu/users/retro_person/" target="_blank"
		>@retro_person</a
	>
</p>
<ul>
	{#each builddata.miscorder as build}
		<Build
			name={build}
			folder="misc/"
			data={builddata.misc[build]}
			special={specialBuilddata["misc/" + build]}
		/>
	{/each}
</ul>

<h2 id="changelog">Changelog</h2>

<Changelog></Changelog>

<SqueakFilesystem />

<style>
	h1 {
		text-align: center;
	}

	#nav {
		text-align: center;
	}
</style>
