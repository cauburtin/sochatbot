const Stream = require('rxstream');
const eventMaps = require('./eventmaps.json');
const {stream: raw, requestor} = require('./raw.js')();

function StreamSource (type, name=type) {
	if (type === 'raw') {
		return raw;
	} else if (type === 'pretty-event') {
		return StreamSource('raw', name).map(function mapEventNumToName (ev) {
			let evType = ev.event_type;
			return Object.assign({}, ev, {
				event_type: eventMaps.numToId[evType]
			});
		});
	} else if (eventMaps.idToNum.hasOwnProperty(type)) {
		return StreamSource('raw', name).filter(ev => String(ev.event_type) === eventMaps.idToNum[type]);
	} else {
		throw new Error(`Type ${type} unimplemented or not supported!`);
	}
}

module.exports = {
	StreamSource,
	requestor,
};
