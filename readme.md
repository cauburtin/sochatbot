# another bot for so-chat

**NOTE:**
I am not working on this anymore. Currently it is at the stage of "works good". The codebase is in good shape, and is extendable.
I just don't have the time and motivation to add features I wanted to add.
The persistent memory part is missing, to be specific.
If you came here to write/make/establish a bot for SO chats, feel free to take over. The codebase is small and easy to work on.
I am quite happy I already implemented most of the difficult parts, so you mostly won't need to interact with SO directly anywhere.
Please have a look at package.json for the custom deps, and things committed to VC inside node_modules. Everything else is easy stuff.

ok here is my take at writing a bot for Stackoverflow chat network.

the aim here is to keep things easy to extend and use modern stuff. modular code - let it work with any environment without *any* changes to core source code at all, only by adding lightweight shims or an adapter to the outside world.

this uses lots of es6, and all of it works correctly with firefox 45 without any transpilation and NodeJS 5.3.0 with some harmony flags.

this makes heavy usage of a small stream class which I handcoded, because I wanted to play with Rx like stuff. awesome blossom.

### running serverside with node

Please ensure you have npm 3.x and nodejs 5.3.0 or above.
and then...
```sh
git clone https://github.com/awalGarg/sochatbot.git
cd sochatbot
# edit the ./src/config.json file now to add credentials
npm install
node --use_strict --es_staging --harmony_destructuring --harmony_default_parameters --harmony_rest_parameters ./src/main.js
```

that should be it.

### running in the browser
> Note: You must load the chat page over HTTPS, and not HTTP. HTTP is not supported.

run `node build.js`. that would dump a userscript called "build.user.js" in the the `dest/` directory. copy paste it in the console or install as a userscript, whatever. Only Firefox Developer Edition latest supported.


### TODO
- implement more Actions on messages
- add a way to memorize things

### License - WTFPL
### Author - Awal Garg
