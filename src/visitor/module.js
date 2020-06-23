'use strict';

const assert = require('assert');
const BaseVisitor = require('./base');

const ModelVisitor = require('./model');
const CodeVisitor = require('./code');

class ModuleVisitor extends BaseVisitor {

  visit(ast, level = 0) {
    assert.equal(ast.type, 'module');
    this.moduleInfo = {};

    this.moduleInfo.comments = ast.comments;

    const self = this;

    // visit models
    ast.moduleBody.nodes.filter((item) => {
      return item.type === 'model';
    }).forEach((model) => {
      assert.equal(model.type, 'model');
      const modelVisitor = new ModelVisitor(self.option, self.lang, this.moduleInfo);
      modelVisitor.visit(model, level, ast.predefined, ast);
      const modelName = model.modelName.lexeme;

      // for parser 2.0+
      // submodels
      if (ast.models) {
        Object.keys(ast.models).filter((key) => {
          return key.startsWith(modelName + '.');
        }).map((key) => {
          const subModel = ast.models[key];
          const subModelVisitor = new ModelVisitor(self.option, self.lang, this.moduleInfo);
          subModelVisitor.visit(subModel, level, null, ast);
          return ast.models[key];
        });
      }
    });

    // init ApiVisitor
    const codeVisitor = new CodeVisitor(self.option, this.lang, this.moduleInfo);
    codeVisitor.init(ast);

    // visit api (parser1)
    ast.moduleBody.nodes.filter((item) => {
      return item.type === 'api';
    }).forEach((api) => {
      assert.equal(api.type, 'api');
      codeVisitor.visitApi(api, ast.predefined);
    });

    // visit function (parser2)
    ast.moduleBody.nodes.filter((item) => {
      return item.type === 'function';
    }).forEach((api) => {
      assert.equal(api.type, 'function');
      codeVisitor.visitFunc(api, ast.predefined);
    });

    codeVisitor.done();

    return this.moduleInfo;
  }
}

module.exports = ModuleVisitor;
