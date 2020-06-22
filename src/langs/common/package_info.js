'use strict';

const fs = require('fs');
const path = require('path');
const debug = require('../../lib/debug');

class BasePackageInfo {
  constructor(config) {
    this.config = config;
    this.outputDir = '';
  }

  render(tamplate, params = {}) {
    Object.keys(params).forEach((key) => {
      tamplate = tamplate.split('${' + key + '}').join(params[key]);
    });
    return tamplate;
  }

  renderAuto(templatePath, targetPath, params) {
    let content = fs.readFileSync(templatePath).toString();
    content = this.render(content, params);
    if (!fs.existsSync(path.dirname(targetPath))) {
      fs.mkdirSync(path.dirname(targetPath), {
        recursive: true
      });
    }
    fs.writeFileSync(targetPath, content);
  }

  resolveOutputDir(packageInfo, append = '../') {
    let outputDir = path.join(this.config.dir, append);
    if (packageInfo.outputDir) {
      outputDir = path.join(outputDir, packageInfo.outputDir);
    }
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, {
        recursive: true
      });
    }
    return outputDir;
  }

  checkParams(packageInfo, validateParam = []) {
    validateParam.forEach(key => {
      if (typeof packageInfo[key] === 'undefined') {
        debug.stack('need config packageInfo.' + key, packageInfo);
      }
    });
  }
}

module.exports = BasePackageInfo;