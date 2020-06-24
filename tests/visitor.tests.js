'use strict';

const expect = require('chai').expect;
const mm = require('mm');
require('mocha-sinon');
const BaseVisitor = require('../src/visitor/base');
const CodeVisitor = require('../src/visitor/code');
const ModelVisitor = require('../src/visitor/model');

const {
  ObjectItem,
  BehaviorDoAction,
  GrammerValue,
  FuncItem,
  PropItem
} = require('../src/langs/common/items');

describe('visitor tests', function () {
  beforeEach(function () {
    this.sinon.stub(console, 'log');
  });

  it('base : visit should be ok', function () {
    const visitor = new BaseVisitor({}, 'php');
    expect(function () {
      visitor.visit({});
    }).to.be.throw('Please override visit(ast)');
  });

  it('base : resolveAnnotation should be ok', function () {
    const visitor = new BaseVisitor({}, 'php');
    const annotationItem = visitor.resolveAnnotation({
      index: 1,
      value: '/**\n* test row 1\n * test row 2\n* test row 3\n*/'
    }, 0);
    expect(annotationItem.content).to.be.eql(['test row 1', 'test row 2', 'test row 3']);
  });

  it('base : addAnnotations should be ok', function () {
    const visitor = new BaseVisitor({}, 'php');
    visitor.commentsSet = [];
    mm(visitor, 'getComments', function (annotation, belong) {
      return [
        {
          index: 1,
          value: '/**\n* test row 1\n * test row 2\n* test row 3\n*/'
        }
      ];
    });
    expect(function () {
      visitor.addAnnotations({}, {});
    }).to.be.throw('');
    expect(console.log.calledWith({})).to.be.true;
    mm.restore();
  });

  it('base : findComments should be ok', function () {
    const visitor = new BaseVisitor({}, 'php');
    visitor.commentsSet = [];
    mm(visitor, 'getComments', function (annotation, belong) {
      return [
        {
          index: 1,
          value: '/**\n* test row 1\n * test row 2\n* test row 3\n*/'
        }
      ];
    });
    expect(function () {
      visitor.findComments({}, {});
    }).to.be.throw('');
    expect(console.log.calledWith({})).to.be.true;
    mm.restore();
  });

  it('code : initProp should be ok', function () {
    const obj = new ObjectItem();
    const code = new CodeVisitor({}, 'php');
    code.getCombinator();
    mm(code, 'getBackComments', function (annotation, belong) {
      return [
        {
          index: 1,
          value: '/**\n* test row 1\n * test row 2\n* test row 3\n*/'
        }
      ];
    });
    mm(code, 'getFrontComments', function (annotation, belong) {
      return [
        {
          index: 1,
          value: '/**\n* test row 1\n * test row 2\n* test row 3\n*/'
        }
      ];
    });

    code.initProp(obj, [
      {
        vid: {
          lexeme: 'test'
        },
        value: {
          type: 'array',
          subType: {
            lexeme: 'SubModel'
          }
        },
        tokenRange: [1, 100]
      },
      {
        vid: {
          lexeme: 'test'
        },
        value: {
          type: 'array',
          subType: {
            lexeme: 'SubModel'
          }
        },
        tokenRange: [1, 100]
      }
    ]);
    expect(code.getCombinator().includeModelList).to.be.eql([
      { 'alias': null, 'import': '\\Alibabacloud\\SDK\\Models\\SubModel' }
    ]);

    code.getCombinator().thirdPackageNamespace = { 'ThirdModule': 'ThirdModuleNamespace' };
    code.getCombinator().thirdPackageClient = { 'ThirdModule': 'ThirdModuleClient' };
    code.initProp(obj, [
      {
        vid: {
          lexeme: 'moduleProp'
        },
        value: {
          idType: 'module',
          type: 'ThirdModule'
        }
      }
    ]);
    expect(code.getCombinator().includeList).to.be.eql([
      { 'alias': null, 'import': '\\ThirdModuleNamespace\\ThirdModuleClient' }
    ]);

    code.initProp(obj, [{
      vid: {
        lexeme: 'modelProp'
      },
      value: {
        idType: 'model',
        type: 'ModelType',
        returnType: {
          lexeme: 'ModelType'
        }
      }
    }]);
    expect(code.getCombinator().includeModelList).to.be.eql([
      { 'alias': null, 'import': '\\Alibabacloud\\SDK\\Models\\SubModel' },
      { 'alias': null, 'import': '\\Alibabacloud\\SDK\\Models\\ModelType' }
    ]);

    const invalidPropItem = {
      vid: {
        lexeme: 'modelProp'
      },
      value: {
        idType: 'model',
        type: 'ModelType'
      }
    };
    expect(function () {
      code.initProp(obj, [invalidPropItem]);
    }).to.be.throw('');
    expect(console.log.calledWith(invalidPropItem)).to.be.true;
    mm.restore();
  });

  it('code : visitInitBody should be ok', function () {
    const code = new CodeVisitor({}, 'php');
    code.object = new ObjectItem();
    mm(code.getCombinator(), 'addModelInclude', function (modelName) {
      expect(modelName).to.be.eql('modelType');
    });
    mm(code.getCombinator(), 'addInclude', function (className) {
      return className;
    });
    code.langConfig.baseClient = 'BaseClient';
    let ast = {
      moduleBody: {
        nodes: [{
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
        }]
      }
    };
    code.visitInitBody(ast);
    expect(code.object.extends).to.be.eql(['BaseClient']);

    code.langConfig.baseClient = ['BaseClient', 'BaseClient2'];
    code.visitInitBody(ast);
    expect(code.object.extends).to.be.eql(['BaseClient', 'BaseClient2']);

    code.langConfig.baseClient = null;
    code.visitInitBody(ast);
    mm.restore();
  });

  it('code : visitWrap should be ok', function () {
    const code = new CodeVisitor({}, 'php');
    mm(code, 'visit', function (func) {
      expect(func.name).to.be.eql('test');
      return;
    });
    code.visitWrap({
      wrapName: {
        lexeme: 'test'
      }
    }, {});
  });

  it('code : visit should be ok', function () {
    const code = new CodeVisitor({}, 'php');
    code.object = new ObjectItem();
    const funcItem = new FuncItem();
    expect(function () {
      code.visit(funcItem, {
        params: { params: [] }
      }, {}, {});
    }).to.be.throw('Unsupported ast.returnType');

    mm(code.getCombinator(), 'addInclude', function (className) {
      return className;
    });
    code.visit(funcItem, {
      params: { params: [] },
      returnType: {
        idType: 'module',
        lexeme: 'object',
      }
    }, {}, {});
    code.visit(funcItem, {
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
    }, {}, {});

    mm.restore();
  });

  it('code : requestBody should be ok', function () {
    const code = new CodeVisitor({}, 'php');
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

  it('code : renderGrammerValue should be ok', function () {
    const code = new CodeVisitor({}, 'php');
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

    mm(code.getCombinator(), 'addModelInclude', function (modelName) {
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

  it('code : visitStmt should be ok', function () {
    const code = new CodeVisitor({}, 'php');
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
    mm(code.getCombinator(), 'addInclude', function (className) {
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

  it('code : visitIfConfition should be ok', function () {
    const code = new CodeVisitor({}, 'php');
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

  it('code : visitIfElse should be ok', function () {
    const code = new CodeVisitor({}, 'php');
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

  it('model : init should be ok', function () {
    const model = new ModelVisitor({}, 'php');
    model.langConfig = {
      modelDirName: 'Models',
      model: {
        dir: ''
      }
    };
    model.init({
      modelName: { lexeme: 'TestModel' }
    }, 0);
    expect(model.langConfig.model.dir).to.be.eql('Models');
    expect(model.layer).to.be.eql('Models');
  });

  it('model : initProp should be ok', function () {
    const model = new ModelVisitor({}, 'php');
    const object = new ObjectItem();

    expect(function () {
      model.initProp(object, [{
        fieldValue: {
          fieldType: null
        }
      }]);
    }).to.be.throw('');

    mm(model.getCombinator(), 'addModelInclude', function (modelName) {
      expect(modelName).to.be.eql('a');
    });
    model.initProp(object, [{
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
    model.initProp(object, [{
      type: 'modelField',
      fieldValue: { fieldType: 'array', fieldItemType: { lexeme: '' } },
      fieldName: { lexeme: 'test' },
      attrs: []
    }]);
    expect(object.body.filter(item => item instanceof PropItem).length).to.be.eql(2);
    mm.restore();
  });

  it('model : findSubModelsUsed should be ok', function () {
    const model = new ModelVisitor({}, 'php');
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

  it('model : visit should be ok', function () {
    const model = new ModelVisitor({}, 'php');
    mm(model, 'init', function () { return; });
    mm(model.getCombinator(), 'init', function () { return; });
    mm(model, 'done', function () { return; });
    const prop = new PropItem();
    prop.name = 'testProp';
    mm(model, 'getBetweenComments', function () { return;});
    mm(model, 'resolveAnnotations', function () { return [prop];});
    model.visit({
      type: 'model',
      modelName: { lexeme: 'modelName' },
      modelBody: { nodes: [] },
      tokenRange: [1, 100]
    }, 0, {}, {});
    expect(model.object.body.filter(item => item instanceof PropItem).length).to.be.eql(1);
  });
});