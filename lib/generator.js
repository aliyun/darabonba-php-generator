'use strict';

const assert = require('assert');

const path = require('path');
const fs = require('fs');

const DSL = require('@darabonba/parser');
const {
  _name, _string, _subModelName, _vid,
  _isBinaryOp, _modelName, _isBuiltinModel,
  REQUEST, RESPONSE, CORE, _upperFirst, _avoidKeywords, _filedsAccess,
  ERROR, MODEL, STREAM, UNRETRY_ERROR, RETRY_CONTEXT, SSE_EVENT,
  RESP_ERROR, RETRY_OPTION, RUNTIME_OPTION, EXTEND_PARAM
} = require('./helper');
const getBuiltin = require('./builtin');
const { Tag } = require('@darabonba/parser/lib/tag');
const Annotation = require('@darabonba/annotation-parser');

class Visitor {

  static get supportGenerateTest() {
    return true;
  }

  constructor(option = {}) {
    this.config = {
      outputDir: '',
      indent: '    ',
      package: option.package,
      clientName: option.clientName || 'Client',
      ...option
    };
    this.used = [];
    this.output = '';
    this.outputDir = option.outputDir;
    if(!this.outputDir) {
      throw Error('`option.outputDir` should not empty');
    }
    this.config.clientPath = path.join(this.outputDir, 'src', `${this.config.clientName}.php`);
    this.modelDir = this.config.modelDirName || 'Models';
    this.exceptionDir = this.config.exceptionDirName || 'Exceptions';
    this.typedef = this.config.typedef;
    this.__module = {};
    this.innerModuleClassName = new Map();
    this.__externModule = new Map();
    this.classNamespace = new Map();
    this.usedClass = new Map();

    if (!this.outputDir) {
      throw new Error('`option.outputDir` should not empty');
    }

    if (!fs.existsSync(this.outputDir)) {
      fs.mkdirSync(this.outputDir, { 
        recursive: true
      });
    }
    this.composer = {};
    const composerPath = path.join(this.outputDir, 'composer.json');
    if (fs.existsSync(composerPath)) {
      try {
        this.composer = JSON.parse(fs.readFileSync(composerPath));
      } catch (err) {
        throw new Error('invalid composer.json');
      } 
    }
  }

  saveProjectFiles() {
    const composerPath = path.join(this.outputDir, 'composer.json');
    fs.writeFileSync(composerPath, JSON.stringify(this.composer, null, 2));
    const projectFiles = ['.gitignore', '.php_cs.dist', 'autoload.php', 'bootstrap.php'];
    projectFiles.map(file => {
      const source = path.join(__dirname, '..', 'templates', `${file}.tmpl`);
      const target = path.join(this.outputDir, file);

      if(file === 'autoload.php') {
        const content = fs.readFileSync(source, 'utf8');
        fs.writeFileSync(target, content.replace(/\${namespace}/g, this.namespace.replace(/\\/, '\\\\')));
      } else {
        fs.copyFileSync(source, target);
      }
      
    });
  }

  initComposer() {
    this.composer.name = this.composer.packageName || (this.config.packageInfo && this.config.packageInfo.name);
    this.composer.type = 'library';
    this.composer.description = this.composer.description || (this.config.packageInfo && this.config.packageInfo.desc);
    this.composer.github = this.composer.github || (this.config.packageInfo && this.config.packageInfo.github);
    this.composer.main = this.composer.main || 'src/Client.php';
    this.composer.authors = this.composer.authors || [];
    if(this.config.maintainers) {
      this.config.maintainers.forEach(maintainer => {
        let name = maintainer.name ? maintainer.name : '';
        let email = maintainer.email ? maintainer.email : '';
        this.composer.authors.push({ name: name, email: email });
      });
    }
    this.composer.license = this.composer.license || 'Apache-2.0';
    if (!this.composer.autoload) {
      this.composer.autoload = {
        'psr-4': {}
      };
      const namsespace = this.config.package.split('.').join('\\');
      this.composer.autoload['psr-4'][`${namsespace}\\`] = 'src';
    }

    if (!this.composer.scripts) {
      this.composer.scripts = {
        fixer: 'php-cs-fixer fix ./'
      };
    }

    if (!this.composer.config) {
      this.composer.config = {
        'sort-packages': true,
        'preferred-install': 'dist',
        'optimize-autoloader': true
      };
    }
    if (!this.composer.require) {
      this.composer.require = {
        'php': '>5.5',
        'alibabacloud/darabonba': '^1.0.0',
      };
    }
    
    Object.keys(this.requires).map(key => {
      this.composer.require[key] = this.requires[key];
    });
    if(this.typedef) {
      Object.keys(this.typedef).map(key => {
        if(!this.typedef[key].package) {
          return;
        }
        const [ name, version ] = this.typedef[key].package.split(':');
        this.composer.require[name] = version;
      });
    }
    


    if (!this.composer['prefer-stable']) {
      this.composer['prefer-stable'] = true;
    }

    if (!this.composer.config) {
      this.composer.config = {
        'sort-packages': true,
        'preferred-install': 'dist',
        'optimize-autoloader': true
      };
    }
  }

  getInnerClient(aliasId, phpPath) {
    const moduleAst = this.ast.innerDep.get(aliasId);
    const beginNotes = DSL.note.getNotes(moduleAst.notes, 0, moduleAst.moduleBody.nodes[0].tokenRange[0]);
    const clientNote = beginNotes.find(note => note.note.lexeme === '@clientName');
    if(clientNote) {
      return _string(clientNote.arg.value);
    }
    const fileInfo = path.parse(phpPath);
    return `${_upperFirst(fileInfo.name)}Client`;
  }

  saveInnerModule(ast, targetPath) {
    const keys = ast.innerModule.keys();
    let data = keys.next();
    while (!data.done) {
      const aliasId = data.value;
      const moduleAst = ast.innerDep.get(aliasId);
      const filepath = ast.innerModule.get(aliasId);
      this.visitModule(moduleAst, filepath, false, 0);
      data = keys.next();
    }
  }

  save(filepath) {
    let targetPath = filepath;
    if(path.resolve(filepath).startsWith(path.resolve(this.outputDir))) {
      const baseDir = path.join(this.outputDir, 'src', path.sep);
      filepath = filepath.replace(baseDir, '');
    }
    targetPath = path.join(this.outputDir, 'src', filepath);
    
    const namespace = this.getClassNamespace(filepath);
    const content = `<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace ${namespace};
${[...new Set(this.used)].join('\n')}
${this.output}`;

    fs.mkdirSync(path.dirname(targetPath), {
      recursive: true
    });
    fs.writeFileSync(targetPath, content);
    
    this.output = '';
    this.used = [];
    this.usedClass = new Map();
  }

  emit(str, level) {
    this.output += ' '.repeat(level * 2) + str;
  }

  visit(ast, level = 0) {
    this.codeDir = path.dirname(this.config.clientPath);
    this.classNamespace.set(this.config.clientPath, this.config.clientName);
    this.visitModule(ast, this.config.clientPath, true, level);
    this.initComposer();
    this.saveProjectFiles();
  }

  getfullModelName(key, namespace = false) { 
    const fullModelNameArr = key.split('.');
    return fullModelNameArr.map((m, i) => {
      if (!namespace && i === fullModelNameArr.length - 1 && m.toLowerCase() === 'model') {
        // If the model class name is 'model'
        // add the '_' suffix.
        return m + '_';
      }
      return _avoidKeywords(m);
    }).join('\\');
  }

  getRealClientName(aliasId) {
    const moduleInfo = this.moduleClass.get(aliasId);
    if(!moduleInfo) {
      return;
    }
    if(moduleInfo.aliasName) {
      this.used.push(`use ${moduleInfo.namespace}\\${moduleInfo.className} as ${moduleInfo.aliasName};`);
      return moduleInfo.aliasName;
    }
    this.used.push(`use ${moduleInfo.namespace}\\${moduleInfo.className};`);
    return moduleInfo.className;
  }

  getRealModelName(fullModelName) {
    if(fullModelName !== MODEL) {
      const fullModelNameArr = fullModelName.split('\\');
      fullModelName = fullModelNameArr.map((m, i) => {
        if (i === fullModelNameArr.length - 1 && m.toLowerCase() === 'model') {
          // If the model class name is 'model'
          // add the '_' suffix.
          return m + '_';
        }
        return _avoidKeywords(m);
      }).join('\\');
    }
    let [ modelName ] = fullModelName.split('\\').slice(-1);
    const existName = this.usedClass.get(modelName.toLowerCase());
    if(existName && existName !== fullModelName) {
      return `\\${fullModelName}`;
    }
    this.used.push(`use ${fullModelName};`);
    
    
    this.usedClass.set(modelName.toLowerCase(), fullModelName);
    return modelName;
  }

  visitExceptions(ast, filepath, level) {
    const exs = ast.moduleBody.nodes.filter((item) => {
      return item.type === 'exception';
    });
    const exDir = path.join(path.dirname(filepath), this.exceptionDir);
    for (let i = 0; i < exs.length; i++) {
      const exceptionName = _modelName(exs[i].exceptionName.lexeme);
      const modelFilepath = path.join(exDir, `${exceptionName}Exception.php`);
      const classNamespace = this.classNamespace.get(filepath);
      this.modelSpace = exceptionName;
      this.visitException(exs[i].exceptionBody, exceptionName, ast.extendOn, level);
      this.save(modelFilepath);
      if (this.predefined) {
        Object.keys(this.predefined).filter((key) => {
          return key.startsWith(exceptionName + '.');
        }).map((key) => {
          const modelDir = path.join(path.dirname(filepath), this.modelDir);
          this.modelSpace = this.getfullModelName(key, true);
          const realFullModelName = this.getfullModelName(key);
          const [ modelName ] = realFullModelName.split('\\').slice(-1);
          
          const realFullClassName = `${classNamespace}\\${this.modelDir}\\${realFullModelName}`;
          this.usedClass.set(modelName, realFullClassName);
          const subModelFilepath = path.join(modelDir, `${realFullModelName.split('\\').join(path.sep)}.php`);
          this.visitModel(this.predefined[key].modelBody, modelName, this.predefined[key].extendOn, level);
          this.save(subModelFilepath);
        });
      }
    }
  }

