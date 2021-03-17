export function showWriter(url, echoarea, description, message) {
	document.getElementById("writer-title").innerHTML = "<h1>" + echoarea + "&nbsp;</h1> <h3>" + description + "</h3><br><center><b>" + message + "</b></center>";
	document.getElementById("submit").onclick = () => {
		sendMessage(url, echoarea)
	};
	document.getElementById("subject").value = "";
	document.getElementById("writer-body").value = "";
	document.getElementById("authstr").value = "";
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
	message += document.getElementById("subject").value + "\n\n";
	message += document.getElementById("writer-body").value;
	let encoded = b64EncodeUnicode(message);
	let authstr = document.getElementById("authstr").value;
	let formData = new FormData();
	formData.append("pauth", authstr);
	formData.append("tmsg", encoded);
	console.log(url);
	console.log(echoarea);
	let response = await fetch(url + "u/point", {
		method: 'POST',
		body: formData
	});
}
