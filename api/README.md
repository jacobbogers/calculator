# Calculator REST Api"

For a Functional User manual see [here](../README.md).

This document only covers technical aspects.

The rest api is based on `fastify`.

The REST api needs node >= v18.15.0 to run correctly.

The script targets apply:

-   `npm run dev`: running the app in dev watch mode.
-   `npm run dev-nowatch`: running the app in dev (not watching for file changes).
-   `npm run build`: create production build in directory `./dist`
-   `npm run test`: running test.
-   `npm start`: run the production build (must exist in `./dist`).
-   `npm run lint`: run the linter
-   `npm run prettier-format`: pretty-print the code according to prettier/eslint rules.


## Installation

```bash
npm i
```

## Environment variables

- `CALCULATOR_API_PORT`: This is the listen port of the API. If not specified the REST api will default to port 4000.

## Docker container

Normally this project is build into a container by docker compose [file][docker-compose].
The Environment variable `CALCULATOR_API_PORT` is set by the docker compose file.

[docker-compose]: ../docker-compose.yml
