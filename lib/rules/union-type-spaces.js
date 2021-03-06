"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const INVALID_SPACE_COUNT = "0";
const ERROR_MESSAGE = {
    [INVALID_SPACE_COUNT]: "invalid space count between union types",
};
exports.union_type_spaces = {
    meta: {
        type: "problem",
        docs: {},
        messages: ERROR_MESSAGE,
        fixable: "whitespace",
        schema: [
            {
                type: "number",
                default: 0
            },
        ],
    },
    create: (context) => {
        const source_code = context.getSourceCode();
        const space_count = context.options[0];
        const space_string = " ".repeat(space_count);
        const join_pattern = space_string + "|" + space_string;
        return {
            TSUnionType(node) {
                const raw_text = source_code.getText(node);
                // ignore multiline
                if (raw_text.indexOf("\n") !== -1) {
                    return;
                }
                const expected_text = raw_text
                    .split("|")
                    .map(type => type.trim())
                    .join(join_pattern);
                if (raw_text !== expected_text) {
                    context.report({
                        messageId: INVALID_SPACE_COUNT,
                        node: node,
                        fix(fixer) {
                            return fixer.replaceText(node, expected_text);
                        }
                    });
                }
            }
        };
    }
};
