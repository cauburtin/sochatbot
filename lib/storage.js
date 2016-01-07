const fs = require('fs');

const {path: storageName} = require('config').storage;


const ENV_NAME = (typeof window !== 'undefined') ? 'browser' : 'node';

class Storage extends Map {
	constructor(iterable, backer=getBacker()) {
		super(iterable);
		this.backer = backer;
		this.cache = new Map();
	}
	get(key, def) {
		let val = super.get(key, def);
		if (typeof val === 'undefined') {
			val = def;
			this.set(key, val);
		}
		return val;
	}
	updateWith(iterable) {
		for (let [key, val] of iterable) {
			this.set(key, val);
		}
	}
	load() {
		return this.backer.load().then(data => this.updateWith(data));
	}
	dump() {
		return this.backer.dump(this);
	}
}

function getBacker(env=ENV_NAME) {
	if (env === 'browser') {
		return {
			load() {
				return new Promise((resolve, reject) => {
					// promise because:
					// we can later migrate to IDB which is async
					// this defers loading slightly
					// slightly slightly slightly
					return resolve(
						// TODO: we should use Response.prototype.json to optimize this
						JSON.parse(
							window.localStorage.getItem(storageName)
						)
					);
				});
			},
			dump(data) {
				return new Promise((resolve, reject) => {
					return resolve(
						localStorage.setItem(
							storageName,
							JSON.stringify(Array.from(data))
						)
					);
				});
			},
		};
	} else {
		return {
			// TODO: provide hook for redis or sqlite, maybe?
			load() {
				return new Promise((resolve, reject) => {
					fs.readFile(storageName, 'utf8', function (err, data) {
						if (err) {
							// probably file doesn't exist :/
							// TODO: check error type for permissions etc. and warn
							resolve([]);
						}
						resolve(JSON.parse(data));
					});
				});
			},
			dump(data) {
				return new Promise((resolve, reject) => {
					fs.writeFile(
						storageName,
						JSON.stringify(Array.from(data)),
						'utf8',
						function (err) {
							if (err) reject(err);
							resolve('done');
						}
					);
				});
			},
		};
	}
}

let storage = new Storage();
module.exports = storage;
