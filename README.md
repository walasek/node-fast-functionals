# [node-fast-functionals](https://github.com/walasek/node-fast-functionals) [![Build Status](https://img.shields.io/travis/walasek/node-fast-functionals.svg?style=flat-square)](https://travis-ci.org/walasek/node-fast-functionals) [![Package Version](https://img.shields.io/npm/v/fast-functionals.svg?style=flat-square)](https://www.npmjs.com/package/fast-functionals) ![License](https://img.shields.io/npm/l/fast-functionals.svg?style=flat-square) [![Dependencies](https://david-dm.org/walasek/node-fast-functionals.svg)](https://david-dm.org/walasek/node-fast-functionals)  [![codecov](https://codecov.io/gh/walasek/node-fast-functionals/branch/master/graph/badge.svg)](https://codecov.io/gh/walasek/node-fast-functionals) [![Greenkeeper badge](https://badges.greenkeeper.io/walasek/node-fast-functionals.svg)](https://greenkeeper.io/)

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

Documentation is available [here](https://walasek.github.io/node-fast-functionals/).

```javascript
const ProceduralLambda = require('fast-functionals');

const external_var = 1;
const my_pipeline = new ProceduralLambda()
    // BEWARE the argument names must be v, i, s!
    // The letters stand for: value, index, self
    .filter((v,i,s) => v % 2)
    // You can omit unused arguments
    // Not using indices is actually faster
    .map(v => v+1)
    // You CANOT reference other variables in pure lambda functions!
    // Only globals and lambda arguments can be safely accessed within the body.
    // This line would throw a runtime exception:
    //   .map(v => v+external_var)
    // But this line is fine:
    //   .map(v => Math.floor(v))
    // If you need any more functionality you need to use the complex method
    //   that doesn't inject function body into procedural code.
    .mapComplex(function(v){
        return v+external_var; // Do whatever you want here
    })
    // Reducing has a signature of accum, v, i ,s
    // Accum stands for: accumulator
    .reduce((accum,v) => accum+v, 0);

const my_data = [1, 2, 3, 4, 5];
console.log(`Result is: ${my_pipeline.execute(my_data)}`);

// High order functions are immutable
const base_pipeline = new ProceduralLambda()
    .map(v => v+1);

const pipeline1 = base_pipeline.filter(v => v % 2 !== 0);
const pipeline2 = base_pipeline.filter(v => v % 2 === 0);
// base_pipeline, pipeline1 and pipeline2 are different objects now!
```

## Benchmarks

Below is a benchmark of a simple map, filter, reduce chain using native Arrays (`raw`), using the awesome [list](https://github.com/funkia/list) library, using this library's complex methods (`lambda-using-complex`), using lambdas with indice arguments for reduce (`lambda-with-indices`), using lambdas with only values (`lambda`).

```
raw x 2,321,126 ops/sec ±0.57% (96 runs sampled)
list x 1,654,198 ops/sec ±1.16% (90 runs sampled)
lambda-using-complex x 2,248,725 ops/sec ±0.98% (93 runs sampled)
lambda-with-indices x 2,957,437 ops/sec ±0.33% (94 runs sampled)
lambda x 3,213,692 ops/sec ±0.63% (90 runs sampled)
Fastest execution for N=10 is lambda

raw x 238,413 ops/sec ±0.20% (92 runs sampled)
list x 415,290 ops/sec ±1.95% (91 runs sampled)
lambda-using-complex x 586,469 ops/sec ±0.76% (90 runs sampled)
lambda-with-indices x 1,188,276 ops/sec ±0.84% (93 runs sampled)
lambda x 1,488,025 ops/sec ±0.26% (93 runs sampled)
Fastest execution for N=100 is lambda

raw x 24,171 ops/sec ±0.64% (93 runs sampled)
list x 47,571 ops/sec ±0.88% (93 runs sampled)
lambda-using-complex x 70,660 ops/sec ±0.52% (95 runs sampled)
lambda-with-indices x 174,379 ops/sec ±0.23% (93 runs sampled)
lambda x 219,467 ops/sec ±0.44% (94 runs sampled)
Fastest execution for N=1000 is lambda

raw x 2,357 ops/sec ±0.67% (95 runs sampled)
list x 4,637 ops/sec ±0.76% (96 runs sampled)
lambda-using-complex x 6,538 ops/sec ±1.33% (96 runs sampled)
lambda-with-indices x 16,682 ops/sec ±1.81% (90 runs sampled)
lambda x 22,277 ops/sec ±0.57% (86 runs sampled)
Fastest execution for N=10000 is lambda

raw x 63.39 ops/sec ±1.26% (65 runs sampled)
list x 90.23 ops/sec ±2.00% (67 runs sampled)
lambda-using-complex x 517 ops/sec ±1.76% (82 runs sampled)
lambda-with-indices x 950 ops/sec ±1.71% (79 runs sampled)
lambda x 1,115 ops/sec ±1.74% (80 runs sampled)
Fastest execution for N=100000 is lambda

raw x 6.13 ops/sec ±1.39% (20 runs sampled)
list x 8.71 ops/sec ±3.84% (24 runs sampled)
lambda-using-complex x 45.51 ops/sec ±5.20% (51 runs sampled)
lambda-with-indices x 83.88 ops/sec ±4.27% (62 runs sampled)
lambda x 88.34 ops/sec ±4.48% (58 runs sampled)
Fastest execution for N=1000000 is lambda,lambda-with-indices

raw x 0.60 ops/sec ±1.33% (6 runs sampled)
list x 0.74 ops/sec ±1.54% (6 runs sampled)
lambda-using-complex x 4.88 ops/sec ±8.00% (17 runs sampled)
lambda-with-indices x 7.17 ops/sec ±9.62% (22 runs sampled)
lambda x 8.28 ops/sec ±10.23% (25 runs sampled)
Fastest execution for N=10000000 is lambda
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
