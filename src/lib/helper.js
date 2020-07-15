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

function _flatten(obj, sep = '.') {
  function recurse(curr, prefix, res = {}) {
    if (Array.isArray(curr)) {
      curr.forEach((item, index) => {
        const p = prefix ? `${prefix}${sep}${index}` : `${index}`;
        recurse(item, p, res);
      });
    } else if (curr instanceof Object) {
      Object.keys(curr).forEach((key) => {
        const p = prefix ? `${prefix}${sep}${key}` : `${key}`;
        recurse(curr[key], p, res);
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
      const tmp = key.split('.').filter(item => item !== '');
      let currObj = output;
      tmp.forEach((k, i) => {
        if (typeof currObj[k] === 'undefined') {
          if (i === tmp.length - 1) {
            currObj[k] = obj[key];
          } else {
            const lastKey = tmp[i + 1];
            currObj[k] = isNaN(lastKey) ? {} : [];
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
    const tmp = _flatten(obj);
    Object.assign(res, tmp);
  });
  Object.assign(targetObj, _unflatten(res));
  return targetObj;
}

module.exports = {
  _config,
  _string,
  _modify,
  _symbol,
  _flatten,
  _unflatten,
  _camelCase,
  _exception,
  _deepClone,
  _upperFirst,
  _lowerFirst,
  _isKeywords,
  _isBasicType,
  _assignObject,
  _subModelName,
  _avoidKeywords,
  _underScoreCase,
  _convertStaticParam,
};