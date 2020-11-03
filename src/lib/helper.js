'use strict';

const path = require('path');
const fs = require('fs');
const DSL = require('@darabonba/parser');

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

function _convertStaticParam(param, _avoidKeyword = true) {
  if (param === '__response') {
    param = config.response;
  } else if (param === '__request') {
    param = config.request;
  }
  return _avoidKeyword ? _avoidKeywords(param) : param;
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

function _toSnakeCase(str) {
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
  if (str[0] !== '_' && res[0] === '_') {
    res = res.substr(1);
  }
  return res;
}

function _flatten(obj, sep = '.') {
  function recurse(curr, prefix, res = {}) {
    if (Array.isArray(curr)) {
      curr.forEach((item, index) => {
        recurse(item, prefix ? `${prefix}${sep}${index}` : `${index}`, res);
      });
    } else if (curr instanceof Object) {
      Object.keys(curr).forEach((key) => {
        recurse(curr[key], prefix ? `${prefix}${sep}${key}` : `${key}`, res);
      });
    } else {
      res[prefix] = curr;
    }
  }
  let output = {};
  recurse(obj, '', output);
  return output;
}

function _unflatten(obj, sep = '.') {
  let output = {};
  Object.keys(obj).forEach(key => {
    if (key.indexOf(sep) !== -1) {
      const keyArr = key.split('.').filter(item => item !== '');
      let currObj = output;
      keyArr.forEach((k, i) => {
        if (typeof currObj[k] === 'undefined') {
          if (i === keyArr.length - 1) {
            currObj[k] = obj[key];
          } else {
            currObj[k] = isNaN(keyArr[i + 1]) ? {} : [];
          }
        }
        currObj = currObj[k];
      });
    } else {
      output[key] = obj[key];
    }
  });
  return output;
}

function _assignObject(targetObj, ...objs) {
  const res = _flatten(targetObj);
  objs.forEach(obj => {
    Object.assign(res, _flatten(obj));
  });
  Object.assign(targetObj, _unflatten(res));
  return targetObj;
}

function _render(template, params) {
  Object.keys(params).forEach((key) => {
    template = template.split('${' + key + '}').join(params[key]);
  });
  return template;
}

function _dir(output) {
  if (!fs.existsSync(path.dirname(output))) {
    fs.mkdirSync(path.dirname(output), {
      recursive: true
    });
  }
}

function _contain(str, substr) {
  return str.indexOf(substr) > -1;
}

function _startWith(str, substr) {
  return str.indexOf(substr) === 0;
}

module.exports = {
  is,
  _dir,
  _config,
  _string,
  _modify,
  _symbol,
  _render,
  _contain,
  _flatten,
  _startWith,
  _unflatten,
  _camelCase,
  _deepClone,
  _upperFirst,
  _lowerFirst,
  _isKeywords,
  _toSnakeCase,
  _isBasicType,
  _assignObject,
  _subModelName,
  _avoidKeywords,
  _convertStaticParam,
};