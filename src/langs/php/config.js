'use strict';

const defaultConfig = require('../common/config');

module.exports = {
  ...defaultConfig,
  indent: '    ',
  ext: '.php',
  keywords: [
    // https://www.php.net/manual/zh/reserved.keywords.php
    '__halt_compiler', 'abstract', 'and', 'array', 'as',
    'break', 'callable', 'case', 'catch', 'class',
    'clone', 'const', 'continue', 'declare', 'default',
    'die', 'do', 'echo', 'else', 'elseif',
    'empty', 'enddeclare', 'endfor', 'endforeach', 'endif',
    'endswitch', 'endwhile', 'eval', 'exit', 'extends',
    'final', 'for', 'foreach', 'function',
    'global', 'goto', 'if', 'implements', 'include',
    'include_once', 'instanceof', 'insteadof', 'interface', 'isset',
    'list', 'namespace', 'new', 'or', 'print',
    'private', 'protected', 'public', 'require', 'require_once',
    'return', 'static', 'switch', 'throw', 'trait',
    'try', 'unset', 'use', 'var', 'while', 'xor'
  ],
  typeMap: {
    'boolean': 'bool',
    'number': 'integer',
    'integer': 'integer',
    'object': 'object',
    'map': 'array',
    'readable': 'Stream',
    'bytes': 'array',
    'long': 'integer'
  },
  model: {
    dir: 'Models',
    include: [],
  },
  client: {
    filename: 'Client',
    include: []
  },
  tea: {
    core: {
      name: '\\AlibabaCloud\\Tea\\Tea',
      doAction: 'send',
      allowRetry: 'allowRetry',
      sleep: 'sleep',
      getBackoffTime: 'getBackoffTime',
      isRetryable: 'isRetryable',
      toModel: 'toModel',
      merge: 'merge'
    },
    model: { name: '\\AlibabaCloud\\Tea\\Model' },
    response: { name: '\\AlibabaCloud\\Tea\\Response' },
    request: { name: '\\AlibabaCloud\\Tea\\Request' },
    exception: { name: '\\AlibabaCloud\\Tea\\Exception\\TeaError' },
    exceptionUnretryable: { name: '\\AlibabaCloud\\Tea\\Exception\\TeaUnableRetryError' },
  }
};