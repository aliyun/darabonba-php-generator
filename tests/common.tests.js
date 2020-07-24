'use strict';

const fs = require('fs');
const mm = require('mm');
const expect = require('chai').expect;
require('mocha-sinon');

const {
  Symbol,
  Modify
} = require('../src/langs/common/enum');

const {
  Counter,
  Grammer,
  GrammerCall,
  GrammerValue,
  GrammerSymbol,
  GrammerThrows,
  GrammerNewLine,
  GrammerCondition,
  NoteItem,
  ObjectItem,
  TypeObject,
} = require('../src/langs/common/items');

const PackageInfo = require('../src/langs/common/package_info');

const Combinator = require('../src/langs/common/combinator');
const Emitter = require('../src/lib/emitter');

describe('common : enum should be ok', function () {
  beforeEach(function () {
    this.sinon.stub(console, 'log');
  });

  it('enum should be ok', function () {
    // test Symbol enum
    expect(Symbol.eq()).to.be.eql('EQ');
    expect(Symbol.not()).to.be.eql('NOT');
    expect(Symbol.multi()).to.be.eql('MULTI');
    expect(Symbol.div()).to.be.eql('DIV');
    expect(Symbol.power()).to.be.eql('POWER');
    expect(Symbol.greaterEq()).to.be.eql('GREATER_EQ');
    expect(Symbol.less()).to.be.eql('LESS');
    expect(Symbol.lessEq()).to.be.eql('LESS_EQ');
    expect(Symbol.judge()).to.be.eql('JUDGE');
    expect(Symbol.risk()).to.be.eql('RISK');

    // test Modify enum
    expect(Modify.private()).to.be.eql('PRIVATE');
    expect(Modify.internal()).to.be.eql('INTERNAL');
    expect(Modify.final()).to.be.eql('FINAL');
    expect(Modify.abstract()).to.be.eql('ABSTRACT');
  });
});

describe('common : counter should be ok', function () {
  beforeEach(function () {
    this.sinon.stub(console, 'log');
  });

  it('counter should be ok', function () {
    const counter = new Counter(-2);
    expect(counter.index).to.be.eql(-2);
    counter.step(2, 10);
    expect(counter.index).to.be.eql(18);
    counter.once();
    expect(counter.index).to.be.eql(19);
  });
});

describe('common : items should be ok', function () {
  beforeEach(function () {
    this.sinon.stub(console, 'log');
  });

  it('items : Item.getItemByIndex&getParent should be ok', function () {
    const parentGrammer = new Grammer();
    const childGrammer = new GrammerNewLine();
    const childGrammer2 = new GrammerSymbol();
    childGrammer.belong = parentGrammer.index;
    childGrammer2.belong = parentGrammer.index;

    expect(function () {
      childGrammer.getItemByIndex(-100);
    }).to.be.throw('Index [-100] not exist in ItemSet');

    expect(childGrammer.getItemByIndex(parentGrammer.index)).to.be.eql(parentGrammer);
    expect(childGrammer.getParent()).to.be.eql(parentGrammer);
    expect(childGrammer2.getParent()).to.be.eql(parentGrammer);
  });

  it('items : GrammerCall.addPath should be ok', function () {
    const call = new GrammerCall();
    expect(function () {
      call.addPath({ type: 'invalid-type' });
    }).to.be.throw('invalid-type path.type should be parent|object|object_static|call|call_static|prop|prop_static|map|list');
  });

  it('items : NoteItem should be ok', function () {
    let noteItem = new NoteItem('', null);
    expect(noteItem.type).to.be.eql('null');
    expect(function () {
      noteItem = new NoteItem('', {});
    }).to.be.throw('Not suppoted type : object  [number,string,boolean]');
  });

  it('items : ObjectItem should be ok', function () {
    const objectItem = new ObjectItem('client');
    expect(function () {
      objectItem.addBodyNode(null);
    }).to.be.throw('Only suppoted PropItem | FuncItem | ObjectItem | AnnotationItem | ConstructItem');
    objectItem.addModify(Modify.private());
    expect(objectItem.modify.indexOf('PRIVATE') !== -1).to.be.true;
  });
});

