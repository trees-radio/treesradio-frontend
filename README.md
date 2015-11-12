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
* Run `webpack` to build or `webpack -w` to build continuously
  - Use `webpack -d` for sourcemaps
  - Use `webpack -p` before deploying to production
  - Use `--progress` and `--colors` for niceness
