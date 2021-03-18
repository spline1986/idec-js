import "./config.js"
import * as menu from "./mainmenu.js"
import * as writer from "./writer.js"
import "./style.css"

(function() {
	let idecJS = {
		echoarea: "",
		description: "",
		msgids: [],
		n: 0,
	}
	let cache = {};
	let cacheIndex = [];

	function addToCache(msgid, message) {
		cache[msgid] = message;
		if (cacheIndex.length > 100) {
			delete cache[cacheIndex.shift()];
		}
		cacheIndex.push(msgid);
	}

	async function getMessage(msgid) {
		let message = ""
		if (cache[msgid]) {
			message = cache[msgid];
		} else {
			let r = await fetch(idec_config["node"] + "m/" + msgid);
			message = await r.text();
			addToCache(msgid, message);
		}
		return message;
	}

	function zeroFill(item) {
		return ("00" + item).slice(-2);
	}

	function renderHeader(header) {
		let html = "";
		html += "<p>\n";
		html += header[3] + " → " + header[5] + "<br>";
		let date = new Date(header[2] * 1000);
		let day = zeroFill(date.getUTCDate());
		let month = zeroFill(date.getUTCMonth() + 1);
		let hours = zeroFill(date.getUTCHours());
		let minutes = zeroFill(date.getUTCMinutes());
		html += day + "." + month + "." + date.getUTCFullYear() + " "
		html += hours + ":" + minutes + " UTC<br>";
		html += header[6];
		html += "</p>\n";
		return html;
	}

	function replaceLinks(text) {
		var regex = /((http|https|ftp):\/\/[^\s]+)/g;
		return text.replace(regex, function(url) {
			return '<a target="_blank" href="' + url + '">' + url + '</a>';
		})
	}

	function renderMessage(message) {
		let html = "<h1>" + idecJS.echoarea + "&nbsp;</h1>";
		html += "<h3>" + idecJS.description + "</h3>";
		document.getElementById("reader-title").innerHTML = html;
		let lines = replaceLinks(message).split("\n");
		html = "<div class='right'>";
		html += "<a class='button' onclick='showWriter(\""
			+ idec_config["node"] + "\", \""
			+ idecJS.echoarea + "\", \""
			+ idecJS.description +
			"\", \"Новое сообщение\")'>Новое сообщение</a></div>";
		html += "<p>Сообщение " + (idecJS.n + 1) + " из " + idecJS.msgids.length + "</p>";
		let header = lines.slice(0, 7);
		let body = lines.slice(7);
		html += renderHeader(header);
		html +="<p>\n";
		body.forEach((line) => { html += "\n" + line + "<br>\n" });
		html +="</p>\n";
		return html;
	}

	function readMessage() {
		let msg = ""
		let msgid = idecJS.msgids[idecJS.n];
		document.getElementById("readloader").style.display = "block";
		getMessage(msgid).then((message) => {
			let echoRecord = localStorage.getItem(idecJS.echoarea).split(",");
			echoRecord = [echoRecord[0], echoRecord.slice(1).join(",")];
			localStorage.setItem(idecJS.echoarea, [idecJS.n, echoRecord[1]]);
			document.getElementById("readloader").style.display = "none";
			document.getElementById("reader-content").innerHTML = renderMessage(message);
			let queryParams = new URLSearchParams(window.location.search);
			queryParams.set("area", idecJS.echoarea);
			queryParams.set("msgid", idecJS.msgids[idecJS.n]);
			history.pushState({"msgid": msgid}, "", "index.html?"+queryParams.toString());
			window.scrollTo(0, 0);
		});
	}

	async function get_index(echoarea) {
		let r = await fetch(idec_config["node"] + "e/" + echoarea);
		let msgids = await r.text();
		return msgids
	}

	function showPanelOrHelper() {
		if (getComputedStyle(document.getElementById("helper"))["top"] != "0px") {
			document.getElementById("helper").style.display = "block";
		} else {
			document.getElementById("panel").style.display = "block";
		}
	}

	function calculateIndexOffset(echoarea, echoRecord, msgid) {
		if (msgid) {
			idecJS.n = idecJS.msgids.indexOf(msgid);
		} else {
			if (!echoRecord[0]) {
				idecJS.n = idecJS.msgids.length - 1;
				localStorage.setItem(echoarea, [idecJS.n, echoRecord[1]]);
			} else {
				idecJS.n = Number(echoRecord[0]);
			}
		}
	}

	function buildMsgids(result) {
		idecJS.msgids = result;
		idecJS.msgids = idecJS.msgids.split("\n").filter((n) => n.length > 0);
	}

	function readEchoarea(echoarea, msgid) {
		idecJS.echoarea = echoarea;
		idecJS.msgid = "";
		document.title = "IDEC-JS: " + echoarea;
		document.getElementById("mainmenu").style.display = "none";
		showPanelOrHelper();
		document.getElementById("reader").style.display = "block";
		document.getElementById("readloader").style.display = "block";
		let echoRecord = localStorage.getItem(echoarea).split(",");
		if (echoRecord) {
			echoRecord = [echoRecord[0], echoRecord.slice(1).join(",")];
			idecJS.description = echoRecord[1];
		}
		let html = "<h1>" + idecJS.echoarea + "&nbsp;</h1>";
		html += "<h3>" + idecJS.description + "</h3>";
		document.getElementById("reader-title").innerHTML = html;
		get_index(echoarea).then(function(result) {
			buildMsgids(result);
			calculateIndexOffset(echoarea, echoRecord, msgid);
			readMessage();
		});
	}
	window.readEchoarea = readEchoarea;

	function prevMessage() {
		if (idecJS.n > 0) {
			idecJS.n -=1;
			readMessage();
		}
	}
	window.prevMessage = prevMessage;

	function nextMessage() {
		if (idecJS.n + 1 < idecJS.msgids.length) {
			idecJS.n +=1;
			readMessage();
		}
	}
	window.nextMessage = nextMessage;

	function firstMessage() {
		idecJS.n = 0;
		readMessage();
	}
	window.firstMessage = firstMessage;

	function lastMessage() {
		idecJS.n = idecJS.msgids.length - 1;
		readMessage();
	}
	window.lastMessage = lastMessage;

	function backToMenu() {
		let queryParams = new URLSearchParams(window.location.search);
		queryParams.delete("area");
		queryParams.delete("msgid");
		history.replaceState(null, null, "?"+queryParams.toString());
		document.getElementById("panel").style.display = "none";
		document.getElementById("readloader").style.display = "none";
		document.getElementById("helper").style.display = "none";
		document.getElementById("writer").style.display = "none";
		document.getElementById("reader").style.display = "none";
		document.getElementById("reader-title").innerHTML = "";
		document.getElementById("reader-popup").innerHTML = "";
		document.getElementById("reader-content").innerHTML = "";
		menu.mainMenu();
	}
	window.backToMenu = backToMenu;

	window.showWriter = writer.showWriter;
	window.hideWriter = writer.hideWriter;

	document.addEventListener('keydown', function(event) {
		if (document.getElementById("writer").style.display == "none") {
			if (event.code == "ArrowLeft" && !event.shiftKey) {
				prevMessage();
			} else if (event.code == "ArrowRight" && !event.shiftKey) {
				nextMessage();
			} else if (event.code == "KeyB") {
				firstMessage();
			} else if (event.code == "KeyE") {
				lastMessage();
			} else if (event.code == "Escape") {
				backToMenu();
			}
		} else {
			if (event.code == "Escape") {
				hideWriter();
				readEchoarea(idecJS.echoarea, false);
			}
		}
	});
})();
