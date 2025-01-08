var fs = require('fs');

var { fixHtmlRefs, copyDir, parseTemplate, htmlToString } = require("../utils.js");

var header = fs.readFileSync("./src/pages/templates/header.html", 'utf8');

function buildHtml(_pageDir, _exportPath) {
	var pageDir = _pageDir + "/";
	var exportPath = _exportPath + "/";
	if (!fs.existsSync(exportPath)) {
		fs.mkdirSync(exportPath, {recursive: true});
	}
	console.log("Building 404 Page");

	var path = "./src/pages/404.html";
	var outPath = exportPath + "404.html";
	var templatePage = fs.readFileSync(path, 'utf8');
	var vars = {
		pageTitle: "Page Not Found",
		title: "Page Not Found",
		header: header,
	};

	let html = parseTemplate(templatePage, vars);

	var dom = fixHtmlRefs(html, pageDir, _pageDir);

	//console.log(data);
	fs.writeFileSync(
		outPath,
		htmlToString(dom),
		'utf8'
	);
}

module.exports = {
	buildHtml: buildHtml
}