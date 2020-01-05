import { TSESLint, AST_NODE_TYPES, TSESTree } from "@typescript-eslint/experimental-utils";

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

function check(context:TSESLint.RuleContext<MessageIds, Options>, type: AST_NODE_TYPES, id:TSESTree.Identifier):void {
    if (SNAKE_CASE_NODE_INIT.has(type) && !isSnakeCase(id.name)) {
        reportSnakeCase(context, id);
        return;
    }

    if (CAMEL_CASE_NODE_INIT.has(type) && isSnakeCase(id.name)) {
        reportCamelCase(context, id);
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
                if (id.type === AST_NODE_TYPES.Identifier && init && !isSnakeCaseCapitalized(id.name)) {
                    check(context, init.type, id);
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
                    check(context, value.type, key);
                }
            },
            ClassProperty({key, value}) {
                if (key.type === AST_NODE_TYPES.Identifier && value) {
                    check(context, value.type, key);
                }
            },
            FunctionDeclaration({id}) {
                if (id && isSnakeCase(id.name)) {
                    reportCamelCase(context, id);
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
                switch(typeAnnotation.typeAnnotation.type) {
                    case AST_NODE_TYPES.TSFunctionType:
                        if (isSnakeCase(key.name)) {
                            reportCamelCase(context, key);
                        }
                        break;
                    case AST_NODE_TYPES.TSTypeLiteral:
                    case AST_NODE_TYPES.TSArrayType:
                    case AST_NODE_TYPES.TSTupleType:
                    case AST_NODE_TYPES.TSBooleanKeyword:
                    case AST_NODE_TYPES.TSNumberKeyword:
                    case AST_NODE_TYPES.TSStringKeyword:
                    case AST_NODE_TYPES.TSObjectKeyword:
                        if (!isSnakeCase(key.name)) {
                            reportSnakeCase(context, key);
                        }
                        break;
                }
            },
            ClassDeclaration({id}) {
                if (id && !isPascalCase(id.name)) {
                    reportPascalCase(context, id);
                }
            }
        };
    }
};