  visitModels(ast, filepath, level) {
    const models = ast.moduleBody.nodes.filter((item) => {
      return item.type === 'model';
    });
    const modelDir = path.join(path.dirname(filepath), this.modelDir);
    for (let i = 0; i < models.length; i++) {
      const modelName = _modelName(models[i].modelName.lexeme);
      const modelFilepath = path.join(modelDir, `${modelName}.php`);
      const classNamespace = this.classNamespace.get(filepath);
      this.modelSpace = modelName;
      this.visitAnnotation(models[i].annotation, level);
      let comments = DSL.comment.getFrontComments(this.comments, models[i].tokenRange[0]);
      this.visitComments(comments, level);
      this.visitModel(models[i].modelBody, modelName, models[i].extendOn, level);
      this.save(modelFilepath);
      if (this.predefined) {
        Object.keys(this.predefined).filter((key) => {
          return key.startsWith(modelName + '.');
        }).map((key) => {
          this.modelSpace = this.getfullModelName(key, true);
          const realFullModelName = this.getfullModelName(key);
          const [ modelName ] = realFullModelName.split('\\').slice(-1);
          
          const realFullClassName = `${classNamespace}\\${this.modelDir}\\${realFullModelName}`;
          this.usedClass.set(modelName, realFullClassName);
          const subModelFilepath = path.join(modelDir, `${realFullModelName.split('\\').join(path.sep)}.php`);
          this.visitModel(this.predefined[key].modelBody, modelName, this.predefined[key].extendOn, level);
          this.save(subModelFilepath);
        });
      }
    }
  }

  overwrite(ast, filepath) {
    if(!ast.moduleBody.nodes || !ast.moduleBody.nodes.length) {
      return;
    }
    const beginNotes = DSL.note.getNotes(this.notes, 0, ast.moduleBody.nodes[0].tokenRange[0]);
    const overwirte = beginNotes.find(note => note.note.lexeme === '@overwrite');
    if(path.resolve(filepath).startsWith(path.resolve(this.outputDir))) {
      const baseDir = path.join(this.outputDir, 'src', path.sep);
      filepath = filepath.replace(baseDir, '');
    }
    const targetPath = path.join(this.outputDir, 'src', filepath);
    if(overwirte && overwirte.arg.value === false && fs.existsSync(targetPath)) {
      return false;
    }
    return true;
  }

  visitModule(ast, filepath, main, level) {
    assert.equal(ast.type, 'module');
    this.ast = ast;
    this.predefined = ast.models;
    this.parentModule = ast.extends;
    this.comments = ast.comments;
    this.notes = ast.notes;
    this.usedExternException = ast.usedExternException;
    this.requires = {};
    this.moduleTypedef = {};
    ast.innerModule = new Map();
    this.moduleClass = new Map();
    this.clientName = new Map();
    if(this.overwrite(ast, filepath) === false) {
      return;
    }
    if(main) {
      this.clientName.set(this.config.clientName, true);
    }
    this.builtin = getBuiltin(this);

    
    
    this.eachImport(ast.imports, ast.usedExternModel, filepath, ast.innerModule, level);
    this.namespace = this.config.package.split('.').join('\\');
    this.visitModels(ast, filepath, level);

    this.visitExceptions(ast, filepath, level);

    const apis = ast.moduleBody.nodes.filter((item) => {
      return item.type === 'api';
    });

    if(apis.length > 0) {
      this.used.push(`use ${CORE};`);
      this.clientName.set('Dara', true);
    }
    this.visitAnnotation(ast.annotation, level);
    // // models definition
    this.apiBefore(main, filepath, level);
    const types = ast.moduleBody.nodes.filter((item) => {
      return item.type === 'type';
    });

    const inits = ast.moduleBody.nodes.filter((item) => {
      return item.type === 'init';
    });

    const [init] = inits;
    if (init) {
      this.visitInit(init, types, level);
    }

    let lastToken = 0;
    for (let i = 0; i < apis.length; i++) {
      if (i !== 0) {
        this.emit('\n');
      }
      const apiNotes = DSL.note.getNotes(this.notes, lastToken, apis[i].tokenRange[0]);
      const sse = apiNotes.find(note => note.note.lexeme === '@sse');
      lastToken = apis[i].tokenRange[1];
      this.eachAPI(apis[i], level + 1, sse && sse.arg.value);
    }

    this.functionBefore();
    const functions = ast.moduleBody.nodes.filter((item) => {
      return item.type === 'function';
    });

    for (let i = 0; i < functions.length; i++) {
      if (i !== 0) {
        this.emit('\n');
      }

      this.eachFunction(functions[i], level + 1);
    }

    this.moduleAfter();
    if (this.config.exec) {
      this.emitExec();
    }
    this.save(filepath);
    this.saveInnerModule(ast, filepath);
  }

  emitExec() {
    this.emit(`$path = __DIR__ . \\DIRECTORY_SEPARATOR . '..' . \\DIRECTORY_SEPARATOR . 'vendor' . \\DIRECTORY_SEPARATOR . 'autoload.php';
if (file_exists($path)) {
  require_once $path;
}
${this.config.clientName}::main(array_slice($argv, 1));`);
  }

  visitComments(comments, level) {
    comments.forEach(comment => {
      this.emit(`${comment.value}`, level);
      this.emit('\n');
    });
  }

  visitAnnotation(annotation, level, bottom = true) {
    if (!annotation || !annotation.value) {
      return;
    }
    let comments = DSL.comment.getFrontComments(this.comments, annotation.index);
    this.visitComments(comments, level);
    var ast = Annotation.parse(annotation.value);
    var description = ast.items.find((item) => {
      return item.type === 'description';
    });
    var summary = ast.items.find((item) => {
      return item.type === 'summary';
    });
    var _return = ast.items.find((item) => {
      return item.type === 'return';
    });
    var deprecated = ast.items.find((item) => {
      return item.type === 'deprecated';
    });
    var params = ast.items.filter((item) => {
      return item.type === 'param';
    }).map((item) => {
      return {
        name: item.name.id,
        text: item.text.text.trimEnd()
      };
    });
    var throws = ast.items.filter((item) => {
      return item.type === 'throws';
    }).map((item) => {
      return item.text.text.trimEnd();
    });

    var descriptionText = description ? description.text.text.trimEnd() : '';
    var summaryText = summary ? summary.text.text.trimEnd() : '';
    var returnText = _return ? _return.text.text.trimEnd() : '';
    let hasNextSection = false;

    this.emit('/**\n', level);
    if (summaryText !== '') {
      summaryText.split('\n').forEach((line) => {
        this.emit(` * ${line}\n`, level);
      });
      hasNextSection = true;
    }
    if (descriptionText !== '') {
      if (hasNextSection) {
        this.emit(' * \n', level);
      }
      this.emit(' * @remarks\n', level);
      descriptionText.split('\n').forEach((line) => {
        this.emit(` * ${line}\n`, level);
      });
      hasNextSection = true;
    }
    if (deprecated) {
      if (hasNextSection) {
        this.emit(' * \n', level);
      }
      if (deprecated.text.text.trimEnd() === '') {
        this.emit(' * @deprecated\n', level);
      } else {
        this.emit(` * @deprecated ${deprecated.text.text.trimEnd()}\n`, level);
      }
      hasNextSection = true;
    }
    if (params.length > 0) {
      if (hasNextSection) {
        this.emit(' * \n', level);
      }
      params.forEach((item) => {
        this.emit(` * @param ${item.name} - ${item.text}\n`, level);
      });
    }
    if (returnText !== '') {
      this.emit(` * @returns ${returnText}\n`, level);
    }
    if (throws.length > 0) {
      this.emit(' * \n', level);
      throws.forEach((item) => {
        this.emit(` * @throws ${item}\n`, level);
      });
    }
    if(bottom) {
      this.emit(' */', level);
      this.emit('\n');
    }
  }

  visitInit(ast, types, level) {
    assert.equal(ast.type, 'init');
    types.forEach((item) => {
      let comments = DSL.comment.getFrontComments(this.comments, item.tokenRange[0]);
      this.visitComments(comments, level + 1);
      this.emit('/**\n', level + 1);
      this.emit(' * @var ', level+ 1);
      this.visitType(item.value);
      this.emit('\n');
      this.emit(' */\n', level + 1);
      this.emit(`protected $${_vid(item.vid)};\n`, level + 1);
      this.emit('\n');
    });
    this.emit('\n');
    this.visitAnnotation(ast.annotation, level + 1);
    let comments = DSL.comment.getFrontComments(this.comments, ast.tokenRange[0]);
    this.visitComments(comments, level + 1);

    if (ast.initBody) {
      this.emit('public function __construct', level + 1);
      this.visitParams(ast.params, level);
      this.emit('\n');
      this.emit('{\n', level + 1);
      this.visitStmts(ast.initBody, level + 2);

      this.emit('}\n', level + 1);
      this.emit('\n');
    }
  }

  getClassNamespace(phpPath) {
    if(path.resolve(phpPath).startsWith(path.resolve(this.outputDir))) {
      const baseDir = path.join(this.outputDir, 'src', path.sep);
      phpPath = phpPath.replace(baseDir, '');
    }

    const arr = phpPath.split(path.sep).slice(0, -1);
    const namsespace = this.config.package.split('.').join('\\');
    let className = namsespace;
    arr.map(key => {
      className += '\\' + key;
    });
    
    return className;
  }

  getAliasName(classNamespace, name, aliasId) {
    let aliasName = '';
    if(!this.clientName.has(name)) {
      this.clientName.set(name, true);
      return aliasName;
    }
    if(aliasId) {
      aliasName = aliasId + name;
    }
    if(aliasName && !this.clientName.has(aliasName)) {
      this.clientName.set(aliasName, true);
      return aliasName;
    }
    const arr = classNamespace.split('\\');
    for(let i = arr.length - 1; i >= 0; i--) {
      aliasName = arr[i] + name;
      if(!this.clientName.has(aliasName)) {
        this.clientName.set(aliasName, true);
        return aliasName;
      }
    }
  }

