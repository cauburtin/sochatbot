const {Actions, streams} = require('sechatapi');
const UtilityCommands = require('./utilcommands/main.js');

const COMMAND_STORE = [];

streams.parsedMessageStream.subscribe(function utilityCommandReplier (msg) {
	let commandResponses = Promise.all(COMMAND_STORE.map(function (command) {
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
});

COMMAND_STORE.push(function utilityCommandMatcher (content) {
	let [commandName, args] = content.split(/\s+/, 2);
	if (!(commandName in UtilityCommands)) return;
	let utilCommand = UtilityCommands[commandName];
	return Promise.resolve(utilCommand({args})).then(content => ({content}));
});

try {
	process.on('unhandledRejection', function (reason, p) {
		console.log('ATTENTION: Unhandled Promise Rejection!');
		console.error(reason);
		console.info(p);
	});
} catch (err) {
	console.log('Doesn\'t look like we are in node. So unhandledRejection global handler won\'t work.');
}
