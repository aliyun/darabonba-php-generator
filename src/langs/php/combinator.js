'use strict';

const assert = require('assert');
const debug = require('../../lib/debug');
const CombinatorBase = require('../common/combinator');
const Emitter = require('../../lib/emitter');
const PackageInfo = require('./package_info');
const path = require('path');
const fs = require('fs');

const {
  Symbol,
  Exceptions
} = require('../common/enum');

const {
  AnnotationItem,
  ConstructItem,
  FuncItem,
  PropItem,

  GrammerVar,
  GrammerCall,
  GrammerCatch,
  GrammerValue,
} = require('../common/items');

const {
  _name,
  _type,
  _symbol,
  _modify,
  _exception,
  _isKeywords,
  _avoidKeywords,
  _convertStaticParam
} = require('./helper');

const {
  _isBasicType,
  _upperFirst
} = require('../../lib/helper');

class Combinator extends CombinatorBase {
  constructor(config) {
    super(config);
    this.eol = ';';
    this.thirdPackageNamespace = {};
    this.thirdPackageModel = {};
    this.thirdPackageClient = {};
    this.classNameMap = {};
    this.classAlias = {};

    // Teafile: name (Tea Package name)
    if (this.config.modelDirName) {
      this.model_dir = this.config.modelDirName;
    } else {
      this.model_dir = this.config.model.dir;
    }
    if (this.config.packageInfo) {
      this.config.dir = path.join(this.config.outputDir, 'src/');
    }
    this.config.layer = this.config.layer.split('.').map(m => {
      return _avoidKeywords(m);
    }).join('.');
  }

  init(ast) {
    const imports = ast.imports;
    this.requirePackage = [];
    if (imports.length > 0) {
      const lockPath = path.join(this.config.pkgDir, '.libraries.json');
      const lock = JSON.parse(fs.readFileSync(lockPath, 'utf8'));
      let packageNameSet = [];
      let clientNameSet = [];
      ast.imports.forEach(item => {
        const aliasId = item.lexeme;
        const moduleDir = this.config.libraries[aliasId];
        const targetPath = path.join(this.config.pkgDir, lock[moduleDir]);
        const teaFilePath = path.join(targetPath, 'Teafile');
        const teaFile = JSON.parse(fs.readFileSync(teaFilePath));
        if (teaFile.php && teaFile.php.package && teaFile.php.clientName) {
          const packageName = teaFile.php.package;
          const clientName = teaFile.php.clientName ? teaFile.php.clientName : 'Client';
          const modelDir = teaFile.php.modelDirName ? teaFile.php.modelDirName : 'Models';
          // third package namespace
          if (packageNameSet.indexOf(packageName.toLowerCase()) < 0) {
            this.thirdPackageNamespace[aliasId] = packageName;
            packageNameSet.push(packageName.toLowerCase());
          } else {
            debug.stack('Duplication namespace');
          }
          // third package model client name
          if (clientNameSet.indexOf(clientName.toLowerCase()) > -1 ||
            clientName.toLowerCase() === this.config.clientName.toLowerCase()) {
            const alias = packageName.split('.').join('') + clientName.split('.').join('');
            this.classAlias[aliasId] = alias;
            this.thirdPackageClient[aliasId] = clientName;
          } else {
            this.thirdPackageClient[aliasId] = clientName;
            clientNameSet.push(clientName.toLowerCase());
          }
          // third package model dir name
          this.thirdPackageModel[aliasId] = modelDir;
        }
        if (teaFile.releases && teaFile.releases.php) {
          this.requirePackage.push(teaFile.releases.php);
        }
      });
    }
  }

  addInclude(className) {
    let realFullClassName = '';
    let last = '';
    if (className.indexOf('$') > -1) {
      realFullClassName = this.coreClass(className);
    } else if (this.thirdPackageNamespace[className]) {
      // is third package
      realFullClassName = `\\${this.thirdPackageNamespace[className].split('.').join('\\')}\\${this.thirdPackageClient[className]}`;
      if (this.classAlias[className]) {
        last = this.classAlias[className];
      }
    } else if (this.config.baseClient.indexOf(className) > -1) {
      realFullClassName = `\\${className.split('.').join('\\')}`;
    } else {
      debug.stack(className, this.thirdPackageNamespace);
    }

    // avoid keywords
    realFullClassName = realFullClassName.split('\\').map(m => {
      return _avoidKeywords(m);
    }).join('\\');

    if (!last) {
      let tmp = realFullClassName.split('\\');
      last = tmp[tmp.length - 1];
    }

    if (this.classNameMap[last]) {
      if (this.classNameMap[last] !== realFullClassName) {
        // return full class name if already have same name class
        return realFullClassName;
      }
      return last;
    }

    this.classNameMap[last] = realFullClassName;
    if (this.classAlias[className]) {
      // has alias
      this.includeList.push({ import: realFullClassName, alias: this.classAlias[className] });
    } else {
      this.includeList.push({ import: realFullClassName, alias: null });
    }

    return last;
  }

