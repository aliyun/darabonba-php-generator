'use strict';

const debug = require('../lib/debug');
const BaseVisitor = require('./base');

const {
  Modify,
  Exceptions,
} = require('../langs/common/enum');

const {
  PropItem,
  FuncItem,
  ObjectItem,

  GrammerValue,
  GrammerThrows,
} = require('../langs/common/items');

class ClientVisitor extends BaseVisitor {
  visit(ast) {
    this.emitConfig = {
      ...this.emitConfig,
      ext: this.langConfig.ext,
      layer: ''
    };
    const combinator = this.getCombinator();
    combinator.includeList = this.langConfig.client.include;
    if (!this.langConfig.filename) {
      debug.stack('option.php.filename undefined or empty', this.langConfig);
    }
    this.object = new ObjectItem();
    this.object.params = this.constructorParams(ast);
    this.object.name = this.langConfig.filename;

    // BaseClient prop
    ast.moduleBody.nodes.filter((item) => {
      return item.type === 'type' && !item.value.type;
    }).forEach((item) => {
      const prop = new PropItem();
      prop.addModify(Modify.protected());
      prop.name = '_' + item.vid.lexeme.substring(1);
      prop.type = item.value.lexeme;
      this.object.addBodyNode(prop);
    });

    this.object.addConstructorBody(
      this.throwGrammer('the constructor is un-implemented!')
    );

    this.funcs(ast);
  }

  throwGrammer(msg = '') {
    return new GrammerThrows(Exceptions.base(), [], msg);
  }

  funcs(ast) {
    ast.moduleBody.nodes.filter((item) => {
      return item.type === 'type' && item.value.type === 'method';
    }).forEach((item) => {
      const func = new FuncItem();
      func.name = `_${item.vid.lexeme.substring(1)}`;
      func.modify.push(Modify.protected());
      if (item.value.isStatic) {
        func.modify.push(Modify.static());
      }

      const parameters = this.langConfig.parameters;
      item.value.types.forEach((t, i) => {
        func.params.push(new GrammerValue('', null, parameters[i]));
      });
      func.return.push(item.value.returnType);
      func.addBodyNode(this.throwGrammer('the method is un-implemented!'));

      this.object.addBodyNode(func);
    });
  }
}

module.exports = ClientVisitor;