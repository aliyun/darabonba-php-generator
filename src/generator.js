'use strict';

const path = require('path');
const fs = require('fs');
const debug = require('./lib/debug');

const { _deepClone } = require('./lib/helper');
const ClientResolver = require('./resolver/client');
const ModelResolver = require('./resolver/model');

class Generator {
  constructor(meta = {}, lang = '') {
    if (!meta.outputDir) {
      throw new Error('`option.outputDir` should not empty');
    }
    this.lang = lang;
    this.initConfig(meta);
  }

  visit(ast) {
    this.imports = this.resolveImports(ast);

    // combine client code
    const clientCombinator = this.getCombinator(this.config);
    let clientResolver = new ClientResolver(ast, clientCombinator, ast);
    const clientObjectItem = clientResolver.resolve();
    clientCombinator.combine(clientObjectItem);

    // combine model code
    ast.moduleBody.nodes.filter((item) => {
      return item.type === 'model';
    }).forEach((model) => {
      const modelCombinator = this.getCombinator(this.config);
      const modelName = model.modelName.lexeme;
      const modelResolver = new ModelResolver(model, modelCombinator, ast);
      const modelObjectItem = modelResolver.resolve();

      if (ast.models) {
        Object.keys(ast.models).filter((key) => {
          return key.startsWith(modelName + '.');
        }).forEach((key) => {
          const subModel = ast.models[key];
          const subModelCombinator = this.getCombinator(this.config);
          const subModelResolver = new ModelResolver(subModel, subModelCombinator, ast);
          const subModelObjectItem = subModelResolver.resolve();
          if (this.config.model.mode === 'group') {
            subModelObjectItem.includeList = subModelCombinator.includeList;
            subModelObjectItem.includeModelList = subModelCombinator.includeModelList;
            modelObjectItem.subObject.push(subModelObjectItem);
          } else {
            subModelCombinator.combine(subModelObjectItem);
          }
          return ast.models[key];
        });
      }
      modelCombinator.combine(modelObjectItem);
    });
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

    const config = {
      package: 'Alibabacloud.SDK',
      clientName: 'Client',
      include: [],
      parent: [],
      pkgDir: '',
      output: true,
      dir: meta.outputDir,
      layer: '',
    };
    Object.assign(config,
      langConfig,
      meta,
    );
    if (meta[this.lang]) {
      Object.assign(config,
        meta[this.lang],
      );
    }
    this.config = config;
  }

  resolveImports(ast) {
    const imports = ast.imports;

    let requirePackage = [];
    let thirdPackageNamespace = {};
    let thirdPackageModel = {};
    let thirdPackageClient = {};
    let thirdPackageClientAlias = {};

    if (imports.length > 0) {
      const lockPath = path.join(this.config.pkgDir, '.libraries.json');
      const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
      let packageNameSet = [];
      let clientNameSet = [];
      ast.imports.forEach((item) => {
        const aliasId = item.lexeme;
        const moduleDir = this.config.libraries[aliasId];
        let targetPath;
        if (moduleDir.startsWith('/')) {
          targetPath = moduleDir;
        } else {
          targetPath = path.join(this.config.pkgDir, lock[moduleDir]);
        }
        // get dara meta
        const daraFilePath = fs.existsSync(path.join(targetPath, 'Teafile'))
          ? path.join(targetPath, 'Teafile')
          : path.join(targetPath, 'Darafile');
        const daraMeta = JSON.parse(fs.readFileSync(daraFilePath));

        // init package name,client name,modelDir name
        let packageName, clientName, modelDir;
        if (daraMeta[this.lang]) {
          packageName = daraMeta[this.lang].package ? daraMeta[this.lang].package : daraMeta.name;
          clientName = daraMeta[this.lang].clientName
            ? daraMeta[this.lang].clientName
            : 'Client';
          modelDir = daraMeta[this.lang].modelDirName
            ? daraMeta[this.lang].modelDirName
            : 'Models';
        } else {
          packageName = daraMeta.name;
          clientName = 'Client';
          modelDir = 'Models';
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
          clientName.toLowerCase() === this.config.clientName.toLowerCase()
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
      requirePackage,
      thirdPackageNamespace,
      thirdPackageClient,
      thirdPackageClientAlias,
      thirdPackageModel,
    };
  }
}

module.exports = Generator;
