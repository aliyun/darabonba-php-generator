'use strict';

const mm = require('mm');
const expect = require('chai').expect;
require('mocha-sinon');

const ModelResolver = require('../src/resolver/model');
const ClientResolver = require('../src/resolver/client');

const {
  PropItem,
  AnnotationItem,
  BehaviorDoAction,
  GrammerValue,
  FuncItem
} = require('../src/langs/common/items');
const { _deepClone } = require('../src/lib/helper');

const lang = 'php';
const Combinator = require(`../src/langs/${lang}/combinator.js`);
const config = require(`../src/langs/${lang}/config.js`);

describe('base resolver should be ok', function () { 
  
});

describe('client resolver should be ok', function () {
  beforeEach(function () {
    this.sinon.stub(console, 'log');
  });

  it('resolve should be ok', function () {
    const combinator = new Combinator(Object.assign(_deepClone(config), {
      package: 'test', model: { dir: 'Models' }
    }), { });
    const code = new ClientResolver({moduleBody: { nodes: [] }}, combinator, {});
    mm(code, 'initAnnotation', function () { return; });
    mm(code, 'resolveProps', function () { return; });
    mm(code.combinator, 'addInclude', function (className) { return className; });
    code.config.baseClient = 'BaseClient';
    code.resolve();
    expect(code.object.extends).to.be.eql(['BaseClient']);

    mm.restore();
  });

  it('resolveInitBody should be ok', function () {
    const combinator = new Combinator(Object.assign(_deepClone(config), {
      package: 'test', model: { dir: 'Models' }
    }), {});
    const code = new ClientResolver({}, combinator, {});
    mm(code.combinator, 'addModelInclude', function (modelName) {
      expect(modelName).to.be.eql('modelType');
    });
    mm(code.combinator, 'addInclude', function (className) {
      return className;
    });
    code.config.baseClient = 'BaseClient';
    let init = {
      type: 'init', params: {
        params: [{
          paramType: {
            idType: 'model',
            lexeme: 'modelType'
          },
          paramName: {
            lexeme: 'modelName'
          }
        }, {
          paramType: {
            idType: 'module',
            lexeme: 'moduleType'
          },
          paramName: {
            lexeme: 'moduleName'
          }
        }]
      }
    };
    code.resolveInitBody(init);
    mm.restore();
  });

  it('resolveFunc should be ok', function () {
    const combinator = new Combinator(Object.assign(_deepClone(config), {
      package: 'test', model: { dir: 'Models' }
    }), {});
    const code = new ClientResolver({}, combinator, {});
    const funcItem = new FuncItem();
    expect(function () {
      code.resolveFunc(funcItem, {
        params: { params: [] }
      }, {}, {});
    }).to.be.throw('Unsupported ast.returnType');

    mm(code.combinator, 'addInclude', function (className) {
      return className;
    });
    code.resolveFunc(funcItem, {
      params: { params: [] },
      returnType: {
        idType: 'module',
        lexeme: 'object',
      }
    }, {});
    code.resolveFunc(funcItem, {
      params: {
        params: [
          {
            paramType: { type: 'moduleModel', subType: { lexeme: '' }, path: ['a'] },
            paramName: { lexeme: 'test' }
          }
        ]
      },
      returnType: {
        idType: 'module',
        lexeme: 'object',
      }
    }, {});

    mm.restore();
  });

  it('code : requestBody should be ok', function () {
    const combinator = new Combinator(Object.assign(_deepClone(config), {
      package: 'test', model: { dir: 'Models' }
    }), {});
    const code = new ClientResolver({}, combinator, {});
    mm(code, 'visitStmt', function (func) {
      expect(func.name).to.be.eql('testFuncName');
    });
    const funcItem = new FuncItem();
    funcItem.name = 'testFuncName';
    code.requestBody({}, {
      body: {},
    }, funcItem);
    mm.restore();
    mm(code, 'visitStmt', function (func, item) {
      expect(item).to.be.eql('https');
    });
    code.requestBody({}, {
      protocol: ['https']
    }, funcItem);
  });

  it('renderGrammerValue should be ok', function () {
    const combinator = new Combinator(Object.assign(_deepClone(config), {
      package: 'test', model: { dir: 'Models' }
    }), {});
    const code = new ClientResolver({}, combinator, {});
    expect(function () {
      code.renderGrammerValue(null, { type: 'invalid' });
    }).to.be.throw('unimpelemented : invalid');

    expect(function () {
      code.renderGrammerValue(null, {
        type: 'map_access',
        accessKey: {
          id: '',
          value: { lexeme: '' }
        }
      });
    }).to.be.throw('');

    let grammerValue = code.renderGrammerValue(null, {
      type: 'map_access',
      id: { lexeme: 'test' },
      accessKey: {
        id: 'test',
        value: { lexeme: 'test' }
      }
    });
    expect(grammerValue.value.path.length).to.be.eql(2);

    expect(function () {
      code.renderGrammerValue(null, {
        type: 'call',
        left: {
          type: 'invalid'
        }
      });
    }).to.be.throw('');

    expect(function () {
      code.renderGrammerValue(null, {
        type: 'call',
        left: {
          type: 'static_call',
          id: { type: 'invalid' }
        }
      });
    }).to.be.throw('');

    expect(function () {
      code.renderGrammerValue(null, {
        type: 'call',
        left: {
          type: 'instance_call',
          id: { type: 'invalid', lexeme: 'test' }
        }
      });
    }).to.be.throw('Unsupported object.left.id.type : invalid');

    grammerValue = code.renderGrammerValue(null, {
      type: 'call',
      left: {
        type: 'instance_call',
        id: { lexeme: '@test' }
      }
    });
    expect(grammerValue.value.path.length).to.be.eql(1);

    grammerValue = code.renderGrammerValue(null, {
      type: 'call',
      left: {
        type: 'method_call',
        id: { type: 'module', lexeme: 'Util' }
      }
    });
    expect(grammerValue.value.path.length).to.be.eql(2);

    mm(code.combinator, 'addModelInclude', function (modelName) {
      return modelName;
    });
    grammerValue = code.renderGrammerValue(null, {
      type: 'construct_model',
      aliasId: {
        lexeme: 'test'
      },
      propertyPath: [{ lexeme: 'a' }, { lexeme: 'b' }]
    });
    expect(grammerValue.value.name).to.be.eql('test.a.b');

    grammerValue = code.renderGrammerValue(null, {
      type: 'property_access',
      id: {
        inferred: 'map',
        lexeme: '__module'
      },
      propertyPath: [{ lexeme: 'test' }],
      propertyPathTypes: [{ name: 'test' }],
      needCast: true
    });
    expect(grammerValue.type).to.be.eql('behavior');

    grammerValue = code.renderGrammerValue(null, {
      type: 'object',
      fields: [
        { expr: { type: 'object', fields: [{ expr: { type: 'null' } }] } }
      ]
    });
    expect(grammerValue.type).to.be.eql('array');

    mm.restore();
  });

  it('visitStmt should be ok', function () {
    const combinator = new Combinator(Object.assign(_deepClone(config), {
      package: 'test', model: { dir: 'Models' }
    }), {});
    const code = new ClientResolver({}, combinator, {});
    const obj = new BehaviorDoAction();

    expect(function () {
      code.visitStmt(obj, {});
    }).to.be.throw('');
    expect(console.log.calledWith({})).to.be.true;

    let stmt = { type: 'while', condition: [{}] };
    mm(code, 'renderGrammerValue', function () {
      return new GrammerValue('string', 'test');
    });
    code.visitStmt(obj, stmt);
    expect(obj.body.length).to.be.eql(1);

    stmt = { type: 'virtualCall' };
    code.visitStmt(obj, stmt);
    expect(obj.body.length).to.be.eql(2);

    stmt = { type: 'throw', expr: [{}] };
    mm(code.combinator, 'addInclude', function (className) {
      return className;
    });
    code.visitStmt(obj, stmt);
    expect(obj.body.length).to.be.eql(3);

    stmt = { type: 'elseIfRequestAssign' };
    mm(code, 'visitIfElse', function () { return 'visitIfElse'; });
    code.visitStmt(obj, stmt);
    expect(obj.body.length).to.be.eql(4);

    stmt = {
      type: 'requestAssign',
      left: {
        id: { lexeme: 'test' },
      }
    };
    code.predefined = {
      '$Request': {
        modelBody: { nodes: [{ fieldName: { lexeme: 'test' }, fieldValue: '' }] }
      }
    };
    code.visitStmt(obj, stmt);
    expect(obj.body.length).to.be.eql(5);

    stmt = {
      type: 'requestAssign',
      left: {
        type: 'request_property_assign',
        id: { lexeme: 'test' },
        propertyPath: [{ lexeme: 'a' }, { lexeme: 'b' }]
      }
    };
    code.visitStmt(obj, stmt);
    expect(obj.body.length).to.be.eql(6);
    mm.restore();
  });

  it('visitIfConfition should be ok', function () {
    const combinator = new Combinator(Object.assign(_deepClone(config), {
      package: 'test', model: { dir: 'Models' }
    }), {});
    const code = new ClientResolver({}, combinator, {});
    const stmtCondition = { left: {}, type: 'invalid' };
    expect(function () {
      code.visitIfConfition(stmtCondition);
    }).to.be.throw('');
    expect(console.log.calledWith(stmtCondition)).to.be.true;

    stmtCondition.type = 'call';
    mm(code, 'renderGrammerValue', function () {
      return 'render grammer value';
    });
    expect(code.visitIfConfition(stmtCondition)).to.be.eql('render grammer value');

    stmtCondition.type = 'not';
    expect(code.visitIfConfition(stmtCondition).opt).to.be.eql('NOT');
    mm.restore();
  });

  it('visitIfElse should be ok', function () {
    const combinator = new Combinator(Object.assign(_deepClone(config), {
      package: 'test', model: { dir: 'Models' }
    }), {});
    const code = new ClientResolver({}, combinator, {});
    expect(function () {
      code.visitIfElse({});
    }).to.be.throw('');
    expect(console.log.calledWith({})).to.be.true;

    let stmt = { stmts: [] };
    expect(function () {
      code.visitIfElse(stmt);
    }).to.be.throw('');
    expect(console.log.calledWith(stmt)).to.be.true;

    stmt = {
      stmts: { type: 'stmts', stmts: [{ type: 'return', expr: { type: 'null' } }] },
      elseAssigns: [{ stmts: { type: 'stmts', stmts: [{ type: 'return', expr: { type: 'null' } }] } }]
    };
    const grammer = code.visitIfElse(stmt);
    expect(grammer.elseItem.length).to.be.eql(1);
  });
});

