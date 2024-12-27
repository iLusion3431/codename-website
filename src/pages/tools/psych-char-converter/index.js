(function () {
var input = document.getElementById("input");
var output = document.getElementById("output");

var dropzone = document.getElementById("dropzone");
var fileInput = document.getElementById("file");

var saveButton = document.getElementById("save");

var fileNameDisplay = document.getElementById('file-name');

saveButton.addEventListener("click", function (e) {
	e.preventDefault();
	var outputValue = output.value.trim();
	if(outputValue == "") {
		alert("Please paste your character data first!");
		return;
	}
	var fileName = !lastFile ? "character.xml" : lastFile.name.replace(/\.json$/, ".xml");
	saveFile(outputValue, fileName);
});

function saveFile(content, filename) {
	var blob = new Blob([content], { type: "text/plain;charset=utf-8" });
	_saveFileBlob(blob, filename);
}

function saveBinaryFile(content, filename) {
	var blob = new Blob([content], { type: "application/octet-stream" });
	_saveFileBlob(blob, filename);
}

function _saveFileBlob(blob, filename) {
	var link = document.createElement("a");
	link.href = URL.createObjectURL(blob);
	link.download = filename;
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
}

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
	dropzone.addEventListener(eventName, preventDefaults, false);
	document.body.addEventListener(eventName, preventDefaults, false);
});

['dragenter', 'dragover'].forEach(eventName => {
	dropzone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop', "dragend"].forEach(eventName => {
	dropzone.addEventListener(eventName, unhighlight, false);
});

dropzone.addEventListener('drop', handleDrop, false);

function preventDefaults(e) {
	e.preventDefault();
	e.stopPropagation();
}

var highlightTimeout = null;

function highlight() {
	dropzone.classList.add('highlight');
	clearTimeout(highlightTimeout);
	highlightTimeout = setTimeout(() => {
		unhighlight();
	}, 1000);
}

function unhighlight() {
	dropzone.classList.remove('highlight');
}

function handleDrop(e) {
	var dt = e.dataTransfer;
	var files = dt.files;
	handleFiles(files);
}

var lastFile = null;

fileInput.addEventListener('change', () => {
	handleFiles(fileInput.files);
}, false);

function handleFiles(files) {
	var filename = "No file chosen";
	var fileArray = Array.from(files);
	if(fileArray.length > 0) {
		var files = fileArray.filter(file => file.type.startsWith("application/json"));
		if(files.length > 0) {
			var file = files[0];
			filename = file.name;
			lastFile = file;
			var reader = new FileReader();
			reader.onload = function(e) {
				input.value = e.target.result;

				var xml = convert(input.value);
				output.value = xml;
			};
			reader.readAsText(file);
		}
	}
	fileNameDisplay.textContent = filename;
}

/*@__PURE__*/
function formatNumberRange(numbers, separator = ",") {
	if (numbers.length === 0) return "";

	var result = [];
	var i = 0;

	while (i < numbers.length) {
		var start = numbers[i];
		var end = start;
		var direction = 0; // 0: no sequence, 1: increasing, -1: decreasing

		if (i + 1 < numbers.length) { // detect direction of sequence
			if (numbers[i + 1] === end + 1) {
				direction = 1;
			} else if (numbers[i + 1] === end - 1) {
				direction = -1;
			}
		}

		if (direction !== 0) {
			while (i + 1 < numbers.length && (numbers[i + 1] === end + direction)) {
				end = numbers[i + 1];
				i++;
			}
		}

		if (start === end) { // no direction
			result.push(start);
		} else if (start + direction === end) { // 1 step increment
			result.push(start + "," + end);
		} else { // store as range
			result.push(start + ".." + end);
		}

		i++;
	}

	return result.join(separator);
}

var convertFolderButton = document.getElementById("convert-folder");
convertFolderButton.addEventListener("change", () => {
	var files = convertFolderButton.files;
	var promises = [];
	var zip = new JSZip();

	var currDate = new Date();
	// sets the date to be fixed
	JSZip.defaults.date = new Date(currDate.getTime() - currDate.getTimezoneOffset() * 60000);

	var convertFile = file => {
		return new Promise((resolve, reject) => {
			var reader = new FileReader();
			reader.onload = function(event) {
				zip.file(file.name.replace('.json', '.xml'), convert(event.target.result));
				//console.log('converted ' + file.name);
				resolve("wiz really likes furries");
			};
			reader.readAsText(file);
		});
	}

	for(var file of files) {
		if (file.name.includes('.json')) {
			promises.push(convertFile(file));
		}
	}

	Promise.all(promises).then(() => {
		zip.generateAsync({type:"blob"}).then(function(content) {
			saveBinaryFile(content, "characters.zip");
		});
	});
});

/*@__PURE__*/
function std_parseInt() {
	var v = parseInt(x);
	if(isNaN(v)) {
		return null;
	}
	return v;
}

