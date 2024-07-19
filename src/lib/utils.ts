export function getSize(bytes: number): string {
	if (bytes < 1000) return roundTo(bytes) + "b";
	else if (bytes < 1000_000) return roundTo(bytes / 1000) + " KiB";
	else if (bytes < 1000_000_000)
		return roundTo(bytes / 1000_000) + " MiB";
	return roundTo(bytes / 1000_000_000) + " GiB";
}

function roundTo(num: number, round: number = 100) {
	return Math.round(num * round) / round;
}