describe('model resolver should be ok', function () {
  it('resolve should be ok', function () {
    const combinator = new Combinator(Object.assign(_deepClone(config), {
      package: 'test', model: { dir: 'Models' }
    }), {});
    const model = new ModelResolver({
      type: 'model',
      modelName: { lexeme: 'test' },
      modelBody: { nodes: [] },
      tokenRange: [1, 100]
    }, combinator, {});
    mm(model, 'initAnnotation', function () { return; });
    mm(model.combinator, 'addInclude', function (modelName) { return modelName; });
    mm(model, 'initProp', function () { return; });
    mm(model, 'resolveAnnotations', function () { return [new AnnotationItem()]; });
    mm(model, 'getBetweenComments', function () { return; });
    model.resolve();
    expect(model.object.body.length).to.be.eql(1);
  });

  it('initProp should be ok', function () {
    const combinator = new Combinator(Object.assign(_deepClone(config), {
      package: 'test', model: { dir: 'Models' }
    }), {});
    const model = new ModelResolver({}, combinator, {});
    expect(function () {
      model.initProp([{
        fieldValue: {
          fieldType: null
        }
      }]);
    }).to.be.throw('');

    mm(model.combinator, 'addModelInclude', function (modelName) {
      expect(modelName).to.be.eql('a');
    });
    model.initProp([{
      fieldValue: {
        fieldType: { type: 'moduleModel', path: [{ lexeme: 'a' }] }
      },
      fieldName: {
        lexeme: 'test'
      },
      attrs: [{ attrValue: { value: 'test' }, attrName: { lexeme: 'name' } }]
    }]);
    mm.restore();
    mm(model, 'findSubModelsUsed', function () {
      return;
    });
    model.initProp([{
      type: 'modelField',
      fieldValue: { fieldType: 'array', fieldItemType: { lexeme: '' } },
      fieldName: { lexeme: 'test' },
      attrs: []
    }]);
    expect(model.object.body.filter(item => item instanceof PropItem).length).to.be.eql(2);
    mm.restore();
  });

  it('findSubModelsUsed should be ok', function () {
    const combinator = new Combinator(Object.assign(_deepClone(config), {
      package: 'test', model: { dir: 'Models' }
    }), {});
    const model = new ModelResolver({}, combinator, {});
    const subModelUsed = [];
    model.findSubModelsUsed({
      fieldName: { lexeme: 'test' },
      fieldValue: {
        nodes: [{
          fieldValue: { nodes: [] },
          fieldName: { lexeme: 'foo' },
        }]
      }
    }, subModelUsed);
    expect(subModelUsed.length).to.be.eql(2);
  });
});