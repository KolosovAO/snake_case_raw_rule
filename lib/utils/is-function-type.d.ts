import { TSESLint, TSESTree } from "@typescript-eslint/experimental-utils";
export declare function isFunctionType<M extends string, O extends unknown[]>(context: TSESLint.RuleContext<M, O>, node: TSESTree.TSTypeReference): boolean;
