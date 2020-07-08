'use strict';

const DSL = require('@darabonba/parser');

let config = {};

function _config(langConfig = null) {
  if (null !== langConfig) {
    config = langConfig;
  }
  return config;
}

function _upperFirst(str) {
  if (!str) {
    return '';
  }
  return str[0].toUpperCase() + str.substring(1);
}

function _camelCase(str, split = '_') {
  if (str.indexOf(split) > -1) {
    let tmp = str.split(split);
    tmp = tmp.map((s, i) => {
      if (s.length > 0 && i !== 0) {
        return _upperFirst(s);
      }
      return s;
    });
    str = tmp.join('');
  }
  return str;
}

function _lowerFirst(str) {
  return str[0].toLowerCase() + str.substring(1);
}

function _subModelName(name) {
  return name.split('.').map((name) => _upperFirst(name)).join('');
}

function _string(str) {
  return str.string;
}

function _isBasicType(type) {
  return DSL.util.isBasicType(type);
}

function _deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

function _avoidKeywords(str) {
  if (config.keywords.indexOf(str.toLowerCase()) > -1) {
    return str + '_';
  }
  return str;
}

function _convertStaticParam(param) {
  if (param === '__response') {
    param = config.response;
  } else if (param === '__request') {
    param = config.request;
  }
  return param;
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

function _exception(str) {
  if (config.exceptionMap[str]) {
    return config.exceptionMap[str];
  }
  return str;
}

function _underScoreCase(str) {
  if (!str) {
    return '';
  }
  let res = '';
  let tmp = '';
  for (const c of str) {
    if (/[A-Z|0-9]/.test(c)) {
      tmp += c;
    } else {
      if (tmp.length > 0) {
        res += res === '' ? tmp.toLowerCase() : '_' + tmp.toLowerCase();
        tmp = '';
      }
      res += c;
    }
  }
  if (tmp.length > 0) {
    res += '_' + tmp.toLowerCase();
  }
  res = res.replace(/-/g, '_');
  return res;
}


module.exports = {
  _config,
  _upperFirst,
  _camelCase,
  _string,
  _subModelName,
  _lowerFirst,
  _isBasicType,
  _deepClone,
  _avoidKeywords,
  _convertStaticParam,
  _isKeywords,
  _modify,
  _symbol,
  _exception,
  _underScoreCase
};