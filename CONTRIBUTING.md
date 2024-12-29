# Trees Radio Frontend

This repo comprises the front-end of Trees Radio. Backend served by Firebase and treesradio/pineapple

> ⚠️ **Important Notice**: The build instructions below are currently outdated and non-functional. We are in the process of modernizing the development environment. Please see [KNOWN_ISSUES.md](./KNOWN_ISSUES.md) for details. New contributors should wait for the updated build process before attempting local development.

## Current Development Status

The project is undergoing major updates to address:
- Outdated React and dependency versions
- Legacy Firebase SDK implementation
- Non-functional local development environment

Track the modernization progress in issue [#ISSUE_NUMBER](link-to-issue).

## Historical Build Instructions (Currently Non-Functional)

> Note: These instructions are preserved for reference but are not currently working.

* Install NPM
  * Windows (using [Chocolatey](https://chocolatey.org/))
    * `cinst npm.install -y`
  * Mac (using [Homebrew](http://brew.sh/))
    * `brew install node`
* Clone the repository
* Run `npm install` from the root of the repo

### NPM Scripts (Pending Updates)
```bash
npm start             # Local development server
npm run bolt-compile  # builds Firebase Bolt rules
npm run build-dev    # builds Bolt rules and unminified app code with source maps
npm run build-prod   # builds Bolt rules and minified app code
npm run bolt-deploy  # builds and deploys only Firebase Bolt rules
npm run update-env   # updates environment info in prod Firebase from `./firebase/env.json`
```

### Legacy Windows-Specific Instructions
```bash
set NODE_ENV=development  # For local dev
set NODE_ENV=production   # For production builds
```

### Legacy Bundle Analysis
```bash
webpack -p --config webpack.config.js
webpack-bundle-analyzer stats.json public/
```

## Contributing

We are actively working on modernizing this project. If you'd like to contribute:

1. Check the [Issues](link-to-issues) page for modernization tasks
2. Read our [CONTRIBUTING.md](./CONTRIBUTING.md) guide
3. Wait for the updated development environment before making changes

## Next Steps

We are working on:
1. Updating all dependencies to current versions
2. Implementing modern Firebase SDK
3. Restoring local development capabilities
4. Creating new documentation for the updated build process

## Looking to Help?

Join our community and track progress:
- Star/Watch this repository for updates
- Check the [Issues](link-to-issues) page
- Join our community discussions (add link to discussions if available)