  addModelInclude(modelName, useFull = false) {
    let realFullClassName = '';
    let accessPath = modelName.split('.');
    if (modelName.indexOf('$') > -1) {
      realFullClassName = this.coreClass(modelName);
    } else if (accessPath.length > 1 && this.thirdPackageNamespace[accessPath[0]]) {
      // is third package model
      realFullClassName = `\\${this.thirdPackageNamespace[accessPath[0]].split('.').join('\\')}\\${this.thirdPackageModel[accessPath[0]]}\\${accessPath.slice(1).join('\\')}`;
    } else {
      // is not third package model
      realFullClassName = `\\${this.config.package.split('.').join('\\')}\\${this.model_dir}\\${accessPath.join('\\')}`;
    }

    // avoid keywords
    realFullClassName = realFullClassName.split('\\').map(m => {
      return _avoidKeywords(m);
    }).join('\\');

    if (useFull) {
      return realFullClassName;
    }

    let tmp = realFullClassName.split('\\');
    let last = tmp[tmp.length - 1];
    if (this.classNameMap[last]) {
      if (this.classNameMap[last] !== realFullClassName) {
        // return full class name if already have same name class
        return realFullClassName;
      }
      return last;
    }
    this.classNameMap[last] = realFullClassName;
    this.includeModelList.push({ import: realFullClassName, alias: null });
    return last;
  }

  combine(emitter, object) {
    if (object.name.indexOf('.') > -1) {
      // reset layer&filename if object is sub model
      let tmp = object.name.split('.');
      object.name = tmp[tmp.length - 1];
      tmp.splice(tmp.length - 1, 1);
      emitter.config.layer = emitter.config.layer + '.' + tmp.join('.');
      emitter.config.filename = object.name;
      this.config.layer = emitter.config.layer;
      this.config.filename = emitter.config.filename;
    }
    if (this.config.emitType === 'code' && this.config.packageInfo) {
      const packageInfo = new PackageInfo(this.config);
      packageInfo.emit(this.config.packageInfo, this.requirePackage);
    }
    emitter.config.layer = emitter.config.layer.split('.').map(m => {
      return _avoidKeywords(m);
    }).join('.');

    var parent = '';
    if (object.extends.length > 0) {
      let tmp = [];
      if (!(object.extends instanceof Array)) {
        object.extends = [object.extends];
      }
      object.extends.forEach(baseClass => {
        tmp.push(baseClass);
      });
      parent = 'extends ' + tmp.join(', ') + ' ';
    }

    emitter.emitln('<?php').emitln();
    if (object.topAnnotation.length > 0) {
      this.emitAnnotations(emitter, object.topAnnotation);
    }

    let appendNamespace = '';
    if (this.config.layer) {
      appendNamespace = '\\' + this.config.layer.split('.').map(m => {
        return _avoidKeywords(m);
      }).join('\\');
    }
    emitter.emitln(`namespace ${this.config.package.split('.').join('\\')}${appendNamespace};`).emitln();

    const globalEmitter = emitter;
    emitter = new Emitter();
    // this.emitInclude(emitter);

    // emit class
    let className = object.name;
    if (this.config.emitType === 'code') {
      if (this.config.clientName === undefined || this.config.clientName === '') {
        let tmp = this.config.package.split('.');
        this.config.clientName = tmp[tmp.length - 1];
      }
      className = this.config.clientName;
      emitter.config.filename = className;
    }
    if (object.annotations.length > 0) {
      this.emitAnnotations(emitter, object.annotations);
    }
    if (_isKeywords(className)) {
      emitter.config.filename = _avoidKeywords(className);
    }
    emitter.emitln(`class ${_avoidKeywords(className)} ${parent}{`, this.level);

    this.levelUp();
    const notes = this.resolveNotes(object.body);
    if (Object.keys(notes).length > 0) {
      this.emitNotes(emitter, notes);
    }

    if (this.config.emitType === 'model') {
      this.emitValidate(emitter, notes);
      let props = object.body.filter(node => node instanceof PropItem);
      this.emitToMap(emitter, props, notes);
      this.emitFromMap(emitter, object.name, props, notes);
    }

    // emit body nodes : PropItem | FuncItem | ConstructItem | AnnotationItem
    object.body.forEach(node => {
      if (node instanceof PropItem) {
        this.emitProp(emitter, node);
      } else if (node instanceof FuncItem) {
        this.emitFunc(emitter, node);
      } else if (node instanceof ConstructItem) {
        this.emitConstruct(emitter, node, parent);
      } else if (node instanceof AnnotationItem) {
        this.emitAnnotation(emitter, node);
      } else {
        debug.stack(node);
      }
    });

    this.levelDown();

    emitter.emitln('}', this.level);
    if (this.config.output === undefined || this.config.output === true) {
      this.emitInclude(globalEmitter);
      globalEmitter.emit(emitter.output);
      globalEmitter.save();
    }
  }

