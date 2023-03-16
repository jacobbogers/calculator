# Google-like Calculator Project

**The scope of the project is limited to:**

Use of the mathematical operators:

-  `+`: addition.
-  `-`: subtraction
-  `×`: multiplication
-  `÷`: division

Use of the edit control buttons:

-  `CE`: clear entry (backspace)
-  `CA`: clear All (only clears result entry after `=` is pressed)


**What is NOT implemented**

- Keystrokes (only mouse usage buttons).
- Other mathematical functions (`log`, `sin` etc).
- Explicit scoping `(` and `)`.

## Modules

This is a git mono-repo:

The project consist of 2 sub-projects a Web frontend and a REST api backend.

### Rest API

This project lives in subdirectory `./api`. For a more specific technical information see [this][rest-api-readme] document.

### Web Frontend

This project lives in subdirectory `./web`. For a more specific technical information see [this][web-readme] document.

## Installation and usage

The project lives in 2 docker containers started by the command

```bash
docker compose up
```

Navigate your browser to `localhost:8080` to use the application.


[rest-api-readme]: ./api/README.md
[web-readme]: ./web/README.md



