import type {
  RouteOptions,
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
} from "fastify";
import StatusCodes from "http-status-codes";

import type {
  FinalValueResponseAction,
  RecordedActionsSansDigit,
  ServerResponseError,
} from "./shared/types";
import {
  calculatorRequest,
  calculatorResponse,
  errorResponse,
} from "./shared/schema";

import evaluateExpression from "./calculator";
import type { ExpressionContext } from "./calculator";

import {
  ERR_APP_CALCULATOR_REJECT,
  API_REST_PATH_SUFFIX,
} from "./shared/constants";

const calculatorRoute: RouteOptions<
  RawServerDefault,
  RawRequestDefaultExpression,
  RawReplyDefaultExpression,
  Required<{
    Body: RecordedActionsSansDigit[];
    Reply: ServerResponseError | FinalValueResponseAction;
    Headers: {
      "content-type": "application/json";
      [index: string]: string;
    };
  }>
> = {
  method: "POST",
  url: API_REST_PATH_SUFFIX,
  schema: {
    querystring: false,
    params: false,
    body: {
      $ref: calculatorRequest.$id,
    },
    response: {
      [StatusCodes.OK]: { $ref: calculatorResponse.$id },
      [StatusCodes.BAD_REQUEST]: { $ref: errorResponse.$id },
      [StatusCodes.INTERNAL_SERVER_ERROR]: { $ref: errorResponse.$id },
    },
  },
  handler: async function (req, reply): Promise<void> {
    const ctx: ExpressionContext = { rank: 0, position: 0 };
    const token: RecordedActionsSansDigit[] = req.body;
    const result = evaluateExpression(token, ctx);
    //
    if (!isNaN(result)) {
      reply
        .code(StatusCodes.OK)
        .send({ type: "value", payload: String(result) });
      return;
    }
    // invalid request
    const errorObj = {
      error: {
        code: ERR_APP_CALCULATOR_REJECT,
        message: ctx.reason ?? "severe: no reason could be obtained", // it is never undefined here
        reqId: String(req.id),
      },
    };
    if (!this.isProduction) {
      Object.assign(errorObj, { ctx });
    }
    reply.status(400).send(errorObj);
  },
};

export default calculatorRoute;