  emitValidate(emitter, notes) {
    let validateNoteKeys = [
      'required',
      'maximum',
      'minimum',
      'maxLength',
      'minLength',
      // 'format',
      // 'enum',
      'pattern',
      // 'maxItems'
    ];
    let noteKeys = Object.keys(notes).filter(key => {
      return validateNoteKeys.indexOf(key) > -1 && notes[key].length > 0;
    });
    if (noteKeys.length > 0) {
      emitter.emitln('public function validate() {', this.level);
      this.levelUp();
      noteKeys.forEach((key) => {
        notes[key].forEach(note => {
          let val = note.value;
          if (note.type === 'string') {
            val = `'${val}'`;
          }
          emitter.emitln(`Model::validate${_upperFirst(note.key)}('${note.prop}', $this->${note.prop}, ${val});`, this.level);
        });
      });
      this.levelDown();
      emitter.emitln('}', this.level);
    } else {
      emitter.emitln('public function validate() {}', this.level);
    }
  }

  emitToMap(emitter, props, notes) {
    let nameMap = {};
    if (notes['name']) {
      notes['name'].forEach(note => {
        if (note.prop !== note.value) {
          nameMap[note.prop] = note.value;
        }
      });
    }
    emitter.emitln('public function toMap() {', this.level);
    this.levelUp();
    emitter.emitln('$res = [];', this.level);
    props.forEach(prop => {
      let name = nameMap[prop.name] !== undefined ? nameMap[prop.name] : prop.name;
      emitter.emitln(`if (null !== $this->${prop.name}) {`, this.level);
      this.levelUp();
      if (_type(prop.type) === 'array' && prop.itemType !== '') {
        if (_type(prop.itemType) === 'map') {
          emitter.emitln(`$res['${name}'] = [];`, this.level);
          emitter.emitln(`if(null !== $this->${prop.name}){`, this.level);
          this.levelUp();
          emitter.emitln(`$res['${name}'] = $this->${prop.name};`, this.level);
          this.levelDown();
          emitter.emitln('}', this.level);
        } else if (!_isBasicType(prop.itemType)) {
          emitter.emitln(`$res['${name}'] = [];`, this.level);
          emitter.emitln(`if(null !== $this->${prop.name} && is_array($this->${prop.name})){`, this.level);
          this.levelUp();
          emitter.emitln('$n = 0;', this.level);
          emitter.emitln(`foreach($this->${prop.name} as $item){`, this.level);
          this.levelUp();
          emitter.emitln(`$res['${name}'][$n++] = null !== $item ? $item->toMap() : $item;`, this.level);
          this.levelDown();
          emitter.emitln('}', this.level);
          this.levelDown();
          emitter.emitln('}', this.level);
        } else {
          emitter.emitln(`$res['${name}'] = [];`, this.level);
          emitter.emitln(`if(null !== $this->${prop.name}){`, this.level);
          this.levelUp();
          emitter.emitln(`$res['${name}'] = $this->${prop.name};`, this.level);
          this.levelDown();
          emitter.emitln('}', this.level);
        }
      } else {
        if (!_isBasicType(prop.type)) {
          emitter.emitln(`$res['${name}'] = null !== $this->${prop.name} ? $this->${prop.name}->toMap() : null;`, this.level);
        } else {
          emitter.emitln(`$res['${name}'] = $this->${prop.name};`, this.level);
        }
      }
      this.levelDown();
      emitter.emitln('}', this.level);
    });
    emitter.emitln('return $res;', this.level);
    this.levelDown();
    emitter.emitln('}', this.level);
  }

