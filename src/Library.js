/*
 * Transpiler - AST-based transpiler wrapper
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/transpiler
 *
 * Released under the MIT license
 * https://github.com/asmblah/transpiler/raw/master/MIT-LICENSE.txt
 */

'use strict';

var _ = require('microdash');

function Library(Transpiler) {
    this.Transpiler = Transpiler;
}

_.extend(Library.prototype, {
    create: function (spec) {
        return new this.Transpiler(spec);
    }
});

module.exports = Library;
