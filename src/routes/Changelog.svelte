<script lang="ts">
	const changelog: [String, string[]][] = [
		[
			"2024-07-21",
			[
				"Added some post-v435.1 Scratch 2.0 builds, thanks to Pixelgamer1286 for giving them to me!",
			],
		],
		[
			"2024-07-20",
			["Added Scratch 3.0 builds (experimental)", "Actually released"],
		],
		["2024-07-19", ["Initial soft-release"]],
	];
</script>

<ul>
	{#each changelog as entry}
		<li>
			<b>{entry[0]}:</b>
			<ul>
				{#each entry[1] as change}
					<li>{change}</li>
				{/each}
			</ul>
		</li>
	{/each}
</ul>