  eachImport(imports, usedModels, filepath, innerModule, level) {
    this.imports = new Map();
    if (imports.length > 0) {
      const lockPath = path.join(this.config.pkgDir, '.libraries.json');
      const lock = fs.existsSync(lockPath) ? JSON.parse(fs.readFileSync(lockPath, 'utf8')) : {};
      for (let i = 0; i < imports.length; i++) {
        const item = imports[i];
        let comments = DSL.comment.getFrontComments(this.comments, item.tokenRange[0]);
        this.visitComments(comments, level);
        const aliasId = item.lexeme;
        const main = item.mainModule;
        const inner = item.module;
        const moduleDir = main ? this.config.libraries[main] : this.config.libraries[aliasId];
        const innerPath = item.innerPath;
        if (!moduleDir && innerPath) {
          let phpPath = innerPath.replace(/(\.tea)$|(\.spec)$|(\.dara)$/gi, '');
          if (phpPath.startsWith('./') || phpPath.startsWith('../')) {
            phpPath = phpPath.split('/').map(dir => _upperFirst(dir)).join(path.sep);
            phpPath = path.join(path.dirname(filepath), `${phpPath}.php`);
          } else if (phpPath.startsWith('/')) {
            phpPath = phpPath.split('/').map(dir => _upperFirst(dir)).join(path.sep);
            phpPath = `${phpPath}.php`;
          }
          
          const classNamespace = this.getClassNamespace(phpPath);
          const className = this.getInnerClient(aliasId, phpPath);

          innerModule.set(aliasId, path.join(path.dirname(phpPath), `${className}.php`));
          this.moduleClass.set(aliasId, {
            namespace: classNamespace,
            className: className,
            aliasName: this.getAliasName(classNamespace, className, aliasId),
            modelDir: this.modelDir,
            exceptionDir: this.exceptionDir,
          });
          continue;
        }
        let targetPath = '';
        if (moduleDir.startsWith('./') || moduleDir.startsWith('../')) {
          targetPath = path.join(this.config.pkgDir, moduleDir);
        } else if (moduleDir.startsWith('/')) {
          targetPath = moduleDir;
        } else {
          if(!lock[moduleDir]) {
            throw new Error(`The '${aliasId}' is not import in Darafile.`);
          }
          targetPath = path.join(this.config.pkgDir, lock[moduleDir]);
        }
        const pkgPath = fs.existsSync(path.join(targetPath, 'Teafile')) ? path.join(targetPath, 'Teafile') : path.join(targetPath, 'Darafile');
        const pkg = JSON.parse(fs.readFileSync(pkgPath));
        const phpRelease = pkg.releases && pkg.releases.php;
        const phpPkg = pkg.php;
        if (!phpRelease || !phpPkg || !phpPkg.package) {
          throw new Error(`The '${aliasId}' has no PHP supported.`);
        }
        let classNamespace = phpPkg.package.split('.').join('\\');
        let className = phpPkg.clientName || 'Client';
        if (inner && pkg.exports[inner]) {
          let phpPath = path.dirname(pkg.exports[inner]);
          const arr = phpPath.split(path.sep).slice(1);
          arr.map(key => {
            classNamespace += '\\' + _upperFirst(key);
            
          });
          className = phpPkg.exports[inner];
        }
        const [ key ,value ] = phpRelease.split(':');
        this.requires[key] = value;
        this.moduleClass.set(aliasId, {
          namespace: classNamespace,
          className: className,
          aliasName: this.getAliasName(classNamespace, className, aliasId),
          modelDir: phpPkg.modelDirName || 'Models',
          exceptionDir: phpPkg.exceptionDirName || 'Exceptions',
        });
        this.moduleTypedef[aliasId] = phpPkg.typedef;
      }
      this.__externModule = usedModels;
    }
  }

  visitParams(ast, level) {
    assert.equal(ast.type, 'params');
    this.emit('(');
    for (var i = 0; i < ast.params.length; i++) {
      if (i !== 0) {
        this.emit(', ');
      }
      const node = ast.params[i];
      assert.equal(node.type, 'param');
      const name = _name(node.paramName);
      this.emit(`$${_avoidKeywords(name)}`);
    }
    this.emit(')');
  }

  visitType(ast, level) {
    if (ast.type === 'array') {
      this.visitType(ast.subType, level);
      this.emit('[]');
    } else if (ast.type === 'moduleModel') {
      const [moduleId, ...rest] = ast.path;
      const { namespace, modelDir, exceptionDir } = this.moduleClass.get(moduleId.lexeme);
      const moduleModelName = rest.map((item) => {
        return item.lexeme;
      }).join('\\');
      let type = modelDir;
      let suffix = '';
      const usedEx = this.usedExternException.get(moduleId.lexeme);
      if(usedEx && usedEx.has(moduleModelName)) {
        type = exceptionDir;
        suffix = 'Exception';
      }
      const subModelName = this.getRealModelName(`${namespace}\\${type}\\${moduleModelName}${suffix}`);
      this.emit(subModelName);
    } else if (ast.type === 'subModel') {
      const [moduleId, ...rest] = ast.path;
      const subModelName = _subModelName([moduleId.lexeme, ...rest.map((item) => {
        return item.lexeme;
      })].join('\\'));
      const realModelName = this.getRealModelName(`${this.namespace}\\${this.modelDir}\\${subModelName}`);
      this.emit(realModelName);
    } else if (ast.type === 'map') {
      this.visitType(ast.valueType, level);
      this.emit('[]');
    } else if (ast.type === 'model') {
      let namespace = this.namespace;
      let type = this.modelDir;
      let suffix = '';
      if (ast.moduleName) {
        namespace = this.moduleClass.get(ast.moduleName).namespace;
        const { modelDir, exceptionDir } = this.moduleClass.get(ast.moduleName);
        type = modelDir;
        const usedEx = this.usedExternException.get(ast.moduleName);
        if(usedEx && usedEx.has(ast.name)) {
          suffix = 'Exception';
          type = exceptionDir;
        }
      } else if(this.predefined[ast.name] && this.predefined[ast.name].isException) {
        suffix = 'Exception';
        type = this.exceptionDir;
      }
      const realModelName = this.getRealModelName(`${namespace}\\${type}\\${ast.name}${suffix}`);
      this.emit(realModelName);
    } else if (this.isIterator(ast)) {
      this.visitType(ast.valueType);
    } else if (ast.type === 'entry') {
      this.emit('[string, ');
      this.visitType(ast.valueType);
      this.emit(']');
    } else if (ast.idType === 'model') {
      let type = this.modelDir;
      let suffix = '';
      if(this.predefined[ast.lexeme] && this.predefined[ast.lexeme].isException) {
        type = this.exceptionDir;
        suffix = 'Exception';
      }
      const realModelName = this.getRealModelName(`${this.namespace}\\${type}\\${ast.lexeme}${suffix}`);
      this.emit(realModelName);
    } else if (ast.idType === 'module') {
      let moduleName = _name(ast);
      if(this.builtin[moduleName]) {
        moduleName = this.getType(moduleName);
      } else {
        moduleName = this.getRealClientName(moduleName);
      }
      this.emit(moduleName);
    } else if (ast.idType === 'builtin_model') {
      const realModelName = this.getRealModelName(this.getType(ast.lexeme));
      this.emit(realModelName);
    } else if (ast.type === 'moduleTypedef') {
      const [moduleId, modelName] = ast.path;
      const moduleTypedef = this.moduleTypedef[moduleId.lexeme];
      const typedef = moduleTypedef[modelName.lexeme];
      if(!typedef.import) {
        this.emit(typedef.type);
      } else {
        const typedefName = this.getRealModelName(`${typedef.import}\\${typedef.type}`);
        this.emit(typedefName);
      }
    } else if (ast.type === 'typedef' || ast.idType === 'typedef') {
      const typedef = this.typedef[ast.lexeme];
      if(!typedef.import) {
        this.emit(typedef.type);
      } else {
        const typedefName = this.getRealModelName(`${typedef.import}\\${typedef.type}`);
        this.emit(typedefName);
      }
    } else {
      this.emit(this.getType(_name(ast)));
    }
  }

  visitAPIBody(ast, level) {
    assert.equal(ast.type, 'apiBody');
    const requestName = this.getRealModelName(REQUEST);
    this.emit(`$_request = new ${requestName}();\n`, level);
    this.visitStmts(ast.stmts, level);
  }

  visitRuntimeBefore(ast, level) {
    assert.equal(ast.type, 'object');
    this.emit('$_runtime = ', level);
    this.visitObject(ast, level);
    this.emit(';\n');
    this.emit('\n');
    this.emit('$_retriesAttempted = 0;\n', level);
    this.emit('$_lastRequest = null;\n', level);
    this.emit('$_lastResponse = null;\n', level);
    const retryContextName = this.getRealModelName(RETRY_CONTEXT);
    this.emit(`$_context = new ${retryContextName}([\n`, level);
    this.emit('\'retriesAttempted\' => $_retriesAttempted,\n', level + 1);
    this.emit(']);\n', level);
    this.emit('while (Dara::shouldRetry($_runtime[\'retryOptions\'], $_context)) {\n', level);
    this.emit('if ($_retriesAttempted > 0) {\n', level + 1);
    this.emit('$_backoffTime = Dara::getBackoffDelay($_runtime[\'retryOptions\'], $_context);\n', level + 2);
    this.emit('if ($_backoffTime > 0) {\n', level + 2);
    this.emit('Dara::sleep($_backoffTime);\n', level + 3);
    this.emit('}\n', level + 2);
    this.emit('}\n', level + 1);
    this.emit('\n');
    this.emit('$_retriesAttempted++;\n', level + 1);
    this.emit('try {\n', level + 1);
  }

  visitStmt(ast, level) {
    let comments = DSL.comment.getFrontComments(this.comments, ast.tokenRange[0]);
    this.visitComments(comments, level);
    if (ast.type === 'return') {
      this.visitReturn(ast, level);
    } else if (ast.type === 'yield') {
      this.visitYield(ast, level);
    } else if (ast.type === 'if') {
      this.visitIf(ast, level);
    } else if (ast.type === 'throw') {
      this.visitThrow(ast, level);
    } else if (ast.type === 'assign') {
      this.visitAssign(ast, level);
    } else if (ast.type === 'retry') {
      this.visitRetry(ast, level);
    } else if (ast.type === 'break') {
      this.emit('break;\n', level);
    } else if (ast.type === 'declare') {
      this.visitDeclare(ast, level);
    } else if (ast.type === 'while') {
      this.visitWhile(ast, level);
    } else if (ast.type === 'for') {
      this.visitFor(ast, level);
    } else if (ast.type === 'try') {
      this.visitTry(ast, level);
    } else {
      this.emit('', level);
      this.visitExpr(ast, level);
      this.emit(';\n');
    }
  }

