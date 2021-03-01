'use strict';

const fs = require('fs');
const path = require('path');
const { debug } = require('@axiosleo/cli-tool');
const mm = require('mm');
const expect = require('chai').expect;
const Emitter = require('../src/lib/emitter');
const os = require('os');

require('mocha-sinon');

const {
  _subModelName,
  _string,
  _config,
  _avoidKeywords,
  _modify,
  _symbol,
} = require('../src/lib/helper');
const { _snake_case } = require('@axiosleo/cli-tool/src/helper/str');

describe('debug should be ok', function () {
  beforeEach(function () {
    this.sinon.stub(console, 'log');
    this.sinon.stub(process, 'exit');
    this.sinon.stub(fs, 'mkdirSync');
    this.sinon.stub(fs, 'writeFileSync');
    this.sinon.stub(fs, 'appendFileSync');
    this.sinon.stub(fs, 'existsSync');
  });

  it('dump should be ok', function () {
    debug.dump(null, 1, '1', 1.11111);
    expect(console.log.calledWith('foo')).to.be.false;
    expect(console.log.calledWith(null)).to.be.true;
    expect(console.log.calledWith(1)).to.be.true;
    expect(console.log.calledWith('1')).to.be.true;
    expect(console.log.calledWith(1.11111)).to.be.true;
    expect(process.exit.calledWith(-1)).to.be.false;
  });

  it('halt should be ok', function () {
    debug.halt(null, 1, '1', 1.11111);
    expect(console.log.calledWith('foo')).to.be.false;
    expect(console.log.calledWith(null)).to.be.true;
    expect(console.log.calledWith(1)).to.be.true;
    expect(console.log.calledWith('1')).to.be.true;
    expect(console.log.calledWith(1.11111)).to.be.true;
    expect(process.exit.calledWith(-1)).to.be.true;
  });

  it('jump should be ok', function () {
    for (let i = 0; i < 3; i++) {
      debug.jump(1, `jump output : ${i}`);
    }
    expect(console.log.calledWith('jump output : 0')).to.be.false;
    expect(console.log.calledWith('jump output : 1')).to.be.true;
    expect(console.log.calledWith('jump output : 2')).to.be.false;
    expect(process.exit.calledWith(-1)).to.be.true;
  });

  it('warning should be ok', function () {
    debug.warning('this is warning message');
    expect(console.log.calledWith(`\x1b[33m${os.EOL}[WARNING] this is warning message\x1b[0m${os.EOL}`)).to.be.false;
    expect(process.exit.calledWith(-1)).to.be.false;
  });

  it('stack should be ok', function () {
    try {
      debug.stack('called debug stack with message', 'data1', 'data2');
    } catch (e) {
      expect(e.message).to.be.eql('called debug stack with message');
      expect(console.log.calledWith('called debug stack with message')).to.be.false;
      expect(console.log.calledWith('data1')).to.be.true;
      expect(console.log.calledWith('data2')).to.be.true;
      expect(process.exit.calledWith(-1)).to.be.false;
    }

    try {
      debug.stack(1, 'called debug stack without message', 'some data');
    } catch (e) {
      expect(e.message).to.be.eql('');
      expect(console.log.calledWith(1)).to.be.true;
      expect(console.log.calledWith('called debug stack without message')).to.be.true;
      expect(console.log.calledWith('some data')).to.be.true;
      expect(process.exit.calledWith(-1)).to.be.false;
    }
  });
});

