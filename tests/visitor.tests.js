'use strict';

const expect = require('chai').expect;
const mm = require('mm');
require('mocha-sinon');
const BaseVisitor = require('../src/visitor/base');
const CodeVisitor = require('../src/visitor/code');
const ModelVisitor = require('../src/visitor/model');

const {
  ObjectItem
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
        }
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
});