  getType(name) {
    if (name === 'integer' || name === 'number' ||
      name === 'int8' || name === 'uint8' ||
      name === 'int16' || name === 'uint16' ||
      name === 'int32' || name === 'uint32' ||
      name === 'int64' || name === 'uint64' ||
      name === 'long' || name === 'ulong') {
      return 'int';
    }
  
    if (name === 'float'  || name === 'double') {
      return 'float';
    }
  
    if (name === 'readable') {
      return STREAM;
    }
  
    if (name === 'writable') {
      return STREAM;
    }

    if (name === '$Request') {
      return REQUEST;
    }
  
    if (name === '$Response') {
      return RESPONSE;
    }
  
    if (name === '$Model') {
      return MODEL;
    }
  
    if (name === '$Error') {
      return ERROR;
    }

    if (name === '$ResponseError') {
      return RESP_ERROR;
    }

    if (name === '$RetryOptions') {
      return RETRY_OPTION;
    }

    if (name === '$RuntimeOptions') {
      return RUNTIME_OPTION;
    }

    if (name === '$ExtendsParameters') {
      return EXTEND_PARAM;
    }
  
    if (name === '$SSEEvent') {
      return SSE_EVENT;
    }
  
    if (name === '$Date' || name === '$File' || 
    name === '$URL' || name === '$Stream') {
      return this.builtin[name].getClientName();
    }
  
    if (name === 'object') {
      return 'mixed[]';
    }
  
    if (name === 'bytes') {
      return 'int[]';
    }
  
    if (name === 'any') {
      return 'mixed';
    }
  
    return name;
  }

  visitFieldType(value, level, fieldName) {
    if (value.type === 'modelBody') {
      const subModelName = this.getRealModelName(`${this.namespace}\\${this.modelDir}\\${this.modelSpace}\\${fieldName}`);
      this.emit(subModelName);
    } else if (value.type === 'array') {
      this.visitType(value);
    } else if (value.fieldType === 'array') {
      this.visitFieldType(value.fieldItemType, level, fieldName);
      this.emit('[]');
    } else if (value.fieldType === 'map') {
      this.visitFieldType(value.valueType);
      this.emit('[]');
    } else if (value.type === 'map') {
      this.visitFieldType(value.valueType);
      this.emit('[]');
    } else if (value.tag === Tag.TYPE) {
      this.emit(`${this.getType(value.lexeme)}`);
    } else if (value.tag === Tag.ID && value.idType === 'model') {
      const modelName = _name(value);
      const realModelName = this.getRealModelName(`${this.namespace}\\${this.modelDir}\\${modelName}`);
      this.emit(realModelName);
    } else if (value.tag === Tag.ID && value.idType === 'module') {
      let moduleName = _name(value);
      if(this.builtin[moduleName]) {
        moduleName = this.getType(moduleName);
      } else {
        moduleName = this.getRealClientName(moduleName);
      }
      this.emit(moduleName);
    } else if (value.tag === Tag.ID && value.idType === 'builtin_model') {
      const realModelName = this.getRealModelName(this.getType(value.lexeme));
      this.emit(realModelName);
    } else if (value.tag === Tag.ID) {
      this.emit(`${value.lexeme}`);
    } else if (value.type === 'moduleModel') {
      const [moduleId, ...models] = value.path;
      const { namespace, modelDir } = this.moduleClass.get(moduleId.lexeme);
      const moduleModelName = models.map((item) => {
        return item.lexeme;
      }).join('\\');
      const subModelName = this.getRealModelName(`${namespace}\\${modelDir}\\${moduleModelName}`);
      this.emit(subModelName);
    } else if (value.type === 'subModel') {
      const [moduleId, ...rest] = value.path;
      const subModelName = [moduleId.lexeme, ...rest.map((item) => {
        return item.lexeme;
      })].join('\\');
      const realModelName = this.getRealModelName(`${this.namespace}\\${this.modelDir}\\${subModelName}`);
      this.emit(realModelName);
    } else if (value.fieldType === 'readable' || value.fieldType === 'writable') {
      const realModelName = this.getRealModelName(this.getType(value.fieldType));
      this.emit(realModelName);
    } else if (typeof value.fieldType === 'string') {
      this.emit(`${this.getType(value.fieldType)}`);
    } else if (value.fieldType.type === 'moduleModel') {
      const [moduleId, ...models] = value.fieldType.path;
      const { namespace, modelDir } = this.moduleClass.get(moduleId.lexeme);
      const subModelName = models.map((item) => {
        return item.lexeme;
      }).join('\\');
      const realModelName = this.getRealModelName(`${namespace}\\${modelDir}\\${subModelName}`);
      this.emit(realModelName);
    } else if (value.fieldType.type === 'moduleTypedef') {
      const [moduleId, modelName] = value.fieldType.path;
      const moduleTypedef = this.moduleTypedef[moduleId.lexeme];
      const typedef = moduleTypedef[modelName.lexeme];
      if(!typedef.import) {
        this.emit(typedef.type);
      } else {
        const typedefName = this.getRealModelName(`${typedef.import}\\${typedef.type}`);
        this.emit(typedefName);
      }
    } else if (value.fieldType.type === 'typedef' || value.fieldType.idType === 'typedef') {
      const typedef = this.typedef[value.fieldType.lexeme];
      if(!typedef.import) {
        this.emit(typedef.type);
      } else {
        const typedefName = this.getRealModelName(`${typedef.import}\\${typedef.type}`);
        this.emit(typedefName);
      }
    } else if (value.fieldType.type) {
      this.emit(`${this.getType(value.fieldType.lexeme)}`);
    } else if (value.fieldType.idType === 'model') {
      const realModelName = this.getRealModelName(`${this.namespace}\\${this.modelDir}\\${value.fieldType.lexeme}`);
      this.emit(realModelName);
    } else if (value.fieldType.idType === 'module') {
      let moduleName = _name(value.fieldType);
      if(this.builtin[moduleName]) {
        moduleName = this.getType(moduleName);
      } else {
        moduleName = this.getRealClientName(moduleName);
      }
      this.emit(moduleName);
    } else if (value.fieldType.idType === 'builtin_model') {
      const realModelName = this.getRealModelName(this.getType(value.fieldType.lexeme));
      this.emit(realModelName);
    } 
  }


  visitFromField(fieldValue, fieldName, key, value, level) {
    const deep = Math.floor(level / 2);
    if (fieldValue.type === 'modelBody') {
      const subModelName = this.getRealModelName(`${this.namespace}\\Models\\${this.modelSpace}\\${fieldName}`);
      this.emit(`${key} = ${subModelName}::fromMap(${value});\n`, level + 1);
    } else if (fieldValue.type === 'array' || fieldValue.fieldType === 'array') {
      this.emit(`if(!empty(${value})) {\n`, level + 1);
      this.emit(`${key} = [];\n`, level + 2);
      this.emit(`$n${deep} = 0;\n`, level + 2);
      this.emit(`foreach(${value} as $item${deep}) {\n`, level + 2);
      this.visitFromField(fieldValue.fieldItemType || fieldValue.subType, fieldName, `${key}[$n${deep}++]`, `$item${deep}`, level + 2);
      this.emit('}\n', level + 2);
      this.emit('}\n', level + 1);
    } else if (fieldValue.fieldType === 'map' || fieldValue.type === 'map') {
      this.emit(`if(!empty(${value})) {\n`, level + 1);
      this.emit(`${key} = [];\n`, level + 2);
      this.emit(`foreach(${value} as $key${deep} => $value${deep}) {\n`, level + 2);
      this.visitFromField(fieldValue.valueType, fieldName, `${key}[$key${deep}]`, `$value${deep}`, level + 2);
      this.emit('}\n', level + 2);
      this.emit('}\n', level + 1);
    } else if (fieldValue.type === 'moduleModel' || 
    (fieldValue.fieldType && fieldValue.fieldType.type === 'moduleModel')) {
      const [moduleId, ...models] = fieldValue.path || fieldValue.fieldType.path;
      const { namespace, modelDir } = this.moduleClass.get(moduleId.lexeme);
      const moduleModelName = models.map((item) => {
        return item.lexeme;
      }).join('\\');
      const subModelName = this.getRealModelName(`${namespace}\\${modelDir}\\${moduleModelName}`);
      this.emit(`${key} = ${subModelName}::fromMap(${value});\n`, level + 1);
    } else if (fieldValue.type === 'subModel') {
      const [moduleId, ...rest] = fieldValue.path;
      const subModelName = _subModelName([moduleId.lexeme, ...rest.map((item) => {
        return item.lexeme;
      })].join('\\'));
      const realModelName = this.getRealModelName(`${this.namespace}\\${this.modelDir}\\${subModelName}`);
      this.emit(`${key} = ${realModelName}::fromMap(${value});\n`, level + 1);
    } else if (fieldValue.idType === 'model') {
      const realModelName = this.getRealModelName(`${this.namespace}\\${this.modelDir}\\${fieldValue.lexeme}`);
      this.emit(`${key} = ${realModelName}::fromMap(${value});\n`, level + 1);
    } else if (fieldValue.fieldType && fieldValue.fieldType.idType === 'model') {
      const realModelName = this.getRealModelName(`${this.namespace}\\${this.modelDir}\\${fieldValue.fieldType.lexeme}`);
      this.emit(`${key} = ${realModelName}::fromMap(${value});\n`, level + 1);
    } else if (fieldValue.fieldType && fieldValue.fieldType.idType === 'builtin_model') {
      const realModelName = this.getRealModelName(this.getType(fieldValue.fieldType.lexeme));
      this.emit(`${key} = ${realModelName}::fromMap(${value});\n`, level + 1);
    } else {
      this.emit(`${key} = ${value};\n`, level + 1);
    }
    
  }

