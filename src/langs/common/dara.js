'use strict';

const { _toSnakeCase } = require('../../lib/helper');

/**
 * resolve dara module package to programmer code
 */

const packages = {
  // darabonba scope
  darabonba: {
    // darabonba package name
    'Number': {
      // the name of method in package
      'parseInt': 'parse', // <method-name> : <method-alias-name>
      'parseLong': 'parse',
      'parseFloat': 'parse',
      'parseDouble': 'parse',
      'itol': 'parse',
      'ltoi': 'parse',
      'add': 'binary_operation',
      'sub': 'binary_operation',
      'mul': 'binary_operation',
      'div': 'binary_operation',
      'gt': 'binary_operation',
      'gte': 'binary_operation',
      'lt': 'binary_operation',
      'lte': 'binary_operation'
    }
  }
};

function resolve(scope, package_name, method_name) {
  if (!packages[scope]) {
    return null;
  }
  const p = packages[scope];
  if (!p[package_name]) {
    return null;
  }
  const m = p[package_name];
  if (m[method_name] === '') {
    return `${_toSnakeCase(scope)}_${_toSnakeCase(package_name)}_${_toSnakeCase(method_name)}`;
  } else if (!m[method_name]) {
    return null;
  }
  return m[method_name];
}

function exclude(scope, package_name) {
  if (!packages[scope]) {
    return false;
  }
  const p = packages[scope];
  if (!p[package_name]) {
    return false;
  }
  return true;
}

module.exports = {
  resolve,
  exclude
};
