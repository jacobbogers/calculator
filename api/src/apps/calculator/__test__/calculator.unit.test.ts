import type { ExpressionContext } from "../calculator";
import evaluateExpression from "../calculator";

describe("calculator unit test", () => {
  describe("Evaluate Expressions", () => {
    it("6 x 0.2 = 1.2", () => {
      const ctx: ExpressionContext = { rank: 0, position: 0 };
      const result = evaluateExpression(
        [
          { type: "value", payload: 6 },
          { type: "multiply" },
          { type: "value", payload: 0.2 },
        ],
        ctx,
      );
      expect(result).toBe(1.2000000000000002);
    });
    it("4 x 5 + 2 x 11 = 42", () => {
      const ctx: ExpressionContext = { rank: 0, position: 0 };
      const result = evaluateExpression(
        [
          { type: "value", payload: 4 },
          { type: "multiply" },
          { type: "value", payload: 5 },
          { type: "add" },
          { type: "value", payload: 2 },
          { type: "multiply" },
          { type: "value", payload: 11 },
        ],
        ctx,
      );
      expect(result).toBe(42);
      expect(ctx).toEqual({ position: 6, rank: 0 });
    });
    it("Expression is a value digit 1.42334E-23", () => {
      const ctx: ExpressionContext = { rank: 0, position: 0 };
      const result = evaluateExpression(
        [{ type: "value", payload: 1.42334e-23 }],
        ctx,
      );
      expect(result).toBe(1.42334e-23);
      expect(ctx).toEqual({ position: 0, rank: 0 });
    });
    it("5x2+5/2+1.2E-8/1.2E-16+18 returns 100000030.5", () => {
      const ctx: ExpressionContext = { rank: 0, position: 0 };
      const result = evaluateExpression(
        [{ type: "value", payload: 1.42334e-23 }],
        ctx,
      );
      expect(result).toBe(1.42334e-23);
      expect(ctx).toEqual({ position: 0, rank: 0 });
    });
    it("5x2+5/2+1.2E-8/1.2E-16+18 returns 100000030.5", async () => {
      const ctx: ExpressionContext = { rank: 0, position: 0 };
      const result = evaluateExpression(
        [
          { type: "value", payload: 5 },
          { type: "multiply" },
          { type: "value", payload: 2 },
          { type: "add" },
          { type: "value", payload: 5 },
          { type: "divide" },
          { type: "value", payload: 2 },
          { type: "add" },
          { type: "value", payload: 1.2e-8 },
          { type: "divide" },
          { type: "value", payload: 1.2e-16 },
          { type: "add" },
          { type: "value", payload: 18 },
        ],
        ctx,
      );
      expect(result).toBe(100000030.5);
      expect(ctx).toEqual({ position: 12, rank: 0 });
    });
  });
  describe("invalid expressions and edge cases", () => {
    it("empty expression", () => {
      const ctx: ExpressionContext = { rank: 0, position: 0 };
      const result = evaluateExpression([], ctx);
      expect(result).toBeNaN();
      expect(ctx).toEqual({
        failureAt: 0,
        position: 0,
        rank: 0,
        reason: "Expected a value",
      });
    });
    it("Expression is a value NaN", () => {
      const ctx: ExpressionContext = { rank: 0, position: 0 };
      const result = evaluateExpression([{ type: "value", payload: NaN }], ctx);
      expect(ctx).toEqual({
        rank: 0,
        position: 0,
        failureAt: 0,
        reason: "Not a valid number",
      });
      expect(result).toBeNaN();
    });
    it("dangling operator ( 4 x ..  = )", () => {
      const ctx: ExpressionContext = { rank: 0, position: 0 };
      const result = evaluateExpression(
        [{ type: "value", payload: 4 }, { type: "multiply" }],
        ctx,
      );
      expect(ctx).toEqual({
        failureAt: 1,
        position: 0,
        rank: 0,
        reason: "Expression ends with a dangling Operator",
      });
      expect(result).toBeNaN();
    });
    it("two values with no operator in between ( 4 6..  = )", () => {
      const ctx: ExpressionContext = { rank: 0, position: 0 };
      const result = evaluateExpression(
        [
          { type: "value", payload: 4 },
          { type: "value", payload: 6 },
        ],
        ctx,
      );
      expect(ctx).toEqual({
        failureAt: 1,
        position: 0,
        rank: 0,
        reason: "Expecting an operator at position 2",
      });
      expect(result).toBeNaN();
    });
    it("dangling operator in subexpression ( 4 + 6 * ..  = )", () => {
      const ctx: ExpressionContext = { rank: 0, position: 0 };
      const result = evaluateExpression(
        [
          { type: "value", payload: 4 },
          { type: "multiply" },
          { type: "value", payload: 6 },
          { type: "add" },
        ],
        ctx,
      );
      expect(ctx).toEqual({
        failureAt: 3,
        position: 0,
        rank: 0,
        reason: "Expression ends with a dangling Operator",
      });
      expect(result).toBeNaN();
    });
    it("expression must start with a value ( x 6  = )", () => {
      const ctx: ExpressionContext = { rank: 0, position: 0 };
      const result = evaluateExpression(
        [{ type: "multiply" }, { type: "value", payload: 4 }],
        ctx,
      );
      expect(ctx).toEqual({
        failureAt: 0,
        position: 0,
        rank: 0,
        reason: "Expected a value",
      });
      expect(result).toBeNaN();
    });
    it("Expression contains Infinity (  4 x 6 - Infinity= )", () => {
      const ctx: ExpressionContext = { rank: 0, position: 0 };
      const result = evaluateExpression(
        [
          { type: "value", payload: 4 },
          { type: "multiply" },
          { type: "value", payload: 6 },
          { type: "subtract" },
          { type: "value", payload: Infinity },
        ],
        ctx,
      );
      expect(result).toBe(-Infinity);
      expect(ctx).toEqual({ position: 4, rank: 0 });
    });
    it("Division by zero (  1 / 0 = Infinity ) and (-1/0 = -Infinity)", () => {
      {
        const ctx: ExpressionContext = { rank: 0, position: 0 };
        const result = evaluateExpression(
          [
            { type: "value", payload: 1 },
            { type: "divide" },
            { type: "value", payload: 0 },
          ],
          ctx,
        );
        expect(result).toBe(Infinity);
        expect(ctx).toEqual({ position: 2, rank: 0 });
      }
      {
        const ctx: ExpressionContext = { rank: 0, position: 0 };
        const result = evaluateExpression(
          [
            { type: "value", payload: -1 },
            { type: "divide" },
            { type: "value", payload: 0 },
          ],
          ctx,
        );
        expect(result).toBe(-Infinity);
        expect(ctx).toEqual({ position: 2, rank: 0 });
      }
    });
    it("valid expression syntax 0/0, result is a NaN", () => {
      const ctx: ExpressionContext = { rank: 0, position: 0 };
      const result = evaluateExpression(
        [
          { type: "value", payload: 0 },
          { type: "divide" },
          { type: "value", payload: 0 },
        ],
        ctx,
      );
      expect(result).toBeNaN();
      expect(ctx).toEqual({
        position: 0,
        rank: 0,
        failureAt: 0,
        reason: "Expression between 1 and 3 yielded a NaN",
      });
    });
    it("valid expression syntax (5+2+0/0+7), result is a NaN", () => {
      const ctx: ExpressionContext = { rank: 0, position: 0 };
      const result = evaluateExpression(
        [
          { type: "value", payload: 5 },
          { type: "add" },
          { type: "value", payload: 2 },
          { type: "add" },
          { type: "value", payload: 0 },
          { type: "divide" },
          { type: "value", payload: 0 },
          { type: "add" },
          { type: "value", payload: 7 },
        ],
        ctx,
      );
      expect(result).toBeNaN();
      expect(ctx).toEqual({
        failureAt: 4,
        position: 2,
        rank: 0,
        reason: "Expression between 5 and 7 yielded a NaN",
      });
    });
  });
});
