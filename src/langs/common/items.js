'use strict';

const assert = require('assert');
const debug = require('../../lib/debug');

class Counter {
  constructor(start = -1) {
    this.index = start;
  }
  once() {
    this.index++;
    return this.index;
  }
  step(step = 1, length = 1) {
    this.index = this.index + step * length;
    return this.index;
  }
}
const count = new Counter();
const ItemSet = {};

class Item {
  constructor() {
    this.index = count.once();
    ItemSet[this.index] = this;
    this.belong = 0;
  }

  getItemByIndex(index) {
    if (ItemSet[index]) {
      return ItemSet[index];
    }
    debug.stack(`Index [${index}] not exist in ItemSet`);
  }

  setBelongTo(gram, belong) {
    if (gram instanceof Item) {
      gram.belong = belong;
    }
  }

  getParent() {
    return this.getItemByIndex(this.belong);
  }
}

class AnnotationItem extends Item {
  constructor(belong, mode = 'single', content = null) {
    super();
    this.belong = belong;
    this.mode = mode;       // single | multi
    this.content = content;
  }
}

class Grammer extends Item {
  constructor(eol = null, newLine = null) {
    super();
    this.eol = eol;
    this.newLine = newLine;
  }
}

class GrammerValue extends Grammer {
  constructor(type, value, key = '', needCast = false) {
    super();
    this.type = type;    // map | array | string | number | call | null | behavior | param | expr | merge | var | class
    this.key = key;
    this.value = value;
    this.needCast = needCast;
    this.keyType = '';
    this.itemType = '';
    this.isExpand = false;
  }
}

class GrammerNewObject extends Grammer {
  constructor(objectName, params = [], type = 'var') {
    super();
    this.name = objectName;
    this.params = params;
    this.type = type;  // var | map
  }

  addParam(param) {
    this.params.push(param);
  }
}

class GrammerVar extends Grammer {
  constructor(name = '', dataType = '', varType = 'var', itemType = '') {
    super();
    this.name = name;
    this.type = dataType;      // Types Enum
    this.varType = varType;    // static_class 静态类名 || var 可变 || const 不可变
    this.itemType = itemType;
    this.eol = false;
  }
}

class GrammerExpr extends Grammer {
  constructor(left = null, opt = '', right = '') {
    super();
    this.left = left;    // GrammerVar
    this.opt = opt;
    this.right = right;
    this.setBelongTo(left, this.index);
    this.setBelongTo(right, this.index);
  }
}

class GrammerCall extends Grammer {
  constructor(type = 'method', path = [], params = [], returnType = null, hasThrow = false) {
    super();
    this.type = type;     // method | key | index | prop | sys_func | super
    this.path = [];
    path.forEach(p => {
      this.addPath(p);
    });
    this.params = params;
    this.returnType = returnType;
    this.hasThrow = hasThrow;
  }

  addPath(path) {
    // {type: '', name: ''}
    const pathType = [
      'parent', 'object', 'object_static', 'call', 'call_static', 'prop', 'prop_static', 'map', 'list'
    ];
    if (pathType.indexOf(path.type) < 0) {
      throw new Error(
        `${path.type} path.type should be parent|object|object_static|call|call_static|prop|prop_static|map|list`
      );
    }
    this.path.push(path);
    return this;
  }

  addParams(param) {
    this.params.push(param);
    return this;
  }
}

class GrammerCondition extends Grammer {
  constructor(type = '', conditionBody = [], body = []) {
    super();
    this.type = type;                    // like 'if' | elseif | else | 'while' | 'doWhile'
    this.body = body;                    // Grammer
    this.conditionBody = conditionBody;  // GrammerExpr | GrammerValue | GrammerCall
    this.elseItem = [];
    this.eol = false;
  }

  addElse(elseItem) {
    assert.equal(true, elseItem instanceof GrammerCondition);
    this.elseItem.push(elseItem);
  }

  addBodyNode(node) {
    assert.equal(true, node instanceof Grammer || node instanceof AnnotationItem);
    this.body.push(node);
    return this;
  }

  addCondition(condition) {
    assert.equal(true,
      condition instanceof GrammerExpr ||
      condition instanceof GrammerValue ||
      condition instanceof GrammerCall
    );
    this.conditionBody.push(condition);
  }
}

