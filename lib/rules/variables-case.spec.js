"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const experimental_utils_1 = require("@typescript-eslint/experimental-utils");
const variables_case_1 = require("./variables-case");
const parser = require.resolve("@typescript-eslint/parser");
const tester = new experimental_utils_1.TSESLint.RuleTester({
    parser,
    parserOptions: {
        ecmaVersion: 6,
        sourceType: "module",
    },
});
tester.run("variables_case", variables_case_1.variables_case, {
    valid: [
        {
            code: `
                const MAGIC_NUMBER = 364;
                const some_number = 25;
                const some_string = "str";
                const some_bool = true;
                const doSomething = () => null;

                const test_array = [1, 2, 3];

                const test_obj = {
                    a: 1,
                    b: 2,
                    doSomething: () => null,
                    some_var: []
                };

                const {a, b, ...other_items} = test_obj;
                const [el1, el2, ...other_array_items] = test_array;

                function testFunc() {
                    return 42;
                }

                function Component() {}

                class TestClass {
                    private test_num = 25;
                    private testFunc() {
                        
                    }
                }
            `,
        },
    ],
    invalid: [],
});
//# sourceMappingURL=variables-case.spec.js.map