// this just requires environment detection... can't help it
// it basically does some checks in the browser
// and for node, it shims the CHAT.addEventHandlerHook function
// exposed by chat in the browser
// call the default function exported by this module
// and you will get a stream of fresh events


const config = require('config');
const Stream = require('rxstream');
const {fetch, urlStringifyObject} = require('apputils');

const ENV_NAME = (typeof window !== 'undefined') ? 'browser' : 'node';

function init() {
	const stream = new Stream('chat::raw');
	let chatFkey = '';
	let requestor;

	if (ENV_NAME === 'browser') {
		if (typeof CHAT === 'undefined') {
			throw new Error(
				'We are probably running as a content script at document-start, which is not supported.'
			);
		}
		if (typeof CHAT.addEventHandlerHook !== 'function') {
			throw new Error('Possible change in chat code detected. Please file an issue on Github!');
		}

		CHAT.addEventHandlerHook(function rawReciever (data) {
			stream.emit(Object.assign({}, data));
		});
		chatFkey = window.fkey().fkey;

		requestor = function requestor(url, body={}, headers={}, method='POST') {
			body.fkey = chatFkey;
			let qs = urlStringifyObject(body);
			if (method === 'POST') {
				headers['X-Requested-With'] = 'XMLHttpRequest';
				headers['Content-Type'] = 'application/x-www-form-urlencoded';
			}
			return fetch(url, {
				method,
				headers,
				body: method === 'POST' ? qs : undefined,
				credentials: 'include',
			});
		};

		return {
			stream,
			chatFkey,
			requestor
		};
	}

	// node stuff!
	// some of the code here is almost a copy paste of the above browser counter-part
	// I know you smart people have higher order functions to keep things DRY here
	// but for greater flexibility in the future, I am intentionally keeping
	// things separate
	const SEChatSocket = require('sechatsocket');
	let cookieString = '';

	function connect() {
		return SEChatSocket(config.site, config.locker)
			.then(function handleSocket (c) {
				function socket$onerror(error) {
					console.error('CHAT::Socker | Error occurred. Reattempting connection.');
					console.error(error);
					return c.connect().then(handleSocket);
				}
				let socket = c.socket;
				cookieString = c.keys.cookieString;
				chatFkey = c.keys.chatFkey;
				socket.on('message', socket$onmessage);
				socket.on('close', socket$onerror);
				socket.on('error', socket$onerror);
			});
	}

	connect();

	requestor = function requestor(url, body={}, headers={}, method='POST') {
		body.fkey = chatFkey;
		let qs = urlStringifyObject(body);
		if (method === 'POST') {
			headers['X-Requested-With'] = 'XMLHttpRequest';
			headers['Content-Type'] = 'application/x-www-form-urlencoded';
		}
		headers['Cookie'] = cookieString;
		headers['User-Agent'] = 'Mozilla/5.0 (X11; Linux x86_64; rv:45.0) Gecko/20100101 Firefox/45.0';
		return fetch(url, {
			method,
			headers,
			body: method === 'POST' ? qs : undefined,
			credentials: 'include',
		});
	};

	return {
		stream,
		chatFkey,
		requestor,
	};

	function socket$onmessage(data) {
		if (data.type === 'utf8') {
			data = data.utf8Data;
		}
		const events = parse(data);
		events.forEach(ev => stream.emit(ev));
	}

	function parse(frame) {
		/*
		{
			"r17": {
				"e": [
					{
						"event_type": 3,
						"time_stamp": 1451935306,
						"id": 57130383,
						"user_id": 4023065,
						"target_user_id": 4023065,
						"user_name": "Ronin",
						"room_id": 17,
						"room_name": "JavaScript"
					}
				],
				"t": 57130383,
				"d": 1
			}
		}
		*/
		if (typeof frame === 'string') frame = JSON.parse(frame);
		return Object.keys(frame).reduce(function (lot, key) {
			let events = frame[key].e;
			if (!events || !Array.isArray(events)) return [];
			return lot.concat(events);
		}, []);

	}

}

module.exports = init;
