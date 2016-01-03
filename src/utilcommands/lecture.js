module.exports = (function lecturizer (book) {
	return function lecture ({args}) {
		return book[args];
	};
})({
	mcve: 'Please create a fiddle on http://jsfiddle.net (or put the code on http://gist.github.com) showing the issue in as less code as possible. See our guide on creating an _[MCVE](http://stackoverflow.com/help/mcve)_.',
	format: 'Please format your code with `Ctrl+K` before sending. Use http://gist.github.com if your snippet is bigger than 5 lines or so.',
	nopings: 'Please don\'t ping users randomly. If someone is available and willing to reply, they will.',
	norepeat: 'Please don\'t post the same question/link more than once, it gets noisy really quick.',
	askonmain: 'Please ask a well formatted question according to our _[How to ask guide](http://stackoverflow.com/help/how-to-ask)_ on [so], and post a link to the question here once. If someone is free and willing to answer, they will.',
});
