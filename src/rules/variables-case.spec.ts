import { TSESLint } from "@typescript-eslint/experimental-utils";
import { variables_case } from "./variables-case";

const parser = require.resolve("@typescript-eslint/parser");

const tester = new TSESLint.RuleTester({
    parser,
    parserOptions: {
        ecmaVersion: 6,
        sourceType: "module",
    },
});

tester.run("variables_case", variables_case, {
    valid: [
        {
            code: `
                const MAGIC_NUMBER = 364;
                const some_number = 25;
                const some_string = "str";
                const some_bool = true;
                const doSomething = () => null;

                const array_with = [1, 2, 3];

                const object_with = {
                    a: 1,
                    b: 2,
                    doSomething: () => null,
                    some_var: []
                };

                function whatAfunc() {
                    return 42;
                }

                function Component() {}

                class Ab {
                    private test_num = 25;
                }
            `,
        },
    ],
    invalid: [

    ],
});