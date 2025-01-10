(function() {

	/**@__PURE__*/
	function minimizeCss( content ) {
		content = content.trim();
		content = content.replace( /\n/g, '' );
		content = content.replace( /\t/g, '' );
		// sadly i cant include more optimizations since minification wont pre run the replacements
		return content;
	}

	/*

	// Cause a whole new rendering layer
	transform: translateZ(0px);
	will-change: transform;
	*/
	var styleCss = minimizeCss(`
.countdown-container {
	display: flex;
	flex-direction: row;
	justify-content: center;

	font-size: 2em;
	height: 1.2em;
}

.days, .hours, .minutes, .seconds {
	display: flex;
	flex-direction: row;
	justify-content: center;

	overflow: hidden;
}

.digit-group {
	display: flex;
	flex-direction: row;
	justify-content: center;

	background-color: var(--primary-color);
	box-shadow: 0 0 0 2px rgba(0, 0, 0, .2) inset;

	transform: translateZ(0px);
	will-change: transform;
}

.digits {
	display: flex;
	flex-direction: column;
	transition: transform 0.3s;
}

.digit {
	width: 1.2em;
	height: 1.5em;
	color: white;
	display: flex;
	justify-content: center;
	align-items: center;
}

.spacing {
	margin-top: 0.8em;
	font-size: 0.6em;
	margin-left: 0.2em;
	margin-right: 0.6em;
}

.countdown-container.finished {
	position: relative;
}

.countdown-container.finished .days, .countdown-container.finished .hours, .countdown-container.finished .minutes, .countdown-container.finished .seconds {
	opacity: 0.25;
}

.countdown-container.finished::after {
	content: attr(data-message);
	font-size: 1.5em;
	display: flex;
	align-items: center;
	justify-content: center;
	height: 100%;
	width: 100%;
	position: absolute;
	top: 0;
	left: 0;

	pointer-events: none;
}

.invalid-date {
	color: red;
}

`);

function $$(tagName, attrs, children) {
	var el = document.createElement(tagName);
	if(attrs) {
		for(const attr in attrs) {
			var value = attrs[attr];
			if(attr == "className") {
				var classes = value.split(" ");
				for(const className of classes) {
					el.classList.add(className);
				}
			} else {
				if(typeof value == "function") {
					el[attr] = value;
				} else {
					el.setAttribute(attr, attrs[attr]);
				}
			}
		}
	}
	if(children) {
		for(let child of children) {
			if(typeof child == "string") {
				child = document.createTextNode(child);
			}
			el.appendChild(child);
		}
	}
	return el;
}

var floor = Math.floor;

/**@__PURE__*/
function getTimeDiffArr(diff) {
	if (diff <= 0) {
		return [0, 0, 0, 0];
	}

	const days = floor(diff / (1000 * 60 * 60 * 24));
	const hours = floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
	const minutes = floor((diff % (1000 * 60 * 60)) / (1000 * 60));
	const seconds = floor((diff % (1000 * 60)) / 1000);

	return [days, hours, minutes, seconds];
}

	const DAYS = 0;
	const HOURS = 1;
	const MINUTES = 2;
	const SECONDS = 3;

	const maxDigitFirst = [10, 3, 6, 6];

	class CountdownTimer extends HTMLElement {
		constructor() {
			super();
			this.attachShadow({ mode: "open" });

			const style = document.createElement("style");
			style.textContent = styleCss;
			this.shadowRoot.appendChild(style);

			var time = this.getTime();

			this.days = this.createDigitsFor(DAYS, 3);
			this.hours = this.createDigitsFor(HOURS);
			this.minutes = this.createDigitsFor(MINUTES);
			this.seconds = this.createDigitsFor(SECONDS);

			var container = document.createElement("div");
			container.classList.add("countdown-container");
			if(time == null) {
				container.setAttribute("data-message", this.getAttribute("data-date") == "awaiting-date" ? "Awaiting Date" : "Invalid Date");
				container.classList.add("finished");
			} else {
				container.setAttribute("data-message", this.getAttribute("data-message") ?? "To be deleted");
			}
			if(this.finished) {
				container.classList.add("finished");
			}

			container.appendChild($$("div", {"className": "days"}, [
				$$("div", {"className": "digit-group"}, this.days),
				this.createSpacing("d")
			]));

			container.appendChild($$("div", {"className": "hours"}, [
				$$("div", {"className": "digit-group"}, this.hours),
				this.createSpacing("h")
			]));

			container.appendChild($$("div", {"className": "minutes"}, [
				$$("div", {"className": "digit-group"}, this.minutes),
				this.createSpacing("m")
			]));

			container.appendChild($$("div", {"className": "seconds"}, [
				$$("div", {"className": "digit-group"}, this.seconds),
				this.createSpacing("s")
			]));

			this.shadowRoot.appendChild(container);

			//this.debug = document.createElement("div");
			//this.debug.classList.add("debug");
			//this.shadowRoot.appendChild(this.debug);
		}

		createDigitsFor(type, totalDigits=2) {
			var maxFirst = maxDigitFirst[type];

			var digits = [];

			//var currentTime = time[["days", "hours", "minutes", "seconds"].indexOf(type)];

			for(let i = 0; i < totalDigits; i++) {
				if(this.finished) {
					digits.push(this.createDigits(1));
				} else {
					digits.push(this.createDigits(i == 0 ? maxFirst : 10));
				}
			}
			return digits;
		}

		getTime() {
			const dateString = this.getAttribute("data-date");
			const date = new Date(dateString);

			if (isNaN(date.getTime())) {
				return null;
			}

			const now = new Date();
			const diff = date.getTime() - now.getTime();

			this.finished = diff <= 0;
			return getTimeDiffArr(diff);
		}

		createSpacing(text) {
			var container = document.createElement("div");
			container.classList.add("spacing");
			container.textContent = text;
			return container;
		}
		// if input is 5 then it returns [0, 1, 2, 3, 4]
		createDigits(num) {
			const digitsInt = [];
			for(let i = 0; i < num; i++) {
				digitsInt.push(i);
			}
			var digits = [];
			var container = document.createElement("div");
			container.classList.add("digits");
			for(const digit of digitsInt) {
				digits.push(document.createElement("div"));
				digits[digit].classList.add("digit");
				digits[digit].textContent = digit;
				container.appendChild(digits[digit]);
			}
			return container;
		}

		getDigits(num) {
			var digits = [];
			while(num > 0) {
				digits.push(num % 10);
				num = floor(num / 10);
			}
			return digits.reverse();
		}

		connectedCallback() {
			if(this.finished) {
				return;
			}
			const dateString = this.getAttribute("data-date");
			const date = new Date(dateString);

			const setDigits = (digitsElm, numberToSet, length=2) => {
				var digits = this.getDigits(numberToSet);
				while(digits.length < length) {
					digits.unshift(0);
				}

				var i = 0;
				for(const digit of digitsElm) {
					// more optimized to use translateY, since it doesn't have to repaint the whole element
					//digit.style.marginTop = "-" + (digits[i]*2.375/2) + "em";
					digit.style.transform = `translateY(-${digits[i]*(2.375/2)}em)`;
					i++;
				}
			}

			const updateCountdown = () => {
				const now = new Date();
				const diff = date.getTime() - now.getTime();

				if (diff < 0) {
					diff = 0;

					clearInterval(this.interval);
					this.container.classList.add("finished");
					this.finished = true;
				}

				const diffs = getTimeDiffArr(diff);

				setDigits(this.days, diffs[DAYS], 3);
				setDigits(this.hours, diffs[HOURS]);
				setDigits(this.minutes, diffs[MINUTES]);
				setDigits(this.seconds, diffs[SECONDS]);

				//this.debug.innerHTML = `${days}d ${hours}h ${minutes}m ${seconds}s`;
			};

			updateCountdown();
			this.interval = setInterval(updateCountdown, 1000);
		}
	}

	customElements.define("countdown-timer", CountdownTimer);

})();
