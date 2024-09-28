function randomizeOrder() {
	var mods = document.querySelectorAll(".featured-mod");
	var parent = mods[0].parentNode;
	var modsArray = Array.from(mods);

	for (var i = modsArray.length - 1; i > 0; i--) {
		var j = Math.floor(Math.random() * (i + 1));
		var temp = modsArray[i];
		modsArray[i] = modsArray[j];
		modsArray[j] = temp;
	}

	parent.innerHTML = "";
	for (var i = 0; i < modsArray.length; i++) {
		parent.appendChild(modsArray[i]);
	}
}

function sortByTime(a, b) {
	var aTime = a.getAttribute("data-time");
	var bTime = b.getAttribute("data-time");
	if(aTime == "unknown") return 1;
	if(bTime == "unknown") return -1;
	return new Date(bTime) - new Date(aTime);
}

function recentOrder() {
	var mods = document.querySelectorAll(".featured-mod");
	var parent = mods[0].parentNode;
	var modsArray = Array.from(mods);

	var sorted = modsArray.sort(sortByTime);
	parent.innerHTML = "";
	for (var i = 0; i < sorted.length; i++) {
		parent.appendChild(sorted[i]);
	}
}

var sortButtons = document.querySelectorAll(".sort-button");
var orderButtons = document.querySelectorAll(".order-button");
var categoryButtons = document.querySelectorAll(".category-button");
sortButtons.forEach(button => {
	button.addEventListener("click", function(e) {
		e.preventDefault();
		var sort = button.getAttribute("data-sort");
		if(sort == "recent" || sort == "random") {
			if(sort == "random") {
				randomizeOrder();
			} else {
				recentOrder();
			}

			orderButtons.forEach(button => {
				button.classList.remove("selected");
			});
			button.classList.add("selected");
		} else {
			if(sort == "all") {
				document.querySelectorAll(".featured-mod").forEach(mod => {
					if(mod.classList.contains("upcoming")) {
						mod.style.display = "none";
					} else {
						mod.style.display = "block";
					}
				});
			} else {
				document.querySelectorAll(".featured-mod").forEach(mod => {
					mod.style.display = "none";
				});
				document.querySelectorAll(".featured-mod." + sort).forEach(mod => {
					if(sort != "upcoming" && mod.classList.contains("upcoming")) {
						mod.style.display = "none";
					} else {
						mod.style.display = "block";
					}
				});
			}

			categoryButtons.forEach(button => {
				button.classList.remove("selected");
			});
			button.classList.add("selected");
		}
	});
});

randomizeOrder();

function getRelativeTimeString(
	date, // Date | number
	lang = "en" // navigator.language
) {
	const timeMs = typeof date === "number" ? date : date.getTime();
	const deltaSeconds = Math.round((timeMs - Date.now()) / 1000);
	const cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity];
	const units = ["second", "minute", "hour", "day", "week", "month", "year"];
	const unitIndex = cutoffs.findIndex(cutoff => cutoff > Math.abs(deltaSeconds));
	const divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;
	const rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
	return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex]);
}

var lastUpdated = document.querySelectorAll(".last-updated");
if(lastUpdated.length > 0 && window.Intl) {
	const rtf1 = new Intl.RelativeTimeFormat('en', { style: 'short' });
	lastUpdated.forEach(lastUpdated => {
		var time = lastUpdated.getAttribute("data-time");
		if(time != "unknown" && time != null && time != "unreleased") {
			lastUpdated.innerText = getRelativeTimeString(new Date(time));
			lastUpdated.style.display = "inline";
		}
		if(time == "unreleased") {
			lastUpdated.style.display = "inline";
		}
	});
}