  visitToArrayField(fieldValue, key, value, level) {
    const deep = Math.floor(level / 2);
    if (fieldValue.type === 'modelBody' || fieldValue.type === 'moduleModel' || 
    fieldValue.type === 'subModel') {
      this.emit(`${key} = null !== ${value} ? ${value}->toArray($noStream) : ${value};\n`, level + 1);
    } else if(fieldValue.idType === 'model') {
      this.emit(`${key} = null !== ${value} ? ${value}->toArray($noStream) : ${value};\n`, level + 1);
    } else if(fieldValue.fieldType && (fieldValue.fieldType.type === 'moduleModel' || 
    fieldValue.fieldType.idType === 'model' || fieldValue.fieldType.idType === 'builtin_model')) {
      this.emit(`${key} = null !== ${value} ? ${value}->toArray($noStream) : ${value};\n`, level + 1);
    } else if (fieldValue.type === 'array' || fieldValue.fieldType === 'array') {
      this.emit(`if(is_array(${value})) {\n`, level + 1);
      this.emit(`${key} = [];\n`, level + 2);
      this.emit(`$n${deep} = 0;\n`, level + 2);
      this.emit(`foreach(${value} as $item${deep}) {\n`, level + 2);
      this.visitToArrayField(fieldValue.fieldItemType || fieldValue.subType, `${key}[$n${deep}++]`, `$item${deep}`, level + 2);
      this.emit('}\n', level + 2);
      this.emit('}\n', level + 1);
    } else if (fieldValue.fieldType === 'map' || fieldValue.type === 'map') {
      this.emit(`if(is_array(${value})) {\n`, level + 1);
      this.emit(`${key} = [];\n`, level + 2);
      this.emit(`foreach(${value} as $key${deep} => $value${deep}) {\n`, level + 2);
      this.visitToArrayField(fieldValue.valueType, `${key}[$key${deep}]`, `$value${deep}`, level + 2);
      this.emit('}\n', level + 2);
      this.emit('}\n', level + 1);
    } else {
      this.emit(`${key} = ${value};\n`, level + 1);
    }
    
  }

  visitModelBody(ast, level, modelName) {
    assert.equal(ast.type, 'modelBody');
    let node;
    for (let i = 0; i < ast.nodes.length; i++) {
      node = ast.nodes[i];
      //  TODO document gen
      node = ast.nodes[i];
      let comments = DSL.comment.getFrontComments(this.comments, node.tokenRange[0]);
      this.visitComments(comments, level);
      this.emit('/**\n', level);
      this.emit(' * @var ', level);
      this.visitFieldType(node.fieldValue, level, _name(node.fieldName));
      this.emit('\n');
      this.emit(' */\n', level);
      this.emit(`public $${_name(node.fieldName)};\n`, level);
    }
    if (node) {
      //find the last node's back comment
      let comments = DSL.comment.getBetweenComments(this.comments, node.tokenRange[0], ast.tokenRange[1]);
      this.visitComments(comments, level);
    }

    if (ast.nodes.length === 0) {
      //empty block's comment
      let comments = DSL.comment.getBetweenComments(this.comments, ast.tokenRange[0], ast.tokenRange[1]);
      this.visitComments(comments, level);
    }

    this.emit('protected $_name = [\n', level);
    for (let i = 0; i < ast.nodes.length; i++) {
      const node = ast.nodes[i];
      const nameAttr = node.attrs.find((item) => {
        return item.attrName.lexeme === 'name';
      });
      if (nameAttr) {
        this.emit(`'${_name(node.fieldName)}' => '${_string(nameAttr.attrValue)}',\n`, level + 2);
      } else {
        this.emit(`'${_name(node.fieldName)}' => '${_name(node.fieldName)}',\n`, level + 2);
      }
    }
    this.emit('];\n', level);
    this.emit('\n');

    this.emit('public function validate()\n', level);
    this.emit('{\n', level);
    this.visitModelValidate(ast, level + 1);
    this.emit('}\n', level);
    this.emit('\n');
    this.emit('public function toArray($noStream = false)\n', level);
    this.emit('{\n', level);
    this.emit('$res = [];\n', level + 1);
    for (let i = 0; i < ast.nodes.length; i++) {
      const node = ast.nodes[i];
      const nameAttr = node.attrs.find((item) => {
        return item.attrName.lexeme === 'name';
      });
      const realName = nameAttr ?_string(nameAttr.attrValue) : _name(node.fieldName);

      this.emit(`if (null !== $this->${_name(node.fieldName)}) {\n`, level + 1);
      this.visitToArrayField(node.fieldValue, `$res['${realName}']`, `$this->${_name(node.fieldName)}`, level + 1);
      this.emit('}\n', level + 1);
      this.emit('\n');
    }
    this.emit('return $res;\n', level + 1);
    this.emit('}\n', level);
    this.emit('\n');

    this.emit('public function toMap($noStream = false)\n', level);
    this.emit('{\n', level);
    this.emit('return $this->toArray($noStream);\n', level + 1);
    this.emit('}\n', level);
    this.emit('\n');

    this.emit('public static function fromMap($map = [])\n', level);
    this.emit('{\n', level);
    this.emit('$model = new self();\n', level + 1);
    for (let i = 0; i < ast.nodes.length; i++) {
      const node = ast.nodes[i];
      const nameAttr = node.attrs.find((item) => {
        return item.attrName.lexeme === 'name';
      });
      const realName = nameAttr ?_string(nameAttr.attrValue) : _name(node.fieldName);
      const fieldName = _name(node.fieldName);
      this.emit(`if (isset($map['${realName}'])) {\n`, level + 1);
      this.visitFromField(node.fieldValue, fieldName, `$model->${fieldName}`, `$map['${realName}']`, level + 1);
      this.emit('}\n', level + 1);
      this.emit('\n');
    }
    this.emit('return $model;\n', level + 1);
    this.emit('}\n', level);
    this.emit('\n');

    
  }
  

  getAttributes(ast, name) {
    const attr = ast.attrs.find((item) => {
      return item.attrName.lexeme === name;
    });
    if(!attr) {
      return;
    }
    return attr.attrValue.string || attr.attrValue.lexeme || attr.attrValue.value;
  }

  visitFieldValidate(modelName, value, level, name) {
    if (value.type === 'array' || value.fieldType === 'array') {
      this.emit(`if(is_array(${name})) {\n`, level);
      this.emit(`${modelName}::validateArray(${name});\n`, level + 1);
      this.emit('}\n', level);
    } else if (value.fieldType === 'map' || value.type === 'map') {
      this.emit(`if(is_array(${name})) {\n`, level);
      this.emit(`${modelName}::validateArray(${name});\n`, level + 1);
      this.emit('}\n', level);
    } else if (value.type === 'moduleModel' || value.type === 'modelBody'
    || value.type === 'subModel' || value.fieldType.type === 'moduleModel'
    || value.fieldType.idType === 'model' || value.fieldType.idType === 'module') {
      this.emit(`if(null !== ${name}) {\n`, level);
      this.emit(`${name}->validate();\n`, level + 1);
      this.emit('}\n', level);
    }
  }

  visitModelValidate(ast, level) {
    const modelName = this.getRealModelName(MODEL);
    for (let i = 0; i < ast.nodes.length; i++) {
      const node = ast.nodes[i];
      this.visitFieldValidate(modelName, node.fieldValue, level, `$this->${_name(node.fieldName)}`);
      const attrName = _name(node.fieldName);
      const pattern = this.getAttributes(node, 'pattern') || '';
      const maxLength = this.getAttributes(node, 'maxLength') || 0;
      const minLength = this.getAttributes(node, 'minLength') || 0;
      const maximum = this.getAttributes(node, 'maximum') || 0;
      const minimum = this.getAttributes(node, 'minimum') || 0;
      const required = node.required || false;
      if (required || maxLength > 0 || minLength > 0 || maximum > 0 || pattern !== '') {
        if (required) {
          this.emit(`${modelName}::validateRequired('${attrName}', $this->${attrName}, true);\n`, level);
        }
        if (pattern !== '') {
          this.emit(`${modelName}::validatePattern('${attrName}', $this->${attrName}, '${pattern}');\n`, level);
        }
        if (maxLength > 0 && maxLength <= 2147483647) {
          this.emit(`${modelName}::validateMaxLength('${attrName}', $this->${attrName}, ${maxLength});\n`, level);
        }
        if (minLength > 0 && minLength <= 2147483647) {
          this.emit(`${modelName}::validateMinLength('${attrName}', $this->${attrName}, ${minLength});\n`, level);
        }
        // 不能超过JS中最大安全整数
        if (maximum > 0 && maximum <= Number.MAX_SAFE_INTEGER) {
          this.emit(`${modelName}::validateMaximum('${attrName}', $this->${attrName}, ${maximum});\n`, level);
        }
        // 不能超过JS中最大安全整数
        if (minimum > 0 && minimum <= Number.MAX_SAFE_INTEGER) {
          this.emit(`${modelName}::validateMinimum('${attrName}', $this->${attrName}, ${minimum});\n`, level);
        }
      }
    }
    this.emit('parent::validate();\n', level);
  }

  visitExtendOn(extendOn, type = 'model') {
    if (!extendOn) {
      const modelName = type === 'model' ? this.getRealModelName(MODEL) : this.getRealModelName(ERROR);
      return this.emit(modelName);
    }
    let suffix = '';
    let namespace = this.namespace;
    let extendType = this.modelDir;
    let modelName = _name(extendOn);
    if(this.predefined[modelName] && this.predefined[modelName].isException) {
      extendType = this.exceptionDir;
      suffix = 'Exception';
    }
    if (extendOn.type === 'moduleModel') {
      const [moduleId, ...rest] = extendOn.path;
      namespace = this.moduleClass.get(moduleId.lexeme).namespace;
      extendType = this.moduleClass.get(moduleId.lexeme)[`${type}Dir`];
      modelName = rest.map((item) => {
        return item.lexeme;
      }).join('\\');
      const usedEx = this.usedExternException.get(moduleId.lexeme);
      if(usedEx && usedEx.has(modelName)) {
        extendType = this.exceptionDir;
        suffix = 'Exception';
      }
    } else if (extendOn.type === 'subModel') {
      const [moduleId, ...rest] = extendOn.path;
      modelName = [moduleId.lexeme, ...rest.map((item) => {
        return item.lexeme;
      })].join('\\');
    }
    this.emit(this.getRealModelName(`${namespace}\\${extendType}\\${modelName}${suffix}`));
  }

