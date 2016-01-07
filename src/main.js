const {Actions, streams} = require('sechatapi');
const Storage = require('storage');
const config = require('config');

const UtilityCommands = require('./utilcommands/main.js');

Storage.load().then(init);

const COMMAND_STORE = [
	// TODO: this shall have more!
	utilityCommandMatcher,
];

function init() {
	// all subscriptions to streams from above
	// shall be made here in one go
	streams.parsedMessageStream.subscribe(utilityCommandReplier);
}

try {
	process.on('unhandledRejection', function (reason, p) {
		console.log('ATTENTION: Unhandled Promise Rejection!');
		console.error(reason);
		console.info(p);
	});
} catch (err) {
	console.log('Doesn\'t look like we are in node. So unhandledRejection global handler won\'t work.');
}

function utilityCommandReplier (msg) {
	let commandResponses = Promise.all(COMMAND_STORE.map(function (command) {
		// TODO: documentation for this
		return command(msg.content, msg);
	}));
	commandResponses.then(function (responses) {
		return responses.reduce(Object.assign, {directReply: true});
	}).then(function (reply) {
		if (!reply.content) return;
		if (reply.directReply) {
			return msg.reply(reply.content);
		}
		return Actions.send(reply.content);
	});
}

function utilityCommandMatcher (content) {
	let [commandName, args] = content.split(/\s+/, 2);

	if (!(commandName in UtilityCommands)) {
		return;
	}

	let utilCommand = UtilityCommands[commandName];
	return Promise.resolve(utilCommand({args})).then(content => ({content}));
}

setInterval(() => Storage.dump(), config.storage.dumpInterval*1000);
