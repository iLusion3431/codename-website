var fs = require('fs');
const { Remarkable } = require('remarkable');

const { fixHtmlRefs, parseTemplate } = require("../utils.js");

var modsDir = "./featured-mods/";

function getValidMods() {
	var mods = [];

	var files = fs.readdirSync(modsDir);
	for(const file of files) {
		if(file.startsWith(".")) continue;
		if(!fs.existsSync(modsDir + file + "/meta.json")) continue;

		mods.push(file);
	}

	return mods;
}

function buildMods(pageDir, exportPath) {
	var warnings = [];

	var mods = [];
	var links = {};
	for(const mod of getValidMods()) {
		var meta = JSON.parse(fs.readFileSync(modsDir + mod + "/meta.json", 'utf8'));

		let modExport = exportPath + "mods/" + mod;

		if(!fs.existsSync(modExport)) fs.mkdirSync(modExport, { recursive: true });

		var imageExt = null;
		if(fs.existsSync(modsDir + mod + "/cover.jpg")) {
			imageExt = "jpg";
		}
		else if(fs.existsSync(modsDir + mod + "/cover.jpeg")) {
			imageExt = "jpeg";
		}
		else if(fs.existsSync(modsDir + mod + "/cover.png")) {
			imageExt = "png";
		}

		var imgLink;

		if(imageExt == null) {
			//warnings.push("No cover image found for mod: " + meta.name);
			imgLink = "img/missing.png";
		} else {
			fs.copyFileSync(modsDir + mod + "/cover." + imageExt, modExport + "/cover." + imageExt);
			imgLink = "./mods/" + mod + "/cover." + imageExt;
		}

		if(meta.link != null && meta.link != "") {
			if(links[meta.link]) {
				warnings.push("Duplicate link: " + meta.link + " (mod: " + meta.name + " and " + links[meta.link] + ")");
			}
			links[meta.link] = meta.name;
		}

		var tags = meta.tags ?? [];

		mods.push({
			name: meta.name,
			description: meta.description,
			image: imgLink,
			link: meta.link,
			tags: tags,
			tagsRaw: (tags).join(","),
			author: meta.author,
			source: meta.source,
			version: meta.version,
			lastUpdated: meta.lastUpdated ?? "unknown",
			premium: tags.includes("premium")
		});
	}

	mods.sort((a, b) => a.name.localeCompare(b.name));
	return {mods, warnings};
}

var header = fs.readFileSync("./src/pages/templates/header.html", 'utf8');

function buildHtml(_pageDir, _exportPath) {
	var pageDir = _pageDir + "mods/";
	var exportPath = _exportPath + "mods/";
	if (!fs.existsSync(exportPath)) {
		fs.mkdirSync(exportPath, {recursive: true});
	}

	var mods = getValidMods();

	var templatePage = fs.readFileSync("./src/pages/templates/mod.html", 'utf8');

	var renderer = new Remarkable({
		html: true,
	});

	for(const mod of mods) {
		var meta = JSON.parse(fs.readFileSync(modsDir + mod + "/meta.json", 'utf8'));

		let modExport = exportPath + mod;

		var imageExt = null;
		if(fs.existsSync(modsDir + mod + "/cover.jpg")) {
			imageExt = "jpg";
		}
		else if(fs.existsSync(modsDir + mod + "/cover.jpeg")) {
			imageExt = "jpeg";
		}
		else if(fs.existsSync(modsDir + mod + "/cover.png")) {
			imageExt = "png";
		}

		var imgLink;

		if(imageExt == null) {
			//warnings.push("No cover image found for mod: " + meta.name);
			imgLink = "img/missing.png";
		} else {
			fs.copyFileSync(modsDir + mod + "/cover." + imageExt, modExport + "/cover." + imageExt);
			imgLink = "root/mods/" + mod + "/cover." + imageExt;
		}

		var tags = meta.tags ?? [];

		var content = "";
		if(fs.existsSync(modsDir + mod + "/desc.md")) {
			content = fs.readFileSync(modsDir + mod + "/desc.md", 'utf8');
		}

		var vars = {
			modName: meta.name,
			pageTitle: meta.name,
			cover: imgLink,
			description: meta.description,
			link: meta.link,
			tags: tags,
			tagsRaw: (tags).join(","),
			author: meta.author,
			source: meta.source,
			version: meta.version,
			lastUpdated: meta.lastUpdated ?? "unknown",

			header: header,
			content: renderer.render(content),
		};

		let html = parseTemplate(templatePage, vars);

		var dom = fixHtmlRefs(html, pageDir, _pageDir);

		console.log(mod);

		//console.log(data);
		fs.writeFileSync(
			exportPath + mod + "/index.html",
			dom.serialize(),
			'utf8'
		);
	}
}

module.exports = {
	buildMods: buildMods,
	buildHtml: buildHtml,
}