# Trees Radio Frontend
This repo comprises the front-end of Trees Radio. Backend served by Firebase.

## How to build:
* Install NPM
  - Windows (using [Chocolatey](https://chocolatey.org/))
    + `cinst npm.install -y`
  - Mac (using [Homebrew](http://brew.sh/))
    + `brew install node`
* Get the repo (duh)
* Run `npm install` from the root of the repo
* Use `npm start` for local dev server. Requires `webpack-dev-server`.
* NPM script reference:
  - `npm run bolt-compile`: builds Firebase Bolt rules
  - `npm run build-dev`: builds Bolt rules and unminified app code with source maps
  - `npm run build-prod`: builds Bolt rules and minified app code
  - `npm run bolt-deploy`: builds and deploys only Firebase Bolt rules
  - `npm run deploy-dev`: runs `build-dev` and deploys to Firebase
  - `npm run deploy-prod`: runs `build-prod` and deploys to Firebase

See wiki for recommended Atom packages.
