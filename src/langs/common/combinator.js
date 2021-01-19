'use strict';

const debug = require('../../lib/debug');
const Emitter = require('../../lib/emitter');

const {
  Grammer,
  GrammerThrows,

  Behavior,
  PropItem,
  AnnotationItem,
  ObjectItem,
} = require('./items');

const {
  _name,
  _config,
  _upperFirst,
  _lowerFirst,
} = require('../../lib/helper.js');

class BaseCombinator {
  constructor(config = {}, imports = {}) {
    this.level = 0;
    this.eol = '';

    this.includeList = [];
    this.includeModelList = [];
    this.includeSet = [];

    this.config = config;
    this.imports = imports;

    this.libraries = imports.libraries;
    this.requirePackage = imports.requirePackage;
    this.thirdPackageDaraMeta = imports.thirdPackageDaraMeta;
    this.thirdPackageScope = imports.thirdPackageScope;
    this.thirdPackageNamespace = imports.thirdPackageNamespace;
    this.thirdPackageClient = imports.thirdPackageClient;
    this.thirdPackageClientAlias = imports.thirdPackageClientAlias;
    this.thirdPackageModel = imports.thirdPackageModel;

    _config(this.config);
  }

  combine(objects = []) {
    if (objects.some(Object => !(Object instanceof ObjectItem))) {
      throw new Error('Only supported ObjectItem.');
    }
  }

  combineOutputParts(config, outputParts) {
    const globalEmitter = new Emitter(config);
    globalEmitter.emit(outputParts.head);
    globalEmitter.emit(outputParts.body);
    globalEmitter.emit(outputParts.foot);
    globalEmitter.save();
  }

  coreClass(objName) {
    const key = _lowerFirst(objName.split('$').join(''));
    if (this.config.tea[key]) {
      return this.config.tea[key].name;
    }
    debug.stack('Unsupported core class name : ' + objName);
  }

  resolveNotes(nodes) {
    let notes = {};
    nodes.filter(node => node instanceof PropItem).map(prop => {
      if (prop.notes.length > 0) {
        prop.notes.forEach(note => {
          note.belong = prop.index;
          note.prop = prop.name;
          if (typeof notes[note.key] === 'undefined') {
            notes[note.key] = [];
          }
          notes[note.key].push(note);
        });
      }
    });
    return notes;
  }

  resolveName(path_name, avoidKeyword = true) {
    if (path_name instanceof Grammer) {
      let emit = new Emitter(this.config);
      this.grammer(emit, path_name, false, false);
      path_name = emit.output;
    } else {
      path_name = `${path_name}`;
      if (path_name.indexOf('^') === 0) {
        path_name = this.addInclude(path_name.substr(1));
      } else if (path_name.indexOf('#') === 0) {
        path_name = this.addModelInclude(path_name.substr(1));
      } else if (path_name.indexOf('$') === 0) {
        path_name = this.addInclude(path_name);
      }
    }
    return _name(path_name, avoidKeyword);
  }

  emitAnnotations(emitter, annotations) {
    annotations.forEach(annotation => {
      this.emitAnnotation(emitter, annotation);
    });
  }

  findThrows(grammer, set = []) {
    if (grammer.body) {
      grammer.body.filter(node => {
        if (node instanceof GrammerThrows) {
          set.push(node);
        } else if (node.body) {
          this.findThrows(node, set);
        }
      });
    }
    return set;
  }

  init(ast) {
    throw new Error('unimpelemented');
  }

  levelUp() {
    this.level++;
    return this.level;
  }

  levelDown() {
    this.level--;
    return this.level;
  }

  addModelInclude(modelName) {
    throw new Error('unimpelemented');
  }

  addInclude(include) {
    throw new Error('unimpelemented');
  }

  systemfunc(emitter, gram) {
    let tmp = [];
    gram.path.forEach(path => {
      tmp.push(_upperFirst(path.name));
    });
    if (tmp.length === 0) {
      debug.stack('Invalid path. path list cannot be empty.');
    }
    let systemFunc = 'sys' + tmp.join('');
    if (this[systemFunc]) {
      this[systemFunc].apply(this, [emitter, gram]);
    } else {
      debug.stack(`unimpelemented ${systemFunc}(emitter, gram){} method\n`, gram);
    }
  }

  grammer(emit, gram, eol = true, newLine = true) {
    if (gram instanceof AnnotationItem) {
      this.emitAnnotation(emit, gram);
      return;
    }

    let emitter = new Emitter(this.config);
    let method = null;
    if (gram instanceof Behavior) {
      method = gram.name;
    } else if (gram instanceof Grammer) {
      method = _lowerFirst(gram.constructor.name);
    } else {
      debug.stack('Unsupported', gram);
    }
    if (typeof this[method] !== 'undefined') {
      this[method].call(this, emitter, gram);
    } else {
      debug.stack('Unimpelemented : ' + method);
    }
    if (gram.eol !== null) {
      eol = gram.eol;
    }
    if (gram.newLine !== null) {
      newLine = gram.newLine;
    }
    if (newLine) {
      emit.emit('', this.level);
    }
    emit.emit(emitter.output);
    if (eol) {
      emit.emitln(this.eol);
    }
    emitter = null;
  }

  grammerNewLine(emitter, gram) {
    let number = gram.number;
    while (number > 0) {
      emitter.emitln();
      number--;
    }
  }

  emitGrammerValue(gram) {
    let emitter = new Emitter(this.config);
    this.grammerValue(emitter, gram);
    return emitter.output;
  }
}

module.exports = BaseCombinator;
