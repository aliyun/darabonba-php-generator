'use strict';

const path = require('path');
const fs = require('fs');
const debug = require('./lib/debug');
const { _deepClone, _assignObject } = require('./lib/helper');
const ClientResolver = require('./resolver/client');
const ModelResolver = require('./resolver/model');
const DSL = require('@darabonba/parser');

function readLock(pkg_dir) {
  const filepath = path.join(pkg_dir, '.libraries.json');
  if (!fs.existsSync(filepath)) {
    throw new Error('The `.libraries.json` file could not be found. Please execute "dara install" first.');
  }
  return JSON.parse(fs.readFileSync(filepath, 'utf8'));
}

function readMetafile(module_dir) {
  const filepath = fs.existsSync(path.join(module_dir, 'Teafile'))
    ? path.join(module_dir, 'Teafile')
    : path.join(module_dir, 'Darafile');
  return JSON.parse(fs.readFileSync(filepath));
}

function readModuleMeta(module_dir, pkg_dir, lock) {
  if (!path.isAbsolute(module_dir)) {
    if (module_dir.startsWith('./') || module_dir.startsWith('../')) {
      module_dir = path.join(pkg_dir, module_dir);
    } else {
      module_dir = path.join(pkg_dir, lock[module_dir]);
    }
  }
  return readMetafile(module_dir);
}

function resolveDependencies(lang, config, ast) {
  const imports = ast.imports;
  const dependencies = {
    // Package AliasID : { meta, scope, package_name, client_name, client_alias }
  };
  if (!imports || !imports.length) {
    return dependencies;
  }

  const self_client_name = config.clientName
    ? config.clientName.toLowerCase()
    : config.client.name.toLowerCase();
  const libraries = config.libraries;
  const lock = readLock(config.pkgDir);
  const default_client_name = config.client.name;
  const default_model_dir = config.model.dir;

  let package_sets = [];
  let client_sets = [];
  ast.imports.forEach((item) => {
    const aliasId = item.lexeme;
    const meta = readModuleMeta(
      libraries[aliasId],
      config.pkgDir,
      lock
    );
    meta.libraries = {
      lock: lock[libraries[aliasId]],
      tag: libraries[aliasId],
      alias_id: aliasId
    };
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
      debug.stack(`The package name (${package_name}) has been defined in ${aliasId} dara package.`);
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

function resolveAST(lang, config, type, ast, globalAST) {
  const combinator = getCombinator(lang, config);
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

function resolveObject(lang, config, ast, dependencies) {
  const objects = [];

  // combine client code
  const clientObjectItem = resolveAST(lang, config, 'client', ast, ast);
  objects.push(clientObjectItem);

  // combine model code
  ast.moduleBody.nodes.filter((item) => {
    return item.type === 'model';
  }).forEach((model) => {
    const modelName = model.modelName.lexeme;
    const modelObjectItem = resolveAST(lang, config, 'model', model, ast);
    if (ast.models) {
      Object.keys(ast.models).filter((key) => {
        return key.startsWith(modelName + '.');
      }).forEach((key) => {
        const subModel = ast.models[key];
        const subModelObjectItem = resolveAST(lang, config, 'model', subModel, ast);
        modelObjectItem.subObject.push(subModelObjectItem);
      });
    }
    objects.push(modelObjectItem);
  });

  const combinator = getCombinator(lang, config, dependencies);
  combinator.combine(objects);
  return objects;
}

function resolveLibraries(pkg_dir, dependencies) {
  const lock = readLock(pkg_dir);
  Object.keys(dependencies).forEach((pack) => {
    const lib = dependencies[pack];
    const libraries = lib.meta.libraries;
    const basepath = path.join(pkg_dir, libraries.lock);
    const meta = readMetafile(basepath);
    if (meta.libraries && Object.keys(meta.libraries).length > 0) {
      const obj = {};
      Object.keys(meta.libraries).forEach(item => {
        if (lock[meta.libraries[item]]) {
          obj[meta.libraries[item]] = lock[meta.libraries[item]].replace('libraries/', '../');
        }
      });
      fs.writeFileSync(path.join(basepath, '.libraries.json'), JSON.stringify(obj, null, 2));
    }
    // resolve sub package AST
    let mainFilePath = path.join(basepath, meta.main);
    const content = fs.readFileSync(mainFilePath, 'utf-8');
    dependencies[pack].ast = DSL.parse(content, mainFilePath);
  });
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
    this.config = _assignObject(
      config,
      common_config,
      lang_config,
      meta,
      meta_lang_config
    );
  }

  visit(ast) {
    const lang = this.lang;
    const config = this.config;

    // return objects;
    const dependencies = resolveDependencies(lang, config, ast);
    if (config.advanced) {
      resolveLibraries(config.pkgDir, dependencies);
    }
    if (config.clientName) {
      config.client.name = config.clientName;
    }
    if (config.modelDirName) {
      config.model.dir = config.modelDirName;
    }
    return resolveObject(lang, config, ast, dependencies);
  }
}

module.exports = Generator;
