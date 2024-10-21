var path = require("path");
var fs = require('fs');

var { fixHtmlRefs, copyDir, parseTemplate, htmlToString, compileSass, compileJs } = require("../../utils.js");
var header = fs.readFileSync("./src/pages/templates/header.html", 'utf8')

function buildHtml(_pageDir, _exportPath) {
	var pageDir = _pageDir + "user/";
	var exportPath = _exportPath + "user/";
	if (!fs.existsSync(exportPath)) {
		fs.mkdirSync(exportPath, {recursive: true});
	}
	console.log("Building Users");

    compileSass("./src/pages/users/pages/users.scss", _exportPath + "/users.css");
    compileJs("./src/pages/users/pages/discord-signup.js", exportPath + "/discord-signup.js");

    var pages = [
        ["index", "User"],
        //["login", "Signup/Login"],
    ];

    for(const [page, title] of pages) {
        var path = "./src/pages/users/pages/" + page + ".html";
        var outpath = exportPath + page + ".html";

        var filePath = outpath.split("/");
        filePath.pop();
        filePath = filePath.join("/");

        if (!fs.existsSync(filePath)) {
            fs.mkdirSync(filePath, {recursive: true});
        }
        var templatePage = fs.readFileSync(path, 'utf8');
        var vars = {
            title: title,
            pageTitle: title,
            header: header
        };
        console.log(page);

        let html = parseTemplate(templatePage, vars);

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