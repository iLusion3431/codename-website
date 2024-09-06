const { Remarkable } = require('remarkable');
var path = require("path");
var Mustache = require('mustache');
var jsdom = require("jsdom");
var fs = require('fs');
var hljs = require('highlight.js');

var { fixHtmlRefs, copyImage } = require("../utils.js");
const { trace } = require('console');

var header = fs.readFileSync("./src/pages/templates/header.html", 'utf8');

function generateSidebar(list, basePath = '', selected = null) {
	let html = '';

	list.forEach(item => {
		var visualName = item[0];
		if(item.length > 1 && item[1] != null) {
			visualName = item[1];
		}
		//console.log(visualName);
		visualName = visualName.replace("UNFINISHED", "<span style='color: #FF0000;'>UNFINISHED</span>")
		var hasChildren = item.length > 2 && item[2] != null;
		html += `<li class="sidebar-list-item">`;
		var href = `/${basePath}/${item[0]}.md`;
		var isSelected = href.replace(/^\/+/g, "") == selected.replace(/^\/+/g, "");

		var classAttr = isSelected ? ` class="selected"` : "";
		html += `<a href="${href}"${classAttr}>${visualName}</a>`;

		if(hasChildren) {
			var path = item[0].split("/")[0];
			const subPath = basePath ? `${basePath}/${path}` : path;
			html += `<ul class="sidebar-unordered-list">\n`;
			html += generateSidebar(item[2], subPath, selected);
			html += `</ul>\n`;
		}
		html += `</li>\n`;
	});

	return html;
}

var wikiDir = "docs/";

var sidebarRaw = fs.readFileSync("./src/pages/wiki.json", "utf8");
var parsedSidebar = JSON.parse(sidebarRaw);

function buildHtml(_pageDir, _exportPath) {
	var pageDir = _pageDir + "wiki/";
	var exportPath = _exportPath + "wiki/";
	if (!fs.existsSync(exportPath)) {
		fs.mkdirSync(exportPath, {recursive: true});
	}
	console.log("Building Wiki");

	var templatePage = fs.readFileSync("./src/pages/wiki.html", 'utf8');
	var filenames = fs.readdirSync("./src/" + wikiDir, {recursive: true});
	var renderer = new Remarkable({
		html: true,
	});

	var changedImages = {};

	for (i of filenames) {
		var parsedName = path.parse(i);
		var ext = parsedName.ext;
		if (ext == "" && !fs.existsSync(exportPath + i))
			fs.mkdirSync(exportPath + i, {recursive: true});
		if (ext == ".png" || ext == ".jpg" || ext == ".jpeg" || ext == ".gif") {
			if(ext == ".png") {
				console.log("Converting " + i + " to jpg");
				changedImages[i] = true;
			}
			copyImage("./src/" + wikiDir + i, exportPath + i);
			//fs.copyFile("./src/" + wikiDir + i, exportPath + i, () => {});
		}
	}

	for (i of filenames) {
		var parsedName = path.parse(i);
		var ext = parsedName.ext;
		if (ext == ".md") {
			var filename = parsedName.name;

			var sidebar = generateSidebar(parsedSidebar, "", i);
			var vars = {
				title: filename.replace(".md", ""),
				content: renderer.render(fs.readFileSync("./src/" + wikiDir + i, 'utf8')),
				sidebar: sidebar,
				header: header
			};
			console.log(i);

			var html = Mustache.render(templatePage, vars, null, {
				escape: function(text) {
					return text;
				}
			});

			var dom = fixHtmlRefs(html, pageDir, _pageDir);

			var imageSrcs = dom.window.document.querySelectorAll("[src]");

			for(const image of imageSrcs) {
				image.src = image.src.replace(/\.png$/, ".jpg");
			}

			//console.log(data);
			fs.writeFileSync(
				exportPath + i.replace(".md", ".html"),
				dom.serialize(),
				'utf8'
			);
		}
	}
};

module.exports = {
	buildHtml: buildHtml
}