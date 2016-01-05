const config = require('config');
const Utils = require('apputils');
const {StreamSource, requestor} = require('./sources.js');


// mixin for common chat actions
// the MessageObject class will use this, mostly
const Actions = {
	sendMessage (text, room=config.locker.startWithRoom) {
		return requestor(`https://chat.${config.site}/chats/${room}/messages/new`, {
			text,
		});
	},
	reply(content, id, room=Actions.getRoomFromMessageId(id)) {
		return Promise.resolve(room).then(
			rId => Actions.sendMessage(`:${id} ${content}`, rId)
		);
	},
	getRoomFromMessageId(id) {
		console.log(id);
		let url = `https://chat.${config.site}/messages/${id}/history`;
		console.log(url);
		return requestor(url, undefined, undefined, 'GET').then(
				res => res.text()
			).then(
				html => {
					console.log(html);
					return Utils.parseHTML(html);
				}
			).then(
				dom => {
					let room = dom(`.message > a[name="${id}"]`).attr('href').replace('/transcript/', '').match(/^\d+/)[0];
					console.log(`Room: ${room}`);
					return room;
				}
			).catch(err => {
				console.error(err);
			});
	},
};
exports.Actions = Actions;


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
		Actions.reply(content, this.ev.message_id);
	}
}
exports.MessageObject = MessageObject;


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