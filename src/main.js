const {Actions, streams} = require('./api.js');
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
