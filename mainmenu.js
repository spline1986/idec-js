function generateEcholist(echoareas) {
	let table = "";
	echoareas.forEach((echoarea) => {
		let news = false;
		let cols = echoarea.split(":");
		let cells = [cols[0], cols[1], cols.slice(2).join(":")];
		if (!localStorage.getItem(cols[0])) {
			localStorage.setItem(cols[0], [null, cells[2]]);
		}
		let saved = localStorage.getItem(cols[0]).split(",");
		saved = [saved[0], saved.slice(1).join(",")];
		if (saved[0] < cols[1] - 1) {
			news = true
		}
		table += "<tr onclick='readEchoarea(\"" + cells[0] + "\", false)'>\n";
		cells.forEach((cell) => {
			if (news) {
				table += "<td><b>" + cell + "<b></td>\n";
			} else {
				table += "<td>" + cell + "</td>\n";
			}
		});
		table += "</tr>\n";
	});
	return table;
}

export function mainMenu() {
	let params = new URLSearchParams(window.location.search);
	if (params.has("area") && params.has("msgid")) {
		let echoarea = params.get("area");
		let msgid = params.get("msgid");
		readEchoarea(echoarea, msgid);
	} else {
		document.title = "IDEC-JS";
		document.getElementById("mainmenu").style.display = "block";
		document.getElementById("echolist").innerHTML = "";
		document.getElementById("menuheader").style.display = "none";
		document.getElementById("menuloader").style.display = "inline";
		async function get() {
			let r = await fetch(idec_config["node"] + "list.txt");
			let echoareas = await r.text();
			echoareas = echoareas.split("\n").filter((n) => n.length >0);
			let table = generateEcholist(echoareas);
			return table;
		}

		get().then(
			function(result) {
				document.getElementById("echolist").insertAdjacentHTML("beforeend", result);
				document.getElementById("menuloader").style.display = "none";
				document.getElementById("mainmenu").style.display = "block";
				document.getElementById("menuheader").style.display = "block";
			});
	}
}

document.addEventListener("DOMContentLoaded", mainMenu);