  emitFromMap(emitter, modelName, props, notes) {
    let nameMap = {};
    if (notes['name']) {
      notes['name'].forEach(note => {
        if (note.prop !== note.value) {
          nameMap[note.prop] = note.value;
        }
      });
    }
    let annotation = new AnnotationItem(0, 'multi');
    annotation.content = [];
    annotation.content.push('@param array $map');
    annotation.content.push(`@return ${modelName}`);
    this.emitAnnotation(emitter, annotation);
    emitter.emitln('public static function fromMap($map = []) {', this.level);
    this.levelUp();
    emitter.emitln('$model = new self();', this.level);
    props.forEach(prop => {
      let name = nameMap[prop.name] !== undefined ? nameMap[prop.name] : prop.name;
      let mapVal = `$map['${name}']`;
      emitter.emitln(`if(isset(${mapVal})){`, this.level);
      this.levelUp();
      if (_type(prop.type) === 'array' && prop.itemType !== '') {
        emitter.emitln(`if(!empty(${mapVal})){`, this.level);
        this.levelUp();
        emitter.emitln(`$model->${prop.name} = [];`, this.level);
        let type = _type(prop.itemType);
        if (type === 'map') {
          emitter.emitln(`$model->${prop.name} = ${mapVal};`, this.level);
        } else if (!_isBasicType(prop.itemType)) {
          emitter.emitln('$n = 0;', this.level);
          emitter.emitln(`foreach(${mapVal} as $item) {`, this.level);
          this.levelUp();
          emitter.emitln(`$model->${prop.name}[$n++] = null !== $item ? ${type}::fromMap($item) : $item;`, this.level);
          this.levelDown();
          emitter.emitln('}', this.level);
        } else {
          emitter.emitln(`$model->${prop.name} = ${mapVal};`, this.level);
        }
        this.levelDown();
        emitter.emitln('}', this.level);
      } else {
        if (!_isBasicType(prop.type)) {
          const subModelName = _type(prop.type);
          emitter.emitln(`$model->${prop.name} = ${subModelName}::fromMap(${mapVal});`, this.level);
        } else {
          emitter.emitln(`$model->${prop.name} = ${mapVal};`, this.level);
        }
      }
      this.levelDown();
      emitter.emitln('}', this.level);
    });
    emitter.emitln('return $model;', this.level);
    this.levelDown();
    emitter.emitln('}', this.level);
  }

  emitNotes(emitter, notes) {
    let descNoteKeys = [
      'name',
      'default',
    ];
    Object.keys(notes).forEach((key) => {
      if (descNoteKeys.indexOf(key) > -1 && notes[key].length > 0) {
        emitter.emitln(`protected $_${key.split('-').join('')} = [`, this.level);
        this.levelUp();
        notes[key].forEach(note => {
          if (note.key === key) {
            let val = note.value;
            if (note.type === 'string') {
              val = `'${val}'`;
            }
            emitter.emitln(`'${note.prop}' => ${val},`, this.level);
          }
        });
        this.levelDown();
        emitter.emitln('];', this.level);
      }
    });
  }

  emitConstruct(emitter, construct, parent) {
    let constructParams = [];
    // let parentConstructParams = [];
    if (construct.annotations) {
      this.emitAnnotations(emitter, construct.annotations);
    }
    if (construct.params.length > 0) {
      construct.params.forEach(param => {
        let t = param.type ? param.type + ' ' : '';
        if (param.value !== null && param.value !== 'null') {
          constructParams.push(`${t}$${param.key} = ${param.value}`);
        } else {
          constructParams.push(`${t}$${param.key}`);
        }
        // parentConstructParams.push(`$${param.key}->toMap()`);
      });
      emitter.emit('public function __construct(', this.level);
      emitter.emit(constructParams.join(', '));
      emitter.emitln('){');
      this.levelUp();
      // if (parent !== '') {
      //   emitter.emitln(`parent::__construct(${parentConstructParams.join(', ')});`, this.level);
      // }

      construct.body.forEach(gram => {
        this.grammer(emitter, gram);
      });
      this.levelDown();
      emitter.emitln('}', this.level);
    } else if (construct.body.length > 0) {
      emitter.emitln('public function __construct(){', this.level);
      this.levelUp();
      construct.body.forEach(gram => {
        this.grammer(emitter, gram);
      });
      this.levelDown();
      emitter.emitln('}', this.level);
    }
  }

  emitAnnotation(emitter, annotation, level) {
    if (level === undefined) {
      level = this.level;
    }
    if (annotation.mode === 'single') {
      emitter.emitln(`// ${annotation.content}`, level);
    } else if (annotation.mode === 'multi') {
      emitter.emitln('/**', level);
      annotation.content.forEach(c => {
        emitter.emitln(` * ${c}`, level);
      });
      emitter.emitln(' */', level);
    } else {
      debug.stack('Unsupported annotation.mode :' + annotation.mode, annotation);
    }
  }

