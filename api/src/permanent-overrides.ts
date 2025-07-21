import type { FastifyServerOptions } from "fastify";

// default options dont work with  "oneOf" in JSONSchema works
const fastifyOverrides: FastifyServerOptions = {
  ajv: {
    customOptions: {
      coerceTypes: false,
      useDefaults: false,
      removeAdditional: false,
      allErrors: true,
    },
  },
};

export default fastifyOverrides;
