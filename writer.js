function quoted_body(body) {
	let quoted = "";
	body.forEach((line) => {
		if (line.length > 0) {
			quoted += ">" + line;
		}
		quoted += "\n";
	});
	return quoted;
}

function search_cookie(cookies) {
	let value = false;
	cookies = cookies.split(";");
	cookies.forEach((cookie) => {
		if (cookie.indexOf("authstr") >= 0) {
			value = cookie.split("=")[1];
		}
	});
	return value;
}

export function showWriter(url, echoarea, description, message, subject="", body="") {
	document.getElementById("writer-title").innerHTML = "<h1>" + echoarea + "&nbsp;</h1> <h3>" + description + "</h3><br><center><b>" + message + "</b></center>";
	document.getElementById("submit").onclick = () => {
		sendMessage(url, echoarea)
	};
	document.getElementById("authstr").onkeydown = () => {
		if (event.keyCode == 13)
			sendMessage(url, echoarea);
	};
	if (subject == "") {
		document.getElementById("subject").value = "";
		document.getElementById("writer-body").value = "";
	} else {
		body = quoted_body(body.split("::::"));
		document.getElementById("subject").value = subject;
		document.getElementById("writer-body").value = body;
	}
	let cookie_authstr = search_cookie(document.cookie);
	if (cookie_authstr) {
		document.getElementById("authstr").value = cookie_authstr;
	} else {
		document.getElementById("authstr").value = "";
	}
	document.getElementById("reader").style.display = "none";
	document.getElementById("writer").style.display = "block";
}

export function hideWriter() {
	document.getElementById("reader").style.display = "block";
	document.getElementById("writer").style.display = "none";
}

function b64EncodeUnicode(str) {
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    }));
}

export async function sendMessage(url, echoarea) {
	let message = echoarea + "\nAll\n";
	document.getElementById("writer-error").style.display = "none";
	message += document.getElementById("subject").value + "\n\n";
	message += document.getElementById("writer-body").value;
	let encoded = b64EncodeUnicode(message);
	let authstr = document.getElementById("authstr").value;
	let formData = new FormData();
	formData.append("pauth", authstr);
	formData.append("tmsg", encoded);
	try {
		let response = await fetch(url + "u/point", {
			method: 'POST',
			body: formData
		});
		let result = await response.text();
		if (response.ok) {
			if (result.indexOf("msg ok:") >= 0) {
				hideWriter();
				document.cookie = "authstr=" + authstr + "; max-age=3600*24*28";
				document.getElementById("popup").innerHTML = "?????????????????? ????????????????????";
				document.getElementById("popup").style.opacity = "1";
				setTimeout(() => {
					document.getElementById("popup").style.opacity = "0";
				}, 5000);
				readEchoarea(echoarea, false);
			} else if (result == "error: msg big!") {
				document.getElementById("writer-error").style.display = "block";
				document.getElementById("writer-error").innerHTML = "?????????????????? ?????????????? ??????????????";
			} else {
				document.getElementById("writer-error").style.display = "block";
				document.getElementById("writer-error").innerHTML = "???????????????? ???????????? ??????????????????????";
			}
		}
	} catch (e) {
		if (e.name == "TypeError" && e.message == "NetworkError when attempting to fetch resource.") {
			document.getElementById("writer-error").style.display = "block";
			document.getElementById("writer-error").innerHTML = "?????? ?????????? ?? ????????????????";
		}
	}
}
