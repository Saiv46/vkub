(window.browser || window.chrome).storage.local.get('blacklist', function ({ blacklist = [] }) {
	const css = id => `[data-peer="${v}"],[data-post-id^="${v}_"],[id="friends_user_row${v}"],.reply[onclick$="${v}"],[id*="${v}"]`;
	const href = btoa(blacklist.map(css) + ",[vub-debug]{display:none!important}");
	const node = document.createElement("link");
	node.rel = "stylesheet";
	node.href = `data:text/css;base64,${href}`;
	document.querySelector("head").appendChild(node);
});