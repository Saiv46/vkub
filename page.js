function ready({ blacklist = [] }) {
	const css = id => `[data-peer="${v}"],[data-post-id^="${v}_"],[id="friends_user_row${v}"],.reply[onclick$="${v}"],[id*="${v}"]`;
	const node = document.createElement("link");
	node.rel = "stylesheet";
	node.href = `data:text/css;base64,${btoa(blacklist.map(css) + ",[vub-debug]{display:none!important}")}`;
	document.querySelector("head").appendChild(node);
}
(window.browser || window.chrome).storage.local.get('blacklist', ready);