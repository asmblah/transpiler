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
    expect = require('chai').expect,
    sinon = require('sinon'),
    Transpiler = require('../../src/Transpiler');

describe('Transpiler', function () {
    describe('transpile()', function () {
        it('should support overriding the transpile of node types', function () {
            var transpilerSpec = {
                    nodes: {
                        'EXPR': function (node, transpile) {
                            return transpile(node.left) + ' ' + node.operator + ' ' + transpile(node.right);
                        },
                        'OPERAND': function (node) {
                            return node.value;
                        }
                    }
                },
                transpiler = new Transpiler(transpilerSpec);

            expect(
                transpiler.transpile(
                    {
                        name: 'EXPR',
                        left: {
                            name: 'OPERAND',
                            value: 'leftNode'
                        },
                        operator: '+',
                        right: {
                            name: 'OPERAND',
                            value: 'rightNode'
                        }
                    },
                    null,
                    {
                        nodes: {
                            'OPERAND': function (node, transpile, context, original) {
                                if (node.value === 'leftNode') {
                                    return 'modify(' + original(node) + ')';
                                }

                                return original(node);
                            }
                        }
                    }
                )
            ).to.equal('modify(leftNode) + rightNode');
        });

        describe('when using transpiler spec #1', function () {
            var transpiler,
                transpilerSpec;

            beforeEach(function () {
                transpilerSpec = {
                    nodes: {
                        'EXPRESSION': function (node, transpile) {
                            var expression = node.left;

                            if (!_.isString(expression)) {
                                expression = transpile(expression);
                            }

                            _.each(node.right, function (operation) {
                                expression += ' ' + transpile(operation);
                            });

                            return '(' + expression + ')';
                        },
                        'OPERATION': function (node) {
                            return node.operator + ' ' + node.operand;
                        },
                        'PROGRAM': function (node, transpile) {
                            /*jshint evil:true */
                            var body = '';

                            _.each(node.statements, function (statement) {
                                body += transpile(statement);
                            });

                            return body;
                        },
                        'RETURN': function (node, transpile) {
                            var expression = node.expression;

                            if (expression && !_.isString(expression)) {
                                expression = transpile(expression);
                            }

                            return 'return' + (expression ? ' ' + expression : '') + ';';
                        }
                    }
                };

                transpiler = new Transpiler(transpilerSpec);
            });

            _.each([
                {
                    originalCode: 'return 128;',
                    ast: {
                        name: 'PROGRAM',
                        statements: [
                            {
                                name: 'RETURN',
                                expression: '128'
                            }
                        ]
                    },
                    expectedResult: 'return 128;'
                },
                {
                    originalCode: 'return 2 + 3 - 4;',
                    ast: {
                        name: 'PROGRAM',
                        statements: [
                            {
                                name: 'RETURN',
                                expression: {
                                    name: 'EXPRESSION',
                                    left: '2',
                                    right: [{
                                        name: 'OPERATION',
                                        operator: '+',
                                        operand: '3'
                                    }, {
                                        name: 'OPERATION',
                                        operator: '-',
                                        operand: '4'
                                    }]
                                }
                            }
                        ]
                    },
                    expectedResult: 'return (2 + 3 - 4);'
                },
                {
                    originalCode: 'return (6 + 4) / 2;',
                    ast: {
                        name: 'PROGRAM',
                        statements: [
                            {
                                name: 'RETURN',
                                expression: {
                                    name: 'EXPRESSION',
                                    left: {
                                        name: 'EXPRESSION',
                                        left: '6',
                                        right: [{
                                            name: 'OPERATION',
                                            operator: '+',
                                            operand: '4'
                                        }]
                                    },
                                    right: [{
                                        name: 'OPERATION',
                                        operator: '/',
                                        operand: '2'
                                    }]
                                }
                            }
                        ]
                    },
                    expectedResult: 'return ((6 + 4) / 2);'
                }
            ], function (scenario) {
                it('should return the correct result when the original code was "' + scenario.originalCode + '"', function () {
                    expect(transpiler.transpile(scenario.ast)).to.equal(scenario.expectedResult);
                });
            });
        });

        describe('when the "data" argument to the root .transpile() call', function () {
            _.each({
                'is not specified': {
                    rootInterpretArgs: [{
                        name: 'PROGRAM'
                    }],
                    expectedRootNodeHandlerData: null
                },
                'is null': {
                    rootInterpretArgs: [{
                        name: 'PROGRAM'
                    }, null],
                    expectedRootNodeHandlerData: null
                },
                'is the number 0': {
                    rootInterpretArgs: [{
                        name: 'PROGRAM'
                    }, 0],
                    expectedRootNodeHandlerData: 0
                },
                'is the number 4': {
                    rootInterpretArgs: [{
                        name: 'PROGRAM'
                    }, 4],
                    expectedRootNodeHandlerData: 4
                }
            }, function (rootScenario, description) {
                describe(description, function () {
                    var childNodeHandler,
                        transpiler,
                        programNodeHandler;

                    beforeEach(function () {
                        childNodeHandler = sinon.spy();
                        programNodeHandler = sinon.spy();
                        transpiler = new Transpiler({
                            nodes: {
                                'CHILD': childNodeHandler,
                                'PROGRAM': programNodeHandler
                            }
                        });
                    });

                    it('should pass ' + JSON.stringify(rootScenario.expectedRootNodeHandlerData) + ' to the root node\'s handler', function () {
                        transpiler.transpile.apply(transpiler, rootScenario.rootInterpretArgs);

                        expect(programNodeHandler).to.have.been.calledWith(sinon.match.any, sinon.match.any, rootScenario.expectedRootNodeHandlerData);
                    });

                    describe('and the "data" argument to the child .transpile() call', function () {
                        _.each({
                            'is not specified': {
                                childInterpretArgs: [{
                                    name: 'CHILD'
                                }],
                                // Should inherit data from root node handler
                                expectedChildNodeHandlerData: rootScenario.expectedRootNodeHandlerData
                            },
                            'is null': {
                                childInterpretArgs: [{
                                    name: 'CHILD'
                                }, null],
                                expectedChildNodeHandlerData: null
                            },
                            'is the number 0': {
                                childInterpretArgs: [{
                                    name: 'CHILD'
                                }, 0],
                                expectedChildNodeHandlerData: 0
                            },
                            'is the number 5': {
                                childInterpretArgs: [{
                                    name: 'CHILD'
                                }, 5],
                                expectedChildNodeHandlerData: 5
                            }
                        }, function (childScenario, description) {
                            describe(description, function () {
                                it('should pass ' + JSON.stringify(childScenario.expectedChildNodeHandlerData) + ' to the child node\'s handler', function () {
                                    transpiler.transpile.apply(transpiler, rootScenario.rootInterpretArgs);

                                    programNodeHandler.args[0][1].apply(transpiler, childScenario.childInterpretArgs);

                                    expect(childNodeHandler).to.have.been.calledWith(sinon.match.any, sinon.match.any, childScenario.expectedChildNodeHandlerData);
                                });
                            });
                        });
                    });
                });
            });
        });
    });
});
