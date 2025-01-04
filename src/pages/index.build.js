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
			hasMembership: donator.hasMembership,
			donations: []
		};
		var amounts = {};
		var usd = 0.0;
		for(const donation of donator.donations) {
			obj.donations.push({
				amount: donation.amount,
				currency: donation.currency,
				type: donation.type
			});
			amounts[donation.currency] = (amounts[donation.currency] ?? 0) + donation.amount;

			usd += donation.usdAmount ?? donation.amount;
		}

		var amountString = [];
		for(const currency in amounts) {
			amountString.push(amounts[currency] + " " + currency);
		}
		amountString = amountString.join(", ");

		var siteObj = {
			name: donator.name,
			profilePicture: donator.profilePicture,
			amount: usd + " $",//amountString,
			totalAmount: usd,
			hasMembership: obj.hasMembership
		};
		donators.push(siteObj);
		if(donator.hasMembership) {
			members.push(siteObj);
		}
	}

	donators.sort((a, b) => b.totalAmount - a.totalAmount);

	var path = "./src/pages/index.html";
	var outPath = exportPath + "index.html";
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
		outPath,
		htmlToString(dom),
		'utf8'
	);
}

module.exports = {
	buildHtml: buildHtml
}