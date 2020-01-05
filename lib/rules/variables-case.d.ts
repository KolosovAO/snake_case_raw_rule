import { TSESLint } from "@typescript-eslint/experimental-utils";
declare const SHOULD_BE_SNAKE_CASE = "0";
declare const SHOULD_BE_CAMEL_CASE = "1";
declare const SHOULD_BE_PASCAL_CASE = "2";
declare const ERROR_MESSAGE: {
    readonly [SHOULD_BE_CAMEL_CASE]: "should be camel case";
    readonly [SHOULD_BE_SNAKE_CASE]: "should be snake case";
    readonly [SHOULD_BE_PASCAL_CASE]: "should be pascal case";
};
declare type Options = [];
declare type MessageIds = keyof typeof ERROR_MESSAGE;
export declare const variables_case: TSESLint.RuleModule<MessageIds, Options>;
export {};
