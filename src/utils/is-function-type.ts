import { TSESLint, TSESTree } from "@typescript-eslint/experimental-utils";
import { SyntaxKind, Symbol } from "typescript";

const isSymbolIsFunctionType = (symbol: Symbol):boolean => symbol.declarations.some(({kind}) => kind === SyntaxKind.FunctionType);

export function isFunctionType<M extends string, O extends unknown[]>(context:TSESLint.RuleContext<M, O>, node:TSESTree.TSTypeReference):boolean {
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