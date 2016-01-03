#!/usr/bin/node
var fs = require('fs');
var createBundle = require('./requirify.js');

var dest = __dirname + '/dest/build.user.js';
try {
    if (sys.argv[0].endsWith('/build.js')) {
        // probably just executing directly like fine people
        // do you like long function names too?
        if (sys.argv[1].length) {
            dest = sys.argv[1];
        }
        // bet you love those
    } else if (sys.argv[2].length) {
        dest = sys.argv[2];
    }
} catch (err) {
    // I kind of care about errors
    console.log('No default path was passed, it seems, so writing to ' + dest);
}

var modules = [
    './lib/stream.js',
    './lib/common.js',
    './src/utilcommands/google.js',
    './src/utilcommands/info.js',
    './src/utilcommands/lecture.js',
    './src/utilcommands/main.js',
    './src/utilcommands/mdn.js',
    './src/utilcommands/urban.js',
    './src/api.js',
    './src/config.js',
    './src/eventmaps.js',
    './src/streamsource.js',
];

var injectables = [
    '!./src/header.js',
    modules,
    './src/main.js',
];

function justDoIt (forSure) {
    if (!forSure) {
        throw new Error('You are not determined enough, mortal POS');
    }
    var files = injectables.map(function appendPathsJustInCaseWeAreWorkingFromADifferentWorkingDirectory (el) {
        if (el === modules) {
            return el;
        }
        var prefix = '';
        if (el.startsWith('!')) {
            el = el.slice(1);
            prefix = '!';
        }
        if (el.startsWith('./')) {
            return prefix + __dirname + '/' + el;
        }
        return prefix + el;
    }).map(function readFromFileSystem (el) {
        if (el === modules) {
            return createBundle(modules);
        }
        var prefix;
        if (el.startsWith('!')) {
            el = el.slice(1);
            prefix = '';
        }
        else prefix = `//#included "${el}"\n`;
        return prefix + fs.readFileSync(el, 'utf8');
    }).join('\n');

    fs.writeFile(dest, files, function allDoneKindSir () {
        console.log('Build finished, please don\'t run me too often');
        // because I am not very efficient
    });
}

justDoIt('shuddup');
