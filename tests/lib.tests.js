'use strict';

const fs = require('fs');
const debug = require('../src/lib/debug');
const mm = require('mm');
const expect = require('chai').expect;
const Emitter = require('../src/lib/emitter');
require('mocha-sinon');

const {
  _camelCase,
  _subModelName,
  _string,
} = require('../src/lib/helper');

describe('lib tests', function () {
  beforeEach(function () {
    this.sinon.stub(console, 'log');
    this.sinon.stub(process, 'exit');
    this.sinon.stub(fs, 'mkdirSync');
    this.sinon.stub(fs, 'writeFileSync');
    this.sinon.stub(fs, 'appendFileSync');
    this.sinon.stub(fs, 'existsSync');
  });

  it('debug.dump should be ok', function () {
    debug.dump(null, 1, '1', 1.11111);
    expect(console.log.calledWith('foo')).to.be.false;
    expect(console.log.calledWith(null)).to.be.true;
    expect(console.log.calledWith(1)).to.be.true;
    expect(console.log.calledWith('1')).to.be.true;
    expect(console.log.calledWith(1.11111)).to.be.true;
    expect(process.exit.calledWith(-1)).to.be.false;
  });

  it('debug.halt should be ok', function () {
    debug.halt(null, 1, '1', 1.11111);
    expect(console.log.calledWith('foo')).to.be.false;
    expect(console.log.calledWith(null)).to.be.true;
    expect(console.log.calledWith(1)).to.be.true;
    expect(console.log.calledWith('1')).to.be.true;
    expect(console.log.calledWith(1.11111)).to.be.true;
    expect(process.exit.calledWith(-1)).to.be.true;
  });

  it('debug.jump should be ok', function () {
    for (let i = 0; i < 3; i++) {
      debug.jump(1, `jump output : ${i}`);
    }
    expect(console.log.calledWith('jump output : 0')).to.be.false;
    expect(console.log.calledWith('jump output : 1')).to.be.true;
    expect(console.log.calledWith('jump output : 2')).to.be.false;
    expect(process.exit.calledWith(-1)).to.be.true;
  });

  it('debug.stack should be ok', function () {
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

  it('emitter.indent should be ok', function () {
    const emitter = new Emitter();
    expect(emitter.indent(1)).to.be.eql('    ');
  });

  it('emitter.emit should be ok', function () {
    const emitter = new Emitter();
    emitter.emit('emit some string');
    expect(emitter.output).to.be.eql('emit some string');
  });

  it('emitter.emitln should be ok', function () {
    const emitter = new Emitter();
    emitter.emitln('emitln some string');
    expect(emitter.output).to.be.eql('emitln some string' + emitter.eol);
  });

  it('emitter.emits should be ok', function () {
    const emitter = new Emitter();
    emitter.emits(1);
    expect(emitter.output).to.be.eql('');
    emitter.emits(0, 'row1', 'row2');
    expect(emitter.output).to.be.eql('row1' + emitter.eol + 'row2' + emitter.eol);
  });

  it('emitter.erase should be ok', function () {
    const emitter = new Emitter();
    emitter.emit('full string');
    emitter.erase(3);
    expect(emitter.output).to.be.eql('full str');
  });

  it('emitter.savePath should be ok', function () {
    const emitter = new Emitter({
      dir: '/tmp/',
      layer: 'a.b.c',
      filename: 'filename',
      ext: '.tmp'
    });
    expect(emitter.savePath()).to.be.eql('/tmp/a/b/c/filename.tmp');
  });

  it('emitter.save should be ok', function () {
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
    mm(fs, 'existsSync', function(filename) {
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

  it('helper._camelCase should be ok', function () {
    expect(_camelCase('test_camel_case')).to.be.eql('testCamelCase');
  });

  it('helper._subModelName should be ok', function () {
    expect(_subModelName('test.model.name')).to.be.eql('TestModelName');
  });

  it('helper._string should be ok', function () {
    const obj = {
      string: 'test'
    };
    expect(_string(obj)).to.be.eql('test');
  });
});