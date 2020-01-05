import { TSESLint } from "@typescript-eslint/experimental-utils";
import { variables_case } from "./variables-case";
import path from "path";

const parser = require.resolve("@typescript-eslint/parser");

const tester = new TSESLint.RuleTester({
    parser,
    parserOptions: {
        ecmaVersion: 6,
        sourceType: "module",
        project: "./testtsconfig.json"
    },
});

tester.run("variables_case", variables_case, {
    valid: [
        {
            filename: path.join(__dirname, "test.ts"),
            code: `
                interface ITest {
                    twenty_two: 22;
                    callableFn: () => void;
                    bool_var: boolean;
                }

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

                function func() {}

                function funcWithParams(num_param: number, funcParam: () => void) {}

                function Component() {}

                type Fn = () => void;

                class TestClass {
                    private test_num = 25;
                    private testFn:Fn;
                    private testFunc() {}
                }
            `,
        },
    ],
    invalid: [],
});