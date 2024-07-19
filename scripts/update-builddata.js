import * as fs from "node:fs/promises";
import * as path from "node:path";

const dir = path.resolve(import.meta.dirname, "..");
const jsonPath = path.resolve(dir, "src/lib/builddata.json");

const dateRegexS1 = /(\d+)(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|July|Sept)(\d+)/i;
const dateRegexS2Dated = /v(\d+)\.(\d+)\.(\d+)/i;
const dateRegexS2Numbered = /v(\d+)(\.1)?([^.\d]|\.swf)/i;

let json = {};
try {
	json = JSON.parse(await fs.readFile(jsonPath, { encoding: "utf-8" }));
} catch (e) {
	console.log("Starting with blank builddata");
}

if (!json.scratch1) json.scratch1 = {};
const scratch1Path = path.resolve(dir, "../TBCAMuseum-builds/scratch1/");
let scratch1Dir;
try {
	scratch1Dir = (await fs.readdir(scratch1Path)).sort(sortBuildName1).sort(sortBuildName1);
} catch (e) {
	console.error(e);
	throw "Could not get builds directory at " + scratch1Path
}
for (const entry of scratch1Dir) {
	const stat = await fs.stat(path.resolve(scratch1Path, entry));
	json.scratch1[entry] = {
		modified: Number(stat.mtimeMs),
		size: Number(stat.size),
		...(json.scratch1[entry] || {}),
	};
}
json.scratch1order = scratch1Dir;

if (!json.scratch2) json.scratch2 = {};
const scratch2Path = path.resolve(dir, "../TBCAMuseum-builds/scratch2/");
let scratch2Dir;
try {
	scratch2Dir = (await fs.readdir(scratch2Path)).sort(sortBuildName2).sort(sortBuildName2);
} catch (e) {
	console.error(e);
	throw "Could not get builds directory at " + scratch2Path
}
for (const entry of scratch2Dir) {
	const stat = await fs.stat(path.resolve(scratch2Path, entry));
	json.scratch2[entry] = {
		modified: Number(stat.mtimeMs),
		size: Number(stat.size),
		...(json.scratch2[entry] || {}),
	};
}
json.scratch2order = scratch2Dir;

if (!json.misc) json.misc = {};
const miscPath = path.resolve(dir, "../TBCAMuseum-builds/misc/");
let miscDir;
try {
	miscDir = (await fs.readdir(miscPath)).sort();
} catch (e) {
	console.error(e);
	throw "Could not get builds directory at " + miscPath
}
for (const entry of miscDir) {
	const stat = await fs.stat(path.resolve(miscPath, entry));
	json.misc[entry] = {
		modified: Number(stat.mtimeMs),
		size: Number(stat.size),
		...(json.misc[entry] || {}),
	};
}
json.miscorder = miscDir;

// sorts scratch 1.x builds by name
function sortBuildName1(name1, name2) {
	const date1 = getBuildDate1(name1);
	const date2 = getBuildDate1(name2);
	// sort 2 undated builds by name
	if (date1 === null && date2 === null)
		return name1.localeCompare(name2, "en", { numeric: true });
	// put undated builds at the back
	else if (date1 === null)
		return 1;
	else if (date2 === null)
		return -1;
	return date1 - date2;
}
// sorts scratch 2.0 builds by name
function sortBuildName2(name1, name2) {
	const date1 = getBuildDate1(name1);
	const date1dated = getBuildDate2Dated(name1);
	const date1numbered = getBuildDate2Numbered(name1);
	const date2 = getBuildDate1(name2);
	const date2dated = getBuildDate2Dated(name2);
	const date2numbered = getBuildDate2Numbered(name2);
	
	// era 1: 1.x-dated builds, and a hardcoded exception for BlocksEngineDemo.swf
	// era 2: 2.0-dated builds
	// era 3: numbered builds
	// null: undated builds
	const blocksEngine = "BlocksEngineDemo.swf";
	const era1 = (date1 !== null || name1 === blocksEngine) ? 1 : (
		date1dated !== null ? 2 : (date1numbered !== null ? 3 : null)
	);
	const era2 = (date2 !== null || name2 === blocksEngine) ? 1 : (
		date2dated !== null ? 2 : (date2numbered !== null ? 3 : null)
	);

	// if the builds are in the same era, just sort by their
	// ordering scheme
	// (ascending dates for dated and 1.x-dated builds,
	// ascending numbers for numbered builds)
	if (era1 === 1 && era2 === 1)
		return date1 - date2;
	else if (era1 === 2 && era2 === 2)
		return date1dated - date2dated;
	else if (era1 === 3 && era2 === 3)
		return date1numbered - date2numbered;

	// if both are undated or in the same era somehow, compare
	// alphabetically
	if ((era1 === null && era2 === null) || (era1 === era2))
		return name1.localeCompare(name2, "en", { numeric: true });
	// undated builds always go last
	else if (era1 === null) return 1;
	else if (era2 === null) return -1;
	// otherwise, compare by era number
	return era1 - era2;
}

// e.g 30Sep09
function getBuildDate1(name) {
	const match = name.match(dateRegexS1);
	if (match === null) return null;
	return Number(new Date(`${match[1]} ${match[2]} 20${match[3]}`));
}
// e.g v2010.10.03
function getBuildDate2Dated(name) {
	const match = name.match(dateRegexS2Dated);
	if (match === null) return null;
	return Number(new Date(`${match[1]}-${match[2]}-${match[3]}`));
}
// e.g v418
function getBuildDate2Numbered(name) {
	const match = name.match(dateRegexS2Numbered);
	if (match === null) return null;
	// add 0.1 for 435.1
	// unprefixed builds should go first
	return Number(match[1]) + (match[2] ? 0.1 : 0) - (match[3] === ".swf" ? 0.05 : 0);
}

for (const key of Object.keys(json)) {
	const order = json[key + "order"];
	if (order) {
		const builds = json[key];
		for (const key2 of Object.keys(builds)) {
			if (!order.includes(key2)) {
				delete builds[key2];
				console.log(`Deleted entry for ${key}/${key2}`);
			}
		}
	}
}

await fs.writeFile(jsonPath, JSON.stringify(json));