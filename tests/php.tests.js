'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');
const mm = require('mm');
require('mocha-sinon');

const DSL = require('@darabonba/parser');

const Generator = require('../src/generator');
const PackageInfo = require('../src/langs/php/package_info');

const lang = 'php';

const expectedDir = path.join(__dirname, 'expected/');
const fixturesDir = path.join(__dirname, 'fixtures');
const outputDir = path.join(__dirname, '../', 'output/', 'tests/');

function check(moduleName, expectedFiles = []) {
  const mainFilePath = path.join(fixturesDir, moduleName, 'main.dara');
  const moduleOutputDir = path.join(outputDir, moduleName);
  const pkgContent = fs.readFileSync(path.join(__dirname, `fixtures/${moduleName}/Darafile`), 'utf8');
  const pkgInfo = JSON.parse(pkgContent);
  const config = {
    outputDir: moduleOutputDir,
    pkgDir: path.join(__dirname, `fixtures/${moduleName}`),
    ...pkgInfo,
    php: {
      package: 'Tea.PHP.Tests',
      clientName: 'Client',
      modelDirName: 'Models'
    }
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

describe('New Generator', function () {
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
      'Models/MyModel/subarraymodel.php',
      'Models/MyModel/submodel.php'
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
});

describe('package_info tests', function () {
  beforeEach(function () {
    this.sinon.stub(console, 'log');
    this.sinon.stub(fs, 'existsSync');
    this.sinon.stub(fs, 'readFileSync');
    this.sinon.stub(fs, 'writeFileSync');
  });

  it('emit package files shoule be ok', function () {
    const packageInfo = new PackageInfo({ package: 'a.b.c' });
    mm(packageInfo, 'resolveOutputDir', function () { return './output/'; });
    mm(packageInfo, 'render', function () { return '{}'; });
    packageInfo.emit({
      name: 'name',
      desc: 'desc',
      github: 'github',
    });
    mm.restore();
  });
});