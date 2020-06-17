'use strict';

var count = 0;

function dump(...data) {
  data.forEach(d => {
    console.log(d);
  });
}

function halt(...data) {
  this.dump(...data);
  process.exit(-1);
}

function jump(jumpNumber = 0, ...data) {
  if (count === jumpNumber) {
    this.halt(...data);
    count = 0;
  } else {
    count++;
  }
  return count;
}

function stack(...data) {
  let msg = '';
  if (data[0] && data[0] instanceof String) {
    msg = data[0];
    data = data.slice(1);
  }
  this.dump(...data);
  throw new Error(msg);
}

module.exports = {
  dump,
  halt,
  stack,
  jump
};
