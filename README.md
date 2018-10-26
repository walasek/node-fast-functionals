# [node-fast-functionals](https://github.com/walasek/node-fast-functionals) [![Build Status](https://img.shields.io/travis/walasek/node-fast-functionals.svg?style=flat-square)](https://travis-ci.org/walasek/node-fast-functionals) [![Package Version](https://img.shields.io/npm/v/fast-functionals.svg?style=flat-square)](https://www.npmjs.com/walasek/node-fast-functionals) ![License](https://img.shields.io/npm/l/fast-functionals.svg?style=flat-square) [![Dependencies](https://david-dm.org/walasek/node-fast-functionals.svg)](https://david-dm.org/walasek/node-fast-functionals.svg)  [![codecov](https://codecov.io/gh/walasek/node-fast-functionals/branch/master/graph/badge.svg)](https://codecov.io/gh/walasek/node-fast-functionals)

Super quick collection processing with functional programming.

---

## Goal

Processing data with `Array`'s `map` `reduce` `filter` and other high order functions is really handy, but super slow! This project aims at optimising that by introducing a hack - it injects your function bodies into a procedural loop and runs `eval` on it.

## Installation

Node `>=8.9.0` is required.

```bash
npm install --save fast-functionals
```

To perform tests use:

```bash
cd node_modules/fast-functionals
npm i
npm t
```

This project also has a benchmark that you can run yourself:

```bash
cd node_modules/fast-functionals
npm i
npm run benchmark
```

## Usage

Beware this project is still in development. There may be serious bugs or performance issues over time.

```javascript
// FILL ME
```

## Contributing

The source is documented with JSDoc. To generate the documentation use:

```bash
npm run docs
```

Extra debugging information is printed using the `debug` module:

```bash
DEBUG=fast-functionals:* npm t
```

The documentation will be put in the new `docs` directory.

To introduce an improvement please fork this project, commit changes in a new branch to your fork and add a pull request on this repository pointing at your fork. Please follow these style recommendations when working on the code:

* Use tabs (yup).
* Use `async`/`await` and/or `Promise` where possible.
* Features must be properly tested.
* New methods must be properly documented with `jscode` style comments.