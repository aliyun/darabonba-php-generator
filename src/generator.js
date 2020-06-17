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
  generateBaseClient(ast) {
    const ClientVisitor = require('./visitor/client');
    const clientVisitor = new ClientVisitor(this.option, 'php');
    clientVisitor.visit(ast);
    const emittter = clientVisitor.done();
    return emittter;
  }
}

module.exports = Generator;
