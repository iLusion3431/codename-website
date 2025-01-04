(function () {
function getRelativeTimeString(
    date, // Date | number
    lang = "en" // navigator.language
) {
    var timeMs = typeof date === "number" ? date : date.getTime();
    var deltaSeconds = Math.round((timeMs - Date.now()) / 1000);
    var cutoffs = [60, 3600, 86400, 86400 * 7, 86400 * 30, 86400 * 365, Infinity];
    var units = ["second", "minute", "hour", "day", "week", "month", "year"];
    var unitIndex = cutoffs.findIndex(cutoff => cutoff > Math.abs(deltaSeconds));
    var divisor = unitIndex ? cutoffs[unitIndex - 1] : 1;
    var rtf = new Intl.RelativeTimeFormat(lang, { numeric: "auto" });
    return rtf.format(Math.floor(deltaSeconds / divisor), units[unitIndex]);
}

var lastUpdated = document.querySelectorAll(".last-updated");
if(lastUpdated.length > 0 && window.Intl) {
    lastUpdated.forEach(lastUpdated => {
        var time = lastUpdated.getAttribute("data-time");
        var finalDisplay = lastUpdated.getAttribute("data-display");
        if(!finalDisplay) finalDisplay = "inline";

        var prefix = lastUpdated.getAttribute("data-prefix");
        if(!prefix) prefix = "";

        if(time == "unreleased") {
            lastUpdated.textContent = prefix + "unreleased";
            lastUpdated.style.display = finalDisplay;
        } else if(time != "unknown" && time) {
            lastUpdated.textContent = prefix + getRelativeTimeString(new Date(time));
            lastUpdated.style.display = finalDisplay;
        }
    });
}
})();