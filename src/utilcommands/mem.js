// this file is incomplete, and is left in WIP state
// some weird obscure bug in spidermonkey JS engine is blocking
// this from working in FF dev edition
// try rewriting this or whatever

const Storage = require('storage');
const {Actions, streams} = require('sechatapi');

let learned = Storage.get('learned', {});

// TODO: this entire "command" should move out to its own subscriber
streams.commandStream.filter(isInMemory).subscribe(poker);

function isInMemory(ev) {
	check();
	return ev.content in learned;
}

function poker(ev) {
	// TODO: this should replace certain placeholders with special values
	check();
	return Actions.reply(learned[ev.content], ev.message_id);
}

module.exports = function ({args}) {
	let [label, val] = args.split(/\s+/, 2);
	check();
	learned[label] = val;
	return 'Alright done';
};


function check() {
	console.log(`Is mem same? ${learned === Storage.get('learned')}`);
}
