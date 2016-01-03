const Utils = {
	decodeHTMLEntities: (function (div) {
		// TODO: have this detect environment and do something
		// else for node or whatever
		return function decodeHTMLEntities (content) {
			div.innerHTML = content;
			let ret = div.textContent;
			div.textContent = '';
			return ret;
		};
	})(document.createElement('div')),
	corsFetch (url, ...args) {
		// TODO: shim fetch if working in node
		return fetch(`https://crossorigin.me/${url}`, ...args);
	},
	google (query) {
		return Utils.corsFetch(
			`http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=${
				encodeURIComponent(query + ' -site:w3schools.com')
			}`
		).then(res => res.json());
	},
};

module.exports = Utils;
