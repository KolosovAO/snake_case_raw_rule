"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
const is_function_type_1 = require("../utils/is-function-type");
const SHOULD_BE_SNAKE_CASE = "0";
const SHOULD_BE_CAMEL_CASE = "1";
const SHOULD_BE_PASCAL_CASE = "2";
const ERROR_MESSAGE = {
    [SHOULD_BE_CAMEL_CASE]: "{identifier} should be camel case",
    [SHOULD_BE_SNAKE_CASE]: "{identifier} should be snake case",
    [SHOULD_BE_PASCAL_CASE]: "{identifier} should be pascal case",
};
const isSnakeCaseCapitalized = (str) => /^[A-Z0-9]+(_[A-Z0-9]+)*$/.test(str);
const isSnakeCase = (str) => /^[a-z0-9]+(_[a-z0-9]+)*$/.test(str);
const isPascalCase = (str) => /^([A-Z][a-z0-9]+)+$/.test(str);
const hasUnderscore = (str) => str.indexOf("_") !== -1;
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
const SNAKE_CASE_TYPES = new Set([
    experimental_utils_1.AST_NODE_TYPES.TSTypeLiteral,
    experimental_utils_1.AST_NODE_TYPES.TSArrayType,
    experimental_utils_1.AST_NODE_TYPES.TSTupleType,
    experimental_utils_1.AST_NODE_TYPES.TSBooleanKeyword,
    experimental_utils_1.AST_NODE_TYPES.TSNumberKeyword,
    experimental_utils_1.AST_NODE_TYPES.TSStringKeyword,
    experimental_utils_1.AST_NODE_TYPES.TSObjectKeyword,
]);
const CAMEL_CASE_TYPES = new Set([
    experimental_utils_1.AST_NODE_TYPES.TSFunctionType,
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
function checkInit(context, type, id) {
    if (SNAKE_CASE_NODE_INIT.has(type) && !isSnakeCase(id.name)) {
        reportSnakeCase(context, id);
        return;
    }
    if (CAMEL_CASE_NODE_INIT.has(type) && hasUnderscore(id.name)) {
        reportCamelCase(context, id);
    }
}
function checkTypes(context, type, id) {
    if (SNAKE_CASE_TYPES.has(type) && !isSnakeCase(id.name)) {
        reportSnakeCase(context, id);
    }
    if (CAMEL_CASE_TYPES.has(type) && hasUnderscore(id.name)) {
        reportCamelCase(context, id);
    }
}
function checkTypeAnnotation(context, id, typeAnnotation = id.typeAnnotation) {
    if (!typeAnnotation || typeAnnotation.typeAnnotation.type !== experimental_utils_1.AST_NODE_TYPES.TSTypeReference) {
        return;
    }
    if (is_function_type_1.isFunctionType(context, typeAnnotation.typeAnnotation)) {
        if (hasUnderscore(id.name)) {
            reportCamelCase(context, id);
        }
    }
    else if (!isSnakeCase(id.name)) {
        reportSnakeCase(context, id);
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
                if (id.type !== experimental_utils_1.AST_NODE_TYPES.Identifier) {
                    return;
                }
                checkTypeAnnotation(context, id);
                if (init && !isSnakeCaseCapitalized(id.name)) {
                    checkInit(context, init.type, id);
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
                    checkInit(context, value.type, key);
                }
            },
            ClassProperty({ key, value, typeAnnotation }) {
                if (key.type !== experimental_utils_1.AST_NODE_TYPES.Identifier) {
                    return;
                }
                if (typeAnnotation) {
                    checkTypeAnnotation(context, key, typeAnnotation);
                    checkTypes(context, typeAnnotation.typeAnnotation.type, key);
                }
                if (value) {
                    checkInit(context, value.type, key);
                }
            },
            FunctionDeclaration({ id, params }) {
                if (id && hasUnderscore(id.name)) {
                    reportCamelCase(context, id);
                }
                for (const param of params) {
                    if (param.type !== experimental_utils_1.AST_NODE_TYPES.Identifier || !param.typeAnnotation) {
                        continue;
                    }
                    checkTypeAnnotation(context, param);
                    checkTypes(context, param.typeAnnotation.typeAnnotation.type, param);
                }
            },
            TSEnumDeclaration({ id }) {
                if (!isPascalCase(id.name)) {
                    reportPascalCase(context, id);
                }
            },
            TSPropertySignature({ key, typeAnnotation }) {
                if (!typeAnnotation || key.type !== experimental_utils_1.AST_NODE_TYPES.Identifier) {
                    return;
                }
                checkTypeAnnotation(context, key, typeAnnotation);
                checkTypes(context, typeAnnotation.typeAnnotation.type, key);
            },
            ClassDeclaration({ id }) {
                if (id && !isPascalCase(id.name)) {
                    reportPascalCase(context, id);
                }
            }
        };
    }
};
