'use strict';

const debug = require('../../lib/debug');
const config = require('./config');

const {
  _isBasicType
} = require('../../lib/helper');

const symbolMap = {
  'ASSIGN': '=',
  'EQ': '==',
  'NOT': '!=',
  'AND': '&&',
  'OR': '||',
  'PLUS': '+',
  'SUB': '-',
  'MULTI': '*',
  'DIV': '/',
  'POWER': '^',
  'GREATER': '>',
  'GREATER_EQ': '>=',
  'LESS': '<',
  'LESS_EQ': '<=',
  'REVERSE': '!',
  'CONCAT': '.'
};

function _symbol(str) {
  if (symbolMap[str]) {
    return symbolMap[str];
  }
  debug.stack(str);
}

const exceptionMap = {
  'BASE': '\\Exception',
};

function _exception(str) {
  if (exceptionMap[str]) {
    return exceptionMap[str];
  }
  return str;
}

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

const modifyOrder = [
  'PRIVATE',
  'PROTECTED',
  'PUBLIC',
  'FINAL',
  'ABSTRACT',
  'STATIC'
];

function _modify(modify) {
  if (Array.isArray(modify)) {
    return modify.filter((m) => modifyOrder.indexOf(m) > -1)
      .map((m) => _modify(m)).sort(function (a, b) {
        return modifyOrder.indexOf(a.toUpperCase()) - modifyOrder.indexOf(b.toUpperCase());
      }).join(' ');
  }
  return modify.toLowerCase();
}

function _isKeywords(str) {
  return config.keywords.indexOf(str.toLowerCase()) > -1;
}

function _avoidKeywords(str) {
  if (config.keywords.indexOf(str.toLowerCase()) > -1) {
    return str + '_';
  }
  return str;
}

function _type(type) {
  let t = type instanceof Object ? type.lexeme : type;
  if (config.typeMap[t]) {
    return config.typeMap[t];
  }
  if (t.indexOf('map[') === 0) {
    return 'map';
  }
  if (!_isBasicType(t)) {
    return t;
  }
  if (t[0] === '$') {
    t = t.replace('$', 'Tea');
  }
  return t;
}

function _convertStaticParam(param) {
  if (param === '__response') {
    param = config.response;
  } else if (param === '__request') {
    param = config.request;
  }
  return param;
}

module.exports = {
  _name,
  _type,
  _symbol,
  _modify,
  _exception,
  _isKeywords,
  _avoidKeywords,
  _convertStaticParam,
};
