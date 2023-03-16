# Migration to Vite of: Calculator front-end "Web"

> For a Functional User manual see (disabled)[here](./).

This document only covers technical aspects.

This Frontend is based on `vite` and `@vitejs/plugin-react`.

The standard `vite` script targets apply:

-   `npm run dev`: running the app in dev mode
-   `npm run build`: create production build in directory `./dist`
-   `npm run preview`: preview production build in `./dist`

The following script targets have been added:

-   `npm run coverage` run the test creating coverage report.
-   `npm run test`: run tests in watch mode
-   `npm run testci`: run tests not in interactive mode (for CI integration)
-   `npm run lint`: lint the project files
-   `npm run pretty`: pretty print (in place) the project files

## Installation

```bash
npm i
```

Run the code by typing `npm dev` (development mode).

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

