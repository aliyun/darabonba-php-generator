'use strict';

const fs = require('fs');
const path = require('path');
const os = require('os');

class Emitter {
  constructor(option = {}) {
    this.config = {
      indent: '    ',
      eol: 'auto',    // \n | \r\n | auto
      dir: '',
      layer: '',
      filename: '',
      ext: '',
      ...option
    };

    this.output = '';

    this.eol = this.config.eol === 'auto' ? os.EOL : this.config.eol;
  }

  indent(level) {
    return this.config.indent.repeat(level);
  }

  emit(str = '', level) {
    this.output += this.indent(level) + str;
    return this;
  }

  emitln(str = '', level) {
    this.emit(str + this.eol, level);
    return this;
  }

  emits(level, ...strs) {
    strs.forEach(str => {
      this.emitln(str, level);
    });
    return this;
  }

  erase(lenght) {
    this.output = this.output.substring(0, this.output.length - lenght);
    return this;
  }

  savePath() {
    return path.join(
      this.config.dir,
      this.config.layer.split('.').join(path.sep),
      this.config.filename + this.config.ext
    );
  }

  save(append = false) {
    if (!this.config.dir) {
      throw new Error('`option.dir` should not be empty');
    }

    if (!this.config.filename) {
      throw new Error('filename cannot be empty');
    }

    const targetPath = this.savePath();

    if (!fs.existsSync(path.dirname(targetPath))) {
      fs.mkdirSync(path.dirname(targetPath), {
        recursive: true
      });
    }

    if (append && fs.existsSync(targetPath)) {
      fs.appendFileSync(targetPath, this.output);
    } else {
      fs.writeFileSync(targetPath, this.output);
    }

    this.output = '';

    const consoleInfo = append ? 'append file : ' : 'save path : ';
    if (this.config.showInfo) {
      console.log('');
      console.log(`\x1b[32${consoleInfo}${path.resolve(targetPath)}\x1b[0m`);
      console.log('');
    }
  }
}

module.exports = Emitter;