  visitModel(modelBody, modelName, extendOn, level) {
    this.emit(`class ${modelName} extends `, level);
    this.visitExtendOn(extendOn);
    this.emit(' {\n');
    this.visitModelBody(modelBody, level + 1, modelName);
    this.emit('\n');
    this.emit('}\n\n', level);
  }

  visitEcxceptionBody(ast, level) {
    assert.equal(ast.type, 'exceptionBody');
    let node;
    for (let i = 0; i < ast.nodes.length; i++) {
      node = ast.nodes[i];
      const fieldName = _name(node.fieldName);
      //  TODO document gen
      this.emit('/**\n', level);
      this.emit('* @var ', level);
      this.visitFieldType(node.fieldValue, level, fieldName);
      this.emit('\n');
      this.emit('*/\n', level);
      this.emit(`${_filedsAccess(fieldName)} $${fieldName};\n`, level);
    }

    this.emit('\n');
    this.emit('public function __construct($map)\n', level);
    this.emit('{\n', level);
    this.emit('parent::__construct($map);\n', level + 1);
    for (let i = 0; i < ast.nodes.length; i++) {
      node = ast.nodes[i];
      this.emit(`$this->${_name(node.fieldName)} = $map['${_name(node.fieldName)}'];\n`, level + 1);
    }
    this.emit('}\n\n', level);
    for (let i = 0; i < ast.nodes.length; i++) {
      node = ast.nodes[i];
      //  TODO document gen
      this.emit('/**\n', level);
      this.emit('* @return ', level);
      this.visitFieldType(node.fieldValue, level, _name(node.fieldName));
      this.emit('\n');
      this.emit('*/\n', level);
      this.emit(`public function get${_upperFirst(_name(node.fieldName))}()\n`, level);
      this.emit('{\n', level);
      this.emit(`return $this->${_name(node.fieldName)};\n`, level + 1);
      this.emit('}\n', level);
    }
    if (node) {
      //find the last node's back comment
      let comments = DSL.comment.getBetweenComments(this.comments, node.tokenRange[0], ast.tokenRange[1]);
      this.visitComments(comments, level);
    }

    if (ast.nodes.length === 0) {
      //empty block's comment
      let comments = DSL.comment.getBetweenComments(this.comments, ast.tokenRange[0], ast.tokenRange[1]);
      this.visitComments(comments, level);
    }
  }

  visitException(exceptionBody, exceptionName, extendOn, level) {
    this.emit(`class ${exceptionName}Exception extends `, level);
    this.visitExtendOn(extendOn, 'exception');
    this.emit(' {\n');
    this.visitEcxceptionBody(exceptionBody, level + 1, exceptionName);
    this.emit('}\n\n', level);
  }

  eachSubModel(ast, level) {
    assert.equal(ast.type, 'model');
    const modelName = _subModelName(_name(ast.modelName));
    this.visitModel(ast.modelBody, modelName, ast.extendOn, level);
  }

  visitObjectFieldValue(ast, level) {
    this.visitExpr(ast, level);
  }

  visitObjectField(ast, level) {
    let comments = DSL.comment.getFrontComments(this.comments, ast.tokenRange[0]);
    this.visitComments(comments, level);
    var key = _name(ast.fieldName) || _string(ast.fieldName);
    this.emit(`'${key}' => `, level);
    this.visitObjectFieldValue(ast.expr, level);
    this.emit(',\n');
  }

  visitObject(ast, level) {
    assert.equal(ast.type, 'object');

    if (ast.fields.length === 0) {
      this.emit('[ ');
      let comments = DSL.comment.getBetweenComments(this.comments, ast.tokenRange[0], ast.tokenRange[1]);
      if (comments.length > 0) {
        this.emit('\n');
        this.visitComments(comments, level + 1);
        this.emit('', level);
      }
      this.emit(']');
    } else {
      const mergeFields = [];
      const mapFields = [];
      for (let i = 0; i < ast.fields.length; i++) {
        const field = ast.fields[i];
        if (field.type === 'objectField') {
          mapFields.push(field);
        } else if (field.type === 'expandField') {
          mergeFields.push(field);
        } else {
          throw new Error('unimpelemented');
        }
      }

      if(mergeFields.length > 0) {
        this.emit('Dara::merge(');
      }
      this.emit('[\n');
      for (let i = 0; i < mapFields.length; i++) {
        this.visitObjectField(mapFields[i], level + 1);
      }
      //find the last item's back comment
      let comments = DSL.comment.getBetweenComments(this.comments, ast.fields[ast.fields.length - 1].tokenRange[0], ast.tokenRange[1]);
      this.visitComments(comments, level + 1);
      this.emit(']', level);
      if(mergeFields.length > 0) {
        for (let i = 0; i < mergeFields.length; i++) {
          this.emit(', ');
          this.visitExpr(mergeFields[i].expr, level + 1);
        }
        this.emit(')');
      }

      
    }
  }

  visitMethodCall(ast, level) {
    assert.equal(ast.left.type, 'method_call');
    const name = _name(ast.left.id);
    if (name.startsWith('$') && this.builtin[name]) {
      const method = name.replace('$', '');
      this.builtin[name][method](ast.args, level);
      return;
    } else if (ast.isStatic) {
      this.emit(`self::${name}`);
    } else {
      this.emit(`$this->${name}`);
    }
    this.visitArgs(ast.args, level);
  }

  visitInstanceCall(ast, level) {
    assert.equal(ast.left.type, 'instance_call');
    const method = _avoidKeywords(_name(ast.left.propertyPath[0]));

    if (ast.builtinModule && this.builtin[ast.builtinModule] && this.builtin[ast.builtinModule][method]) {
      this.builtin[ast.builtinModule][method](ast, level);
    } else {
      if (ast.left.id.tag === DSL.Tag.Tag.VID) {
        this.emit(`$this->${_vid(ast.left.id)}`);
      } else {
        this.emit(`$${_name(ast.left.id)}`);
      }
      this.emit(`->${(method)}`);
      this.visitArgs(ast.args, level);
    }

  }

  visitStaticCall(ast, level) {
    assert.equal(ast.left.type, 'static_call');

    if (ast.left.id.type === 'builtin_module') {
      this.visitBuiltinStaticCall(ast);
      return;
    }
    const aliasId = _name(ast.left.id);
    const clientName= this.getRealClientName(aliasId);
    this.emit(`${clientName}::${_avoidKeywords(_name(ast.left.propertyPath[0]))}`);
    this.visitArgs(ast.args, level);
  }

  visitBuiltinStaticCall(ast) {
    const moduleName = _name(ast.left.id);

    const builtiner = this.builtin[moduleName];
    if (!builtiner) {
      throw new Error('un-implemented');
    }
    const func = _name(ast.left.propertyPath[0]);
    builtiner[func](ast.args);
  }

  visitCall(ast, level) {
    assert.equal(ast.type, 'call');
    if (ast.left.type === 'method_call') {
      this.visitMethodCall(ast, level);
    } else if (ast.left.type === 'instance_call') {
      this.visitInstanceCall(ast, level);
    } else if (ast.left.type === 'static_call') {
      this.visitStaticCall(ast, level);
    } else {
      throw new Error('un-implemented');
    }
  }

  visitConstruct(ast, level) {
    assert.equal(ast.type, 'construct');
    this.emit('new ');
    let aliasId = this.getType(ast.aliasId.lexeme);
    const clientName = this.getRealClientName(aliasId);

    this.emit(clientName || aliasId);
    this.visitArgs(ast.args, level);
  }

  visitSuper(ast, level) {
    assert.equal(ast.type, 'super');
    this.emit('parent::__construct');
    this.visitArgs(ast.args, level);
  }

  visitArgs(args, level) {
    this.emit('(');
    for (let i = 0; i < args.length; i++) {
      const expr = args[i];
      if (expr.needCast) {
        this.visitExpr(expr, level);
        this.emit('->toArray()');
      } else {
        this.visitExpr(expr, level);
      }
      if (i !== args.length - 1) {
        this.emit(', ');
      }
    }
    this.emit(')');
  }

  visitPropertyAccess(ast) {
    assert.ok(ast.type === 'property_access' || ast.type === 'property');
    var id = _name(ast.id);
    if (ast.id.tag === Tag.VID) {
      id = `this->${_vid(ast.id)}`;
    }

    var expr = `$${_avoidKeywords(id)}`;

    var current = ast.id.inferred;
    for (var i = 0; i < ast.propertyPath.length; i++) {
      var name = _name(ast.propertyPath[i]);
      if (current.type === 'model') {
        expr += `->${name}`;
      } else {
        if(!expr.startsWith('@')) {
          expr = `@${expr}`;
        }
        expr += `['${name}']`;
      }
      current = ast.propertyPathTypes[i];
    }
    this.emit(expr);
  }

