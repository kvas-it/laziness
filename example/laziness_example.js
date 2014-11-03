'use strict';

var L = require('../lib/laziness.js');
var child_process = require('child_process');

var hello = L.func(function (name) {
    console.log('Hello, ' + name + '!');
});

var byebye = L.func(function (name) {
    console.log('Bye bye, ' + name + '!');
});

var process = L.func(function (input) {
    return input[0].substring(0, input[0].length - 1);
});

var whoami = L.nfunc(child_process.exec)('whoami');
var name = process(whoami);
var greeting = L.If(1,
        hello(name),
        byebye(name));

console.log('Waking up.');
greeting.then(function () {
    console.log('Done.');
});
