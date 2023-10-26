# OoTR Ladder Front

***
## 🔧 1 - Setup

You'll need the following tools :

- Quasar CLI ([link](https://quasar.dev/start/quasar-cli))

Once everything is setup :

- Run `git init`
- Clone the project
- Run `npm install`
- Create /.env file (exemple in the /.env-example)
- Update the quasar.config.js ssr->prodPort if needed.

***
## 🚀 2 - Commands

- Run in development : `quasar d -m ssr`
- Build : `quasar b -m ssr`
- Run for prod : `quasar serve`
- For production only, move the data/wiki/ folder in the dist/ssr/ folder
