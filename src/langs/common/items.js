'use strict';

const assert = require('assert');
const { debug } = require('@axiosleo/cli-tool');

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

class TypeItem extends Item {
  constructor() {
    super();
    this.isOptional = false;
  }
}

class TypeBase extends TypeItem { }

class TypeVoid extends TypeBase { }

class TypeNull extends TypeBase { }

class TypeGeneric extends TypeBase { }

class TypeString extends TypeBase {
  constructor() { super(); }
}

class TypeNumber extends TypeBase {
  constructor() {
    super();
    // TypeNumber contains TypeInteger/TypeDecimal
  }
}

class TypeInteger extends TypeNumber {
  constructor(length = 16, unsigned = false) {
    super();
    // int/uint long/ulong integer
    this.length = length;
    this.unsigned = unsigned;
  }
}

class TypeDecimal extends TypeNumber {
  constructor(precision = 8) {
    super();
    // float  : precision = 4
    // double : precision = 8
    this.precision = precision;
  }
}

class TypeBool extends TypeBase { }

class TypeTree extends TypeBase { }

class TypeArray extends TypeTree {
  constructor(itemType = null) {
    super();
    assert.strictEqual(true, itemType instanceof TypeItem);
    this.itemType = itemType; // TypeItem
  }
}

class TypeBytes extends TypeTree {
  constructor() {
    super(new TypeInteger(8, true));
    // bytes = uint8[]
  }
}

class TypeMap extends TypeTree {
  constructor(keyType, valType) {
    super();
    assert.strictEqual(true, keyType instanceof TypeItem);
    assert.strictEqual(true, valType instanceof TypeItem);
    this.keyType = keyType;
    this.valType = valType;
  }
}

class TypeObject extends TypeItem {
  constructor(objectName = null) {
    super();
    this.objectName = objectName;
  }
}

class TypeStream extends TypeBase {
  constructor(writable = null) {
    super();
    this.writable = writable;
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
    if (key instanceof TypeItem) {
      this.dataType = key;
    } else {
      this.key = key;
      this.dataType = null;  // TypeItem
    }
    this.type = type;        // map | array | string | number | call | null | behavior | param | expr | merge | var | class
    this.value = value;
    this.needCast = needCast;
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
  constructor(name = '', dataType = '', varType = 'var') {
    super();
    this.name = name;
    this.type = dataType;      // TypeItem
    this.varType = varType;    // static_class 静态类名 || var 可变 || const 不可变
    this.eol = false;
    assert.strictEqual(true, this.type instanceof TypeItem);
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
    if (returnType === null) {
      returnType = new TypeVoid();
    }
    this.returnType = returnType;  // TypeItem
    this.hasThrow = hasThrow;
    assert.strictEqual(true, this.returnType instanceof TypeItem);
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
    assert.strictEqual(true, elseItem instanceof GrammerCondition);
    this.elseItem.push(elseItem);
  }

  addBodyNode(node) {
    assert.strictEqual(true, node instanceof Grammer || node instanceof AnnotationItem);
    this.body.push(node);
    return this;
  }

  addCondition(condition) {
    assert.strictEqual(true,
      condition instanceof GrammerExpr ||
      condition instanceof GrammerValue ||
      condition instanceof GrammerCall
    );
    this.conditionBody.push(condition);
  }
}

class GrammerException extends Grammer {
  constructor(type, exceptionVar = null) {
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
    assert.strictEqual(true, node instanceof Grammer || node instanceof AnnotationItem);
    this.body.push(node);
  }

  addCatch(node) {
    assert.strictEqual(true, node instanceof GrammerCatch);
    this.catchBody.push(node);
  }

  setFinally(node) {
    assert.strictEqual(true, node instanceof GrammerFinally);
    this.finallyBody = node;
  }
}

class GrammerThrows extends Grammer {
  constructor(exceptionType = null, params = [], msg = '') {
    super();
    if (exceptionType !== null) {
      assert.strictEqual(true, exceptionType instanceof TypeObject);
    }
    this.exception = exceptionType;  // TypeObject
    this.params = params;        // GrammerValue
    this.message = msg;
  }

  addParam(param) {
    assert.strictEqual(true, param instanceof GrammerValue);
    this.params.push(param);
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
    assert.strictEqual(true, node instanceof Grammer);
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
    this.type = '';         // TypeItem
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
    assert.strictEqual(true, node instanceof Grammer);
    this.body.push(node);
    return this;
  }

  addAnnotation(node) {
    assert.strictEqual(true, node instanceof AnnotationItem);
    this.annotations.push(node);
  }
}

class ConstructItem extends Item {
  constructor(params = [], body = [], annotations = []) {
    super();
    this.params = params;
    this.body = body;
    this.annotations = annotations;
    this.throws = [];
  }

  addParamNode(node) {
    assert.strictEqual(true, node instanceof Grammer);
    this.params.push(node);
  }

  addBodyNode(node) {
    assert.strictEqual(true, node instanceof Grammer);
    this.body.push(node);
  }

  addAnnotation(node) {
    assert.strictEqual(true, node instanceof AnnotationItem);
    this.annotations.push(node);
  }
}

class ObjectItem extends Item {
  constructor(type) {
    super();
    assert.strictEqual(true, type === 'client' || type === 'model' || type === 'test');
    this.type = type;            // client | model
    this.modify = [];            // Modify
    this.name = '';              // object name
    this.extends = [];           // object extends
    this.body = [];              // PropItem | FuncItem | ConstructItem ...
    this.annotations = [];       // AnnotationItem
    this.topAnnotation = [];     // AnnotationItem
    this.subObject = [];         // ObjectItem
    this.includeList = [];
    this.includeModelList = [];
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
    assert.strictEqual(true, call instanceof GrammerCall);
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

class BehaviorTamplateString extends Behavior {
  constructor(items = []) {
    super();
    this.name = 'behaviorTamplateString';
    this.items = items;
  }

  addItem(item) {
    this.items.push(item);
  }
}

module.exports = {
  TypeStream,
  TypeObject,

  TypeGeneric,
  TypeDecimal,
  TypeInteger,
  TypeString,
  TypeNumber,
  TypeArray,
  TypeBytes,
  TypeTree,
  TypeBool,
  TypeBase,
  TypeItem,
  TypeVoid,
  TypeNull,
  TypeMap,

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

  Behavior,
  BehaviorToMap,
  BehaviorRetry,
  BehaviorTimeNow,
  BehaviorToModel,
  BehaviorDoAction,
  BehaviorSetMapItem,
  BehaviorTamplateString
};
