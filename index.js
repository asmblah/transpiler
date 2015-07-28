/*
 * Transpiler - AST-based transpiler wrapper
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/transpiler
 *
 * Released under the MIT license
 * https://github.com/asmblah/transpiler/raw/master/MIT-LICENSE.txt
 */

'use strict';

var Library = require('./src/Library'),
    Transpiler = require('./src/Transpiler');

module.exports = new Library(Transpiler);
