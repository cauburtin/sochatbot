const config = require('./config.js');

// mixin for common chat actions
// the MessageObject class will use this, mostly
const Actions = {
	sendMessage (content) {
		// TODO: remap this to not use DOM
		$('#input').val(content);
		$('#sayit-button').click();
	},
	reply(id, content) {
		Actions.sendMessage(`:${id} ${content}`);
	},
};
exports.Actions = Actions;

const Utils = require('../lib/common.js');

// this is *mostly* what we will interact with
// if you are writing a plugin and think you need something more than what
// this class provides, think again
class MessageObject {
	constructor(ev) {
		this.ev = ev;
		this.content = ev.content.startsWith(config.activator) ? ev.content.slice(2).trim() : ev.content;
		this.senderId = ev.user_id;
		this.senderName = ev.user_name;
	}
	reply(content) {
		Actions.reply(this.ev.message_id, content);
	}
}
exports.MessageObject = MessageObject;


const StreamSource = require('./streamsource.js');

function intializeStreams () {

	const messageStream = StreamSource('MessagePosted');

	const editStream = StreamSource('MessageEdited');

	const commandStream = messageStream.concat(editStream, 'commandStream');

	const interestingMessageStream = commandStream.filter(function filterActivatorStarting ({content}) {
		return Utils.decodeHTMLEntities(content).trim().startsWith(config.activator);
	}, 'interestingMessageStream');

	const parsedMessageStream = interestingMessageStream.map(el => {
		el.content = Utils.decodeHTMLEntities(el.content);
		return new MessageObject(el);
	}, 'parsedMessageStream');

	return {
		messageStream, editStream, commandStream, interestingMessageStream, parsedMessageStream
	};

}

exports.streams = intializeStreams();
