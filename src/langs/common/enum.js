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
const Symbol = new SymbolEnum();
const Modify = new ModifyEnum();

module.exports = {
  Symbol,
  Modify,
};
