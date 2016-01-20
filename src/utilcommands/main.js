const commands = [
	'google',
	'mdn',
	'urban',
	'info',
	'lecture',
	'mem',
];

module.exports = commands.reduce(function (map, cmd) {
	map[cmd] = require(`./${cmd}.js`);
	return map;
}, Object.create(null));
