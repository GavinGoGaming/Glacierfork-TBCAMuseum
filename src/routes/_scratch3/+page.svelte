<script lang="ts">
	/*
		The "heart" of the Scratch 3 runner, this is what eventually turns
		into the editor.
	*/

	import {browser} from "$app/environment";
	import {onMount} from "svelte";

	if (browser) {
		onMount(() => {
			history.pushState = () => {};
			history.replaceState = () => {};

			window.addEventListener(
				"message",
				function ({data}) {
					if (data.command === "runHtml") {
						navigator?.serviceWorker?.ready?.then(async (sw) => {
							if (!sw.active) return;

							sendProxyUrl(sw, data.proxyUrl);
							// resend the proxy url every few seconds in case the worker restarts
							window.setInterval(
								sendProxyUrl.bind(this, sw, data.proxyUrl),
								10000
							);

							document.documentElement.innerHTML =
								await replaceSrcs(data.html, data.proxyUrl);
							
							// run all the scripts, since they don't run automatically
							for (const el of document.documentElement.getElementsByTagName(
								"script"
							)) {
								if (el.textContent || !el.src) continue;
								await fetch(el.src).then(async (res) => {
									(new Function(await res.text())).bind(el)();
								});
							}
						});
					}
				},
				false
			);
			if (window.parent) {
				window.parent.postMessage({command: "ready"});
			}
		});
	}

	async function replaceSrcs(
		html: string,
		proxyUrl: string
	): Promise<string> {
		let newHtml = html;
		for (const match of html.matchAll(/src="([^"]+)"/gi)) {
			const filename = match[1];
			// online url
			if (filename.startsWith("https://")) continue;

			// the browser doesn't let us use the url directly
			// (because content type stuff)
			// so fetch it then put it into a blob url
			if (filename.endsWith(".js")) {
				const blob = new Blob(
					[await (await fetch(proxyUrl + filename)).blob()],
					{type: "application/javascript"}
				);
				const url = URL.createObjectURL(blob);
				newHtml = newHtml.replaceAll(match[0], `src="${url}"`);
			} else {
				newHtml = newHtml.replaceAll(
					match[0],
					`src="${proxyUrl + filename}"`
				);
			}
		}
		return newHtml;
	}

	function sendProxyUrl(sw: ServiceWorkerRegistration, proxyUrl: string) {
		sw.active?.postMessage({
			command: "setProxyUrl",
			url: proxyUrl,
		});
	}
</script>

<p>
	Loading page... (if you see this screen for too long then check the browser
	console)
</p>
