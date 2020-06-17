'use strict';

const Enum = require('enum');

class SymbolEnum extends Enum {
  constructor() {
    super([
      'ASSIGN',
      'EQ',
      'NOT',
      'AND',
      'OR',
      'PLUS',
      'SUB',
      'MULTI',
      'DIV',
      'POWER',
      'GREATER',
      'GREATER_EQ',
      'LESS',
      'LESS_EQ',
      'REVERSE',
      'CONCAT',
      'JUDGE',
      'RISK'
    ], { name: 'symbol', ignoreCase: true });
  }
  assign() {
    return this.ASSIGN.key;
  }
  eq() {
    return this.EQ.key;
  }
  not() {
    return this.NOT.key;
  }
  and() {
    return this.AND.key;
  }
  or() {
    return this.OR.key;
  }
  plus() {
    return this.PLUS.key;
  }
  multi() {
    return this.MULTI.key;
  }
  div() {
    return this.DIV.key;
  }
  power() {
    return this.POWER.key;
  }
  greater() {
    return this.GREATER.key;
  }
  greaterEq() {
    return this.GREATER_EQ.key;
  }
  less() {
    return this.LESS.key;
  }
  lessEq() {
    return this.LESS_EQ.key;
  }
  reverse() {
    return this.REVERSE.key;
  }
  concat() {
    return this.CONCAT.key;
  }
  judge() {
    return this.JUDGE.key;
  }
  risk() {
    return this.RISK.key;
  }
}

class ModifyEnum extends Enum {
  constructor() {
    super([
      'ASYNC',
      'PRIVATE',
      'PROTECTED',
      'INTERNAL',
      'PUBLIC',
      'FINAL',
      'ABSTRACT',
      'STATIC'
    ], { name: 'modify', ignoreCase: true });
  }
  async() {
    return this.ASYNC.key;
  }
  private() {
    return this.PRIVATE.key;
  }
  protected() {
    return this.PROTECTED.key;
  }
  internal() {
    return this.INTERNAL.key;
  }
  public() {
    return this.PUBLIC.key;
  }
  final() {
    return this.FINAL.key;
  }
  abstract() {
    return this.ABSTRACT.key;
  }
  static() {
    return this.STATIC.key;
  }
}

class ExceptionEnum extends Enum {
  constructor() {
    super([
      'BASE',
    ], { name: 'exceptions', ignoreCase: true });
  }

  base() {
    return this.BASE.key;
  }
}

class TypeEnum extends Enum {
  constructor() {
    super([
      'any',
      'anyReference',
      'void',
      'null',
      'empty',
      'char',
      'string',
      'boolean',
      'number',
      'integer',
      'uint8',
      'int8',
      'uint16',
      'int16',
      'uint32',
      'int32',
      'uint64',
      'int64',
      'long',
      'ulong',
      'float',
      'double',
      'single',
      'decimal',
      'byte',
      'map',
      'list',
      'object',
      'readable',
      'writable'
    ], { name: 'types', ignoreCase: true });
  }
}

const Symbol = new SymbolEnum();
const Modify = new ModifyEnum();
const Exceptions = new ExceptionEnum();
const Types = new TypeEnum();

module.exports = {
  Symbol,
  Modify,
  Exceptions,
  Types
};
