'use strict';

class Generator {
  constructor(option = {}) {
    this.option = {
      output: true,
      ...option
    };
  }
  visit(ast) {
    const ModuleVisitor = require('./visitor/module');
    const moduleVisitor = new ModuleVisitor(this.option, 'php');
    moduleVisitor.visit(ast);
  }
}

module.exports = Generator;
