import type { FastifyInstance, FastifyServerOptions } from "fastify";
import fastify from "fastify";

// import all the apps you want to add to the server (root context)
import setupCalculatorApp from "./apps/calculator";

interface CallBack {
  (root: FastifyInstance): void;
}

export default function setup(
  options: FastifyServerOptions,
  afterAllIsRegistered: CallBack
): FastifyInstance {
  const root = fastify(options);

  const promise = setupCalculatorApp(root);
  // add more applications here in the future?

  Promise.all([promise]).then(() => {
    root.ready(() => {
      afterAllIsRegistered(root);
    });
  });
  return root;
}
