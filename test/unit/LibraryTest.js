/*
 * Transpiler - AST-based transpiler wrapper
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/transpiler
 *
 * Released under the MIT license
 * https://github.com/asmblah/transpiler/raw/master/MIT-LICENSE.txt
 */

'use strict';

var expect = require('chai').expect,
    sinon = require('sinon'),
    Library = require('../../src/Library');

describe('Library', function () {
    beforeEach(function () {
        this.Transpiler = sinon.stub();
        this.library = new Library(this.Transpiler);
    });

    describe('create()', function () {
        it('should return an instance of Transpiler', function () {
            expect(this.library.create()).to.be.an.instanceOf(this.Transpiler);
        });

        it('should pass the transpiler spec to the transpiler', function () {
            var spec = {};

            this.library.create(spec);

            expect(this.Transpiler).to.have.been.calledWith(sinon.match.same(spec));
        });
    });
});