class GrammerException extends Grammer {
  constructor(type = '', exceptionVar = null) {
    super();
    this.type = type;
    this.exceptionVar = exceptionVar; // GrammerVar
  }
}

class GrammerCatch extends Grammer {
  constructor(body = [], exceptions = null) {
    super();
    this.exceptions = exceptions;  // GrammerException
    this.body = body; // Grammer
  }

  addBodyNode(node) {
    this.body.push(node);
  }
}

class GrammerFinally extends Grammer {
  constructor(body = []) {
    super();
    this.body = body; // Grammer
  }

  addBodyNode(node) {
    this.body.push(node);
  }
}

class GrammerTryCatch extends Grammer {
  constructor(body = [], catchGramList = [], finallyGram = null) {
    super();
    this.body = body;                // Grammer
    this.catchBody = catchGramList;  // GrammerCatch
    this.finallyBody = finallyGram;  // GrammerFinally
    this.eol = false;
  }

  addBodyNode(node) {
    assert.equal(true, node instanceof Grammer || node instanceof AnnotationItem);
    this.body.push(node);
  }

  addCatch(node) {
    assert.equal(true, node instanceof GrammerCatch);
    this.catchBody.push(node);
  }

  setFinally(node) {
    assert.equal(true, node instanceof GrammerFinally);
    this.finallyBody = node;
  }
}

class GrammerThrows extends Grammer {
  constructor(exception = null, params = [], msg = '') {
    super();
    this.exception = exception;  // ExceptionEnum
    this.params = params;        // GrammerValue
    this.message = msg;
  }

  addParam(param) {
    assert.equal(true, param instanceof GrammerValue);
    this.params.push(param);
  }
}

class GrammerReturnType extends Grammer {
  constructor(type = '', isOptional = false, keyType = null, itemType = null) {
    super();
    this.type = type;
    this.optional = isOptional;
    this.keyType = keyType;
    this.itemType = itemType;
  }
}

class GrammerReturn extends Grammer {
  constructor(expr = '', type = '') {
    super();
    this.type = type; // null | grammer
    this.expr = expr;
  }
}

class GrammerLoop extends Grammer {
  constructor(type = '') {
    super();
    this.type = type;      // foreach | forCondition
    this.item = null;      // GrammerVar
    this.source = null;    // GrammerCall | GrammerValue
    this.start = null;     // GrammerExpr
    this.contions = [];
    this.step = null;      // GrammerExpr
    this.body = [];
    this.eol = false;
  }

  addBodyNode(node) {
    assert.equal(true, node instanceof Grammer);
    this.body.push(node);
  }
}

class GrammerContinue extends Grammer {
  constructor(belong) {
    super();
    this.belong = belong; // counter index
  }
}

class GrammerBreak extends Grammer {
  constructor(belong) {
    super();
    this.belong = belong; // counter index
  }
}

class GrammerNewLine extends Grammer {
  constructor(number = 1) {
    super();
    this.number = number;
  }
}

class GrammerSymbol extends Grammer {
  constructor(symbol) {
    super();
    this.symbol = symbol;
    this.eol = false;
    this.newLine = false;
  }
}

class PropItem extends Item {
  constructor() {
    super();
    this.modify = [];       // Modify
    this.name = '';
    this.type = '';
    this.itemType = '';
    this.value = null;
    this.notes = [];        // [{key:'name', value:'test', type:'string'}, {key:'length', value:10, type:'number'}]
  }

  addModify(modify) {
    this.modify.push(modify);
    return this;
  }

  addNote(note) {
    this.notes.push(note);
    return this;
  }
}

class NoteItem extends Item {
  constructor(key, value) {
    super();
    const typeMap = ['number', 'string', 'boolean'];
    let type = typeof value;
    if (value === null || value === 'null') {
      type = 'null';
    } else if (typeMap.indexOf(type) === -1) {
      throw new Error(`Not suppoted type : ${type}  [${typeMap.toString()}]`);
    }
    this.key = key;
    this.value = value;
    this.type = type;
  }
}

