'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');

const DSL = require('@darabonba/parser');

let Generator = require('../lib/generator');

function compareDirectories(expectedDir, outputDir) {
  const expectedFiles = fs.readdirSync(expectedDir);
  const outputFiles = fs.readdirSync(outputDir);
  for (let fileName of expectedFiles) {
    if (!outputFiles.includes(fileName)) {
      assert.ok(false);
    }
    const expectedPath = path.join(outputDir, fileName);
    const actualPath = path.join(expectedDir, fileName);
    const expectedStat = fs.statSync(expectedPath);
    const actualStat = fs.statSync(actualPath);

    // 如果两个文件都是文件夹，则递归进行比较
    if (expectedStat.isDirectory() && actualStat.isDirectory()) {
      compareDirectories(expectedPath, actualPath);
    }
    // 如果是文件，则比较文件内容
    else if (expectedStat.isFile() && actualStat.isFile()) {
      const expectedContent = fs.readFileSync(expectedPath, 'utf8');
      const acutalContent = fs.readFileSync(actualPath, 'utf8');

      assert.deepStrictEqual(expectedContent, acutalContent);
    }
  }
}

function check(mainFilePath, outputDir, expectedPath, pkgInfo = {}) {
  const php =  pkgInfo.php || {
    package: 'Dara.PHP.Tests',
    clientName: 'Client',
    modelDirName: 'Models'
  };
  const generator = new Generator({
    outputDir,
    ...php,
    ...pkgInfo
  });

  const dsl = fs.readFileSync(mainFilePath, 'utf8');
  const ast = DSL.parse(dsl, mainFilePath);
  generator.visit(ast);
  if(!pkgInfo.allCheck) {
    outputDir = path.join(outputDir , 'src');
  }
  compareDirectories(expectedPath, outputDir);
}