  emitFunc(emitter, func) {
    emitter.emitln();
    this.emitFuncComment(emitter, func);
    emitter.emit(`${_modify(func.modify)} function ${_avoidKeywords(func.name)}(`, this.level);
    if (func.params.length > 0) {
      let params = [];
      func.params.forEach(p => {
        let hadEmit = false;
        if (p.type) {
          if (!_isBasicType(p.type)) {
            params.push(`${p.type} $${p.key}`);
            hadEmit = true;
          }
        }
        if (hadEmit === false) {
          params.push(`$${p.key}`);
        }
      });
      emitter.emit(params.join(', '));
    }
    emitter.emitln('){');
    this.levelUp();
    func.body.forEach(gram => {
      this.grammer(emitter, gram);
    });
    this.levelDown();
    emitter.emitln('}', this.level);
  }

  emitFuncComment(emitter, func) {
    emitter.emitln('/**', this.level);
    const commentTag = ['@param', '@return', '@throws'];
    const paramDesc = {};
    let returnDesc = '';
    if (func.annotations.length > 0) {
      func.annotations.forEach(annotation => {
        if (annotation.mode === 'multi') {
          annotation.content.forEach(c => {
            let tagIndex = null;
            c.split(' ').forEach((item, index) => {
              if (commentTag.indexOf(item) > -1) {
                tagIndex = index;
              }
            });
            if (tagIndex !== null) {
              let tmp = c.split(' ');
              let paramName = '';
              if (tmp[tagIndex] === '@param') {
                paramName = tmp[tagIndex + 1];
                tmp = tmp.slice(tagIndex + 2);
                paramDesc[paramName] = tmp.join(' ');
              } else if (tmp[tagIndex] === '@return') {
                if (tmp[tagIndex + 2] !== undefined) {
                  returnDesc = tmp.slice(tagIndex + 2).join(' ');
                }
              }
            } else {
              emitter.emitln(` * ${c}`, this.level);
            }
          });
        } else {
          emitter.emitln(` * ${annotation.content}`, this.level);
        }
      });
    }
    func.params.forEach(p => {
      let t = _type(p.type);
      const desc = paramDesc[p.key] ? ' ' + paramDesc[p.key] : '';
      if (t === 'any') {
        t = 'mixed';
      }
      emitter.emitln(` * @param ${t} $${p.key}${desc}`, this.level);
    });
    if (func.return) {
      if (func.return.length > 0) {
        let t = '';
        if (func.return.length === 1) {
          t = _type(func.return[0].type);
        } else {
          let tmp = [];
          func.return.forEach(r => {
            tmp.push(r.type);
          });
          t = tmp.join('|');
        }
        if (t.indexOf('object') > -1) {
          t += '|array';
        }
        const desc = returnDesc ? ' ' + returnDesc : '';
        emitter.emitln(` * @return ${t}${desc}`, this.level);
      }

      emitter.emitln(' * @throws ' + _exception(_exception(Exceptions.base())), this.level);
    }
    emitter.emitln(' */', this.level);
  }

  emitProp(emitter, prop) {
    let annotationsNoteKeys = [
      'description',
      'example',
    ];

    if (prop.notes.length > 0) {
      let annotation = new AnnotationItem(prop.index, 'multi');
      annotation.content = [];
      prop.notes.forEach(note => {
        if (annotationsNoteKeys.indexOf(note.key) > -1) {
          annotation.content.push(`@${note.key} ${note.value}`);
        } else if (note.key === 'deprecated' && note.value === 'true') {
          annotation.content.push('@deprecated');
        }
      });
      annotation.content.push(`@var ${_type(prop.type)}`);
      this.emitAnnotation(emitter, annotation);
    }
    emitter.emitln(`${_modify(prop.modify)} $${_name(prop.name)};`, this.level).emitln();
  }

  emitInclude(emitter) {
    this.includeList.forEach(include => {
      const importClass = include.import.split('\\').filter(str => str.length > 0).join('\\');
      if (include.alias) {
        emitter.emitln(`use ${importClass} as ${include.alias};`);
      } else {
        emitter.emitln(`use ${importClass};`);
      }
    });
    if (this.includeList.length) {
      emitter.emitln();
    }
    this.includeModelList.forEach(include => {
      const importClass = include.import.split('\\').filter(str => str.length > 0).join('\\');
      if (include.alias) {
        emitter.emitln(`use ${importClass} as ${include.alias};`);
      } else {
        emitter.emitln(`use ${importClass};`);
      }
    });
    if (this.includeModelList.length) {
      emitter.emitln();
    }
  }

