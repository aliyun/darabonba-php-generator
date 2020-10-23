'use strict';

const path = require('path');
const fs = require('fs');
const debug = require('./lib/debug');

const { _deepClone, _assignObject } = require('./lib/helper');
const ClientResolver = require('./resolver/client');
const ModelResolver = require('./resolver/model');

class Generator {
  constructor(meta = {}, lang = 'php') {
    if (!meta.outputDir) {
      throw new Error('`option.outputDir` should not empty');
    }
    this.lang = lang;
    this.initConfig(meta);
  }

  visit(ast) {
    this.imports = this.resolveImports(ast);
    if (this.config.clientName) {
      this.config.client.name = this.config.clientName;
    }
    if (this.config.modelDirName) {
      this.config.model.dir = this.config.modelDirName;
    }

    const objects = [];

    // combine client code
    const clientObjectItem = this.resolve('client', ast, ast);
    objects.push(clientObjectItem);

    // combine model code
    ast.moduleBody.nodes.filter((item) => {
      return item.type === 'model';
    }).forEach((model) => {
      const modelName = model.modelName.lexeme;
      const modelObjectItem = this.resolve('model', model, ast);
      if (ast.models) {
        Object.keys(ast.models).filter((key) => {
          return key.startsWith(modelName + '.');
        }).forEach((key) => {
          const subModel = ast.models[key];
          const subModelObjectItem = this.resolve('model', subModel, ast);
          modelObjectItem.subObject.push(subModelObjectItem);
        });
      }
      objects.push(modelObjectItem);
    });

    const combinator = this.getCombinator(this.config);
    combinator.combine(objects);
    return objects;
  }

  resolve(type, ast, globalAST) {
    const combinator = this.getCombinator(this.config);
    let resolver;
    switch (type) {
    case 'client':
      resolver = new ClientResolver(ast, combinator, ast);
      break;
    case 'model':
      resolver = new ModelResolver(ast, combinator, globalAST);
      break;
    }
    const objectItem = resolver.resolve();
    objectItem.includeList = combinator.includeList;
    objectItem.includeModelList = combinator.includeModelList;
    return objectItem;
  }

  getCombinator(configOriginal) {
    const config = _deepClone(configOriginal);

    // init combinator
    const Combinator = require(`./langs/${this.lang}/combinator`);
    return new Combinator(config, this.imports);
  }

  initConfig(meta) {
    const langDir = path.join(__dirname, `./langs/${this.lang}/`);
    if (!fs.existsSync(langDir)) {
      throw new Error(`Not supported language : ${this.lang}`);
    }
    const langConfig = require(`./langs/${this.lang}/config`);

    const config = _deepClone(require('./langs/common/config'));
    _assignObject(config, {
      dir: meta.outputDir,
    }, langConfig, meta);
    if (meta[this.lang]) {
      _assignObject(config, meta[this.lang]);
    }
    this.config = config;
  }

  resolveImports(ast) {
    const imports = ast.imports;

    let requirePackage = [];
    let thirdPackageDaraMeta = {};
    let thirdPackageScope = {};
    let thirdPackageNamespace = {};
    let thirdPackageModel = {};
    let thirdPackageClient = {};
    let thirdPackageClientAlias = {};
    let libraries = {};

    const selfClientName = this.config.clientName ? this.config.clientName : this.config.client.name;

    if (imports.length > 0) {
      const lockPath = path.join(this.config.pkgDir, '.libraries.json');
      const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
      let packageNameSet = [];
      let clientNameSet = [];
      Object.keys(lock).forEach(key => {
        const tmp = key.split(':');
        const name = tmp[1];
        libraries[name] = lock[key];
      });
      ast.imports.forEach((item) => {
        const aliasId = item.lexeme;
        const moduleDir = this.config.libraries[aliasId];
        let targetPath;
        if (moduleDir.startsWith('./') || moduleDir.startsWith('../')) {
          targetPath = path.join(this.config.pkgDir, moduleDir);
        } else if (moduleDir.startsWith('/')) {
          targetPath = moduleDir;
        } else {
          targetPath = path.join(this.config.pkgDir, lock[moduleDir]);
        }
        // get dara meta
        const daraFilePath = fs.existsSync(path.join(targetPath, 'Teafile'))
          ? path.join(targetPath, 'Teafile')
          : path.join(targetPath, 'Darafile');
        const daraMeta = JSON.parse(fs.readFileSync(daraFilePath));
        thirdPackageDaraMeta[aliasId] = daraMeta;
        thirdPackageScope[aliasId] = daraMeta.scope;

        // init package name, client name, model dir name
        let packageName, clientName, modelDir;
        if (daraMeta[this.lang]) {
          packageName = daraMeta[this.lang].package ? daraMeta[this.lang].package : daraMeta.name;
          clientName = daraMeta[this.lang].clientName
            ? daraMeta[this.lang].clientName
            : this.config.client.name;
          modelDir = daraMeta[this.lang].modelDirName
            ? daraMeta[this.lang].modelDirName
            : this.config.model.dir;
        } else {
          packageName = daraMeta.name;
          clientName = this.config.client.name;
          modelDir = this.config.model.dir;
        }

        // resolve third package namespace
        if (packageNameSet.indexOf(packageName.toLowerCase()) < 0) {
          thirdPackageNamespace[aliasId] = packageName;
          packageNameSet.push(packageName.toLowerCase());
        } else {
          debug.stack('Duplication namespace');
        }

        // resolve third package model client name
        if (
          clientNameSet.indexOf(clientName.toLowerCase()) > -1 ||
          clientName.toLowerCase() === selfClientName.toLowerCase()
        ) {
          const alias = packageName.split('.').join('') + '->' + clientName.split('.').join('');
          thirdPackageClientAlias[aliasId] = alias;
          thirdPackageClient[aliasId] = clientName;
        } else {
          thirdPackageClient[aliasId] = clientName;
          clientNameSet.push(clientName.toLowerCase());
        }
        if (daraMeta.releases && daraMeta.releases[this.lang]) {
          requirePackage.push(daraMeta.releases[this.lang]);
        }
        // third package model dir name
        thirdPackageModel[aliasId] = modelDir;
      });
    }
    return {
      libraries,
      requirePackage,
      thirdPackageDaraMeta,
      thirdPackageScope,
      thirdPackageNamespace,
      thirdPackageClient,
      thirdPackageClientAlias,
      thirdPackageModel,
    };
  }
}

module.exports = Generator;
