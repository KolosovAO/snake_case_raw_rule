"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typescript_1 = require("typescript");
const isSymbolIsFunctionType = (symbol) => symbol.declarations.some(({ kind }) => kind === typescript_1.SyntaxKind.FunctionType);
function isFunctionType(context, node) {
    const parserServices = context.parserServices;
    if (!parserServices || !parserServices.program || !parserServices.esTreeNodeToTSNodeMap) {
        throw Error("no \"parserOptions.project\" property for @typescript-eslint/parser.");
    }
    const typeChecker = parserServices.program.getTypeChecker();
    const typescript_node = parserServices.esTreeNodeToTSNodeMap.get(node);
    const type = typeChecker.getTypeAtLocation(typescript_node);
    if (type.symbol) {
        return isSymbolIsFunctionType(type.symbol);
    }
    if (type.isUnion()) {
        return type.types.some((innerType) => !!innerType.symbol && isSymbolIsFunctionType(innerType.symbol));
    }
    return false;
}
exports.isFunctionType = isFunctionType;
