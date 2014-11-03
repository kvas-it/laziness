'use strict';

// First we do some preparation:
// Imports.
var L = require('../lib/laziness.js');
var child_process = require('child_process');

// Some functions with side effects.
var morng = L.func(function (name) {
    console.log('Good morning, ' + name + '!');
});

var evng = L.func(function (name) {
    console.log('Good evening, ' + name + '!');
});

// Wrap child_process.exec to produce lazy values.
// L.nfunc wraps node.js-style callback APIs.
var exec = L.nfunc(child_process.exec);

// Simple processing of lazy values.
var convert = L.func(function (input) {
    return input[0].substring(0, input[0].length - 1);
});

var isEvening = L.func(function (input) {
    return Number(input[0]) > 14;
});

// This function demonstrates the idea of the library. Normally the code
// inside would be asynchronous with either pyramide of callbacks or
// promise boilerplate. Using laziness we can just write simple code in
// imperative/functional style.
function greet() {
    var whoami = exec('whoami');
    var name = convert(whoami);
    var eve = isEvening(exec('date +%H'));
    return L.If(eve,
            evng(name),
            morng(name));
}

// This is our lazy computation. At this moment nothing is actually
// done yet.
var lazyGreeting = greet();

// Now we can use it like this:
console.log('Waking up.');
lazyGreeting.done(function () {
    console.log('Done.');
});
