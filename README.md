English | [简体中文](/README-zh-CN.md)

[![NPM version][npm-image]][npm-url]
[![codecov][cov-image]][cov-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/@darabonba/php-generator.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@darabonba/php-generator
[cov-image]: https://codecov.io/gh/aliyun/darabonba-php-generator/branch/master/graph/badge.svg
[cov-url]: https://codecov.io/gh/aliyun/darabonba-php-generator
[david-image]: https://img.shields.io/david/aliyun/darabonba-php-generator.svg?style=flat-square
[david-url]: https://david-dm.org/aliyun/darabonba-php-generator
[download-image]: https://img.shields.io/npm/dm/@darabonba/php-generator.svg?style=flat-square
[download-url]: https://npmjs.org/package/@darabonba/php-generator

# Darabonba Code Generator for PHP

## Installation

Darabonba Code Generator was designed to work in Node.js. The preferred way to install the Generator is to use the [NPM](https://www.npmjs.com/) package manager. Simply type the following into a terminal window:

```shell
npm install @darabonba/php-generator
```

## Usage

Generate PHP Code

```javascript
'use strict';

const path = require('path');
const fs = require('fs');

const parser = require('@darabonba/parser');
const PHPGenerator = require('@darabonba/php-generator');

const sourceDir = "<Darabonda package directory>";
const outputDir = "<Generate output directory>";

// generate AST data by Darabonba Parser
let packageMetaFilePath = path.join(sourceDir, 'Darafile');
let packageMeta = JSON.parse(fs.readFileSync(packageMetaFilePath, 'utf8'));
let mainFile = path.join(sourceDir, packageMeta.main);
let ast = parser.parse(fs.readFileSync(mainFile, 'utf8'), mainFile);

// initialize generator
let generatorConfig = {
    ...packageMeta,
    pkgDir: sourceDir,
    outputDir
};

let generator = new PHPGenerator(generatorConfig);

// generate php code by generator
generator.visit(ast);

// The execution result will be output in the 'outputDir'
```

## Quickly Start

```bash
git clone https://github.com/aliyun/darabonba-php-generator.git
cd darabonba-php-generator/
npm install
node examples/complex.js
```

## Issues

[Opening an Issue](https://github.com/aliyun/darabonba-php-generator/issues/new/choose), Issues not conforming to the guidelines may be closed immediately.

## Changelog

Detailed changes for each release are documented in the [release notes](/CHANGELOG.md).

## License

[Apache-2.0](/LICENSE)
Copyright (c) 2009-present, Alibaba Cloud All rights reserved.