  grammerCall(emitter, gram) {
    // path : 'parent', 'object', 'object_static', 'call', 'call_static', 'prop', 'prop_static', 'map', 'list'
    var pre = '';
    let params = '';
    if (gram.params.length > 0) {
      let tmp = [];
      gram.params.forEach(p => {
        let emit = new Emitter();
        this.grammer(emit, p, false, false);
        tmp.push(emit.output);
      });
      params = tmp.join(', ');
    }
    if (gram.type === 'super') {
      pre = `parent::__construct(${params})`;
    } else {
      gram.path.forEach((path, i) => {
        let pathName = path.name.replace('@', '_');
        if (path.type === 'parent') {
          if (gram.path[i + 1] && gram.path[i + 1].type.indexOf('static') > -1) {
            pre += 'self';
            if (path.name) {
              pre += '::' + pathName;
            }
          } else {
            pre += '$this';
            if (path.name) {
              pre += '->' + pathName;
            }
          }
        } else if (path.type === 'object') {
          pre += `$${_convertStaticParam(pathName)}`;
        } else if (path.type === 'object_static') {
          pre += `${_convertStaticParam(pathName)}`;
        } else if (path.type === 'call') {
          pre += `->${_avoidKeywords(pathName)}(${params})`;
        } else if (path.type === 'call_static') {
          pre += `::${_avoidKeywords(pathName)}(${params})`;
        } else if (path.type === 'prop') {
          pre += `->${pathName}`;
        } else if (path.type === 'prop_static') {
          pre += `::${pathName}`;
        } else if (path.type === 'map') {
          pre += `["${pathName}"]`;
        } else if (path.type === 'list') {
          pre += `[${pathName}]`;
        } else {
          debug.stack(gram);
        }
      });
    }

    if (pre[0] === '-' || pre[0] === ':') {
      pre = pre.slice(2);
    }
    emitter.emit(pre);
  }

  grammerExpr(emitter, gram) {
    if (!gram.left && !gram.right) {
      emitter.emit(` ${_symbol(gram.opt)} `);
      return;
    }
    this.grammer(emitter, gram.left, false, false);
    emitter.emit(` ${_symbol(gram.opt)} `);
    this.grammer(emitter, gram.right, false, false);
  }

  grammerVar(emitter, gram) {
    if (gram.varType === 'static_class') {
      const name = gram.name ? gram.name : gram.key;
      emitter.emit(`${_convertStaticParam(name)}::class`);
    } else if (gram.varType === 'var' || gram.varType === 'const') {
      const name = gram.name ? gram.name : gram.key;
      emitter.emit(`$${_convertStaticParam(name)}`);
    } else {
      debug.stack(gram);
    }
  }

