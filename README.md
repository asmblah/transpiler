Transpiler
==========

[![Build Status](https://secure.travis-ci.org/asmblah/transpiler.png?branch=master)](http://travis-ci.org/asmblah/transpiler)

AST-based transpiler wrapper.

Usage
-----
```javascript
var myTranspiler = require('transpiler').create(<spec>);

var myResult = myTranspiler.transpile(<AST>, <DATA|null>, [<OPTIONS>]);
```

Here's a transpiler for a very simple AST spec that represents expressions:

```javascript
var transpilerSpec = {
    nodes: {
        'EXPR': function (node, transpile) {
            return transpile(node.left) + ' ' + node.operator + ' ' + transpile(node.right);
        },
        'OPERAND': function (node) {
            return node.value;
        }
    }
};
```
We can create a transpiler that uses this spec like so:

```javascript
var expressionTranspiler = require('transpiler').create(transpilerSpec);
```
Now we're ready to perform a transpile. Let's start with a simple example, here's my AST:

```javascript
var myAST = {
    name: 'EXPR',
    left: {
        name: 'OPERAND',
        value: 21
    },
    operator: '+',
    right: {
        name: 'OPERAND',
        value: 27
    }
};
```

And let's transpile:

```javascript
console.log(expressionTranspiler.transpile(myAST)); // Logs '21 + 27'
```

Overrides
---------

It's possible to override or customise the way certain nodes are transpiled.
As an example, let's change it so that operands with the value 27 are wrapped in `yes(...)`.
Here's my AST again:

```javascript
var myAST = {
    name: 'EXPR',
    left: {
        name: 'OPERAND',
        value: 21
    },
    operator: '+',
    right: {
        name: 'OPERAND',
        value: 27
    }
};
```
Now let's transpile, but this time we'll specify a custom way to transpile `OPERAND` nodes:

```javascript
console.log(expressionTranspiler.transpile(myAST, null, {
    nodes: {
        'OPERAND': function (node, transpile, context, original) {
            if (node.value === 27) {
                return 'yes(' + original(node) + ')';
            }

            return original(node);
        }
    }
})); // Logs '21 + yes(27)'
```

Keeping up to date
------------------
- [Follow me on Twitter](https://twitter.com/@asmblah) for updates: [https://twitter.com/@asmblah](https://twitter.com/@asmblah)