class FuncItem extends Item {
  constructor() {
    super();
    this.name = '';
    this.modify = [];      // Modify
    this.params = [];      // param
    this.throws = [];      // Exception name
    this.return = [];      // GrammerReturn
    this.annotations = []; // AnnotationItem
    this.body = [];        // grammer
  }

  addBodyNode(node) {
    assert.equal(true, node instanceof Grammer);
    this.body.push(node);
    return this;
  }

  addAnnotation(node) {
    assert.equal(true, node instanceof AnnotationItem);
    this.annotations.push(node);
  }
}

class ConstructItem extends Item {
  constructor(params = [], body = [], annotations = []) {
    super();
    this.params = params;
    this.body = body;
    this.annotations = annotations;
  }

  addParamNode(node) {
    assert.equal(true, node instanceof Grammer);
    this.params.push(node);
  }

  addBodyNode(node) {
    assert.equal(true, node instanceof Grammer);
    this.body.push(node);
  }

  addAnnotation(node) {
    assert.equal(true, node instanceof AnnotationItem);
    this.annotations.push(node);
  }
}

class ObjectItem extends Item {
  constructor() {
    super();
    this.modify = [];            // Modify
    this.name = '';              // object name
    this.extends = [];           // object extends
    this.body = [];              // PropItem | FuncItem | ConstructItem ...
    this.annotations = [];       // AnnotationItem
    this.topAnnotation = [];     // AnnotationItem
    this.subObject = [];         // ObjectItem
  }

  addBodyNode(node) {
    if (!(node instanceof PropItem || node instanceof FuncItem || node instanceof ObjectItem || node instanceof AnnotationItem || node instanceof ConstructItem)) {
      throw new Error('Only suppoted PropItem | FuncItem | ObjectItem | AnnotationItem | ConstructItem');
    }
    this.body.push(node);
  }

  addModify(modify) {
    this.modify.push(modify);
    return this;
  }

  addExtends(extend) {
    this.extends.push(extend);
    return this;
  }
}

class Behavior extends Grammer {
  constructor() {
    super();
    this.name = '';
    this.eol = false;
    this.newLine = false;
  }
}

class BehaviorTimeNow extends Behavior {
  constructor() {
    super();
    this.name = 'behaviorTimeNow';
  }
}

class BehaviorSetMapItem extends Behavior {
  constructor(call = null, key = '', value = null) {
    super();
    this.name = 'behaviorSetMapItem';
    assert.equal(true, call instanceof GrammerCall);
    this.call = call;
    this.key = key;
    this.value = value;
  }
}

class BehaviorDoAction extends Behavior {
  constructor(responseVar = null, params = [], callbackBody = []) {
    super();
    this.name = 'behaviorDoAction';
    this.var = responseVar;
    this.params = params;
    this.body = callbackBody;
  }
  addBodyNode(node) {
    this.body.push(node);
  }
}

class BehaviorRetry extends Behavior {
  constructor() {
    super();
    this.name = 'behaviorRetry';
  }
}

class BehaviorToModel extends Behavior {
  constructor(grammer, expected) {
    super();
    this.name = 'behaviorToModel';
    this.grammer = grammer;
    this.expected = expected;
  }
}

class BehaviorToMap extends Behavior {
  constructor(grammer, inferred) {
    super();
    this.name = 'behaviorToMap';
    this.grammer = grammer;
    this.inferred = inferred;
  }
}

module.exports = {
  Counter,

  AnnotationItem,
  ConstructItem,
  ObjectItem,
  FuncItem,
  PropItem,
  NoteItem,

  Grammer,
  GrammerVar,
  GrammerCall,
  GrammerExpr,
  GrammerLoop,
  GrammerBreak,
  GrammerCatch,
  GrammerValue,
  GrammerSymbol,
  GrammerReturn,
  GrammerThrows,
  GrammerNewLine,
  GrammerFinally,
  GrammerContinue,
  GrammerTryCatch,
  GrammerNewObject,
  GrammerCondition,
  GrammerException,
  GrammerReturnType,

  Behavior,
  BehaviorToMap,
  BehaviorRetry,
  BehaviorTimeNow,
  BehaviorToModel,
  BehaviorDoAction,
  BehaviorSetMapItem
};
