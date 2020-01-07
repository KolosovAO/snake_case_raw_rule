import { TSESLint } from "@typescript-eslint/experimental-utils";
import { union_type_spaces } from "./union-type-spaces";

const tester = new TSESLint.RuleTester({
    parser: require.resolve("@typescript-eslint/parser"),
    parserOptions: {
        ecmaVersion: 6,
        sourceType: "module"
    },
});

tester.run("union-type-spaces", union_type_spaces, {
    valid: [
        {
            code: `const a:"1"|"2" = "2";`,
        },
    ],
    invalid: [
        {
            code: `const a:"1"| "2" = "2";`,
            errors: [
                {
                    messageId: "0"
                }
            ]
        }
    ],
});