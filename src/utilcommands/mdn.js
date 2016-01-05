const Utils = require('apputils');

module.exports = function ({args}) {
	let terms = args.split(/,\s*/g).map(function appendSite (term) {
		return `${term} site:developer.mozilla.org`;
	});
	return Promise.all(terms.map(Utils.google)).then(function (collection) {
		return collection.map(function (result) {
			if (result.responseStatus !== 200) {
				return 'An error occurred!';
			}
			result = result.responseData.results[0];
			if (!result) return 'Not found!';
			let title = '`' + Utils.decodeHTMLEntities(result.titleNoFormatting.split(' -')[0].trim()) + '`';
			let url = result.url;

			return `[${title}](${url})`;
		}).join(', ');
	});
};
