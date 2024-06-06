'use strict';

const keywords = [
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
];

const builtinModels = ['$Request', '$Response', '$Error', '$SSEEvent', '$Model'];
const NAMESPACE = 'AlibabaCloud\\Dara';
const CORE = 'AlibabaCloud\\Dara\\Dara';
const REQUEST = 'AlibabaCloud\\Dara\\Request';
const RESPONSE = 'AlibabaCloud\\Dara\\Response';
const MODEL = 'AlibabaCloud\\Dara\\Model';
const ERROR = 'AlibabaCloud\\Dara\\Exception\\DaraException';
const UNRETRY_ERROR = 'AlibabaCloud\\Dara\\Exception\\DaraUnableRetryException';
const RESP_ERROR = 'AlibabaCloud\\Dara\\Exception\\DaraRespException';
const RETRY_CONTEXT = 'AlibabaCloud\\Dara\\RetryPolicy\\RetryPolicyContext';
const SSE_EVENT = 'AlibabaCloud\\Dara\\SSE\\Event';
const STREAM = 'GuzzleHttp\\Psr7\\Stream';


function _name(str) {
  if (str.lexeme === '__request') {
    return '_reqeust';
  }

  if (str.lexeme === '__response') {
    return '_response';
  }

  return str.lexeme || str.name;
}

function _upperFirst(str) {
  return str[0].toUpperCase() + str.substring(1);
}

function _subModelName(name) {
  return name.split('.').map((name) => _upperFirst(name)).join('');
}

function _avoidKeywords(str) {
  if (keywords.indexOf(str.toLowerCase()) > -1) {
    return str + '_';
  }
  return str;
}

function _modelName(str) {
  if (keywords.indexOf(str.toLowerCase()) > -1 || str.toLowerCase() === 'model') {
    return str + '_';
  }
  return str;
}


function _string(str) { 
  if (str.string === '\'\'') {
    return '\\\'\\\'';
  }
  return str.string.replace(/([^\\])'+|^'/g, function(str){
    return str.replace(/'/g, '\\\'');
  });
}

function _isBinaryOp(type){
  const op = [
    'or', 'eq', 'neq',
    'gt', 'gte', 'lt',
    'lte', 'add', 'subtract',
    'div', 'multi', 'and'
  ];
  return op.includes(type);
}

function _vid(vid) {
  return `_${_name(vid).substr(1)}`;
}

function _isBuiltinModel(name){ 
  return builtinModels.includes(name);
}

module.exports = {
  _name, _string, _subModelName, _vid, _upperFirst, _isBuiltinModel,
  _isBinaryOp, _modelName, _avoidKeywords, RETRY_CONTEXT,
  REQUEST, RESPONSE, MODEL, NAMESPACE, ERROR, STREAM, UNRETRY_ERROR,
  CORE, SSE_EVENT, RESP_ERROR
};