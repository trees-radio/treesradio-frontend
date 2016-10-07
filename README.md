# Trees Radio Frontend

This repo comprises the front-end of Trees Radio. Backend served by Firebase and treesradio/pineapple


## How to build:
* Install NPM
  - Windows (using [Chocolatey](https://chocolatey.org/))
    + `cinst npm.install -y`
  - Mac (using [Homebrew](http://brew.sh/))
    + `brew install node`
* Get the repo (duh)
* Run `npm install` from the root of the repo
* NPM script reference:
  - `npm run bolt-compile`: builds Firebase Bolt rules
  - `npm run build-dev`: builds Bolt rules and unminified app code with source maps
  - `npm run build-prod`: builds Bolt rules and minified app code
  - `npm run bolt-deploy`: builds and deploys only Firebase Bolt rules
  - `npm run update-env`: updates environment info in prod Firebase from `./firebase/env.json`

See wiki for recommended Atom packages.
