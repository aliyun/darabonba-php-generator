'use strict';

const fs = require('fs');
const path = require('path');
const debug = require('../../lib/debug');
const { _render } = require('../../lib/helper');

class BasePackageInfo {
  constructor(config, dependencies) {
    this.config = config;
    this.dependencies = dependencies;
    this.outputDir = '';
  }

  renderAuto(templatePath, targetPath, params = {}) {
    let content = fs.readFileSync(templatePath, 'utf-8');
    this.renderContent(content, targetPath, params);
  }

  renderContent(templateContent, targetPath, params = {}) {
    let content = _render(templateContent, params);
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