  grammerValue(emitter, gram, layer = 1) {
    if (gram.key) {
      emitter.emit(`"${gram.key}" => `);
    }
    if (gram instanceof GrammerCall) {
      this.grammerCall(emitter, gram);
    } else if (gram.type === 'array' || gram.type === 'model_construct_params') {
      if (gram.needCast) {
        if (gram.value.length > 0) {
          emitter.emit(`${this.addInclude('$Core')}::${this.config.tea.core.merge}(`);
          let expandParams = gram.value.filter((item) => {
            return item.isExpand !== true;
          });
          let notExpandParams = gram.value.filter((item) => {
            return item.isExpand === true;
          });
          if (expandParams.length > 0) {
            emitter.emitln('[');
            for (let i = 0; i < expandParams.length; i++) {
              emitter.emit('', this.level + layer);
              let v = expandParams[i];
              if (v instanceof AnnotationItem) {
                this.emitAnnotation(emitter, v, 0);
                continue;
              }
              this.grammerValue(emitter, v, layer + 1);
              if (i < expandParams.length - 1) {
                emitter.emitln(',');
              } else {
                emitter.emitln('');
              }
            }
            emitter.emit(']', this.level + layer);
          }
          if (notExpandParams.length > 0) {
            if (expandParams.length > 0) {
              emitter.emit(', ');
            }
            for (let i = 0; i < notExpandParams.length; i++) {
              let v = notExpandParams[i];
              if (v instanceof AnnotationItem) {
                this.emitAnnotation(emitter, v, 0);
                continue;
              }
              this.grammerValue(emitter, v, layer + 1);
              if (i < notExpandParams.length - 1) {
                emitter.emitln(',');
                emitter.emit('', this.level + layer);
              }
            }
          }
          emitter.emit(')');
        } else {
          emitter.emit('[]');
        }
      } else {
        if (gram.value.length > 0) {
          emitter.emitln('[');
          let len = gram.value.length;
          let i = 0;
          for (i = 0; i < gram.value.length; i++) {
            let item = gram.value[i];
            emitter.emit('', this.level + layer);
            if (item instanceof AnnotationItem) {
              this.emitAnnotation(emitter, item, 0);
              continue;
            }
            this.grammerValue(emitter, item, layer + 1);
            if (i < len - 1) {
              emitter.emitln(',');
            } else {
              emitter.emitln('');
            }
          }
          emitter.emit(']', this.level + layer);
        } else {
          emitter.emit('[]');
        }
      }
    } else if (gram.type === 'string') {
      emitter.emit(`"${gram.value}"`);
    } else if (gram.type === 'param') {
      emitter.emit(`$${_convertStaticParam(gram.value)}`);
    } else if (gram.type === 'call') {
      this.grammerCall(emitter, gram.value);
    } else if (gram.type === 'number') {
      emitter.emit(gram.value);
    } else if (gram.type === 'null') {
      emitter.emit('null');
    } else if (gram.type === 'behavior') {
      this.grammer(emitter, gram.value);
    } else if (gram.type === 'expr') {
      if (Array.isArray(gram.value)) {
        gram.value.forEach(gramItem => {
          this.grammer(emitter, gramItem, false, false);
        });
      } else {
        this.grammer(emitter, gram.value, false, false);
      }
    } else if (gram.type === 'instance') {
      this.grammerNewObject(emitter, gram.value);
    } else if (gram.type === 'bool' || gram.type === 'boolean') {
      emitter.emit(gram.value ? 'true' : 'false');
    } else if (gram.type === 'var') {
      this.grammerVar(emitter, gram.value);
    } else if (gram.type === 'class') {
      emitter.emit(`${gram.value.name}::class`);
    } else if (gram.type === 'not') {
      emitter.emit(_symbol(Symbol.reverse()));
      this.grammerValue(emitter, gram.value);
    } else if (gram.type === '') {
      if (gram.varType) {
        this.grammerVar(emitter, gram);
      } else {
        debug.stack('Unsupported GrammerValue type', gram);
      }
    } else if (Array.isArray(gram)) {
      let grammerValue = new GrammerValue();
      grammerValue.type = 'array';
      grammerValue.value = gram;
      this.grammerValue(emitter, grammerValue);
    } else {
      debug.stack('Unsupported GrammerValue type', gram);
    }
  }

  grammerLoop(emitter, gram) {
    if (gram.type === 'foreach') {
      emitter.emit('foreach(');
      this.grammerVar(emitter, gram.item, false, false);
      emitter.emit(' as ');
      this.grammer(emitter, gram.source, false, false);
      emitter.emitln('){');
    }
    this.levelUp();
    gram.body.forEach(node => {
      this.grammer(emitter, node);
    });
    this.levelDown();
    emitter.emitln('}', this.level);
  }

  grammerBreak(emitter, gram) {
    emitter.emit('break');
  }

  grammerCondition(emitter, gram) {
    if (gram.type === 'elseif') {
      emitter.emit('else if');
    } else {
      emitter.emit(`${gram.type}`);
    }

    if (gram.type !== 'else') {
      emitter.emit(' (');
      let emit = new Emitter();
      gram.conditionBody.forEach(condition => {
        this.grammer(emitter, condition, false, false);
      });
      emitter.emit(`${emit.output})`);
    }

    emitter.emitln(' {');
    this.levelUp();
    gram.body.forEach(node => {
      this.grammer(emitter, node);
    });
    this.levelDown();
    emitter.emitln('}', this.level);
    if (gram.elseItem.length && gram.elseItem.length > 0) {
      gram.elseItem.forEach(e => {
        this.grammer(emitter, e);
      });
    }
  }

  grammerReturn(emitter, gram) {
    emitter.emit('return ');

    if (gram.type === 'null') {
      this.grammerValue(emitter, new GrammerValue('null'));
    } else if (gram.type === 'grammer') {
      this.grammer(emitter, gram.expr, false, false);
    } else if (gram.type === 'string') {
      emitter.emit('\'\'');
    } else {
      this.grammer(emitter, gram.expr, false, false);
    }
  }

  grammerContinue(emitter, gram) {
    emitter.emit('continue');
  }

