import { FastifyInstance } from "fastify";

import setup from "../../../setupServer";
import permanentOverrides from "../../../permanent-overrides";
import {
  ERR_APP_CALCULATOR_REJECT,
  API_REST_PATH_SUFFIX,
} from "../shared/constants";

describe("app integration test", () => {
  const url = API_REST_PATH_SUFFIX;

  let NODE_ENV: string | undefined;
  let root: FastifyInstance;

  beforeEach(async () => {
    NODE_ENV = process.env.NODE_ENV;
    root = setup({ ...permanentOverrides }, () => void 0);
  });

  afterEach(() => {
    process.env.NODE_ENV = NODE_ENV;
  });

  describe("calculation integration tests", () => {
    it("5x2 returns 10", async () => {
      const response = await root.inject({
        method: "POST",
        url,
        payload: [
          { type: "value", payload: 5 },
          { type: "multiply" },
          { type: "value", payload: 2 },
        ],
      });
      expect(JSON.parse(response.body)).toEqual({
        type: "value",
        payload: "10",
      });
      expect(response.statusCode).toBe(200);
    });
    it("6 x .2 returns 1.2", async () => {
      const response = await root.inject({
        method: "POST",
        url,
        payload: [
          { type: "value", payload: 6 },
          { type: "multiply" },
          { type: "value", payload: 0.2 },
        ],
      });
      expect(JSON.parse(response.body)).toEqual({
        type: "value",
        payload: "1.2000000000000002",
      });
      expect(response.statusCode).toBe(200);
    });
  });

  describe("edge cases and errors", () => {
    it("force http-400: (non production) 0/0 should return NaN ( 5 + 3*2 + 0/0 + 4*5 - 2/3)", async () => {
      const requestData = [
        { type: "value", payload: 5 },
        { type: "add" },
        { type: "value", payload: 3 },
        { type: "multiply" },
        { type: "value", payload: 2 },
        { type: "add" },
        { type: "value", payload: 0 },
        { type: "divide" },
        { type: "value", payload: 0 },
        { type: "add" },
        { type: "value", payload: 4 },
        { type: "multiply" },
        { type: "value", payload: 5 },
        { type: "subtract" },
        { type: "value", payload: 2 },
        { type: "divide" },
        { type: "value", payload: 3 },
      ];
      const response = await root.inject({
        method: "POST",
        url,
        payload: requestData,
      });
      expect(response.json()).toEqual({
        error: {
          code: ERR_APP_CALCULATOR_REJECT,
          message: "Expression between 7 and 9 yielded a NaN",
          reqId: "req-1",
        },
        ctx: {
          failureAt: 6,
          position: 4,
          rank: 0,
          reason: "Expression between 7 and 9 yielded a NaN",
        },
      });
      expect(response.statusCode).toBe(400);
    });
    it("force http-400: (production) 0/0 should return NaN ( 5 + 3*2 + 0/0 + 4*5 - 2/3)", async () => {
      process.env.NODE_ENV = "production";
      const localInstance = setup({ ...permanentOverrides }, () => void 0);
      const requestData = [
        { type: "value", payload: 5 },
        { type: "add" },
        { type: "value", payload: 3 },
        { type: "multiply" },
        { type: "value", payload: 2 },
        { type: "add" },
        { type: "value", payload: 0 },
        { type: "divide" },
        { type: "value", payload: 0 },
        { type: "add" },
        { type: "value", payload: 4 },
        { type: "multiply" },
        { type: "value", payload: 5 },
        { type: "subtract" },
        { type: "value", payload: 2 },
        { type: "divide" },
        { type: "value", payload: 3 },
      ];
      const response = await localInstance.inject({
        method: "POST",
        url,
        payload: requestData,
      });
      expect(response.json()).toEqual({
        error: {
          code: ERR_APP_CALCULATOR_REJECT,
          message: "Expression between 7 and 9 yielded a NaN",
          reqId: "req-1",
        },
      });
      expect(response.statusCode).toBe(400);
    });
    it("force http-400 response, no request body", async () => {
      const response = await root.inject({
        method: "POST",
        url,
        payload: "",
      });
      expect(response.json()).toEqual({
        error: { code: 400, message: "Invalid Request sent", reqId: "req-1" },
      });
      expect(response.statusCode).toBe(400);
    });
    it("force http-500 response: (production) Unsupported media type in request", async () => {
      process.env.NODE_ENV = "production";
      const localInstance = setup({ ...permanentOverrides }, () => void 0);
      const response = await localInstance.inject({
        method: "POST",
        url,
        headers: {
          "content-type": "xyz",
        },
      });
      expect(response.json()).toEqual({
        error: {
          code: 500,
          message: "internal server error: Unsupported Media Type: xyz",
          reqId: "req-1",
        },
      });
      expect(response.statusCode).toBe(500);
    });
    it("force http-500 response: (non production) Unsupported media type in request", async () => {
      const response = await root.inject({
        method: "POST",
        url,
        headers: {
          "content-type": "xyz",
        },
      });
      const errorBody: Record<string, Record<string, string>> = JSON.parse(
        response.body
      ) as Record<string, Record<string, string>>;
      const errorMessage = errorBody?.error?.message;
      expect(errorMessage).toMatch(
        /internal server error: FastifyError: Unsupported Media Type/
      );
      expect(errorMessage.length).toBeGreaterThan(1000);
      expect(response.statusCode).toBe(500);
    });

    describe("jsonschema validation rejection", () => {
      it("force http-400, jsonSchema validation rejection, empty token list", async () => {
        const response = await root.inject({
          method: "POST",
          url,
          payload: [],
        });
        expect(response.json()).toEqual({
          error: { code: 400, message: "Invalid Request sent", reqId: "req-1" },
        });
        expect(response.statusCode).toBe(400);
      });
      it("force http-400, jsonSchema validation rejection, invalid token in the list", async () => {
        const response = await root.inject({
          method: "POST",
          url,
          payload: [{ type: "xmultiply" }],
        });
        expect(response.json()).toEqual({
          error: { code: 400, message: "Invalid Request sent", reqId: "req-1" },
        });
        expect(response.statusCode).toBe(400);
      });
    });
  });
});
