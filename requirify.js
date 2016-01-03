// I am the best
// and I hate everything which is not

// please keep convention and import all native modules with capital case binding only
// we are working in two realms at the same time, so...

var FS = require('fs');
var URL = require('url');
var PATH = require('path');
var RE_URL = /^\w+:\/\/.+/;

function compileFunction(module) {
	return `function (module, exports, __dirname, require) {
		${module}
	}`;
}

function createBundle(pathList, main, root) {
	root = root || __dirname;
	var compiled = pathList.map(function normalizer (path) {
		if (path.startsWith('./') || path.startsWith('../') || path.startsWith('/')) {
			// relative url
			return PATH.normalize(path);
		} else if (path.matches(RE_URL)) {
			throw new Error('Only relative urls implemented till now!');
		} else {
			throw new Error(`Path: ${path} | is not identified as a valid path!`);
		}
	}).map(function compile (path) {
		var module = FS.readFileSync(PATH.join(root, path)); 
		return {
			path: `./${path}`,
			module: module,
			compiled: compileFunction(module)
		};
	});
	return (
`/*! bundle compiled on ${Date()} */
(function () {
	var require = window.require = (function () {
		var ROOT = '/';
		var REQUIRE_CACHE = Object.create(null);
		var REQUIRE_SOURCE = Object.create(null);
		var hasOwn = Object.prototype.hasOwnProperty;
		var RE_URL = /^\\w+:\\/\\/.+/;

		function require(url) {
			var fqn = _GenerateFQN_(url, this.__dirname);
			if (fqn in REQUIRE_CACHE) {
				return REQUIRE_CACHE[fqn].exports;
			}
			var MODULE_CODE = REQUIRE_SOURCE[fqn.abs];
			if (fqn.abs.endsWith('.json')) {
				return (REQUIRE_CACHE[fqn] = {exports: JSON.parse(MODULE_CODE)}).exports;
			}
			var MODULE_EXECUTABLE = REQUIRE_SOURCE[fqn.abs];
			var MODULE__module = {
				__dirname: fqn.dir,
				exports: {}
			};
			REQUIRE_CACHE[fqn] = MODULE__module;
			MODULE_EXECUTABLE.call(MODULE__module.exports, MODULE__module, MODULE__module.exports, fqn.dir, require.bind(MODULE__module));
			return MODULE__module.exports;
		}
		function _GenerateFQN_ (url, __dirname) {
			var fqn = {
				toString: function () {
					return this.abs;
				}
			};
			if (url.match(RE_URL)) fqn.abs = url;
			else fqn.abs = '.' + (new URL(__dirname + url, 'http://a.b').pathname);
			fqn.dir = fqn.abs.split('/').slice(0, -1).join('/') + '/';
			return fqn;
		}
		var globalRequire = require.bind({__dirname: ROOT});
		globalRequire.register = function (module, compiled) {
			REQUIRE_SOURCE[module] = compiled;
		};
		return globalRequire;
	})();
	${compiled.map(function (bin) {
		return `require.register("${bin.path}", ${bin.compiled});`;
	}).join('\n\t')}
})();
`);
}

module.exports = createBundle;
