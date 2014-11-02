/* global describe,it */

'use strict';

require('should');
var Q = require('q');

var L = require('../lib/laziness');

describe('Laziness module', function () {

    it('should support simple lazy functions', function () {
        var run = false;
        var lf = L.func(function () {
            run = true;
            return 42;
        });

        lf.isReady().should.be.eql(false);
        run.should.be.eql(false);
        lf.force();
        lf.isReady().should.be.eql(true);
        run.should.be.eql(true);
        lf.get().should.be.eql(42);
    });

    it('should be thenable', function (done) {
        var lf = L.func(function () {return 42;});

        lf.then(function (result) {
            result.should.be.eql(42);
        }).done(done);
    });

    it('should support functions returning promises', function (done) {
        var run = false;
        var deferred = Q.defer();

        var lf = L.func(function () {
            run = true;
            return deferred.promise;
        });

        lf.then(function (result) {
            result.should.be.eql(42);
            lf.isReady().should.be.eql(true);
        }).done(done);

        run.should.be.eql(true);
        lf.isReady().should.be.eql(false);
        deferred.resolve(42);
    });
});
