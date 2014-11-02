/*
 * General purpose lazy evaluation library (experimental).
 *
 * https://github.com/kvas-it/laziness
 *
 * Copyright (c) 2014 Vasily Kuznetsov
 * Licensed under the MIT license.
 */

'use strict';

var Q = require('q');

/* Lazy value is something that can be computed on demand.
 *
 * @param {function} compute Function that will be called to compute the value
 *      when it's requested. It can return the value of a promise to the
 *      value.
 */
function LazyValue(compute) {
    this._compute = compute;
}

/* Evaluate or start evaluating the value.
 *
 * @return {null}
 */
LazyValue.prototype.force = function () {
    if ('_value' in this) { // Already forced.
        return;
    } else {
        this._value = this._compute();
        if (typeof(this._value.then) !== 'undefined') {
            // We got a promise.
            this._value = this._value.then(function (value) {
                this._finalValue = value;
                return value;
            }.bind(this));
        } else {
            // We have the final value.
            this._finalValue = this._value;
        }
    }
};

/* Return true if the lazy value is ready.
 */
LazyValue.prototype.isReady = function () {
    return ('_finalValue' in this);
};

/* Get the final value of the lazy object after it's been computed.
 */
LazyValue.prototype.get = function () {
    return this._finalValue;
};

/* Promise API support.
 */
LazyValue.prototype.then = function (onSuccess, onError) {
    try {
        this.force();
    } catch (error) {
        return onError(error);
        // TODO: Should we return some kind of failed promise here?
    }
    if (this.isReady()) {
        return Q.fcall(onSuccess, this.get());
    } else {
        return this._value.then(onSuccess, onError);
    }
};

/* Wrapper to make a function accept and return lazy values.
 */
function lazyFunction(f) {
    return function () {
        if (arguments.length > 0) {
            var args = arguments;
            return new LazyValue(function () {
                return Q.all(args).then(function (resolvedArgs) {
                    return f.apply(this, resolvedArgs);
                });
            });
        } else {
            return new LazyValue(f);
        }
    };
}

/* Lazy if
 */
function lazyIf(cond, trueValue, falseValue) {
    return new LazyValue(function () {
        return Q.all([cond]).then(function (resolvedCond) {
            return resolvedCond[0] ? trueValue : falseValue;
        });
    });
}

/* Shorthand for If(a, func(b)(), func(c)())
 */
function lazyIff(cond, trueCompute, falseCompute) {
    return lazyIf(cond,
            new LazyValue(trueCompute),
            new LazyValue(falseCompute));
}

module.exports = {
    func: lazyFunction,
    If: lazyIf,
    Iff: lazyIff
};
