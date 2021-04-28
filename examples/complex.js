'use strict';

const path = require('path');
const fs = require('fs');

const parser = require('@darabonba/parser');
// const PHPGenerator = require('@darabonba/php-generator');
const PHPGenerator = require('../src/generator');

const sourceDir = path.join(__dirname, '../tests/fixtures/complex');
const outputDir = path.join(__dirname, '../output/complex');

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

console.log('\x1b[33mSuccessfully generated!');
console.log(`output dir : ${outputDir}\x1b[0m`);