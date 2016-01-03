const Stream = require('../lib/stream.js');
const eventMaps = require('./eventmaps.js');

function StreamSource (type, name=type) {
	if (type === 'raw') {
		let stream = new Stream(name);
		// TODO: delocalize the CHAT object
		CHAT.addEventHandlerHook(function rawReciever (e) {
			stream.emit(Object.assign({}, e));
		});
		return stream;
	} else if (type === 'pretty-event') {
		return StreamSource('raw', name).map(function mapEventNumToName (ev) {
			let evType = ev.event_type;
			return Object.assign({}, ev, {
				event_type: eventMaps.numToId[evType]
			});
		});
	} else if (eventMaps.idToNum.hasOwnProperty(type)) {
		return StreamSource('raw', name).filter(ev => ev.event_type === eventMaps.idToNum[type]);
	} else {
		throw new Error(`Type ${type} unimplemented or not supported!`);
	}
}

module.exports = StreamSource;
