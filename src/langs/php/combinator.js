'use strict';

const assert = require('assert');
const debug = require('../../lib/debug');
const CombinatorBase = require('../common/combinator');
const Emitter = require('../../lib/emitter');
const PackageInfo = require('./package_info');
const modules = require('./modules');

const {
  Symbol,
  Modify
} = require('../common/enum');

const {
  BehaviorToMap,

  AnnotationItem,
  ConstructItem,
  ObjectItem,
  FuncItem,
  PropItem,

  // GrammerVar,
  Grammer,
  GrammerCall,
  GrammerCatch,
  GrammerValue,
  TypeStream,
  TypeObject,

  TypeGeneric,
  TypeDecimal,
  TypeInteger,
  TypeString,
  TypeNumber,
  TypeArray,
  TypeBytes,
  TypeBool,
  TypeItem,
  TypeVoid,
  TypeNull,
  TypeBase,
  TypeMap,
} = require('../common/items');

const {
  _symbol,
  _modify,
  _deepClone,
  _upperFirst,
  _isKeywords,
  _avoidKeywords,
  _resolveGrammerCall
} = require('../../lib/helper');

function _name(str) {
  if (str.indexOf('-') > -1) {
    let tmp = str.split('-');
    tmp.map((s, i) => {
      if (i !== 0) {
        return s;
      }
      return s;
    });
    str = tmp.join('');
  }
  return str;
}

class Combinator extends CombinatorBase {
  constructor(config, dependencies) {
    super(config, dependencies);
    this.eol = ';';
    this.classNameMap = {};
  }

  addInclude(className) {
    let realFullClassName = '';
    let last = '';
    const dependencies = this.dependencies;
    if (className.indexOf('$') > -1) {
      realFullClassName = this.coreClass(className);
    } else if (dependencies[className]) {
      const package_name = dependencies[className].package_name;
      const client_name = dependencies[className].client_name;
      // is third package
      realFullClassName = `\\${package_name.split('.').join('\\')}\\${client_name}`;
      if (dependencies[className].client_alias) {
        last = dependencies[className].client_alias.split('->').join('');
      }
    } else if (this.config.baseClient && this.config.baseClient === className) {
      realFullClassName = `\\${className.split('.').join('\\')}`;
    } else {
      debug.stack(`Class Name Error : ${className}`, dependencies);
    }

    // avoid keywords
    realFullClassName = realFullClassName.split('\\').map(m => {
      return _avoidKeywords(m);
    }).join('\\');

    if (!last) {
      let tmp = realFullClassName.split('\\');
      last = tmp[tmp.length - 1];
    }
    let lower = last.toLowerCase();
    if (this.classNameMap[lower]) {
      if (this.classNameMap[lower] !== realFullClassName) {
        // return full class name if already have same name class
        return realFullClassName;
      }
      return last;
    }

    this.classNameMap[lower] = realFullClassName;
    if (this.dependencies[className]) {
      // has alias
      this.includeList.push({ import: realFullClassName, alias: this.dependencies[className].client_alias });
    } else {
      this.includeList.push({ import: realFullClassName, alias: null });
    }

    return last;
  }

