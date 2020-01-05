import { TSESLint, AST_NODE_TYPES, TSESTree } from "@typescript-eslint/experimental-utils";
import { isFunctionType } from "../utils/is-function-type";

const SHOULD_BE_SNAKE_CASE = "0";
const SHOULD_BE_CAMEL_CASE = "1";
const SHOULD_BE_PASCAL_CASE = "2";

const ERROR_MESSAGE = {
    [SHOULD_BE_CAMEL_CASE]: "should be camel case",
    [SHOULD_BE_SNAKE_CASE]: "should be snake case",
    [SHOULD_BE_PASCAL_CASE]: "should be pascal case",
} as const;

type Options = [];
type MessageIds = keyof typeof ERROR_MESSAGE;

const isSnakeCaseCapitalized = (str:string):boolean => /^[A-Z0-9]+(_[A-Z0-9]+)*$/.test(str);
const isSnakeCase = (str:string):boolean => /^[a-z0-9]+(_[a-z0-9]+)*$/.test(str);
const isPascalCase = (str:string):boolean => /^([A-Z][a-z0-9]+)+$/.test(str);
const hasUnderscore = (str:string):boolean => str.indexOf("_") !== -1;

const SNAKE_CASE_NODE_INIT = new Set([
    AST_NODE_TYPES.Literal,
    AST_NODE_TYPES.ObjectExpression,
    AST_NODE_TYPES.ArrayExpression,
    AST_NODE_TYPES.BinaryExpression,
    AST_NODE_TYPES.JSXElement,
]);

const CAMEL_CASE_NODE_INIT = new Set([
    AST_NODE_TYPES.ArrowFunctionExpression,
    AST_NODE_TYPES.FunctionExpression,
]);

const SNAKE_CASE_TYPES = new Set([
    AST_NODE_TYPES.TSTypeLiteral,
    AST_NODE_TYPES.TSArrayType,
    AST_NODE_TYPES.TSTupleType,
    AST_NODE_TYPES.TSBooleanKeyword,
    AST_NODE_TYPES.TSNumberKeyword,
    AST_NODE_TYPES.TSStringKeyword,
    AST_NODE_TYPES.TSObjectKeyword,
]);

const CAMEL_CASE_TYPES = new Set([
    AST_NODE_TYPES.TSFunctionType,
]);

function report(messageId:MessageIds): (context:TSESLint.RuleContext<MessageIds, Options>, node:TSESTree.Identifier) => void {
    return (context, node) => {
        context.report({
            messageId,
            node: node,
            data: {
                identifier: node.name,
            }
        });
    }
}

const reportSnakeCase = report(SHOULD_BE_SNAKE_CASE);
const reportPascalCase = report(SHOULD_BE_PASCAL_CASE);
const reportCamelCase = report(SHOULD_BE_CAMEL_CASE);

function checkInit(context:TSESLint.RuleContext<MessageIds, Options>, type: AST_NODE_TYPES, id:TSESTree.Identifier):void {
    if (SNAKE_CASE_NODE_INIT.has(type) && !isSnakeCase(id.name)) {
        reportSnakeCase(context, id);
        return;
    }

    if (CAMEL_CASE_NODE_INIT.has(type) && hasUnderscore(id.name)) {
        reportCamelCase(context, id);
    }
}

function checkTypes(context:TSESLint.RuleContext<MessageIds, Options>, type: AST_NODE_TYPES, id:TSESTree.Identifier):void {
    if (SNAKE_CASE_TYPES.has(type) && !isSnakeCase(id.name)) {
        reportSnakeCase(context, id);
    }

    if (CAMEL_CASE_TYPES.has(type) && hasUnderscore(id.name)) {
        reportCamelCase(context, id);
    }
}

function checkTypeAnnotation(context:TSESLint.RuleContext<MessageIds, Options>, id:TSESTree.Identifier, typeAnnotation = id.typeAnnotation):void {
    if (!typeAnnotation || typeAnnotation.typeAnnotation.type !== AST_NODE_TYPES.TSTypeReference) {
        return;
    }

    if (isFunctionType(context, typeAnnotation.typeAnnotation)) {
        if (hasUnderscore(id.name)) {
            reportCamelCase(context, id);
        }
    } else if (!isSnakeCase(id.name)) {
        reportSnakeCase(context, id);
    }
}

export const variables_case:TSESLint.RuleModule<MessageIds, Options> = {
    meta: {
        type: "problem",
        schema: [],
        docs: {} as any,
        messages: ERROR_MESSAGE
    },
    create: (context) => {
        return {
            VariableDeclarator({id, init}) {
                if (id.type !== AST_NODE_TYPES.Identifier) {
                    return;
                }

                checkTypeAnnotation(context, id);

                if (init && !isSnakeCaseCapitalized(id.name)) {
                    checkInit(context, init.type, id);
                }
            },
            RestElement({argument}) {
                if (argument.type === AST_NODE_TYPES.Identifier) {
                    if (!isSnakeCase(argument.name)) {
                        reportSnakeCase(context, argument);
                    }
                }
            },
            Property({key, value}) {
                if (key.type === AST_NODE_TYPES.Identifier && value) {
                    checkInit(context, value.type, key);
                }
            },
            ClassProperty({key, value, typeAnnotation}) {
                if (key.type !== AST_NODE_TYPES.Identifier) {
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
            FunctionDeclaration({id, params}) {
                if (id && hasUnderscore(id.name)) {
                    reportCamelCase(context, id);
                }

                for (const param of params) {
                    if (param.type !== AST_NODE_TYPES.Identifier || !param.typeAnnotation) {
                        continue;
                    }
                    checkTypeAnnotation(context, param);
                    checkTypes(context, param.typeAnnotation.typeAnnotation.type, param);
                }
            },
            TSEnumDeclaration({id}) {
                if (!isPascalCase(id.name)) {
                    reportPascalCase(context, id);
                }
            },
            TSPropertySignature({key, typeAnnotation}) {
                if (!typeAnnotation || key.type !== AST_NODE_TYPES.Identifier) {
                    return;
                }

                checkTypeAnnotation(context, key, typeAnnotation);
                checkTypes(context, typeAnnotation.typeAnnotation.type, key);
            },
            ClassDeclaration({id}) {
                if (id && !isPascalCase(id.name)) {
                    reportPascalCase(context, id);
                }
            }
        };
    }
};