const Utils = require('../../lib/common.js');

module.exports = function google ({args}) {
	return Utils.google(args.trim()).then(function (result) {
		if (result.responseStatus !== 200) {
			return 'An error occurred!';
		}
		let results = result.responseData.results;
		if (!results || !results.length) {
			return 'No results!';
		}
		let linkToMore = result.responseData.cursor.moreResultsUrl;
		let linkList = results.map(function (res) {
			return res.url;
		}).join(', ');
		return `Google [${args}](${linkToMore}): ${linkList}`;
	});
};
