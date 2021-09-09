'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');
require('mocha-sinon');

const DSL = require('@darabonba/parser');

const Generator = require('../src/generator');

const lang = 'php';

const expectedDir = path.join(__dirname, 'expected/');
const fixturesDir = path.join(__dirname, 'fixtures/');
const outputDir = path.join(__dirname, '../', 'output/tests/');

function check(moduleName, expectedFiles = []) {
  const mainFilePath = path.join(fixturesDir, moduleName, 'main.dara');
  const moduleOutputDir = path.join(outputDir, moduleName);
  const prefixDir = path.join(fixturesDir, moduleName);
  const pkgContent = fs.readFileSync(
    fs.existsSync(path.join(prefixDir, 'Darafile')) ? path.join(prefixDir, 'Darafile') : path.join(prefixDir, 'Teafile'), 'utf8');
  const pkgInfo = JSON.parse(pkgContent);
  const config = {
    outputDir: moduleOutputDir,
    pkgDir: path.join(fixturesDir, moduleName),
    php: {
      package: 'Tea.PHP.Tests',
      clientName: 'Client',
      modelDirName: 'Models'
    },
    ...pkgInfo
  };
  const generator = new Generator(config, lang);

  const dsl = fs.readFileSync(mainFilePath, 'utf8');
  const ast = DSL.parse(dsl, mainFilePath);
  generator.visit(ast);
  expectedFiles.forEach(element => {
    const outputFilePath = path.join(outputDir, moduleName, element);
    const expectedFilePath = path.join(expectedDir, moduleName, element);
    const expected = fs.readFileSync(expectedFilePath, 'utf8');
    assert.deepStrictEqual(fs.readFileSync(outputFilePath, 'utf8'), expected);
  });
}

describe('PHP Generator', function () {
  it('add annotation should ok', function () {
    check('annotation', [
      'Client.php',
      'Models/Test.php'
    ]);
  });

  it('api should ok', function () {
    check('api', [
      'Client.php'
    ]);
  });

  it('add comments should ok', function () {
    check('comment', [
      'Client.php',
      'Models/Test1.php',
      'Models/Test2.php',
      'Models/Test3.php'
    ]);
  });

  it('complex should ok', function () {
    check('complex', [
      'Client.php',
      'Models/ComplexRequest.php',
      'Models/ComplexRequest/header.php',
      'Models/ComplexRequest/part.php'
    ]);
  });

  it('const should ok', function () {
    check('const', [
      'Client.php'
    ]);
  });

  it('empty should ok', function () {
    check('empty', [
      'Client.php'
    ]);
  });

  it('function should ok', function () {
    check('function', [
      'Client.php'
    ]);
  });

  it('import should ok', function () {
    check('import', [
      'Client.php'
    ]);
  });

  it('map should ok', function () {
    check('map', [
      'Client.php'
    ]);
  });

  it('model should ok', function () {
    check('model', [
      'Client.php',
      'Models/M.php',
      'Models/MyModel.php',
      'Models/MyModel/model_.php',
      'Models/MyModel/model/model_.php',
      'Models/MyModel/subarraymodel.php',
      'Models/MyModel/submodel.php',
      'Models/MyModel/submodel/model_.php',
      'Models/Class_.php',
      'Models/model_.php',
    ]);
  });

  it('statements should ok', function () {
    check('statements', [
      'Client.php'
    ]);
  });

  it('super should ok', function () {
    check('super', [
      'Client.php'
    ]);
  });

  it('alias should ok', function () {
    check('alias', [
      'Client.php'
    ]);
  });

  it('number should ok', function () {
    check('number', [
      'Client.php'
    ]);
  });

  it('exec should ok', function () {
    check('exec', [
      'Client.php'
    ]);
  });

  it('package should ok', function () {
    check('package', [
      'autoload.php',
      'composer.json',
      'src/Client.php'
    ]);
  });
});
