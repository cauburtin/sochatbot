class Stream {
	constructor(name='anonStream') {
		this.name = name;
		this._subscribers = new Set();
	}
	subscribe(fn) {
		this._subscribers.add(fn);
	}
	unsub(fn) {
		this._subscribers.remove(fn);
	}
	emit(...data) {
		// thankfully setTimeout has the same api in node too
		setTimeout(() => {
			this._subscribers.forEach(sub => sub(...data));
		});
	}
	filter(fn, name) {
		let filtered = new Stream(name);
		this.subscribe((...data) => {
			if (fn(...data)) {
				filtered.emit(...data);
			}
		});
		return filtered;
	}
	map(fn, name) {
		let mapped = new Stream(name);
		this.subscribe((...data) => mapped.emit(fn(...data)));
		return mapped;
	}
	concat(stream, name) {
		let mix = new Stream(name);
		let sub = (...data) => mix.emit(...data);
		this.subscribe(sub);
		stream.subscribe(sub);
		return mix;
	}
	clone(name) {
		let cloned = new Stream(name);
		this.subscribe((...data) => cloned.emit(...data));
		return cloned;
	}
}

module.exports = Stream;
