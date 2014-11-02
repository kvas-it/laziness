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
        // TODO: Or should we return some kind of failed promise here?
    }
    if (this.isReady()) {
        return Q.fcall(onSuccess, this.get());
    } else {
        return this._value.then(onSuccess, onError);
    }
};

module.exports = {
    func: function (f) {
        return new LazyValue(f);
    }
};
