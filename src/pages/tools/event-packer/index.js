(function () {
var form = document.querySelector("form");
form.addEventListener("submit", function (e) {
	e.preventDefault();

	var eventFile = document.querySelector("#event-file").files[0];
	var eventParams = document.querySelector("#event-params").files[0];
	var eventImage = document.querySelector("#event-image").files[0];
	var separator = '________PACKSEP________';

	var promises = [readFile(eventFile), readFile(eventParams)];
	if(eventImage) {
		promises.push(getImageBase64(eventImage));
	}

	// TODO: add compression by converting 4 spaces to tabs, and more

	Promise.all(promises)
		.then(([hscriptText, jsonFileText, imageDataURL]) => {
			//if(!imageDataURL) {
			//	imageDataURL = "assets/images/editors/charter/event-icons/Unknown.png";
			//}
			var toPack = [
				eventFile.name,
				hscriptText,
				jsonFileText
			];
			if(imageDataURL) {
				toPack.push(imageDataURL);
			}

			var packText = toPack.join(separator);

			saveFile(packText, eventFile.name.replace(/\.(hx|hscript|hxs|hsc)$/, ".pack"));
		})
		.catch(error => console.error("Error processing files:", error));
});

function readFile(file) {
	return new Promise((resolve, reject) => {
		var reader = new FileReader();
		reader.onload = () => resolve(reader.result);
		reader.onerror = reject;
		reader.readAsText(file);
	});
}

function getImageBase64(file) {
	return new Promise((resolve, reject) => {
		var reader = new FileReader();
		reader.onload = function () {
			if(!file.name.endsWith(".png")) {
				var img = new Image();
				img.onload = function () {
					var canvas = document.createElement("canvas");
					canvas.width = img.width;
					canvas.height = img.height;
					var ctx = canvas.getContext("2d");
					ctx.drawImage(img, 0, 0);

					var pngDataUrl = canvas.toDataURL("image/png");
					resolve(pngDataUrl.split(',')[1]);
				};
				img.onerror = reject;
				img.src = reader.result;
			}
			else {
				resolve(reader.result.split(',')[1]);
			}
		};
		reader.onerror = reject;
		reader.readAsDataURL(file); // Read the image as a Data URL
	});
}

function saveFile(content, filename) {
	var blob = new Blob([content], { type: "text/plain;charset=utf-8" });
	var link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}
})();