describe('package_info should be ok', function () {
  beforeEach(function () {
    this.sinon.stub(console, 'log');
  });

  it('package_info : render should be ok', function () {
    const packageInfo = new PackageInfo();
    expect(
      packageInfo.render('${key}', { key: 'render-key' })
    ).to.be.eql('render-key');
  });

  it('package_info : checkParams should be ok', function () {
    const packageInfo = new PackageInfo();
    const param = { key: 'value' };
    packageInfo.checkParams(param);
    try {
      packageInfo.checkParams(param, ['someRequeiredKey']);
    } catch (e) {
      expect(e.message).to.be.eql('need config packageInfo.someRequeiredKey');
      expect(console.log.calledWith(param)).to.be.true;
    }
  });

  it('package_info : renderAuto should be ok', function () {
    const packageInfo = new PackageInfo();
    mm(fs, 'readFileSync', function (filename) {
      return '${key}';
    });
    mm(fs, 'existsSync', function (filename) {
      return true;
    });
    mm(fs, 'writeFileSync', function (filename, content) {
      return true;
    });
    // not throw exception
    packageInfo.renderAuto('/tmp/template-file-path.tmpl', '/tmp/target-path.tmp', { key: 'RenderAutoKey' });

    mm(fs, 'existsSync', function (filename) {
      return false;
    });
    mm(fs, 'mkdirSync', function (filename) {
      return true;
    });
    // not throw exception
    packageInfo.renderAuto('/tmp/template-file-path.tmpl', '/tmp/target-path.tmp', { key: 'RenderAutoKey' });
  });

  it('package_info : resolveOutputDir should be ok', function () {
    const packageInfo = new PackageInfo();
    packageInfo.config = { dir: '/tmp/' };
    expect(packageInfo.resolveOutputDir({ outputDir: null }, './')).to.be.eql('/tmp/');

    mm(fs, 'existsSync', function (filename) {
      return false;
    });
    expect(packageInfo.resolveOutputDir({ outputDir: 'output/' }, './')).to.be.eql('/tmp/output/');
    mm.restore();
  });
});

describe('combinator should be ok', function () {
  beforeEach(function () {
    this.sinon.stub(console, 'log');
  });

  it('combine should be ok', function () {
    const combinator = new Combinator({ tea: {} });
    expect(function () {
      combinator.combine([new ObjectItem('client'), 'not ObjectItem']);
    }).to.be.throw('Only supported ObjectItem.');
  });

  it('coreClass should be ok', function () {
    const combinator = new Combinator({ tea: {} });
    expect(function () {
      combinator.coreClass('test');
    }).to.be.throw('Unsupported core class name : test');
  });

  it('combinator : findThrows should be ok', function () {
    const combinator = new Combinator();
    const grammer = new GrammerCondition();
    expect(combinator.findThrows(grammer).length).to.be.eql(0);
    grammer.addBodyNode(new GrammerThrows(new TypeObject('exception')));
    expect(combinator.findThrows(grammer).length).to.be.eql(1);
    const childGrammer = new GrammerCondition();
    childGrammer.addBodyNode(new GrammerThrows(new TypeObject('exception')));
    grammer.addBodyNode(childGrammer);
    expect(combinator.findThrows(grammer).length).to.be.eql(2);
  });

  it('combinator : unimpelemented should be ok', function () {
    const combinator = new Combinator();
    expect(function () {
      combinator.init({});
    }).to.be.throw('unimpelemented');
    expect(function () {
      combinator.addModelInclude('foo');
    }).to.be.throw('unimpelemented');
    expect(function () {
      combinator.addInclude('foo');
    }).to.be.throw('unimpelemented');
  });

  it('combinator : systemfunc should be ok', function () {
    const combinator = new Combinator();
    const emitter = new Emitter();
    const gram = new GrammerCall();
    expect(function () {
      combinator.systemfunc(emitter, gram);
    }).to.be.throw('Invalid path. path list cannot be empty.');
    gram.addPath({ type: 'call', name: 'test' });
    expect(function () {
      combinator.systemfunc(emitter, gram);
    }).to.be.throw('unimpelemented sysTest(emitter, gram){} method\n');

    combinator.sysTest = function () {
      console.log('test call combinator.sysTest');
      return true;
    };
    combinator.systemfunc(emitter, gram);
    expect(console.log.calledWith('test call combinator.sysTest')).to.be.true;
  });

  it('combinator : grammerNewLine should be ok', function () {
    const combinator = new Combinator();
    const emitter = new Emitter();
    emitter.output = '';
    const grammerNewLine = new GrammerNewLine(2);
    combinator.grammerNewLine(emitter, grammerNewLine);
    expect(emitter.output).to.be.eql(emitter.eol + emitter.eol);
  });

  it('combinator : emitGrammerValue should be ok', function () {
    const combinator = new Combinator();
    combinator.grammerValue = function (emitter) {
      emitter.emit('test');
    };
    const grammerValue = new GrammerValue();
    expect(combinator.emitGrammerValue(grammerValue)).to.be.eql('test');
  });

  it('combinator : grammer should be ok', function () {
    const combinator = new Combinator();
    const emitter = new Emitter();

    emitter.output = '';
    const obj = new ObjectItem('client');
    expect(function () {
      combinator.grammer(emitter, obj);
    }).to.be.throw('Unsupported');
    expect(console.log.calledWith(obj)).to.be.true;

    expect(function () {
      combinator.grammer(emitter, new GrammerCondition());
    }).to.be.throw('Unimpelemented : grammerCondition');
  });
});
