'use strict';

module.exports = {
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
  symbolMap: {
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
  },
  modifyOrder: [
    'PRIVATE',
    'PROTECTED',
    'PUBLIC',
    'FINAL',
    'ABSTRACT',
    'STATIC'
  ],
  model: {
    dir: 'Models',
    include: [],
  },
  client: {
    name: 'Client',
    include: []
  },
  tea: {
    namespace: '\\AlibabaCloud\\Tea\\',
    name: 'Tea',
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
    stream: { name: '\\GuzzleHttp\\Psr7\\Stream' },
    model: { name: '\\AlibabaCloud\\Tea\\Model' },
    response: { name: '\\AlibabaCloud\\Tea\\Response' },
    request: { name: '\\AlibabaCloud\\Tea\\Request' },
    exception: { name: '\\Exception' },
    error: { name: '\\AlibabaCloud\\Tea\\Exception\\TeaError' },
    exceptionUnretryable: { name: '\\AlibabaCloud\\Tea\\Exception\\TeaUnableRetryError' },
  }
};