describe('new Generator', function() {
  it('must pass in outputDir', function () {
    assert.throws(function () {
      new Generator({});
    }, function(err) {
      assert.deepStrictEqual(err.message, '`option.outputDir` should not empty');
      return true;
    });
  });

  it('empty module should ok', function () {
    const outputDir = path.join(__dirname, 'output/empty');
    const mainFilePath = path.join(__dirname, 'fixtures/empty/main.dara');
    check(mainFilePath, outputDir, path.join(__dirname, 'expected/empty'));
  });

  it('one model should ok', function () {
    const outputDir = path.join(__dirname, 'output/model');
    const mainFilePath = path.join(__dirname, 'fixtures/model/main.dara');
    const pkgContent = fs.readFileSync(path.join(__dirname, 'fixtures/model/Darafile'), 'utf8');
    const pkg = JSON.parse(pkgContent);
    check(mainFilePath, outputDir, path.join(__dirname, 'expected/model'), {
      pkgDir: path.join(__dirname, 'fixtures/model'),
      ...pkg
    });
  });

  it('one api should ok', function () {
    const outputDir = path.join(__dirname, 'output/api');
    const mainFilePath = path.join(__dirname, 'fixtures/api/main.dara');
    check(mainFilePath, outputDir, path.join(__dirname, 'expected/api'));
  });

  it('one function should ok', function () {
    const outputDir = path.join(__dirname, 'output/function');
    const mainFilePath = path.join(__dirname, 'fixtures/function/main.dara');
    check(mainFilePath, outputDir, path.join(__dirname, 'expected/function'));
  });

  it('const should ok', function () {
    const outputDir = path.join(__dirname, 'output/const');
    const mainFilePath = path.join(__dirname, 'fixtures/const/main.dara');
    check(mainFilePath, outputDir, path.join(__dirname, 'expected/const'));
  });

  it('statements should ok', function () {
    const outputDir = path.join(__dirname, 'output/statements');
    const mainFilePath = path.join(__dirname, 'fixtures/statements/main.dara');
    check(mainFilePath, outputDir, path.join(__dirname, 'expected/statements'));
  });

  it('import should ok', function () {
    const outputDir = path.join(__dirname, 'output/import');
    const mainFilePath = path.join(__dirname, 'fixtures/import/main.dara');
    const pkgContent = fs.readFileSync(path.join(__dirname, 'fixtures/import/Darafile'), 'utf8');
    const pkg = JSON.parse(pkgContent);
    check(mainFilePath, outputDir, path.join(__dirname, 'expected/import'), {
      pkgDir: path.join(__dirname, 'fixtures/import'),
      ...pkg
    });
  });

  it('complex should ok', function () {
    const outputDir = path.join(__dirname, 'output/complex');
    const mainFilePath = path.join(__dirname, 'fixtures/complex/main.dara');
    const pkgContent = fs.readFileSync(path.join(__dirname, 'fixtures/complex/Darafile'), 'utf8');
    const pkg = JSON.parse(pkgContent);
    check(mainFilePath, outputDir, path.join(__dirname, 'expected/complex'), {
      pkgDir: path.join(__dirname, 'fixtures/complex'),
      ...pkg
    });
  });

  it('add annotation should ok', function () {
    const outputDir = path.join(__dirname, 'output/annotation');
    const mainFilePath = path.join(__dirname, 'fixtures/annotation/main.dara');
    check(mainFilePath, outputDir, path.join(__dirname, 'expected/annotation'), {editable: true});
  });

  it('add comments should ok', function () {
    const outputDir = path.join(__dirname, 'output/comment');
    const mainFilePath = path.join(__dirname, 'fixtures/comment/main.dara');
    const pkgContent = fs.readFileSync(path.join(__dirname, 'fixtures/comment/Darafile'), 'utf8');
    const pkg = JSON.parse(pkgContent);
    check(mainFilePath, outputDir, path.join(__dirname, 'expected/comment'), {
      pkgDir: path.join(__dirname, 'fixtures/comment'),
      ...pkg,
      editable: 'true'
    });
  });

  it('add builtin should ok', function () {
    const outputDir = path.join(__dirname, 'output/builtin');
    const mainFilePath = path.join(__dirname, 'fixtures/builtin/main.dara');
    check(mainFilePath, outputDir, path.join(__dirname, 'expected/builtin'), {editable: 1});
  });

  it('multi dara should ok', function () {
    const outputDir = path.join(__dirname, 'output/multi');
    const mainFilePath = path.join(__dirname, 'fixtures/multi/sdk.dara');
    const pkgContent = fs.readFileSync(path.join(__dirname, 'fixtures/multi/Darafile'), 'utf8');
    const pkg = JSON.parse(pkgContent);
    const expectedOverwritePath = path.join(__dirname, 'expected/multi/Overwrite.php');
    const expectedOverwrite = fs.readFileSync(expectedOverwritePath, 'utf8');
    const srcPath = path.join(outputDir, 'src');
    if(!fs.existsSync(srcPath)) {
      fs.mkdirSync(srcPath, {recursive: true});
    }
    fs.writeFileSync(path.join(srcPath, 'Overwrite.php'), expectedOverwrite);
    check(mainFilePath, outputDir, path.join(__dirname, 'expected/multi'), {
      pkgDir: path.join(__dirname, 'fixtures/multi'),
      ...pkg,
      editable: 'true'
    });
  });

  it('alias should ok', function () {
    const outputDir = path.join(__dirname, 'output/alias');
    const mainFilePath = path.join(__dirname, 'fixtures/alias/main.dara');
    const pkgContent = fs.readFileSync(path.join(__dirname, 'fixtures/alias/Darafile'), 'utf8');
    const pkg = JSON.parse(pkgContent);
    check(mainFilePath, outputDir, path.join(__dirname, 'expected/alias'), {
      pkgDir: path.join(__dirname, 'fixtures/alias'),
      ...pkg,
      editable: 'true'
    });
  });

  it('exec should ok', function () {
    const outputDir = path.join(__dirname, 'output/exec');
    const mainFilePath = path.join(__dirname, 'fixtures/exec/main.dara');
    const pkgContent = fs.readFileSync(path.join(__dirname, 'fixtures/exec/Darafile'), 'utf8');
    const pkg = JSON.parse(pkgContent);
    check(mainFilePath, outputDir, path.join(__dirname, 'expected/exec'), {
      pkgDir: path.join(__dirname, 'fixtures/exec'),
      ...pkg,
      exec: true,
      editable: 'true'
    });
  });

  it('map should ok', function () {
    const outputDir = path.join(__dirname, 'output/map');
    const mainFilePath = path.join(__dirname, 'fixtures/map/main.dara');
    const pkgContent = fs.readFileSync(path.join(__dirname, 'fixtures/map/Darafile'), 'utf8');
    const pkg = JSON.parse(pkgContent);
    check(mainFilePath, outputDir, path.join(__dirname, 'expected/map'), {
      pkgDir: path.join(__dirname, 'fixtures/map'),
      ...pkg,
      editable: 'true'
    });
  });

  it('number should ok', function () {
    const outputDir = path.join(__dirname, 'output/number');
    const mainFilePath = path.join(__dirname, 'fixtures/number/main.dara');
    const pkgContent = fs.readFileSync(path.join(__dirname, 'fixtures/number/Darafile'), 'utf8');
    const pkg = JSON.parse(pkgContent);
    check(mainFilePath, outputDir, path.join(__dirname, 'expected/number'), {
      pkgDir: path.join(__dirname, 'fixtures/number'),
      ...pkg,
      editable: 'true'
    });
  });

  it('super should ok', function () {
    const outputDir = path.join(__dirname, 'output/super');
    const mainFilePath = path.join(__dirname, 'fixtures/super/main.dara');
    const pkgContent = fs.readFileSync(path.join(__dirname, 'fixtures/super/Darafile'), 'utf8');
    const pkg = JSON.parse(pkgContent);
    check(mainFilePath, outputDir, path.join(__dirname, 'expected/super'), {
      pkgDir: path.join(__dirname, 'fixtures/super'),
      ...pkg,
      editable: 'true'
    });
  });


  it('package should ok', function () {
    const outputDir = path.join(__dirname, 'output/package');
    const mainFilePath = path.join(__dirname, 'fixtures/package/main.dara');
    const pkgContent = fs.readFileSync(path.join(__dirname, 'fixtures/package/Darafile'), 'utf8');
    const pkg = JSON.parse(pkgContent);
    check(mainFilePath, outputDir, path.join(__dirname, 'expected/package'), {
      pkgDir: path.join(__dirname, 'fixtures/package'),
      ...pkg,
      editable: 'true',
      allCheck: true,
    });
  });


  it('typedef should ok', function () {
    const outputDir = path.join(__dirname, 'output/typedef');
    const mainFilePath = path.join(__dirname, 'fixtures/typedef/main.dara');
    const pkgContent = fs.readFileSync(path.join(__dirname, 'fixtures/typedef/Darafile'), 'utf8');
    const pkg = JSON.parse(pkgContent);
    check(mainFilePath, outputDir, path.join(__dirname, 'expected/typedef'), {
      pkgDir: path.join(__dirname, 'fixtures/typedef'),
      ...pkg,
      editable: false,
      allCheck: true,
    });
  });
});
