# another bot for so-chat

ok here is my take at writing a bot for Stackoverflow chat network.

the aim here is to keep things easy to extend and use modern stuff. modular code - let it work with any environment without *any* changes to the code at all, only by adding lightweight shims or an adapter.

this uses lots of es6, and all of it works correctly with firefox 44 without any transpilation.

run `node build.js`. that would dump a userscript called "build.user.js" in the the `dest/` directory. copy paste it in the console or install as a userscript, whatever.

this makes heavy usage of a small stream class which I handcoded, because I wanted to play with Rx like stuff. awesome blossom.

### TODO
- there are two or three (shared) things which depend on the window APIs for now, both should be easy to port for node. see `/lib/common.js`.
- improve `requirify.js`
- make it remember things depending on environment
- improve the API


### License - WTFPL
### Author - Awal Garg
