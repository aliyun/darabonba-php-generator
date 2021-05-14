'use strict';

const Emitter = require('../../lib/emitter');

function param(param_gram) {
  let emit = new Emitter(this.config);
  this.grammer(emit, param_gram, false, false);
  return emit.output;
}

function parse(emitter, gram) {
  const method_name = gram.path[1].name;
  const map = {
    'parseInt': '(int)',
    'parseLong': '(int)',
    'parseFloat': '(double)',
    'parseDouble': '(double)',
    'itol': '',
    'ltoi': '',
  };
  emitter.emit(`${map[method_name]}${param.call(this, gram.params[0])}`);
}

function binary_operation(emitter, gram) {
  const a = param.call(this, gram.params[0]);
  const b = param.call(this, gram.params[1]);
  const method_name = gram.path[1].name;
  const map = {
    'add': '+',
    'sub': '-',
    'mul': '*',
    'div': '/',
    'gt': '>',
    'gte': '>=',
    'lt': '<',
    'lte': '<='
  };
  emitter.emit(`${a} ${map[method_name]} ${b}`);
}

function str_split(emitter, gram) {
  let raw = param.call(this, gram.params[0]);
  let sep = param.call(this, gram.params[1]);
  let limit = param.call(this, gram.params[2]);
  emitter.emit(`explode(${sep}, (string)${raw}, ${limit} ? ${limit} : null)`);
}

function str_replace(emitter, gram) {
  let raw = param.call(this, gram.params[0]);
  let old_str = param.call(this, gram.params[1]);
  let new_str = param.call(this, gram.params[2]);
  let count = param.call(this, gram.params[3]);
  emitter.emit(`str_replace((string)${raw}, (string)${old_str}, (string)${new_str}, (int)${count})`);
}

function str_contains(emitter, gram) {
  let str = param.call(this, gram.params[0]);
  let sub = param.call(this, gram.params[1]);
  emitter.emit(`false !== strpos((string)${str}, (string)${sub})`);
}

function str_count(emitter, gram) {
  let str = param.call(this, gram.params[0]);
  let sub = param.call(this, gram.params[1]);
  emitter.emit(`substr_count((string)${str}, (string)${sub})`);
}

function str_prefix(emitter, gram) {
  let str = param.call(this, gram.params[0]);
  let sub = param.call(this, gram.params[1]);
  emitter.emit(`0 === strpos((string)${str}, (string)${sub})`);
}

function str_suffix(emitter, gram) {
  let str = param.call(this, gram.params[0]);
  let sub = param.call(this, gram.params[1]);
  emitter.emit(`substr((string)${str}, -\\strlen(${sub})) === ${sub}`);
}

function str_index(emitter, gram) {
  let str = param.call(this, gram.params[0]);
  let sub = param.call(this, gram.params[1]);
  emitter.emit(`(int)strpos((string)${str}, (string)${sub})`);
}

function str_lower(emitter, gram) {
  let str = param.call(this, gram.params[0]);
  emitter.emit(`strtolower((string)${str})`);
}

function str_upper(emitter, gram) {
  let str = param.call(this, gram.params[0]);
  emitter.emit(`strtoupper((string)${str})`);
}

function str_sub(emitter, gram) {
  let str = param.call(this, gram.params[0]);
  let start = param.call(this, gram.params[1]);
  let end = param.call(this, gram.params[2]);
  emitter.emit(`substr((string)${str}, ${start}, ${end} - ${start} + 1)`);
}

module.exports = {
  parse,

  str_sub,
  str_upper,
  str_lower,
  str_index,
  str_split,
  str_count,
  str_prefix,
  str_suffix,
  str_replace,
  str_contains,

  binary_operation,
};