describe('emitter should be ok', function () {
  beforeEach(function () {
    this.sinon.stub(console, 'log');
    this.sinon.stub(process, 'exit');
    this.sinon.stub(fs, 'mkdirSync');
    this.sinon.stub(fs, 'writeFileSync');
    this.sinon.stub(fs, 'appendFileSync');
    this.sinon.stub(fs, 'existsSync');
  });

  it('indent should be ok', function () {
    const emitter = new Emitter();
    expect(emitter.indent(1)).to.be.eql('    ');
  });

  it('emit should be ok', function () {
    const emitter = new Emitter();
    emitter.emit('emit some string');
    expect(emitter.output).to.be.eql('emit some string');
  });

  it('emitln should be ok', function () {
    const emitter = new Emitter();
    emitter.emitln('emitln some string');
    expect(emitter.output).to.be.eql('emitln some string' + emitter.eol);
  });

  it('emits should be ok', function () {
    const emitter = new Emitter();
    emitter.emits(1);
    expect(emitter.output).to.be.eql('');
    emitter.emits(0, 'row1', 'row2');
    expect(emitter.output).to.be.eql('row1' + emitter.eol + 'row2' + emitter.eol);
  });

  it('currRow should be ok', function () {
    const emitter = new Emitter();
    emitter.emit('row one');
    expect(emitter.currRow()).to.be.eql('row one');
    emitter.emitln();
    expect(emitter.currRow()).to.be.eql('row one');
    emitter.emit('row two');
    expect(emitter.currRow()).to.be.eql('row two');
  });

  it('savePath should be ok', function () {
    const emitter = new Emitter({
      dir: '/tmp/',
      layer: 'a.b.c',
      filename: 'filename',
      ext: '.tmp'
    });
    expect(emitter.savePath()).to.be.eql('/tmp/a/b/c/filename.tmp');
  });

  it('save should be ok', function () {
    const emitter = new Emitter();
    try {
      emitter.save();
    } catch (e) {
      expect(e.message).to.be.eql('`option.dir` should not be empty');
    }
    emitter.config.dir = '/tmp/';
    try {
      emitter.save();
    } catch (e) {
      expect(e.message).to.be.eql('filename cannot be empty');
    }
    emitter.config.filename = 'filename';
    emitter.config.ext = '.tmp';

    emitter.emit('test');

    emitter.save();
    emitter.emit();
    mm(fs, 'existsSync', function (filename) {
      return true;
    });
    emitter.save(true);
    mm.restore();

    // show emit info
    emitter.config.showInfo = true;
    emitter.emit('test');
    emitter.save();
    const filename = emitter.savePath();

    expect(filename).to.be.eql('/tmp/filename.tmp');
  });
});

describe('helper tests', function () {
  it('_subModelName should be ok', function () {
    expect(_subModelName('test.model.name')).to.be.eql('TestModelName');
  });

  it('_string should be ok', function () {
    const obj = {
      string: 'test'
    };
    expect(_string(obj)).to.be.eql('test');
  });

  it('_avoidKeywords should be ok', function () {
    _config({ keywords: ['key'] });
    expect(_avoidKeywords('key')).to.be.eql('key_');
  });

  it('_modify should be ok', function () {
    _config({
      modifyOrder: [
        'PRIVATE',
        'PROTECTED',
        'PUBLIC',
        'FINAL',
        'ABSTRACT',
        'STATIC'
      ]
    });
    expect(_modify('PRIVATE')).to.be.eql('private');
  });

  it('_symbol should be ok', function () {
    _config({ symbolMap: { 'ASSIGN': '=' } });
    expect(function () {
      _symbol('InvalidSymbol');
    }).to.be.throw('Unsupported symbol : InvalidSymbol');

    expect(_symbol('ASSIGN')).to.be.eql('=');
  });

  it('_toSnakeCase should be ok', function () {
    expect(_snake_case('TestABC')).to.be.eql('test_abc');
    expect(_snake_case(null)).to.be.eql('');
    expect(_snake_case('SLS')).to.be.eql('sls');
    expect(_snake_case('_runtime')).to.be.eql('_runtime');
    expect(_snake_case('TT123')).to.be.eql('tt123');
    expect(_snake_case('fooBar')).to.be.eql('foo_bar');
  });

  it('_dir should be ok', function () { 
    mm(fs, 'existsSync', function (filename) {
      return false;
    });
    mm(path, 'dirname', function (filename) {
      return '';
    });
    mm(fs, 'mkdirSync', function (filename, option = {}) { 
      return true;
    });
    mm.restore();
  });
});
