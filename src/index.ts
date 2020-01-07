import { variables_case } from "./rules/variables-case";
import { union_type_spaces } from "./rules/union-type-spaces";

export = {
    rules: {
        "variables-case": variables_case,
        "union-type-spaces": union_type_spaces,
    },
};