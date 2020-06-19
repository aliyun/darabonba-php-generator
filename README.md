English | [简体中文](/README-zh-CN.md)

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

## Issues

[Opening an Issue](https://github.com/aliyun/darabonba-php-generator/issues/new/choose), Issues not conforming to the guidelines may be closed immediately.

## Changelog

Detailed changes for each release are documented in the [release notes](/CHANGELOG.md).

## License

[Apache-2.0](/LICENSE)
Copyright (c) 2009-present, Alibaba Cloud All rights reserved.
