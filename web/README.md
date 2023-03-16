# Calculator front-end "Web"

For a Functional User manual see [here](../README.md).

This document only covers technical aspects.

This Frontend is based on `create-react-app`.

The standard `create-react-app` script targets apply:

-   `npm start`: running the app in dev mode
-   `npm run build`: create production build in directory `./build`
-   `npm run test`: running test

The following script targets have been added:

-   `npm run testci` run the app in "CI" environment (no interactive menu at the end of the run)
-   `npm run lint`: linting your code
-   `npm run prettier-format`: pretty print the code using formatting rules in `.prettierrc`

## Installation

```bash
npm i
```

Run the code by typing `npm start` (development mode).

## Updating snapshots

If code is changed, it may be jest snapshots need to be updated, use:

```bash
npm run testci -- -u
```

## NGINX config file

The this project is supposed to run in a docker container served as static files by nginx

There is an nginx template file `nginx.conf.template` using the following environment variables (set by [`docker-compose.yml`][docker-compose]).

-   `NGINX_LISTEN_PORT`: the port nginx will listen on within in the container.
-   `CALCULATOR_API_HOST`: the hostname of the REST api.
-   `CALCULATOR_API_PORT`: the port number of the REST api.

[docker-compose]: ../docker-compose.yml
