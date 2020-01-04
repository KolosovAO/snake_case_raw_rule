"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
const SHOULD_BE_SNAKE_CASE = "0";
const SHOULD_BE_CAMEL_CASE = "1";
const SHOULD_BE_PASCAL_CASE = "2";
const ERROR_MESSAGE = {
    [SHOULD_BE_CAMEL_CASE]: "should be camel case",
    [SHOULD_BE_SNAKE_CASE]: "should be snake case",
    [SHOULD_BE_PASCAL_CASE]: "should be pascal case",
};
const isSnakeCaseCapitalized = (str) => /^[A-Z0-9]+(_[A-Z0-9]+)*$/.test(str);
const isSnakeCase = (str) => /^[a-z0-9]+(_[a-z0-9]+)*$/.test(str);
const isPascalCase = (str) => /^([A-Z][a-z0-9]+)+$/.test(str);
const SNAKE_CASE_NODE_INIT = new Set([
    experimental_utils_1.AST_NODE_TYPES.Literal,
    experimental_utils_1.AST_NODE_TYPES.ObjectExpression,
    experimental_utils_1.AST_NODE_TYPES.ArrayExpression,
    experimental_utils_1.AST_NODE_TYPES.BinaryExpression,
    experimental_utils_1.AST_NODE_TYPES.JSXElement,
]);
const CAMEL_CASE_NODE_INIT = new Set([
    experimental_utils_1.AST_NODE_TYPES.ArrowFunctionExpression,
    experimental_utils_1.AST_NODE_TYPES.FunctionExpression,
]);
function report(messageId) {
    return (context, node) => {
        context.report({
            messageId,
            node: node,
            data: {
                identifier: node.name,
            }
        });
    };
}
const reportSnakeCase = report(SHOULD_BE_SNAKE_CASE);
const reportPascalCase = report(SHOULD_BE_PASCAL_CASE);
const reportCamelCase = report(SHOULD_BE_CAMEL_CASE);
function check(context, type, id) {
    if (SNAKE_CASE_NODE_INIT.has(type) && !isSnakeCase(id.name)) {
        reportSnakeCase(context, id);
        return;
    }
    if (CAMEL_CASE_NODE_INIT.has(type) && isSnakeCase(id.name)) {
        reportCamelCase(context, id);
    }
}
exports.variables_case = {
    meta: {
        type: "problem",
        schema: [],
        docs: {},
        messages: ERROR_MESSAGE
    },
    create: (context) => {
        return {
            VariableDeclarator({ id, init }) {
                if (id.type === experimental_utils_1.AST_NODE_TYPES.Identifier && init && !isSnakeCaseCapitalized(id.name)) {
                    check(context, init.type, id);
                }
            },
            RestElement({ argument }) {
                if (argument.type === experimental_utils_1.AST_NODE_TYPES.Identifier) {
                    if (!isSnakeCase(argument.name)) {
                        reportSnakeCase(context, argument);
                    }
                }
            },
            Property({ key, value }) {
                if (key.type === experimental_utils_1.AST_NODE_TYPES.Identifier && value) {
                    check(context, value.type, key);
                }
            },
            ClassProperty({ key, value }) {
                if (key.type === experimental_utils_1.AST_NODE_TYPES.Identifier && value) {
                    check(context, value.type, key);
                }
            },
            FunctionDeclaration({ id }) {
                if (id && isSnakeCase(id.name)) {
                    reportCamelCase(context, id);
                }
            },
            TSEnumDeclaration({ id }) {
                if (!isPascalCase(id.name)) {
                    reportPascalCase(context, id);
                }
            },
            ClassDeclaration({ id }) {
                if (id && !isPascalCase(id.name)) {
                    reportPascalCase(context, id);
                }
            }
        };
    }
};
//# sourceMappingURL=variables-case.js.map