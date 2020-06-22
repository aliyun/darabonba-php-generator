'use strict';

const debug = require('../src/lib/debug');
const expect = require('chai').expect;
require('mocha-sinon');

describe('debug tests', function () {
  // eslint-disable-next-line no-undef
  beforeEach(function () {
    this.sinon.stub(console, 'log');
    this.sinon.stub(process, 'exit');
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
});