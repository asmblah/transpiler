/*
 * Transpiler - AST-based transpiler wrapper
 * Copyright (c) Dan Phillimore (asmblah)
 * https://github.com/asmblah/transpiler
 *
 * Released under the MIT license
 * https://github.com/asmblah/transpiler/raw/master/MIT-LICENSE.txt
 */

'use strict';

var _ = require('microdash'),
    hasOwn = {}.hasOwnProperty;

function Transpiler(spec) {
    this.spec = spec;
}

_.extend(Transpiler.prototype, {
    transpile: function (node, data, options) {
        var transpiler = this,
            transpileFn,
            nodeName,
            spec = transpiler.spec;

        if (!options) {
            options = {};
        }

        if (!options.nodes) {
            options.nodes = {};
        }

        if (!hasOwn.call(node, 'name')) {
            throw new Error('Transpiler.transpile() :: Invalid AST node provided');
        }

        if (arguments.length === 1) {
            data = null;
        }

        nodeName = node.name;

        if (!hasOwn.call(spec.nodes, nodeName) && !hasOwn.call(options.nodes, nodeName)) {
            throw new Error(
                'Transpiler.transpile() :: Spec does not define how to handle node "' + nodeName + '"'
            );
        }

        transpileFn = options.nodes[nodeName] || spec.nodes[nodeName];

        function createSubTranspile(useOriginal) {
            return function (node, newData) {
                if (arguments.length === 1) {
                    newData = data;
                } else if (newData && (typeof newData === 'object')) {
                    newData = _.extend({}, data, newData);
                }

                if (_.isString(node)) {
                    return node;
                } else {
                    return transpiler.transpile(node, newData, useOriginal ? options : null);
                }
            };
        }

        return transpileFn.call(
            transpiler,
            node,
            createSubTranspile(true),
            data,
            createSubTranspile(false)
        );
    }
});

module.exports = Transpiler;
