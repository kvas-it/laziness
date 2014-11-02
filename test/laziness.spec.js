/* global describe,it */

'use strict';

require('should');
var Q = require('q');

var L = require('../lib/laziness');

describe('Laziness module', function () {

    it('should support lazy functions with no arguments', function () {
        var run = false;
        var lv = L.func(function () {
            run = true;
            return 42;
        })();

        lv.isReady().should.be.eql(false);
        run.should.be.eql(false);
        lv.force();
        lv.isReady().should.be.eql(true);
        run.should.be.eql(true);
        lv.get().should.be.eql(42);
    });

    it('should be thenable', function (done) {
        var lv = L.func(function () {return 42;})();

        lv.then(function (result) {
            result.should.be.eql(42);
        }).done(done);
    });

    it('should support functions returning promises', function (done) {
        var run = false;
        var deferred = Q.defer();

        var lv = L.func(function () {
            run = true;
            return deferred.promise;
        })();

        lv.then(function (result) {
            result.should.be.eql(42);
            lv.isReady().should.be.eql(true);
        }).done(done);

        run.should.be.eql(true);
        lv.isReady().should.be.eql(false);
        deferred.resolve(42);
    });

    it('should support lazy functions with simple argument', function (done) {
        var lv = L.func(function (arg) {
            return arg + 1;
        })(41);

        lv.then(function (result) {
            result.should.be.eql(42);
        }).done(done);
    });

    it('should support promised argument', function (done) {
        var deferred = Q.defer();
        var run = false;
        var lv = L.func(function (arg) {
            run = true;
            return arg + 1;
        })(deferred.promise);

        lv.then(function (result) {
            result.should.be.eql(42);
        }).done(done);

        run.should.be.eql(false);
        deferred.resolve(41);
    });

    it('should support two promised arguments', function (done) {
        var d1 = Q.defer();
        var d2 = Q.defer();

        var lv = L.func(function (a, b) {
            return a + b
        })(d1.promise, d2.promise);

        lv.then(function (result) {
            result.should.be.eql(42);
        }).done(done);

        d1.resolve(40);
        d2.resolve(2)
    });
});
