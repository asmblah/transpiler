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
    transpilerLibrary = require('../..'),
    Transpiler = require('../../src/Transpiler');

describe('Public API', function () {
    it('should return an instance of Transpiler', function () {
        expect(transpilerLibrary.create()).to.be.an.instanceOf(Transpiler);
    });
});
