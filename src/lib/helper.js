'use strict';

const DSL = require('@darabonba/parser');
const { _upper_first } = require('@axiosleo/cli-tool/src/helper/str');
const {
  TypeGeneric,
  TypeDecimal,
  TypeInteger,
  TypeStream,
  TypeObject,
  TypeString,
  TypeNumber,
  TypeArray,
  TypeBytes,
  TypeBool,
  TypeItem,
  TypeVoid,
  TypeNull,
  TypeMap,
  TypeBase,
  TypeTree,
  PropItem,
  FuncItem,
  ConstructItem,
  AnnotationItem,
} = require('../langs/common/items');

let config = {};

const is = {
  undefined: a => typeof (a) === 'undefined',
  any: a => a instanceof TypeGeneric,
  array: a => a instanceof TypeArray,
  map: a => a instanceof TypeMap,
  decimal: a => a instanceof TypeDecimal,
  base: a => a instanceof TypeBase,
  null: a => a instanceof TypeNull,
  integer: a => a instanceof TypeInteger,
  stream: a => a instanceof TypeStream,
  object: a => a instanceof TypeObject,
  string: a => a instanceof TypeString,
  number: a => a instanceof TypeNumber,
  bytes: a => a instanceof TypeBytes,
  bool: a => a instanceof TypeBool,
  type: a => a instanceof TypeItem,
  void: a => a instanceof TypeVoid,
  tree: a => a instanceof TypeTree,
  // Item
  prop: a => a instanceof PropItem,
  func: a => a instanceof FuncItem,
  construct: a => a instanceof ConstructItem,
  annotation: a => a instanceof AnnotationItem,
};

function _config(langConfig = null) {
  if (null !== langConfig) {
    config = langConfig;
  }
  return config;
}

function _subModelName(name) {
  return name.split('.').map((name) => _upper_first(name)).join('');
}

function _string(str) {
  return str.string;
}

function _isBasicType(type) {
  return DSL.util.isBasicType(type);
}

function _avoidKeywords(str) {
  if (config.keywords.indexOf(str.toLowerCase()) > -1) {
    return str + '_';
  }
  return str;
}

function _isKeywords(str) {
  return config.keywords.indexOf(str.toLowerCase()) > -1;
}

function _modify(modify) {
  if (Array.isArray(modify)) {
    return modify.filter((m) => config.modifyOrder.indexOf(m) > -1)
      .map((m) => _modify(m)).sort(function (a, b) {
        return config.modifyOrder.indexOf(a.toUpperCase()) - config.modifyOrder.indexOf(b.toUpperCase());
      }).join(' ');
  }
  return modify.toLowerCase();
}

function _symbol(str) {
  if (config.symbolMap[str]) {
    return config.symbolMap[str];
  }
  throw new Error(`Unsupported symbol : ${str}`);
}

function _contain(str, substr) {
  return str.indexOf(substr) > -1;
}

function _name(str, avoidKeyword = true) {
  str = `${str}`;
  if (str.indexOf('@') === 0) {
    str = `_${str.substr(1)}`;
  }
  if (str === '__response') {
    str = config.response;
  } else if (str === '__request') {
    str = config.request;
  }
  return avoidKeyword ? _avoidKeywords(str) : str;
}

module.exports = {
  is,
  _name,
  _config,
  _string,
  _modify,
  _symbol,
  _contain,
  _isKeywords,
  _isBasicType,
  _subModelName,
  _avoidKeywords
};
