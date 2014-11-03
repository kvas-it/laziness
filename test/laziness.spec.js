/* global describe,it */

'use strict';

require('should');
var Q = require('q');

var L = require('../lib/laziness');

describe('Laziness module:', function () {

    it('lazy func with no arguments', function () {
        var run = false;
        var lv = L.func(function () {
            run = true;
            return 42;
        })();

        setTimeout(function () {
            lv.isReady().should.be.eql(false);
            run.should.be.eql(false);
            lv.force();
            lv.isReady().should.be.eql(true);
            run.should.be.eql(true);
            lv.get().should.be.eql(42);
        }, 5);
    });

    it('lazy values are thenable', function (done) {
        var lv = L.func(function () {return 42;})();

        lv.then(function (result) {
            result.should.be.eql(42);
        }).done(done);
    });

    it('lazy func returning promise', function (done) {
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

        setTimeout(function () {
            run.should.be.eql(true);
            lv.isReady().should.be.eql(false);
            deferred.resolve(42);
        });
    });

    it('lazy func with simple argument', function (done) {
        var lv = L.func(function (arg) {
            return arg + 1;
        })(41);

        lv.then(function (result) {
            result.should.be.eql(42);
        }).done(done);
    });

    it('lazy func with promised argument', function (done) {
        var deferred = Q.defer();
        var run = false;
        var lv = L.func(function (arg) {
            run = true;
            return arg + 1;
        })(deferred.promise);

        lv.then(function (result) {
            result.should.be.eql(42);
        }).done(done);

        setTimeout(function () {
            run.should.be.eql(false);
            deferred.resolve(41);
        }, 5);
    });

    it('lazy func with two promised arguments', function (done) {
        var d1 = Q.defer();
        var d2 = Q.defer();

        var lv = L.func(function (a, b) {
            return a + b;
        })(d1.promise, d2.promise);

        lv.then(function (result) {
            result.should.be.eql(42);
        }).done(done);

        setTimeout(function () {
            d1.resolve(40);
            d2.resolve(2);
        }, 5);
    });

    it('mixing promises and normal arguments', function (done) {
        var d1 = Q.defer();
        var lv = L.func(function (a, b) {
            return a + b;
        })(d1.promise, 4);

        lv.then(function (result) {
            result.should.be.eql(42);
        }).done(done);

        d1.resolve(38);
    });

    it('lazy arguments', function (done) {
        var run1 = false;
        var run2 = false;
        var lv1 = L.func(function () {
            run1 = true;
            return 5;
        })();
        var lv2 = L.func(function (a, b) {
            run2 = true;
            return a + b;
        })(lv1, 37);

        setTimeout(function () {
            run1.should.be.eql(false);
            run2.should.be.eql(false);
            lv2.then(function (result) {
                result.should.be.eql(42);
            }).done(done);
        }, 5);
    });

    it('adapting callback APIs', function (done) {
        var lv = L.nfunc(function (a, b, callback) {
            Q.delay(5).then(function () {
                callback(null, a + b);
            });
        })(40, 2);

        lv.then(function (result) {
            result.should.be.eql(42);
        }).done(done);
    });

    it('reporting errors from callback APIs', function (done) {
        L.nfunc(function (a, b, callback) {
            a.should.be.eql(1);
            b.should.be.eql(2);
            callback(new Error('boom'));
        })(1, 2).then(function () {
            true.should.not.be.eql(true);
        }, function (err) {
            err.message.should.be.eql('boom');
        }).done(done);
    });

    it('lazy if with simple condition', function (done) {
        var run1 = false;
        var run2 = false;

        var lv1 = L.func(function () {
            run1 = true;
            return 42;
        })();
        var lv2 = L.func(function () {
            run2 = true;
            return 40;
        })();

        L.If(1, lv1, lv2).then(function (result) {
            result.should.be.eql(42);
        }).done();

        setTimeout(function () {
            run1.should.be.eql(true);
            run2.should.be.eql(false);
            done();
        }, 5);
    });

    it('lazy if with promise condition', function (done) {
        var deferred = Q.defer();
        var lv1 = L.func(function () {return 42;})();
        var lv2 = L.func(function () {return 40;})();

        L.If(deferred.promise, lv1, lv2).then(function (result) {
            result.should.be.eql(40);
        }).done(done);

        setTimeout(function () {deferred.resolve(0);}, 5);
    });

    it('lazy iff with simple condition', function (done) {
        var run1 = false;
        var run2 = false;

        L.Iff(1, function Then() {
            run1 = true;
            return 42;
        }, function Else() {
            run2 = true;
            return 40;
        }).then(function (result) {
            result.should.be.eql(42);
        }).done();

        setTimeout(function () {
            run1.should.be.eql(true);
            run2.should.be.eql(false);
            done();
        }, 5);
    });

});
