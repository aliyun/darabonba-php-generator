[English](/README.md) | 简体中文

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![codecov][cov-image]][cov-url]
[![David deps][david-image]][david-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/@darabonba/php-generator.svg?style=flat-square
[npm-url]: https://npmjs.org/package/@darabonba/php-generator
[travis-image]: https://img.shields.io/travis/aliyun/darabonba-php-generator.svg?style=flat-square
[travis-url]: https://travis-ci.org/aliyun/darabonba-php-generator
[cov-image]: https://codecov.io/gh/aliyun/darabonba-php-generator/branch/master/graph/badge.svg
[cov-url]: https://codecov.io/gh/aliyun/darabonba-php-generator
[david-image]: https://img.shields.io/david/aliyun/darabonba-php-generator.svg?style=flat-square
[david-url]: https://david-dm.org/aliyun/darabonba-php-generator
[download-image]: https://img.shields.io/npm/dm/@darabonba/php-generator.svg?style=flat-square
[download-url]: https://npmjs.org/package/@darabonba/php-generator

# Darabonba PHP 生成器

## 安装

Darabonba 生成器只能在 Node.js 环境下运行。建议使用 [NPM](https://www.npmjs.com/) 包管理工具安装。在终端输入以下命令进行安装:

```shell
npm install @darabonba/php-generator
```

## 使用示例

生成 PHP 代码

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

## 快速开始

```bash
git clone https://github.com/aliyun/darabonba-php-generator.git
cd darabonba-php-generator/
node examples/complex.js
```

## 问题反馈

[提出问题](https://github.com/aliyun/darabonba-php-generator/issues/new/choose), 不符合指南的问题可能会立即关闭。

## 发布日志

发布详情会更新在 [release notes](/CHANGELOG.md) 文件中

## 许可证

[Apache-2.0](/LICENSE)
Copyright (c) 2009-present, Alibaba Cloud All rights reserved.
