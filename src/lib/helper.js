'use strict';

const DSL = require('@darabonba/parser');

function _upperFirst(str) {
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

function _getTaskConfig(option) {
  return {
    outputDir: '',
    indent: '    '
    , ...option
  };
}

function _getLangConfig(option, lang) {
  let config = require(`../langs/${lang}/config`);
  return {
    package: 'Alibabacloud.SDK',
    clientName: 'Client',
    include: [],
    parent: [],
    pkgDir: '',
    ...config,
    ...option,
    ...option[lang]
  };
}

function _getEmitConfig(option, lang) {
  const taskConfig = _getTaskConfig(option);
  const langConfig = _getLangConfig(option, lang);
  return {
    ...langConfig,
    dir: taskConfig.outputDir,
    layer: langConfig.package,
    showInfo: false
  };
}

function _getCombinator(lang, langConfig) {
  const Combinator = require(`../langs/${lang}/combinator`);
  return new Combinator(langConfig);
}

function _deepClone(obj) {
  return JSON.parse(JSON.stringify(obj));
}

module.exports = {
  _upperFirst,
  _camelCase,
  _string,
  _subModelName,
  _lowerFirst,
  _isBasicType,
  _deepClone,

  _getLangConfig,
  _getEmitConfig,
  _getCombinator,
};