  visitExpr(ast, level) {
    if (ast.type === 'boolean') {
      this.emit(ast.value);
    } else if (ast.type === 'property_access') {
      this.visitPropertyAccess(ast);
    } else if (ast.type === 'string') {
      this.emit(`'${_string(ast.value)}'`);
    } else if (ast.type === 'number') {
      this.emit(ast.value.value);
    } else if (ast.type === 'null') {
      this.emit('null');
    } else if (ast.type === 'object') {
      this.visitObject(ast, level);
    } else if (ast.type === 'variable') {
      if(ast.inferred &&  ast.inferred.type === 'basic' && ast.inferred.name === 'class') {
        this.emit(`${_avoidKeywords(_name(ast.id))}::class`);
      } else {
        this.emit(`$${_avoidKeywords(_name(ast.id))}`);
      }
    } else if (ast.type === 'virtualVariable') {
      this.emit(`$this->${_vid(ast.vid)}`);
    } else if (ast.type === 'decrement') {
      if (ast.position === 'front') {
        this.emit('--');
      }
      this.visitExpr(ast.expr, level);
      if (ast.position === 'backend') {
        this.emit('--');
      }
    } else if (ast.type === 'increment') {
      if (ast.position === 'front') {
        this.emit('++');
      }
      this.visitExpr(ast.expr, level);
      if (ast.position === 'backend') {
        this.emit('++');
      }
    } else if (ast.type === 'template_string') {
      this.emit('\'');
      for (var i = 0; i < ast.elements.length; i++) {
        var item = ast.elements[i];
        if (item.type === 'element') {
          this.emit(_string(item.value));
        } else if (item.type === 'expr') {
          this.emit('\' . ');
          if(item.expr.inferred && item.expr.inferred.name !== 'string') {
            this.emit('(string)');
          }
          if(_isBinaryOp(item.expr.type)) {
            this.emit('(');
          }
          this.visitExpr(item.expr, level);
          if(_isBinaryOp(item.expr.type)) {
            this.emit(')');
          }
          this.emit(' . \'');
        } else {
          throw new Error('unimpelemented');
        }
      }
      this.emit('\'');
    } else if (ast.type === 'call') {
      this.visitCall(ast, level);
    } else if (ast.type === 'construct') {
      this.visitConstruct(ast, level);
    } else if (ast.type === 'array') {
      this.visitArray(ast, level);
    } else if (ast.type === 'group') {
      this.emit('(');
      this.visitExpr(ast.expr, level);
      this.emit(')');
    } else if (_isBinaryOp(ast.type)) {
      this.visitExpr(ast.left, level);
      if (ast.type === 'or') {
        this.emit(' || ');
      } else if (ast.type === 'add') {
        if(ast.inferred &&  ast.inferred.type === 'basic' && ast.inferred.name === 'string') { 
          this.emit(' . ');
        } else {
          this.emit(' + ');
        }
      } else if (ast.type === 'subtract') {
        this.emit(' - ');
      } else if (ast.type === 'div') {
        this.emit(' / ');
      } else if (ast.type === 'multi') {
        this.emit(' * ');
      } else if (ast.type === 'and') {
        this.emit(' && ');
      } else if (ast.type === 'or') {
        this.emit(' || ');
      } else if (ast.type === 'lte') {
        this.emit(' <= ');
      } else if (ast.type === 'lt') {
        this.emit(' < ');
      } else if (ast.type === 'gte') {
        this.emit(' >= ');
      } else if (ast.type === 'gt') {
        this.emit(' > ');
      } else if (ast.type === 'neq') {
        this.emit(' != ');
      } else if (ast.type === 'eq') {
        this.emit(' == ');
      }
      this.visitExpr(ast.right, level);
    } else if (ast.type === 'group') {
      this.emit('(');
      this.visitExpr(ast.expr, level);
      this.emit('(');
    } else if (ast.type === 'not') {
      this.emit('!');
      this.visitExpr(ast.expr, level);
    } else if (ast.type === 'construct_model') {
      this.visitConstructModel(ast, level);
    } else if (ast.type === 'map_access') {
      this.visitMapAccess(ast);
    } else if (ast.type === 'array_access') {
      this.visitArrayAccess(ast);
    } else if (ast.type === 'super') {
      this.visitSuper(ast, level);
    } else {
      console.log(ast);
      throw new Error('unimpelemented');
    }
  }

  visitConstructModel(ast, level) {
    assert.equal(ast.type, 'construct_model');
    if (ast.aliasId.isModule) {
      let aliasId = ast.aliasId.lexeme;
      let suffix = '';
      const { namespace, modelDir, exceptionDir } = this.moduleClass.get(aliasId);
      const moduleModelName = ast.propertyPath.map((item) => {
        return item.lexeme;
      }).join('\\');

      let type = modelDir;
      const usedEx = this.usedExternException.get(aliasId);
      if(usedEx && usedEx.has(moduleModelName)) {
        type = exceptionDir;
        suffix = 'Exception';
      }
      const subModelName = this.getRealModelName(`${namespace}\\${type}\\${moduleModelName}${suffix}`);
      this.emit(`new ${subModelName}`);
    }

    if (ast.aliasId.isModel) {
      let mainModelName = ast.aliasId;
      let type = this.modelDir;
      let suffix = '';

      this.emit('new ');
      const modelName = [mainModelName, ...ast.propertyPath].map((item) => {
        return item.lexeme;
      }).join('\\');
      
      if(_isBuiltinModel(modelName)) {
        const subModelName = this.getRealModelName(this.getType(modelName));
        this.emit(subModelName);
      } else {
        if(this.predefined[modelName] && this.predefined[modelName].isException) {
          type = this.exceptionDir;
          suffix = 'Exception';
        }
        const subModelName = this.getRealModelName(`${this.namespace}\\${type}\\${modelName}${suffix}`);
        this.emit(subModelName);
      }
      
    }

    this.emit('(');
    if (ast.object) {
      this.visitObject(ast.object, level);
    } else {
      this.emit('[ ]');
    }
    this.emit(')');
  }

  visitMapAccess(ast, level) {
    assert.equal(ast.type, 'map_access');
    let expr;
    if (ast.id.tag === DSL.Tag.Tag.VID) {
      expr = `$this->${_vid(ast.id)}`;
    } else {
      expr = `$${_name(ast.id)}`;
    }
    if (ast.propertyPath && ast.propertyPath.length) {
      var current = ast.id.inferred;
      for (var i = 0; i < ast.propertyPath.length; i++) {
        var name = _name(ast.propertyPath[i]);
        if (current.type === 'model') {
          expr += `->${name}`;
        } else {
          expr += `['${name}']`;
        }
        current = ast.propertyPathTypes[i];
      }
    }
    this.emit(`@${expr}[`, level);
    this.visitExpr(ast.accessKey, level);
    this.emit(']');
  }

  visitArrayAccess(ast, level) {
    assert.equal(ast.type, 'array_access');
    let expr;
    if (ast.id.tag === DSL.Tag.Tag.VID) {
      expr = `$this->${_vid(ast.id)}`;
    } else {
      expr = `$${_name(ast.id)}`;
    }
    if (ast.propertyPath && ast.propertyPath.length) {
      var current = ast.id.inferred;
      for (var i = 0; i < ast.propertyPath.length; i++) {
        var name = _name(ast.propertyPath[i]);
        if (current.type === 'model') {
          expr += `->${name}`;
        } else {
          expr += `['${name}']`;
        }
        current = ast.propertyPathTypes[i];
      }
    }
    this.emit(`@${expr}[`, level);
    this.visitExpr(ast.accessKey, level);
    this.emit(']');
  }

  visitArray(ast, level) {
    assert.equal(ast.type, 'array');
    let arrayComments = DSL.comment.getBetweenComments(this.comments, ast.tokenRange[0], ast.tokenRange[1]);
    if (ast.items.length === 0) {
      this.emit('[ ');
      if (arrayComments.length > 0) {
        this.emit('\n');
        this.visitComments(arrayComments, level + 1);
        this.emit('', level);
      }
      this.emit(']');
      return;
    }

    this.emit('[\n');
    let item;
    for (let i = 0; i < ast.items.length; i++) {
      item = ast.items[i];
      let comments = DSL.comment.getFrontComments(this.comments, item.tokenRange[0]);
      this.visitComments(comments, level + 1);
      this.emit('', level + 1);
      this.visitExpr(item, level + 1);
      if (i < ast.items.length - 1) {
        this.emit(',');
      }
      this.emit('\n');
    }
    if (item) {
      //find the last item's back comment
      let comments = DSL.comment.getBetweenComments(this.comments, item.tokenRange[0], ast.tokenRange[1]);
      this.visitComments(comments, level + 1);
    }
    this.emit(']', level);
  }

  visitYield(ast, level) {
    assert.equal(ast.type, 'yield');
    this.emit('yield ', level);
    if (!ast.expr) {
      this.emit(';\n');
      return;
    }

    if (ast.needCast) {
      this.visitType(ast.expectedType);
      this.emit('::fromMap(');
    }

    this.visitExpr(ast.expr, level);

    if (ast.needCast) {
      this.emit(')');
    }

    this.emit(';\n');
  }

  visitReturn(ast, level) {
    assert.equal(ast.type, 'return');
    this.emit('return ', level);
    if (!ast.expr) {
      this.emit('null;\n');
      return;
    }

    if (ast.needCast) {
      this.visitType(ast.expectedType);
      this.emit('::fromMap(');
    }

    this.visitExpr(ast.expr, level);

    if (ast.needCast) {
      this.emit(')');
    }

    this.emit(';\n');
  }

  visitRetry(ast, level) {
    assert.equal(ast.type, 'retry');
    const errorName = this.getRealModelName(UNRETRY_ERROR);
    this.emit(`throw ${errorName}($_lastRequest, $_lastException);\n`, level);
  }

  visitTry(ast, level) {
    assert.equal(ast.type, 'try');
    this.emit('try {\n', level);
    this.visitStmts(ast.tryBlock, level + 1);
    this.emit('}', level);
    if (ast.catchBlocks && ast.catchBlocks.length > 0) {
      ast.catchBlocks.forEach(catchBlock => {
        if (!catchBlock.id) {
          return;
        }
        if (!catchBlock.id.type) {
          const errorName = this.getRealModelName(ERROR);
          this.emit(` catch (${errorName} $${_name(catchBlock.id)}) {\n`);
        } else {
          this.emit(' catch (');
          this.visitType(catchBlock.id.type);
          this.emit(` $${_name(catchBlock.id)}) {\n`);
        }
        this.visitStmts(catchBlock.catchStmts, level + 1);
        this.emit('}', level);
      });
    } else if (ast.catchBlock && ast.catchBlock.stmts.length > 0) {
      const errorName = this.getRealModelName(ERROR);
      this.emit(` catch (${errorName} $${_name(ast.catchId)}) {\n`);
      this.visitStmts(ast.catchBlock, level + 1);
      this.emit('}', level);
    }
    if (ast.finallyBlock && ast.finallyBlock.stmts.length > 0) {
      this.emit(' finally {\n');
      this.visitStmts(ast.finallyBlock, level + 1);
      this.emit('}', level);
    }
    this.emit('\n', level);
  }

  visitWhile(ast, level) {
    assert.equal(ast.type, 'while');
    this.emit('\n');
    this.emit('while (', level);
    this.visitExpr(ast.condition, level + 1);
    this.emit(') {\n');
    this.visitStmts(ast.stmts, level + 1);
    this.emit('}\n', level);
  }

