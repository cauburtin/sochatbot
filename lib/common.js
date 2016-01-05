// most of the environment detection makes sense here and only here
// we can get a bit hacky here if that allows rest of the codebase
// to be clean of environment detection and null checks
// support only node latest and firefox aurora latest. try to keep compatibility
// with chrome dev and ff stable as well

const ENV_NAME = (typeof window !== 'undefined') ? 'browser' : 'node';
// this is not *exported* to discourage detection of environment elsewhere

let fetch;
if (ENV_NAME === 'browser') {
	fetch = window.fetch;
} else {
	fetch = require('node-fetch');
}

const Utils = {
	fetch,
	google (query) {
		return Utils.corsFetch(
			`http://ajax.googleapis.com/ajax/services/search/web?v=1.0&q=${
				encodeURIComponent(query + ' -site:w3schools.com')
			}`
		).then(res => res.json());
	},
	urlStringifyObject (obj) {
		// adopted from and respectful credits to:
		// https://github.com/sindresorhus/query-string/blob/d9a74a5e624ddd13cf2e9f80c995ec860d1e89a9/index.js#L44-L66
		return obj ? Object.keys(obj).sort().map(function (key) {
			var val = obj[key];
			if (typeof val === 'undefined' || val === null) {
				return key;
			}
			if (Array.isArray(val)) {
				return val.sort().map(function (val2) {
					return encodeURIComponent(key) + '=' + encodeURIComponent(val2);
				}).join('&');
			}
			return encodeURIComponent(key) + '=' + encodeURIComponent(val);
		}).filter(Boolean).join('&') : '';
	},
};

Utils.parseHTML = (function () {
	if (ENV_NAME === 'browser') {
		return function parseHTML (html) {
			let div = document.createElement('div');
			div.innerHTML = html;
			let $div = window.jQuery(div);
			return $div.find.bind($div);
		};
	}
	const $ = require('cheerio');
	return $.load.bind($);
})();

Utils.decodeHTMLEntities = (function () {
	if (ENV_NAME === 'browser') {
		let div = document.createElement('div');
		return function decodeHTMLEntities (content) {
			div.innerHTML = content;
			let ret = div.textContent;
			div.textContent = '';
			return ret;
		};
	}
	let Entities = require('html-entities').AllHtmlEntities;
	let entities = new Entities();
	return entities.decode.bind(entities);
})();

Utils.corsFetch = (function () {
	if (ENV_NAME === 'browser') {
		return function corsFetch(url, ...args) {
			return fetch(`https://crossorigin.me/${uri}`, ...args);
		}
	}
	return fetch;
})();

module.exports = Utils;
