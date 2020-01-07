import { TSESLint } from "@typescript-eslint/experimental-utils";
declare const INVALID_SPACE_COUNT = "0";
declare const ERROR_MESSAGE: {
    readonly [INVALID_SPACE_COUNT]: "invalid space count between union types";
};
declare type Options = [number];
declare type MessageIds = keyof typeof ERROR_MESSAGE;
export declare const union_type_spaces: TSESLint.RuleModule<MessageIds, Options>;
export {};