var colorMapping = {
	"TRANSPARENT":0x00000000,
	"WHITE":0xFFFFFFFF,
	"GRAY":0xFF808080,
	"BLACK":0xFF000000,
	"GREEN":0xFF008000,
	"LIME":0xFF00FF00,
	"YELLOW":0xFFFFFF00,
	"ORANGE":0xFFFFA500,
	"RED":0xFFFF0000,
	"PURPLE":0xFF800080,
	"BLUE":0xFF0000FF,
	"BROWN":0xFF8B4513,
	"PINK":0xFFFFC0CB,
	"MAGENTA":0xFFFF00FF,
	"CYAN":0xFF00FFFF,
}

var COLOR_REGEX = /^(0x|#)(([A-F0-9]{2}){3,4})$/i;
/*@__PURE__*/
function colorFromString(str) {
	var result = null;
	if (COLOR_REGEX.test(str)) {
		var match = COLOR_REGEX.exec(str);
		var hexColor = "0x" + match[2];
		result = std_parseInt(hexColor);
		if (hexColor.length == 8) {
			result = result | 0xFF000000;
		}
	} else {
		if (colorMapping.hasOwnProperty(str.toUpperCase())) {
			result = colorMapping[str.toUpperCase()];
		}
	}

	return result;
}

/*@__PURE__*/
function hex(num, size) {
	var s = num.toString(16);
	while (s.length < size) {
		s = "0" + s;
	}
	return s;
}

/*@__PURE__*/
function fromRGBArray(arr) {
	var r = arr[0];
	var g = arr[1];
	var b = arr[2];
	return 0xFF000000 | (r << 16) | (g << 8) | b;
}

/*@__PURE__*/
function toWebColor(color, Alpha=true, Prefix=true) {
	var color = color | 0;
	var alpha = (color >> 24) & 0xFF;
	var red = (color >> 16) & 0xFF;
	var green = (color >> 8) & 0xFF;
	var blue = color & 0xFF;
	var prefix = Prefix ? "#" : "";
	return prefix + (Alpha ? hex(alpha, 2) : "") + hex(red, 2) + hex(green, 2) + hex(blue, 2);
}

/*@__PURE__*/
function convertRGBArrayToHex(color) {
	return "#" + hex(color[0] & 0xFF, 2) + hex(color[1] & 0xFF, 2) + hex(color[2] & 0xFF, 2);
}

/*@__PURE__*/
function roundDecimal(number, decimals) {
	var pow = Math.pow(10, decimals);
	return Math.round(number * pow) / pow;
}


function convert(jsonInput) {
	var json = JSON.parse(jsonInput);

	var xmlOutput = "<!DOCTYPE codename-engine-character>\n<!-- Made with WizardMantis's Character Converter on https://codename-engine.com/ -->\n<character";

	var jsonPosition = json.position;
	var jsonCameraPos = json.camera_position;
	var jsonSingDuration = json.sing_duration;
	var jsonScale = json.scale;
	var jsonImage = json.image;

	if(jsonImage.startsWith("characters/")) {
		jsonImage = jsonImage.slice(11);
	}
	xmlOutput += ` sprite="${jsonImage}"`;
	xmlOutput += ` icon="${json.healthicon}"`;
	xmlOutput += ` color="${convertRGBArrayToHex(json.healthbar_colors)}"`;

	if (jsonPosition[0] !== 0)	xmlOutput += ` x="${jsonPosition[0]}"`;
	if (jsonPosition[1] !== 0)	xmlOutput += ` y="${jsonPosition[1]}"`;
	if (json.flip_x)			xmlOutput += ` flipX="true"`;
	if (json.no_antialiasing)	xmlOutput += ` antialiasing="false"`;
	if (jsonCameraPos[0] !== 0)	xmlOutput += ` camx="${jsonCameraPos[0]}"`;
	if (jsonCameraPos[1] !== 0)	xmlOutput += ` camy="${jsonCameraPos[1]}"`;
	if (jsonSingDuration !== 4)	xmlOutput += ` holdTime="${jsonSingDuration}"`;
	if (jsonScale !== 1)		xmlOutput += ` scale="${jsonScale}"`;

	xmlOutput += ">\n"

	json.animations.forEach(function (a) {
		xmlOutput += `\t<anim name="${a.anim}" anim="${a.name}"`;
		var xOffset = a.offsets[0] / jsonScale;//roundDecimal(a.offsets[0] / scale, 5);
		var yOffset = a.offsets[1] / jsonScale;//roundDecimal(a.offsets[1] / scale, 5);
		var needsOffset = xOffset !== 0 || yOffset !== 0;
		if (needsOffset)			xmlOutput += ` x="${xOffset}" y="${yOffset}"`;
		if (a.fps !== 24)			xmlOutput += ` fps="${a.fps}"`;
		if (a.loop)					xmlOutput += ` loop="true"`;
		if (a.indices.length !== 0)	xmlOutput += ` indices="${formatNumberRange(a.indices)}"`;
		xmlOutput += '/>\n'
	});

	xmlOutput += "</character>";

	return xmlOutput;
}
})();