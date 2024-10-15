var fs = require('fs');
var { buildMods } = require("./mods.build.js");

var { fixHtmlRefs, copyDir, parseTemplate, htmlToString } = require("../utils.js");

var header = fs.readFileSync("./src/pages/templates/header.html", 'utf8');
var donatorsData = JSON.parse(fs.readFileSync("./donators.json", 'utf8'));

function buildHtml(_pageDir, _exportPath) {
	var pageDir = _pageDir + "/";
	var exportPath = _exportPath + "/";
	if (!fs.existsSync(exportPath)) {
		fs.mkdirSync(exportPath, {recursive: true});
	}
	console.log("Building Index Page");

    var {mods, warnings} = buildMods(pageDir, exportPath);

    var members = [];
    var donators = [];
    for(const donator of donatorsData.donators) {
        var obj = {
            name: donator.name,
            profilePicture: donator.profilePicture,
            amount: donator.amount,
            currency: donator.currency,
            hasMembership: donator.hasMembership != 0
        };
        donators.push(obj);
        if(donator.hasMembership) {
            members.push(obj);
        }
    }

    donators.sort((a, b) => b.amount - a.amount);

    var path = "./src/pages/index.html";
    var outpath = exportPath + "index.html";
    var templatePage = fs.readFileSync(path, 'utf8');
    var vars = {
        pageTitle: "Home",
        title: "Home",
        header: header,
        mods: mods,
        warnings: warnings,
        donators: donators,
        members: members,
        hasMembers: members.length > 0
    };

    let html = parseTemplate(templatePage, vars);

    var dom = fixHtmlRefs(html, pageDir, _pageDir);

    //console.log(data);
    fs.writeFileSync(
        outpath,
        htmlToString(dom),
        'utf8'
    );
}

module.exports = {
	buildHtml: buildHtml
}