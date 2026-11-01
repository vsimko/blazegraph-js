# Blazegraph Javascript API (Written in Typescript)

[Blazegraph](https://www.blazegraph.com/) JavaScript API.
This version has been completely rewritten and the new API is still evolving.

## Installation

`yarn add https://github.com/vsimko/blazegraph-js`

## Usage

Many (undocumented yet) methods are available. Have a look at the source for more info.

### preparation

```js
const { prepareBlaze } = require("blazegraph");
const { SELECT, UPDATE } = prepareBlaze({
  host: "localhost",
  port: 9999,
  namespace: "kb" // Those are the default values, passing no params yields the same result
});
```

### sparql query - output written to the console

```js
// simple async example
const results = await SELECT`select * { ?s ?p ?o } limit 10`;
console.log(results);
```

### sparql query - asynchronous pipeline with ramda

```js
const { pipeP, pluck } = require("ramda");
await pipeP(
  () => SELECT`select * {?s ?p ?o}`, // 1. query
  pluck("p"), // 2. extract only properties
  pluck("value"), // 3. extract value from each property
  console.log // 4. write results to console
)();
```

## Note

Unstable, do not use in production!
The current API is quite specific to Nelson, but feel free to PR breaking changes to make it universal.

## Contributing

Install dependencies with `yarn install`. Before opening a pull request, run:

- `yarn build` to compile the TypeScript sources.
- `yarn lint` to run ESLint.
- `yarn test` to run the test suite.

The tests require a running Blazegraph instance. Start the configured service with
`yarn test:up` before running the tests, and stop it afterwards with `yarn test:down`.
The CI workflow starts and stops this service automatically.

## Original version available here:

[![npm version](https://badge.fury.io/js/blazegraph.svg)](https://www.npmjs.com/package/blazegraph)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](#contributing)

`npm install blazegraph --save`

## License

Blazegraph-js is released under the MIT license.

[Blazegraph](https://www.blazegraph.com/) is freely available under the GPLv2 open-source license.
