# Trees Radio Frontend
This repo comprises the front-end of Trees Radio. Backend served by Firebase.

[![wercker status](https://app.wercker.com/status/cc27bc23e90eea7d0c16679e8d382e5f/m "wercker status")](https://app.wercker.com/project/bykey/cc27bc23e90eea7d0c16679e8d382e5f)

## How to build:
* Install NPM
  - Windows (using [Chocolatey](https://chocolatey.org/))
    + `cinst npm.install -y`
  - Mac (using [Homebrew](http://brew.sh/))
    + `brew install node`
* Get the repo (duh)
* Run `npm install` from the root of the repo
* Use `npm start` for local dev server. Requires `webpack-dev-server` installed as global (`npm install -g <package_name>`)
* NPM script reference:
  - Some scripts require `firebase-tools` and `firebase-bolt` as well as `webpack` installed as globals (`npm install -g <package_name>`)
  - `npm run bolt-compile`: builds Firebase Bolt rules
  - `npm run build-dev`: builds Bolt rules and unminified app code with source maps
  - `npm run build-prod`: builds Bolt rules and minified app code
  - `npm run bolt-deploy`: builds and deploys only Firebase Bolt rules
  - `npm run deploy-dev`: runs `build-dev` and deploys to Firebase prod environment
  - `npm run deploy-prod`: runs `build-prod` and deploys to Firebase dev environment
  - `npm run update-env`: updates environment info in prod Firebase from `./firebase/env.json`

See wiki for recommended Atom packages.
