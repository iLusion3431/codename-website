const { Remarkable } = require('remarkable');
var path = require("path");
var Mustache = require('mustache');
var jsdom = require("jsdom");
var fs = require('fs');
var hljs = require('highlight.js');
var { fixHtmlRefs, htmlToString } = require("../../utils.js");

var header = fs.readFileSync("./src/pages/templates/header.html", 'utf8')

function buildHtml(_pageDir, _exportPath) {
	var pageDir = _pageDir + "tools/";
	var exportPath = _exportPath + "tools/";
	if (!fs.existsSync(exportPath)) {
		fs.mkdirSync(exportPath, {recursive: true});
	}
	console.log("Building Tools");

	var tools = [
		"index",
		"event-packer"
	];

	for(const tool of tools) {
		var path = "./src/pages/tools/" + tool + "/index.html";
		var outpath = exportPath + tool + "/index.html";
		if(tool == "index") {
			path = "./src/pages/tools/index.html";
			outpath = exportPath + "index.html";
		}

		var filePath = outpath.split("/");
		filePath.pop();
		filePath = filePath.join("/");

		if (!fs.existsSync(filePath)) {
			fs.mkdirSync(filePath, {recursive: true});
		}
		var templatePage = fs.readFileSync(path, 'utf8');
		var vars = {
			title: tool,
			header: header
		};
		console.log(tool);

		let html = templatePage;
		let old;
		do {
			old = html;
			html = Mustache.render(html, vars, null, {
				escape: function(text) {
					return text;
				}
			});
		} while(html != old);

		var dom = fixHtmlRefs(html, pageDir, _pageDir);

		//console.log(data);
		fs.writeFileSync(
			outpath,
			htmlToString(dom),
			'utf8'
		);
	}
}

module.exports = {
	buildHtml: buildHtml
}