  addModelInclude(modelName, useFull = false) {
    let realFullClassName = '';
    let accessPath = modelName.split('.');
    const dependencies = this.dependencies;
    if (modelName.indexOf('$') > -1) {
      realFullClassName = this.coreClass(modelName);
    } else if (accessPath.length > 1 && dependencies[accessPath[0]]) {
      const info = dependencies[accessPath[0]];
      // is third package model
      realFullClassName = `\\${info.package_name.split('.').join('\\')}\\${info.model_dir}\\${accessPath.slice(1).join('\\')}`;
    } else {
      // is not third package model
      realFullClassName = `\\${this.config.package.split('.').join('\\')}\\${this.config.model.dir}\\${accessPath.join('\\')}`;
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
    let lower = last.toLowerCase();
    if (this.classNameMap[lower]) {
      if (this.classNameMap[lower] !== realFullClassName) {
        // return full class name if already have same name class
        return realFullClassName;
      }
      return last;
    }
    this.classNameMap[lower] = realFullClassName;
    this.includeModelList.push({ import: realFullClassName, alias: null });
    return last;
  }

  combine(objectArr = []) {
    if (this.config.packageInfo) {
      const packageInfo = new PackageInfo(this.config, this.dependencies);
      packageInfo.emit();
    }

    const [clientObjectItem] = objectArr.filter(obj => obj.type === 'client');
    this.combineOject(clientObjectItem);

    const models = objectArr.filter(obj => obj.type === 'model');
    if (models.length > 0) {
      const self = this;
      models.forEach(modelObjectItem => {
        self.combineOject(modelObjectItem);
        if (modelObjectItem.subObject && modelObjectItem.subObject.length > 0) {
          modelObjectItem.subObject.forEach(subModelObjectItem => {
            self.combineOject(subModelObjectItem);
          });
        }
      });
    }

    if (this.config.withTest) {
      const object = new ObjectItem('test');
      object.name = `Tests.${clientObjectItem.name}Test`;
      object.extends = ['TestCase'];
      object.includeList = [{ import: 'PHPUnit\\Framework\\TestCase', alias: null }];
      clientObjectItem.body.forEach(node => {
        if (node instanceof FuncItem) {
          const func = new FuncItem();
          func.name = `test${_upperFirst(node.name)}`;
          func.modify.push(Modify.public());
          object.addBodyNode(func);
        }
      });
      const outputParts = this.combineOject(object, false);
      const config = _deepClone(this.config);
      config.filename = `${clientObjectItem.name}Test`;
      config.dir = `${config.dir}/tests/`;
      config.layer = '';
      this.combineOutputParts(config, outputParts);
    }
  }

  combineOject(object, output = true) {
    let layer = '';
    if (object.type === 'model') {
      layer = this.config.model.dir;
    }
    this.includeList = object.includeList;
    this.includeModelList = object.includeModelList;
    this.classNameMap = {};

    let emitter, outputParts = { head: '', body: '', foot: '' };

    /******************************** emit body ********************************/
    emitter = new Emitter(this.config);
    if (object.name.indexOf('.') > -1) {
      // reset layer&filename if object is sub model
      let tmp = object.name.split('.');
      object.name = tmp[tmp.length - 1];
      tmp.splice(tmp.length - 1, 1);
      layer = layer ? layer + '.' + tmp.join('.') : tmp.join('.');
    }
    const currClassName = this.emitClass(emitter, object);
    outputParts.body = emitter.output;

    /******************************** emit head ********************************/
    emitter = new Emitter(this.config);
    emitter.emitln('<?php').emitln();
    if (object.topAnnotation.length > 0) {
      this.emitAnnotations(emitter, object.topAnnotation);
    }

    let appendNamespace = '';
    if (layer) {
      appendNamespace = '\\' + layer.split('.').map(m => {
        return _avoidKeywords(m);
      }).join('\\');
    }
    emitter.emitln(`namespace ${this.config.package.split('.').join('\\')}${appendNamespace};`).emitln();
    this.emitInclude(emitter);
    outputParts.head = emitter.output;

    /***************************** combine output ******************************/
    if (output) {
      const config = _deepClone(this.config);
      config.filename = _avoidKeywords(object.name);
      config.layer = layer.split('.').map(m => {
        return _avoidKeywords(m);
      }).join('.');
      if (config.packageInfo) {
        config.dir = config.outputDir + '/src/';
      }
      if (object.type === 'client' && config.exec) {
        emitter = new Emitter(this.config);
        emitter.emitln('$path = __DIR__ . \\DIRECTORY_SEPARATOR . \'..\' . \\DIRECTORY_SEPARATOR . \'vendor\' . \\DIRECTORY_SEPARATOR . \'autoload.php\';', this.level);
        emitter.emitln('if (file_exists($path)) {', this.level);
        this.levelUp();
        emitter.emitln('require_once $path;', this.level);
        this.levelDown();
        emitter.emitln('}', this.level);
        emitter.emitln(`${currClassName}::main(array_slice($argv, 1));`, this.level);
        outputParts.foot = emitter.output;
      }
      this.combineOutputParts(config, outputParts);
    }
    return outputParts;
  }

  emitType(type, onComment = false) {
    if (!(type instanceof TypeItem)) {
      debug.stack('Inavalid type', type);
    }
    if (type instanceof TypeString) {
      return 'string';
    } else if (type instanceof TypeBytes || type instanceof TypeArray || type instanceof TypeMap) {
      if (onComment) {
        if (type instanceof TypeBytes) {
          return 'int[]';
        } else if (type instanceof TypeMap) {
          let subType = this.emitType(type.valType, onComment);
          return `${subType}[]`;
        }
        let itemType = this.emitType(type.itemType, onComment);
        return `${itemType}[]`;
      }
      return 'array';
    } else if (type instanceof TypeObject) {
      return this.resolveName(type.objectName);
    } else if (type instanceof TypeStream) {
      return this.addInclude('$Stream');
    } else if (type instanceof TypeGeneric) {
      if (onComment) {
        return 'mixed';
      }
      return 'any';
    } else if (type instanceof TypeDecimal) {
      return 'float';
    } else if (type instanceof TypeInteger) {
      return 'int';
    } else if (type instanceof TypeNumber) {
      return 'int';
    } else if (type instanceof TypeBool) {
      return 'bool';
    } else if (type instanceof TypeVoid) {
      return 'void';
    } else if (type instanceof TypeNull) {
      return 'null';
    }
    debug.stack(type);
  }

  emitClass(emitter, object) {
    var parent = '';
    if (object.extends.length > 0) {
      let tmp = [];
      if (!(object.extends instanceof Array)) {
        object.extends = [object.extends];
      }
      object.extends.forEach(baseClass => {
        tmp.push(this.resolveName(baseClass));
      });
      parent = 'extends ' + tmp.join(', ') + ' ';
    }
    let className = object.name;
    if (object.type === 'client') {
      className = this.config.client.name;
      this.config.filename = className;
    }
    className = _avoidKeywords(className);
    if (object.annotations.length > 0) {
      this.emitAnnotations(emitter, object.annotations);
    }
    if (_isKeywords(className)) {
      this.config.filename = className;
    }
    this.classNameMap[className.toLowerCase()] = className;
    emitter.emitln(`class ${className} ${parent}{`, this.level);
    this.levelUp();
    const notes = this.resolveNotes(object.body);
    if (Object.keys(notes).length > 0) {
      this.emitNotes(emitter, notes);
    }

    if (object.type === 'model') {
      this.emitValidate(emitter, notes);
      let props = object.body.filter(node => node instanceof PropItem);
      this.emitToMap(emitter, props, notes);
      this.emitFromMap(emitter, className, props, notes);
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
    return className;
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
      let name = typeof nameMap[prop.name] !== 'undefined' ? nameMap[prop.name] : prop.name;
      emitter.emitln(`if (null !== $this->${prop.name}) {`, this.level);
      this.levelUp();
      if (prop.type instanceof TypeArray && !(prop.type instanceof TypeBytes)) {
        if (prop.type.itemType instanceof TypeBase) {
          emitter.emitln(`$res['${name}'] = $this->${prop.name};`, this.level);
        } else {
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
        }
      } else if (prop.type instanceof TypeMap) {
        if (prop.type.valType instanceof TypeBase) {
          emitter.emitln(`$res['${name}'] = $this->${prop.name};`, this.level);
        } else {
          emitter.emitln(`$res['${name}'] = [];`, this.level);
          emitter.emitln(`if(null !== $this->${prop.name} && is_array($this->${prop.name})){`, this.level);
          this.levelUp();
          emitter.emitln(`foreach($this->${prop.name} as $key => $val){`, this.level);
          this.levelUp();
          emitter.emitln(`$res['${name}'][$key] = null !== $val ? $val->toMap() : $val;`, this.level);
          this.levelDown();
          emitter.emitln('}', this.level);
          this.levelDown();
          emitter.emitln('}', this.level);
        }
      } else if (prop.type instanceof TypeBase || prop.type instanceof TypeBytes || prop.type instanceof TypeStream) {
        emitter.emitln(`$res['${name}'] = $this->${prop.name};`, this.level);
      } else {
        emitter.emitln(`$res['${name}'] = null !== $this->${prop.name} ? $this->${prop.name}->toMap() : null;`, this.level);
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
      let name = typeof nameMap[prop.name] !== 'undefined' ? nameMap[prop.name] : prop.name;
      let mapVal = `$map['${name}']`;
      emitter.emitln(`if(isset(${mapVal})){`, this.level);
      this.levelUp();
      if (prop.type instanceof TypeArray && !(prop.type instanceof TypeBytes)) {
        emitter.emitln(`if(!empty(${mapVal})){`, this.level);
        this.levelUp();
        if (prop.type.itemType instanceof TypeBase) {
          emitter.emitln(`$model->${prop.name} = ${mapVal};`, this.level);
        } else if (prop.type.itemType instanceof TypeObject) {
          emitter.emitln(`$model->${prop.name} = [];`, this.level);
          emitter.emitln('$n = 0;', this.level);
          emitter.emitln(`foreach(${mapVal} as $item) {`, this.level);
          this.levelUp();
          emitter.emitln(`$model->${prop.name}[$n++] = null !== $item ? ${this.resolveName(prop.type.itemType.objectName)}::fromMap($item) : $item;`, this.level);
          this.levelDown();
          emitter.emitln('}', this.level);
        } else {
          debug.stack('Unsupported', prop.type);
        }
        this.levelDown();
        emitter.emitln('}', this.level);
      } else if (prop.type instanceof TypeObject) {
        emitter.emitln(`$model->${prop.name} = ${this.resolveName(prop.type.objectName)}::fromMap(${mapVal});`, this.level);
      } else {
        emitter.emitln(`$model->${prop.name} = ${mapVal};`, this.level);
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
        if (param.value !== null && param.value !== 'null') {
          constructParams.push(`$${param.key} = ${param.value}`);
        } else {
          constructParams.push(`$${param.key}`);
        }
      });
      emitter.emit('public function __construct(', this.level);
      emitter.emit(constructParams.join(', '));
      emitter.emitln('){');
      this.levelUp();

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
    if (typeof level === 'undefined') {
      level = this.level;
    }
    if (annotation.mode === 'single') {
      emitter.emitln(`// ${annotation.content}`, level);
    } else if (annotation.mode === 'multi') {
      emitter.emitln('/**', level);
      annotation.content.forEach(c => {
        emitter.emitln(` * ${c.split('*/').join('*\\/')}`, level);
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
        params.push(`$${p.key}`);
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
                if (typeof tmp[tagIndex + 1] !== 'undefined') {
                  returnDesc = tmp.slice(tagIndex + 1).join(' ');
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
      let t = this.emitType(p.type, true);
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
          t = this.emitType(func.return[0]);
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
      if (func.throws.length) {
        func.throws.forEach(exception => {
          emitter.emitln(' * @throws ' + this.emitType(exception), this.level);
        });
      }
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
      annotation.content.push(`@var ${this.emitType(prop.type, true)}`);
      this.emitAnnotation(emitter, annotation);
    }
    emitter.emitln(`${_modify(prop.modify)} $${_name(prop.name)};`, this.level).emitln();
  }

  emitInclude(emitter) {
    let emitSet = [];
    this.includeList.forEach(include => {
      let importClass;
      if (include.import === this.config.tea.exception.name) {
        importClass = include.import;
      } else {
        importClass = include.import.split('\\').filter(str => str.length > 0).join('\\');
      }
      let emitContent = include.alias ? `use ${importClass} as ${include.alias.split('->').join('')};` : `use ${importClass};`;
      if (emitSet.indexOf(emitContent) === -1) {
        emitter.emitln(emitContent);
        emitSet.push(emitContent);
      }
    });
    if (this.includeList.length) {
      emitter.emitln();
    }
    this.includeModelList.forEach(include => {
      const importClass = include.import.split('\\').filter(str => str.length > 0).join('\\');
      let emitContent = include.alias ? `use ${importClass} as ${include.alias};` : `use ${importClass};`;
      if (emitSet.indexOf(emitContent) === -1) {
        emitter.emitln(emitContent);
        emitSet.push(emitContent);
      }
    });
    if (this.includeModelList.length) {
      emitter.emitln();
    }
  }

  grammerCall(emitter, gram) {
    if (gram.type === 'sys_func' || gram.type === 'method') {
      const resolve_method = _resolveGrammerCall(gram, this.dependencies);
      if (resolve_method !== null) {
        if (!modules[resolve_method]) {
          debug.stack(`Unsupported method : ${resolve_method}`);
        }
        modules[resolve_method].call(this, emitter, gram);
        return;
      }
    }
    // path : 'parent', 'object', 'object_static', 'call', 'call_static', 'prop', 'prop_static', 'map', 'list'
    var pre = '';
    let params = '';
    if (gram.params.length > 0) {
      let tmp = [];
      gram.params.forEach(p => {
        let emit = new Emitter();
        if (p.value instanceof BehaviorToMap && gram.type === 'sys_func' && gram.path[1].name === 'isUnset') {
          this.grammer(emit, p.value.grammer, false, false);
        } else {
          this.grammer(emit, p, false, false);
        }
        tmp.push(emit.output);
      });
      params = tmp.join(', ');
    }
    let last_path;
    if (gram.type === 'super') {
      pre = `parent::__construct(${params})`;
    } else {
      gram.path.forEach((path, i) => {
        let pathName = this.resolveName(path.name);
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
          if (path.name.indexOf('@') === 0 && pre === '') {
            pre += `$this->${pathName}`;
          } else {
            pre += `$${pathName}`;
          }
        } else if (path.type === 'object_static') {
          pre += `${pathName}`;
        } else if (path.type === 'call') {
          pre += `->${pathName}(${params})`;
        } else if (path.type === 'call_static') {
          pre += `::${pathName}(${params})`;
        } else if (path.type === 'prop') {
          pre += `->${pathName}`;
        } else if (path.type === 'prop_static') {
          pre += `::${pathName}`;
        } else if (path.type === 'map') {
          if (path.isVar) {
            pre += `[$${pathName}]`;
          } else if (path.name instanceof Grammer) {
            pre += `[${pathName}]`;
          } else {
            pre += `["${pathName}"]`;
          }
        } else if (path.type === 'list') {
          if (path.isVar) {
            pre += `[$${pathName}]`;
          } else if (path.name instanceof Grammer) {
            pre += `[${pathName}]`;
          } else {
            pre += `[${pathName}]`;
          }
        } else {
          debug.stack(gram);
        }
        last_path = path;
      });
    }

    if (pre[0] === '-' || pre[0] === ':') {
      pre = pre.slice(2);
    }
    if (last_path && (last_path.type === 'map' || last_path.type === 'list')) {
      pre = '@' + pre;
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
      emitter.emit(`${this.resolveName(name)}::class`);
    } else if (gram.varType === 'var' || gram.varType === 'const') {
      const name = gram.name ? gram.name : gram.key;
      emitter.emit(`$${this.resolveName(name, false)}`);
    } else {
      debug.stack(gram);
    }
  }

  grammerValue(emitter, gram) {
    if (gram instanceof AnnotationItem) {
      this.emitAnnotation(emitter, gram);
      return;
    }
    const emitMap = function (emitter, values) {
      if (values.length > 0) {
        emitter.emitln('[', this.levevl);
        this.levelUp();
        values.forEach((item, i) => {
          if (item instanceof AnnotationItem) {
            this.grammer(emitter, item);
            return;
          }
          emitter.emit(`"${item.key}" => `, this.level);
          this.grammerValue(emitter, item, false, false);
          if (i < values.length - 1) {
            emitter.emitln(',');
          } else {
            emitter.emitln();
          }
        });
        this.levelDown();
        emitter.emit(']', this.level);
      } else {
        emitter.emit('[]');
      }
    };
    if (gram.type === 'map' || gram.type === 'model_construct_params') {
      if (gram.needCast) {
        let expandParams = gram.value.filter((item) => {
          return item.isExpand !== true;
        });
        let notExpandParams = gram.value.filter((item) => {
          return item.isExpand === true;
        });
        emitter.emit(`${this.addInclude('$Core')}::${this.config.tea.core.merge}(`);
        if (expandParams.length) {
          emitMap.call(this, emitter, expandParams);
          emitter.emit(', ');
        }
        for (let i = 0; i < notExpandParams.length; i++) {
          let v = notExpandParams[i];
          if (v instanceof AnnotationItem) {
            this.emitAnnotation(emitter, v, 0);
            continue;
          }
          this.levelUp();
          this.grammerValue(emitter, v);
          this.levelDown();
          if (i < notExpandParams.length - 1) {
            emitter.emit(', ');
          }
        }
        emitter.emit(')');
      } else {
        emitMap.call(this, emitter, gram.value);
      }
    } else if (gram.type === 'string') {
      let str = gram.value.split('\\"').map(str => str.split('"').join('\\"')).join('\\"');
      emitter.emit(`"${str.split('$').join('\\$')}"`);
    } else if (gram.type === 'null') {
      emitter.emit('null');
    } else if (gram.type === 'behavior' || gram.type === 'call'
      || gram.type === 'var' || gram.type === 'instance') {
      this.grammer(emitter, gram.value, false, false);
    } else if (gram.type === 'number' || gram.type === 'bool') {
      emitter.emit(gram.value);
    } else if (gram.type === 'param') {
      emitter.emit(`$${gram.value}`);
    } else if (gram.type === 'expr') {
      if (Array.isArray(gram.value)) {
        gram.value.forEach(gramItem => {
          this.grammer(emitter, gramItem, false, false);
        });
      } else {
        this.grammer(emitter, gram.value, false, false);
      }
    } else if (gram.type === 'array') {
      if (gram.value.length) {
        emitter.emitln('[', this.levevl);
        this.levelUp();
        gram.value.forEach((item, i) => {
          if (item instanceof AnnotationItem) {
            this.grammer(emitter, item);
            return;
          }
          emitter.emit('', this.level);
          this.grammerValue(emitter, item, false, false);
          if (i < gram.value.length - 1) {
            emitter.emitln(',');
          } else {
            emitter.emitln();
          }
        });
        this.levelDown();
        emitter.emit(']', this.level);
      } else {
        emitter.emit('[]');
      }
    } else if (gram.type === 'not') {
      emitter.emit(_symbol(Symbol.reverse()));
      this.grammerValue(emitter, gram.value);
    } else {
      debug.stack('Unsupported GrammerValue type', gram);
    }
  }

  grammerLoop(emitter, gram) {
    if (gram.type === 'foreach') {
      emitter.emit('foreach(');
      this.grammer(emitter, gram.source, false, false);
      emitter.emit(' as ');
      this.grammerVar(emitter, gram.item, false, false);
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
      let emit = new Emitter(this.config);
      gram.conditionBody.forEach(condition => {
        this.grammer(emitter, condition, false, false);
      });
      emitter.emit(`${emit.output})`);
    }

    if (gram.body.length) {
      emitter.emitln(' {');
      this.levelUp();
      gram.body.forEach(node => {
        this.grammer(emitter, node);
      });
      this.levelDown();
      emitter.emitln('}', this.level);
    } else {
      emitter.emitln(' {}');
    }
   
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
        emitter.emit(`throw new ${this.emitType(gram.exception)}(`);
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
        emitter.emit(`throw new ${this.emitType(gram.exception)}(${msg})`);
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
    let emitterVar = new Emitter();
    this.grammerVar(emitterVar, gram.exceptions.exceptionVar);
    let varName = emitterVar.output;
    emitter.emit(`catch (${this.emitType(gram.exceptions.type)} `, this.level);
    emitter.emit(varName);
    emitter.emitln(') {');
    this.levelUp();
    emitter.emitln(`if (!(${varName} instanceof ${this.addInclude('$Error')})) {`, this.level);
    this.levelUp();
    emitter.emitln(`${varName} = new ${this.addInclude('$Error')}([], ${varName}->getMessage(), ${varName}->getCode(), ${varName});`, this.level);
    this.levelDown();
    emitter.emitln('}', this.level);
    gram.body.forEach(childGram => {
      this.grammer(emitter, childGram);
    });
    this.levelDown();
    emitter.emitln('}', this.level);
  }

  grammerNewObject(emitter, gram) {
    let objectName = '';
    objectName = gram.name;
    emitter.emit(`new ${this.resolveName(objectName)}(`);
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
            this.grammerVar(emit, p.value, false, false);
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
    emitter.emitln(`throw new ${this.addInclude('$Error')}($${this.config.request}, $${this.config.response});`, this.level);
  }

  behaviorToModel(emitter, behavior) {
    emitter.emit(`${behavior.expected}::fromMap(`);
    this.grammer(emitter, behavior.grammer, false, false);
    emitter.emit(')');
  }

  behaviorToMap(emitter, behavior) {
    const grammer = behavior.grammer;
    const grammerCall = new GrammerCall('sys_func', [
      { type: 'object_static', name: this.addInclude('$Core') },
      { type: 'call_static', name: 'merge' }
    ], [grammer]);
    this.grammer(emitter, grammerCall, false, false);
  }

  grammerSymbol(emitter, gram) {
    emitter.emit(_symbol(gram));
  }

  behaviorTamplateString(emitter, behavior) {
    let tmp = [];
    behavior.items.forEach(item => {
      let emit = new Emitter(this.config);
      if (item.dataType instanceof TypeString) {
        this.grammer(emit, item, false, false);
      } else {
        emit.emit('(string) (');
        this.grammer(emit, item, false, false);
        emit.emit(')');
      }
      tmp.push(emit.output);
    });
    emitter.emit(tmp.join(' . '));
  }
}

module.exports = Combinator;
