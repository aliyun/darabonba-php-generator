'use strict';

const os = require('os');

var count = 0;

function dump(...data) {
  if (data && data.length) {
    data.forEach(d => console.log(d));
  }
}

function halt(...data) {
  let stack = new Error().stack;
  let tmp = stack.split(os.EOL);
  let local = tmp[2].indexOf('at Object.jump') > -1 ? tmp[3] : tmp[2];
  process.stdout.write(`\x1b[33mhalt ${local.trim()}\x1b[0m${os.EOL}`);
  this.dump(...data);
  process.exit(-1);
}

function jump(jumpNumber = 0, ...data) {
  if (count === jumpNumber) {
    count = 0;
    this.halt(...data);
  } else {
    count++;
  }
  return count;
}

function stack(...data) {
  let msg = '';
  if (data[0] && typeof data[0] === 'string') {
    msg = data[0];
    data = data.slice(1);
  }
  this.dump(...data);
  throw new Error(msg);
}

function warning(...data) {
  let msg = '';
  if (data[0] && typeof data[0] === 'string') {
    msg = data[0];
    data = data.slice(1);
  }
  this.dump(...data);
  if (msg.length) {
    process.stdout.write(`\x1b[33m${os.EOL}[WARNING] ${msg}\x1b[0m${os.EOL}`);
  }
}

module.exports = {
  dump,
  halt,
  stack,
  jump,
  warning
};
