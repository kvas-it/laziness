'use strict';

var L = require('../lib/laziness.js');
var child_process = require('child_process');

/* These are lazy functions with side effects.
 * The side effects will happen only if the value is actually
 * used and we can control this with L.If.
 */
var morningGreeting = L.func(function (name) {
    console.log('Good morning, ' + name + '!');
});

var eveningGreeting = L.func(function (name) {
    console.log('Good evening, ' + name + '!');
});

/* Simple functions for processing of lazy values.
 * We take functions working with normal values and wrap them
 * with L.func.
 */
var extractName = L.func(function (input) {
    return input[0].substring(0, input[0].length - 1);
});

var isEvening = L.func(function (input) {
    return Number(input[0]) > 14;
});

/* Wrapped child_process.exec that produces lazy values. L.nfunc wraps
 * node.js-style callback APIs (similar idea to Q.nfapply, actually
 * that's what we use inside).
 */
var exec = L.nfunc(child_process.exec);

/* This function demonstrates what this all is about. Once we wrapped
 * all basic operations with laziness, we can just express business
 * logic in simple imperative (or actually rather functional) code.
 *
 * Without laziness we'd have to either have async calls with a pyramide
 * of callbacks or promise boilerplate.
 */
function greet() {
    var whoami = exec('whoami');
    var name = extractName(whoami);
    var isEve = isEvening(exec('date +%H'));
    return L.If(isEve, eveningGreeting(name), morningGreeting(name));
}

/* Now we call the function and the result is lazy computation (or thunk,
 * as the haskellers would say). At this moment nothing is actually done
 * yet.
 */
var lazyGreeting = greet();

/* The easiest way to get the result of a lazy computation is via
 * promise-like API. As soon as we call .then or .done on a lazy value,
 * the computation is started and becomes a promise.
 */
console.log('Waking up.');
lazyGreeting.done(function () {
    console.log('Done.');
});
