/*
	This service worker is used for proxying any requests
	the scratch3 runner makes to /static/, to GitHub.
*/

const proxyUrls = new Map();
self.addEventListener("message", (event) => {
	if (event.data.command === "setProxyUrl") {
		proxyUrls.set(event.source.id, event.data.url);
	}
	cleanupClients();
});

self.addEventListener("fetch", function (event) {
	if (event.request.method !== "GET") return;
	const index = event.request.url.indexOf("/static/");
	if (index === -1) return;

	function onFetch() {
		const req = event.request;
		const proxyUrl = proxyUrls.get(event.clientId);
		if (!proxyUrl) return fetch(req);
		const newReq = new Request(proxyUrl + req.url.substring(index + 1), req);
		return fetch(newReq);
	}

	event.respondWith(onFetch());
});

function cleanupClients() {
	self.clients.matchAll().then((_clientsArr) => {
		if (!_clientsArr) return;
		const clientsArr = _clientsArr.map(c => c.id);
		for (const key of proxyUrls.keys()) {
			if (!clientsArr.includes(key)) proxyUrls.delete(key);
		}
	})
}