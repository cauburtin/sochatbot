const Utils = require('apputils');

module.exports = function urban ({args}) {
	args = args.trim();
	let indexRe = /\b(\d+)$/;
	let index = 0;
	if (indexRe.test(args)) {
		index = Number(args.match(indexRe)[1]);
		args = args.split(indexRe)[0];
	}
	return Utils.corsFetch(
	`http://api.urbandictionary.com/v0/define?term=${
		encodeURIComponent(args.trim())
	}`).then(res => res.json()).then(function format (result) {
		if (result.result_type === 'no_results') {
			return `No urban definition found for ${args}`;
		}
		if (index > result.list.length) {
			return 'Urban: Nothing at that index!';
		}
		result = result.list[index];
		return `Urban [${args}](${result.permalink}): ${result.definition}`;
	});
};
