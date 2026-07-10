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
    hasOwn = {}.hasOwnProperty,
    /**
     * Internal recursive transpile, called with already-normalised options.
     * Skips the options setup that the public transpile() does, so recursive
     * calls (via the interpret() closure) don't pay that cost on every node.
     */
    transpileNode = function (transpiler, node, data, options) {
        var nodeName,
            spec = transpiler.spec,
            transpileFn,
            interpret;

        if (!hasOwn.call(node, 'name')) {
            throw new Error('Transpiler.transpile() :: Invalid AST node provided');
        }

        nodeName = node.name;

        if (!hasOwn.call(spec.nodes, nodeName) && (!options || !hasOwn.call(options.nodes, nodeName))) {
            throw new Error(
                'Transpiler.transpile() :: Spec does not define how to handle node "' + nodeName + '"'
            );
        }

        transpileFn = (options && options.nodes[nodeName]) || spec.nodes[nodeName];

        // interpret() is the primary closure passed as the 2nd argument to every handler.
        // Using `=== undefined` instead of `arguments.length === 1` avoids materialising
        // the arguments object, allowing V8 to optimise the closure more aggressively.
        interpret = function (node, newData) {
            if (newData === undefined) {
                newData = data;
            } else if (newData && (typeof newData === 'object')) {
                newData = _.extend({}, data, newData);
            }

            return typeof node === 'string' ? node : transpileNode(transpiler, node, newData, options);
        };

        // The 4th argument (original) is only created when the handler declares it, checked via
        // Function.length. This avoids allocating a second closure on every call for the common
        // case where handlers only use (node, interpret, context).
        if (transpileFn.length >= 4) {
            return transpileFn.call(
                transpiler,
                node,
                interpret,
                data,
                function (node, newData) {
                    if (newData === undefined) {
                        newData = data;
                    } else if (newData && (typeof newData === 'object')) {
                        newData = _.extend({}, data, newData);
                    }

                    // Pass null options so that node overrides are not applied -
                    // the handler gets the original spec behaviour.
                    return typeof node === 'string' ? node : transpileNode(transpiler, node, newData, null);
                }
            );
        }

        return transpileFn.call(transpiler, node, interpret, data);
    };

function Transpiler(spec) {
    this.spec = spec;
}

_.extend(Transpiler.prototype, {
    transpile: function (node, data, options) {
        if (!options) {
            options = {};
        }

        if (!options.nodes) {
            options.nodes = {};
        }

        if (arguments.length === 1) {
            data = null;
        }

        return transpileNode(this, node, data, options);
    }
});

module.exports = Transpiler;
