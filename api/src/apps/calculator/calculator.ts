import { RecordedActionsSansDigit } from "./shared/types";

const operatorRank = {
  "=": 0,
  subtract: 5,
  add: 5,
  multiply: 10,
  divide: 10,
  // TODO: could add more operators like x^y, explicit '(' and ')' etc
};

const operatorFunctionMap = {
  subtract: (a: number, b: number) => a - b,
  add: (a: number, b: number) => a + b,
  multiply: (a: number, b: number) => a * b,
  divide: (a: number, b: number) => a / b,
  // TODO: could add more operators like x^y, explicit '(' and ')' etc
};

export type ExpressionContext = {
  rank: number;
  position: number;
  failureAt?: number;
  reason?: string;
};

export default function evaluateExpression(
  data: RecordedActionsSansDigit[],
  ctx: ExpressionContext
): number {
  // start of context so there must be at least something on data[position]
  const leftToken = data[ctx.position];
  if (leftToken?.type !== "value") {
    ctx.failureAt = ctx.position;
    ctx.reason = "Expected a value";
    return NaN;
  }

  let leftValue = leftToken.payload;
  if (isNaN(leftValue)) {
    ctx.failureAt = ctx.position;
    ctx.reason = "Not a valid number";
    return NaN;
  }
  // EOL?
  while (ctx.position < data.length - 1) {
    // next token should be an operator
    const operator = data[ctx.position + 1];
    if (operator.type === "value") {
      ctx.failureAt = ctx.position + 1;
      ctx.reason = `Expecting an operator at position ${ctx.position + 2}`;
      return NaN;
    }

    // there must be data after the operator (sneak peek)
    if (ctx.position + 2 > data.length - 1) {
      ctx.failureAt = ctx.position + 1;
      ctx.reason = "Expression ends with a dangling Operator";
      return NaN;
    }

    // if the operator has equal or lower rank then this context we close the context and return leftValue

    const rank = operatorRank[operator.type];
    if (rank <= ctx.rank) {
      return leftValue;
    }
    // at this point we create a sub-context for a new Expression on the "right hand side"
    // create subContext
    const subctx: ExpressionContext = { position: ctx.position + 2, rank };
    const rightValue = evaluateExpression(data, subctx);

    // propagate error up the chain of sub-expressions
    if (isNaN(rightValue)) {
      if (subctx?.failureAt) {
        ctx.failureAt = subctx.failureAt;
      }
      if (subctx?.reason) {
        ctx.reason = subctx.reason;
      }
      return NaN;
    }
    // Now we collapse the expression to one Value
    const operatorFunction = operatorFunctionMap[operator.type];
    const result = operatorFunction(leftValue, rightValue);
    if (isNaN(result)) {
      ctx.failureAt = ctx.position;
      ctx.reason = `Expression between ${ctx.position + 1} and ${
        subctx.position + 1
      } yielded a NaN`;
      return NaN;
    }
    /*if (!isFinite(result)) {
      ctx.failureAt = ctx.position;
      ctx.reason = `Expression between ${ctx.position + 1} and ${
        subctx.position + 1
      } yielded a Infinity`;
      return Infinity;
    }*/
    leftValue = result;
    ctx.position = subctx.position;
    // rinse and repeat
  }
  return leftValue;
}
