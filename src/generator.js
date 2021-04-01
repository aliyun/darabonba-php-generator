'use strict';

const path = require('path');
const fs = require('fs');

const { _deepClone, _assignObject } = require('./lib/helper');
const ClientResolver = require('./resolver/client');
const ModelResolver = require('./resolver/model');

function readLock(pkg_dir) {
  const filepath = path.join(pkg_dir, '.libraries.json');
  if (!fs.existsSync(filepath)) {
    throw new Error('The `.libraries.json` file could not be found. Please execute "dara install" first.');
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

function readModuleMeta(module_dir, pkg_dir, lock) {
  if (!path.isAbsolute(module_dir)) {
    if (module_dir.startsWith('./') || module_dir.startsWith('../')) {
      module_dir = path.join(pkg_dir, module_dir);
    } else {
      module_dir = path.join(pkg_dir, lock[module_dir]);
    }
  }
  const filepath = fs.existsSync(path.join(module_dir, 'Teafile'))
    ? path.join(module_dir, 'Teafile')
    : path.join(module_dir, 'Darafile');
  return JSON.parse(fs.readFileSync(filepath));
}

function resolveDependencies(ast) {
  const imports = ast.imports;
  const dependencies = {
    // Package ID : { meta, scope, package_name, client_name, client_alias }
  };
  if (!imports || !imports.length) {
    return dependencies;
  }

  const self_client_name = this.config.clientName ? this.config.clientName.toLowerCase() : this.config.client.name.toLowerCase();
  const libraries = this.config.libraries;
  const lock = readLock(this.config.pkgDir);
  const lang = this.lang;
  const default_client_name = this.config.client.name;
  const default_model_dir = this.config.model.dir;

  let package_sets = [];
  let client_sets = [];
  ast.imports.forEach((item) => {
    const aliasId = item.lexeme;
    const meta = readModuleMeta(libraries[aliasId], this.config.pkgDir, lock);
    const scope = meta.scope;
    let package_name = meta.name;
    let client_name = default_client_name;
    let model_dir = default_model_dir;
    let lang_config = !meta[lang] ? {} : meta[lang];
    if (lang_config.package) {
      package_name = lang_config.package;
    }
    if (lang_config.clientName) {
      client_name = lang_config.clientName;
    }
    if (lang_config.modelDirName) {
      model_dir = lang_config.modelDirName;
    }
    // check package name duplication
    if (package_sets.indexOf(package_name.toLowerCase()) > 0) {
      throw new Error(`The package name (${package_name}) has been defined in ${aliasId} dara package.`);
    }
    package_sets.push(package_name.toLowerCase());

    // check client name duplication
    let client_name_lower = client_name.toLowerCase();
    let client_alias = '';
    if (client_sets.indexOf(client_name_lower) > -1 || client_name_lower === self_client_name) {
      client_alias = package_name.split('.').join('') + '->' + client_name.split('.').join('');
    } else {
      client_sets.push(client_name_lower);
    }
    dependencies[aliasId] = {
      meta,
      scope,
      package_name,
      client_name,
      client_alias,
      model_dir
    };
  });
  return dependencies;
}

function getCombinator(lang, configOriginal, denpendencies) {
  const config = _deepClone(configOriginal);

  // init combinator
  const Combinator = require(`./langs/${lang}/combinator`);
  return new Combinator(config, denpendencies);
}

function resolveAST(type, ast, globalAST) {
  const combinator = getCombinator(this.lang, this.config);
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

class Generator {
  constructor(meta = {}, lang = 'php') {
    if (!meta.outputDir) {
      throw new Error('`option.outputDir` should not empty');
    }
    this.lang = lang;
    const langDir = path.join(__dirname, `./langs/${lang}/`);
    if (!fs.existsSync(langDir)) {
      throw new Error(`Not supported language : ${lang}`);
    }
    const lang_config = require(`./langs/${lang}/config`);
    const common_config = _deepClone(require('./langs/common/config'));
    const config = {
      dir: meta.outputDir,
    };
    const meta_lang_config = !meta[lang] ? {} : meta[lang];
    this.config = _assignObject(config, common_config, lang_config, meta, meta_lang_config);
  }

  visit(ast) {
    const dependencies = resolveDependencies.call(this, ast);
    if (this.config.clientName) {
      this.config.client.name = this.config.clientName;
    }
    if (this.config.modelDirName) {
      this.config.model.dir = this.config.modelDirName;
    }

    const objects = [];

    // combine client code
    const clientObjectItem = resolveAST.call(this, 'client', ast, ast);
    objects.push(clientObjectItem);

    // combine model code
    ast.moduleBody.nodes.filter((item) => {
      return item.type === 'model';
    }).forEach((model) => {
      const modelName = model.modelName.lexeme;
      const modelObjectItem = resolveAST.call(this, 'model', model, ast);
      if (ast.models) {
        Object.keys(ast.models).filter((key) => {
          return key.startsWith(modelName + '.');
        }).forEach((key) => {
          const subModel = ast.models[key];
          const subModelObjectItem = resolveAST.call(this, 'model', subModel, ast);
          modelObjectItem.subObject.push(subModelObjectItem);
        });
      }
      objects.push(modelObjectItem);
    });

    const combinator = getCombinator(this.lang, this.config, dependencies);
    combinator.combine(objects);
    return objects;
  }
}

module.exports = Generator;
