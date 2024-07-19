interface BuildInfo {
	modified: number;
	size: number;
}
interface SpecialBuildInfo {
	notes?: string;
	nicknames?: string[];
	infoLink?: string;
}
interface BuilddataJSON {
	scratch1: {[index: string]: BuildInfo};
	scratch1order: string[];
	scratch2: {[index: string]: BuildInfo};
	scratch2order: string[];
	misc: {[index: string]: BuildInfo};
	miscorder: string[];
}

// filename, created date, modified date, is directory, filesize
type SqueakFileArr = [string, number, number, boolean, number];

// globals
var JSZip: any;
var SqueakJS: any;
var Squeak: any;
var RufflePlayer: any;