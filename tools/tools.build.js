var fs = require('fs');
var { fixHtmlRefs, htmlToString, parseTemplate, compileJs, copyDir } = require("../src/utils.js");

var header = fs.readFileSync("./src/pages/templates/header.html", 'utf8')

const tools = [
	{
		link: "index",
		title: "Home",
		desc: "Home of the tools",
		internal: true
	},
	{
		link: "event-packer",
		title: "Event Packer",
		desc: "Tool to pack events for the engine"
	},
	{
		link: "https://neeeoo.github.io/funkin-packer/",
		title: "Funkin Packer",
		desc: "Tool to pack and repack spritesheets",
		external: true,
	},
	{
		link: "psych-char-converter",
		title: "Psych Character Converter",
		desc: "Convert characters from Psych Engine to Codename Engine",
	},
	{
		link: "https://tools.rotato.app/compress",
		title: "Video Compressor",
		desc: "Compress videos to reduce their size<br>(Warning: this is not a lossless compression)",
		external: true,
	},
	{
		link: "save-editor",
		title: "Save Data Editor",
		desc: "Edit flixel .sol save files",
	}
];

function buildHtml(_pageDir, _exportPath) {
	var pageDir = _pageDir + "tools/";
	var exportPath = _exportPath + "tools/";
	if (!fs.existsSync(exportPath)) {
		fs.mkdirSync(exportPath, {recursive: true});
	}
	console.log("Building Tools");

	var displayTools = tools.filter(tool => !tool.internal);

	for(const tool of tools) {
		if(tool.external) {
			continue;
		}
		var basePath = "./tools/" + tool.link + "/";
		var outputPath = exportPath + tool.link + "/";
		if(tool.link == "index") {
			basePath = "./tools/";
			outputPath = exportPath;
		}
		var path = basePath + "index.html";
		var outPath = outputPath + "index.html";

		var filePath = outPath.split("/");
		filePath.pop();
		filePath = filePath.join("/");

		if (!fs.existsSync(filePath)) {
			fs.mkdirSync(filePath, {recursive: true});
		}

		if(fs.existsSync(path.replace(/\.html$/, ".js"))) {
			var scriptPath = path.replace(/\.html$/, ".js");

			compileJs(scriptPath, outPath.replace(/\.html$/, ".js"));
		}

		if(fs.existsSync(basePath + "res/")) {
			copyDir(basePath + "res/", outputPath + "res/");
		}

		var hasBuildScript = fs.existsSync(path.replace(/\.html$/, ".build.js"));
		if(hasBuildScript) {
			var scriptPath = path.replace(/\.html$/, ".build.js");
			var script = require(scriptPath);
			script.build(pageDir, exportPath);
		}

		var templatePage = fs.readFileSync(path, 'utf8');
		var vars = {
			title: tool.title,
			header: header,
			tools: displayTools
		};
		console.log(tool.link);

		let html = parseTemplate(templatePage, vars);

		var dom = fixHtmlRefs(html, pageDir, _pageDir);

		//console.log(data);
		fs.writeFileSync(
			outPath,
			htmlToString(dom),
			'utf8'
		);
	}
}

module.exports = {
	buildHtml: buildHtml
}