  visitFor(ast, level) {
    assert.equal(ast.type, 'for');
    this.emit('\n');
    this.emit('foreach(', level);
    this.visitExpr(ast.list, level + 1);
    this.emit(` as $${_name(ast.id)}`);
    this.emit(') {\n');
    this.visitStmts(ast.stmts, level + 1);
    this.emit('}\n', level);
  }

  visitIf(ast, level) {
    assert.equal(ast.type, 'if');
    this.emit('if (', level);
    this.visitExpr(ast.condition, level + 1);
    this.emit(') {\n');
    if(!ast.stmts.stmts.length) {
      this.emit('', level + 1);
      this.emit('\n');
    }
    this.visitStmts(ast.stmts, level + 1);
    this.emit('}', level);
    if (ast.elseIfs) {
      for (let i = 0; i < ast.elseIfs.length; i++) {
        const branch = ast.elseIfs[i];
        this.emit(' else if (');
        this.visitExpr(branch.condition, level + 1);
        this.emit(') {\n');
        if(!branch.stmts.stmts.length) {
          this.emit('', level + 1);
          this.emit('\n');
        }
        this.visitStmts(branch.stmts, level + 1);
        this.emit('}', level);
      }
      
    }

    if (ast.elseStmts) {
      this.emit(' else {\n');
      for (let i = 0; i < ast.elseStmts.stmts.length; i++) {
        this.visitStmt(ast.elseStmts.stmts[i], level + 1);
      }
      if (ast.elseStmts.stmts.length === 0) {
        const comments = DSL.comment.getBetweenComments(this.comments, ast.elseStmts.tokenRange[0], ast.elseStmts.tokenRange[1]);
        this.visitComments(comments, level + 1);
        this.emit('', level + 1);
        this.emit('\n');
      }
      this.emit('}', level);
    }

    this.emit('\n');
    this.emit('\n');
  }

  visitThrow(ast, level) {
    this.emit('throw ', level);
    if (ast.expr.type === 'construct_model') {
      this.visitConstructModel(ast.expr, level);
      this.emit(';\n');
    } else {
      const errorName = this.getRealModelName(ERROR);
      this.emit(`new ${errorName}(`);
      this.visitObject(ast.expr, level);
      this.emit(');\n');
    }
  }

  visitAssign(ast, level) {
    if (ast.left.type === 'property_assign' || ast.left.type === 'property') {
      this.emit('', level);
      this.visitPropertyAccess(ast.left);
    } else if (ast.left.type === 'virtualVariable') { // vid
      this.emit(`$this->${_vid(ast.left.vid)}`, level);
    } else if (ast.left.type === 'variable') {
      this.emit(`$${_name(ast.left.id)}`, level);
    } else if (ast.left.type === 'map_access') {
      this.visitMapAccess(ast.left, level);
    } else if (ast.left.type === 'array_access') {
      this.visitArrayAccess(ast.left, level);
    } else {
      throw new Error('unimpelemented');
    }

    this.emit(' = ');
    // if (ast.expr.needToReadable) {
    //   const streamName = this.getRealModelName(STREAM);
    //   this.emit(`new ${streamName}(`);
    // }
    this.visitExpr(ast.expr, level);
    // if (ast.expr.needToReadable) {
    //   this.emit(')');
    // }
    this.emit(';\n');
  }

  visitDeclare(ast, level) {
    var id = _name(ast.id);
    this.emit(`$${id}`, level);
    this.emit(' = ');
    this.visitExpr(ast.expr, level);
    this.emit(';\n');
  }

  visitStmts(ast, level) {
    assert.equal(ast.type, 'stmts');
    let node;
    for (var i = 0; i < ast.stmts.length; i++) {
      node = ast.stmts[i];
      this.visitStmt(node, level);
    }
    if (node) {
      //find the last node's back comment
      let comments = DSL.comment.getBackComments(this.comments, node.tokenRange[1]);
      this.visitComments(comments, level);
    }

    if (ast.stmts.length === 0) {
      //empty block's comment
      let comments = DSL.comment.getBetweenComments(this.comments, ast.tokenRange[0], ast.tokenRange[1]);
      this.visitComments(comments, level);
    }
  }

  visitReturnBody(ast, level) {
    assert.equal(ast.type, 'returnBody');
    this.emit('\n');
    this.visitStmts(ast.stmts, level);
  }

  visitDefaultReturnBody(level) {
    this.emit('\n');
    this.emit('return [];\n', level);
  }

  visitFunctionBody(ast, level) {
    assert.equal(ast.type, 'functionBody');
    this.visitStmts(ast.stmts, level);
  }

  isIterator(returnType) {
    if (returnType.type === 'iterator' || returnType.type === 'asyncIterator') {
      return true;
    }
    return false;
  }

  eachFunction(ast, level) {
    let comments = DSL.comment.getFrontComments(this.comments, ast.tokenRange[0]);
    this.visitComments(comments, level);
    this.visitAnnotation(ast.annotation, level, false);
    const functionName = _avoidKeywords(_name(ast.functionName));

    if(!ast.annotation || !ast.annotation.value) {
      this.emit('/**\n', level);
    }
    this.visitParamsType(ast.params, level);
    this.visitReturnType(ast, level);
    this.emit(' */', level);
    this.emit('\n');

    this.emit('', level);
    if (ast.isStatic) {
      this.emit('static ');
    }

    this.emit(`public function ${functionName}`);

    this.visitParams(ast.params, level);
    this.emit('\n');
    this.emit('{\n', level);
    if (ast.functionBody) {
      this.visitFunctionBody(ast.functionBody, level + 1);
    } else {
      this.used.push('use RuntimeException;');
      // interface mode
      this.emit('throw new RuntimeException(\'Un-implemented!\');\n', level + 1);
    }
    this.emit('}\n', level);
  }

  visitParamsType(ast, level) {
    for (var i = 0; i < ast.params.length; i++) {
      const node = ast.params[i];
      assert.equal(node.type, 'param');
      this.emit(' * @param ', level);
      this.visitType(node.paramType, level);
      this.emit(' ');
      const name = _name(node.paramName);
      this.emit(`$${_avoidKeywords(name)}\n`);
    }
  }

  visitReturnType(ast, level) {
    this.emit(' * @return ', level);
    this.visitType(ast.returnType, level);
    this.emit('\n');
  }

  eachAPI(ast, level, sse = false) {
    // if (ast.annotation) {
    //   this.emit(`${_anno(ast.annotation.value)}\n`, level);
    // }
    let comments = DSL.comment.getFrontComments(this.comments, ast.tokenRange[0]);
    this.visitComments(comments, level);
    this.visitAnnotation(ast.annotation, level, false);
    const apiName = _avoidKeywords(_name(ast.apiName));
    if(!ast.annotation || !ast.annotation.value) {
      this.emit('/**\n', level);
    }
    
    this.visitParamsType(ast.params, level);
    this.visitReturnType(ast, level);
    this.emit(' */', level);
    this.emit('\n');


    this.emit(`public function ${apiName}`, level);
    this.visitParams(ast.params, level);
    this.emit('\n');
    this.emit('{\n', level);
    let baseLevel = ast.runtimeBody ? level + 2 : level;
    // api level
    if (ast.runtimeBody) {
      this.visitRuntimeBefore(ast.runtimeBody, level + 1);
    }

    // temp level
    this.visitAPIBody(ast.apiBody, baseLevel + 1);



    if(sse && ast.runtimeBody) {
      this.emit('$_runtime[\'stream\'] = true;\n', baseLevel + 1);
    }
    this.emit('$_response = Dara::send($_request', baseLevel + 1);


    if (ast.runtimeBody) {
      this.emit(', $_runtime');
    }
    if(sse && !ast.runtimeBody) {
      this.emit(', [ \'stream\' => true, ]');
    }
    this.emit(');\n');

    if (ast.runtimeBody) {
      this.emit('$_lastRequest = $_request;\n', baseLevel + 1);
      this.emit('$_lastResponse = $_response;\n', baseLevel + 1);
    }

    if (ast.returns) {
      this.visitReturnBody(ast.returns, baseLevel + 1);
    } else {
      this.visitDefaultReturnBody(baseLevel + 1);
    }

    if (ast.runtimeBody) {
      this.visitRuntimeAfter(ast.runtimeBody, level + 1);
    }

    this.emit('}\n', level);
  }

  visitRuntimeAfter(ast, level) {
    const errorName = this.getRealModelName(ERROR);
    this.emit(`} catch (${errorName} $e) {\n`, level + 1);
    const retryContextName = this.getRealModelName(RETRY_CONTEXT);
    this.emit(`$_context = new ${retryContextName}([\n`, level + 2);
    this.emit('\'retriesAttempted\' => $_retriesAttempted,\n', level + 3);
    this.emit('\'lastRequest\' => $_lastRequest,\n', level + 3);
    this.emit('\'lastResponse\' => $_lastResponse,\n', level + 3);
    this.emit('\'exception\' => $e,\n', level + 3);
    this.emit(']);\n', level + 2);
    this.emit('continue;\n', level + 2);
    this.emit('}\n', level + 1);
    this.emit('}\n', level);
    this.emit('\n');
    const unretryErrorName = this.getRealModelName(UNRETRY_ERROR);
    this.emit(`throw new ${unretryErrorName}($_context);\n`, level);
  }

  importBefore(level) {
    if (this.config.editable !== true) {
      this.emit('// This file is auto-generated, don\'t edit it\n', level);
    }
  }

  apiBefore(main, filepath, level) {
    let clientName = this.config.clientName;
    if(!main) {
      const beginNotes = DSL.note.getNotes(this.notes, 0, this.ast.moduleBody.nodes[0].tokenRange[0]);
      const clientNote = beginNotes.find(note => note.note.lexeme === '@clientName');
      if(clientNote) {
        clientName = _string(clientNote.arg.value);
      } else {
        const fileInfo = path.parse(filepath);
        clientName = _upperFirst(fileInfo.name);
      }
    }

    this.emit(`class ${clientName}`, level);
    if (this.parentModule) {
      const moduleName = this.getRealClientName(this.parentModule.lexeme);
      this.emit(` extends ${moduleName}`);
    }
    this.emit(' {\n', level);
  }

  functionBefore() {
    this.emit('\n');
  }

  moduleAfter() {
    this.emit(`
}
`);
  }

}

module.exports = Visitor;
