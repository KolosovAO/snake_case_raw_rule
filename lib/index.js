"use strict";
const variables_case_1 = require("./rules/variables-case");
const union_type_spaces_1 = require("./rules/union-type-spaces");
module.exports = {
    rules: {
        "variables-case": variables_case_1.variables_case,
        "union-type-spaces": union_type_spaces_1.union_type_spaces,
    },
};