  grammerThrows(emitter, gram) {
    if (gram.exception === null) {
      emitter.emit('throw ');
      this.grammerValue(emitter, gram.params[0]);
    } else {
      if (gram.params.length > 0) {
        emitter.emit(`throw new ${_exception(gram.exception)}(`);
        if (gram.params.length === 1) {
          this.grammerValue(emitter, gram.params[0]);
        } else {
          let tmp = [];
          gram.params.forEach(p => {
            let emit = new Emitter();
            this.grammerValue(emit, p);
            tmp.push(emit.output);
          });
          emitter.emit(tmp.join(', '));
        }
        emitter.emit(')');
      } else {
        let msg = gram.message ? `'${gram.message}'` : '';
        emitter.emit(`throw new ${_exception(gram.exception)}(${msg})`);
      }
    }
  }

  grammerTryCatch(emitter, gram) {
    emitter.emitln('try {');
    this.levelUp();
    gram.body.forEach(node => {
      this.grammer(emitter, node);
    });
    this.levelDown();
    emitter.emitln('}', this.level);
    gram.catchBody.forEach(node => {
      assert.equal(true, node instanceof GrammerCatch);
      this.grammerCatch(emitter, node);
    });

    if (gram.finallyBody) {
      this.grammerFinally(emitter, gram.finallyBody);
    }
  }

  grammerFinally(emitter, gram) {
    emitter.emitln('finally {', this.level);
    this.levelUp();
    gram.body.forEach(childGram => {
      this.grammer(emitter, childGram);
    });
    this.levelDown();
    emitter.emitln('}', this.level);
  }

  grammerCatch(emitter, gram) {
    emitter.emit(`catch (${_exception(gram.exceptions.type)} `, this.level);
    this.grammerVar(emitter, gram.exceptions.exceptionVar);
    emitter.emitln(') {');
    this.levelUp();
    gram.body.forEach(childGram => {
      this.grammer(emitter, childGram);
    });
    this.levelDown();
    emitter.emitln('}', this.level);
  }

  grammerNewObject(emitter, gram) {
    let objectName = '';
    objectName = gram.name;
    emitter.emit(`new ${objectName}(`);
    if (!Array.isArray(gram.params)) {
      this.grammerValue(emitter, gram.params);
    } else {
      if (gram.params.length > 0) {
        let params = [];
        gram.params.forEach(p => {
          let emit = new Emitter();
          if (p.key) {
            emit.emit(`$${p.key}`);
            emit.emit(' = ');
          }
          if (typeof (p.value) === 'string') {
            if (p.value) {
              emit.emit(`${p.value}`);
            } else if (p.key) {
              emit.emit('\'\'');
            }
          } else {
            this.grammerValue(emit, p.value, false, false);
          }
          params.push(emit.output);
        });
        emitter.emit(params.join(', '));
      }
    }
    emitter.emit(')');
  }

  behaviorTimeNow(emitter, behavior) {
    emitter.emit('time()');
  }

  behaviorSetMapItem(emitter, behavior) {
    let emit = new Emitter();
    this.grammerCall(emit, behavior.call);
    emitter.emit(`${emit.output}["${behavior.key}"] = `, this.level);
    this.grammerValue(emitter, behavior.value);
    emitter.emitln(';');
  }

  behaviorDoAction(emitter, behavior) {
    emitter.emit('', this.level);
    this.grammerVar(emitter, behavior.var);
    emitter.emit(`= ${this.addInclude('$Core')}::${this.config.tea.core.doAction}(`);
    let params = [];
    behavior.params.forEach(p => {
      let emit = new Emitter();
      this.grammerValue(emit, p);
      params.push(emit.output);
    });
    emitter.emit(params.join(', '));
    emitter.emitln(');');
    behavior.body.forEach(node => {
      this.grammer(emitter, node);
    });
  }

  behaviorRetry(emitter, behavior) {
    emitter.emitln(`throw new ${this.addInclude('$Exception')}($${this.config.request}, $${this.config.response});`, this.level);
  }

  behaviorToModel(emitter, behavior) {
    emitter.emit(`${behavior.expected}::fromMap(`);
    this.grammer(emitter, behavior.grammer, false, false);
    emitter.emit(')');
  }

  behaviorToMap(emitter, behavior) {
    const grammer = behavior.grammer;
    if (grammer instanceof GrammerCall) {
      this.grammerCall(emitter, grammer);
    } else if (grammer instanceof GrammerVar) {
      this.grammerVar(emitter, grammer);
    } else {
      debug.stack(grammer);
    }
  }

  grammerSymbol(emitter, gram) {
    emitter.emit(_symbol(gram));
  }
}

module.exports = Combinator;