const divideSchema = {
  type: "object",
  properties: {
    type: {
      type: "string",
      const: "divide",
    },
  },
  required: ["type"],
  additionalProperties: false,
};

const additionSchema = {
  type: "object",
  properties: {
    type: {
      type: "string",
      const: "add",
    },
  },
  required: ["type"],
  additionalProperties: false,
};

const subtractSchema = {
  type: "object",
  properties: {
    type: {
      type: "string",
      const: "subtract",
    },
  },
  required: ["type"],
  additionalProperties: false,
};

const valueSchema = {
  type: "object",
  properties: {
    type: {
      type: "string",
      const: "value",
    },
    payload: {
      type: "number",
    },
  },
  required: ["type", "payload"],
  additionalProperties: false,
};

const finalValueSchema = {
  type: "object",
  properties: {
    type: {
      type: "string",
      const: "value",
    },
    payload: {
      type: "string",
    },
  },
  required: ["type", "payload"],
  additionalProperties: false,
};

const multiplySchema = {
  type: "object",
  properties: {
    type: {
      type: "string",
      const: "multiply",
    },
  },
  required: ["type"],
  additionalProperties: false,
};

export const calculatorRequest = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Calculator Engine Request",
  $id: "https://redspher.com/calculator/request",
  type: "array",
  minItems: 1,
  items: {
    oneOf: [
      multiplySchema,
      divideSchema,
      additionSchema,
      subtractSchema,
      valueSchema,
    ],
  },
};

export const calculatorResponse = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Calculator Engine Response",
  $id: "https://redspher.com/api/calculator/response",
  ...finalValueSchema,
};

export const errorResponse = {
  $schema: "http://json-schema.org/draft-07/schema#",
  title: "Calculator Engine Error Response",
  $id: "https://redspher.com/api/calculator/error",
  type: "object",
  properties: {
    error: {
      type: "object",
      properties: {
        code: { type: "number" },
        message: { type: "string" },
        reqId: { type: "string" },
      },
      required: ["code", "message", "reqId"],
      additionalProperties: false,
    },
    ctx: {
      type: "object",
      additionalProperties: true,
    },
  },
  required: ["error"],
  additionalProperties: false,
};
