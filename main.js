if (window.chrome.runtime) { window.browser = window.chrome }

function promisify (area) {
	const call = func => (...args) => new Promise((res, rej) => {
		func(...args, val => res(val))
		if (browser.runtime.lastError) {
			rej(browser.runtime.lastError)
		}
	})
	return new Proxy(area, {
		get (target, prop) {
			return typeof target[prop] === 'function'
				? call(target[prop].bind(target))
				: target[prop]
		}
	})
}

const storage = promisify(browser.storage.local)

const fetchMethod = async (method, params = {}) => {
	params = Object.assign({
		access_token: 'f914f14af914f14af914f14a82f972b0aeff914f914f14aa2bc69adfcfb125d207cbfd3',
		v: 5.90
	}, params);
	const query = Object.entries(params).map(v => v.join("=")).join("&");
	let data = await fetch(`https://api.vk.com/method/${method}?${query}`);
	data = await data.json();
	if (data.error) throw data.error;
	return data.response
};

const fetchUsers = async ids => {
	if(!ids.length) return [];
	return (await fetchMethod("users.get", {user_ids: ids.join()}))
		.map(v => `${v.first_name || ""} ${v.last_name || ""}`.trim())
};

const fetchUserId = async url => {
	const screen_name = url.match(/((https:\/\/)?vk\.com\/)*([0-9A-z._]{3,})/)[3];
	if(!screen_name) return;
	let { type, object_id } = 
		await fetchMethod("utils.resolveScreenName", { screen_name });
	if (type !== "user") return;
	return object_id;
};

window.UB = {
	get blacklist () {
		return storage.get({ blacklist: [] }).then(v => v.blacklist)
	}, set blacklist (value) {
		return storage.set({ blacklist: value }).then(() => value)
	}, appendItem (id, update = true) {
		let li = document.createElement('li');
		li.innerHTML = `... (@id${id})<a href="#unblock__${id}"></a>`;
		if (update) {
			fetchUsers([ id ])
			.then(v => {
				li.innerHTML = `${v[0]} (@id${id})<a href="#unblock__${id}"></a>`;
			})
		}
		document.getElementById("banned").appendChild(li);
		return id
	}, removeItem (id) {
		return UB.blacklist.then(list => {
			let i = list.indexOf(id);
			if(!~i) throw "ID not found";
			list.splice(i, 1);
			UB.blacklist = list;
			document.querySelector(`#banned :nth-child(${i+1})`).remove();
		});
	}, init () {
		document.getElementById("version").innerText = browser.runtime.getManifest().version_name;
		document.getElementById("banned").innerHTML = "";
		UB.blacklist.then(async data => {
			data.forEach(v => UB.appendItem(v, false));
			(await fetchUsers(data)).forEach((v, i) => {
				let e = document.querySelector(`#banned :nth-child(${i+1})`);
				e.innerHTML = e.innerHTML.replace('...', v);
			})
		});
		
		window.addEventListener('hashchange', () => {
			if(location.hash.indexOf("#unblock__") !== 0) return;
			UB.removeItem(parseInt(location.hash.substr(10)))
			.catch(e => {
				console.error(e);
				alert("Error occured, open DevTools for into")
			});
		});
		document.querySelector("form").onsubmit = e => {
			e.preventDefault();
			document.querySelector("form input").disabled = true;
			fetchUserId(document.querySelector("form input").value).then(async v => {
				UB.blacklist = (await UB.blacklist).concat(v);
				UB.appendItem(v);
			})
			.catch(e => {
				console.error("Error occured", e);
				alert(typeof e == "string" ? e : "Error occured, open DevTools for info");
			})
			.then(() => {
				document.querySelector("form input").value = "";
				document.querySelector("form input").disabled = false
			});
		};
	}
};
UB.init();