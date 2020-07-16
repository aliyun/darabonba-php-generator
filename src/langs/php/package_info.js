'use strict';

const path = require('path');
const fs = require('fs');
const BasePackageInfo = require('../common/package_info');

const { _deepClone } = require('../../lib/helper');

const OPTION_LOCAL = 1;   // use local tmpl file to render content
const OPTION_SOURCE = 2;  // config by Darafile.{lang}.packageInfo
const OPTION_RENDER = 4;  // render content from tmpl
const OPTION_UPDATE = 8;  // update if file already exist

// file_name : OPTIONS
const files = {
  '.gitignore': OPTION_LOCAL,
  '.php_cs.dist': OPTION_LOCAL,
  'composer.json': OPTION_LOCAL | OPTION_RENDER | OPTION_SOURCE | OPTION_UPDATE,
  'LICENSE': OPTION_SOURCE,
  'README-CN.md': OPTION_SOURCE | OPTION_RENDER,
  'README.md': OPTION_SOURCE | OPTION_RENDER,
  'phpunit.xml': OPTION_SOURCE,
  'autoload.php': OPTION_LOCAL | OPTION_RENDER
};

class PackageInfo extends BasePackageInfo {
  emit(packageInfo, requirePackage) {
    const config = _deepClone(this.config);
    let outputDir = this.resolveOutputDir(packageInfo, '');
    this.checkParams(packageInfo, ['name', 'desc', 'github']);
    const params = {
      name: packageInfo.name,
      desc: packageInfo.desc,
      github: packageInfo.github,
      namespace: config.package.split('.').join('\\\\')
    };
    if (config.withTest) {
      if (!fs.existsSync(path.join(config.dir, 'tests'))) {
        fs.mkdirSync(path.join(config.dir, 'tests'), { recursive: true });
      }
      fs.writeFileSync(
        path.join(config.dir, 'tests', 'bootstrap.php'),
        fs.readFileSync(path.join(__dirname, './files/bootstrap.php.tmpl'), 'utf-8')
      );
    }
    Object.keys(files).forEach(filename => {
      let content = '';
      let optional = files[filename];
      if (optional & OPTION_UPDATE && fs.existsSync(path.join(outputDir, filename))) {
        content = fs.readFileSync(path.join(outputDir, filename), 'utf-8');
      } else if (optional & OPTION_SOURCE && packageInfo.files && packageInfo.files[filename]) {
        let filepath = path.isAbsolute(packageInfo.files[filename]) ?
          packageInfo.files[filename] : path.join(config.pkgDir, packageInfo.files[filename]);
        if (!fs.existsSync(filepath)) {
          return;
        }
        content = fs.readFileSync(filepath, 'utf-8');
      } else if (optional & OPTION_LOCAL) {
        content = fs.readFileSync(path.join(__dirname, './files/' + filename + '.tmpl'), 'utf-8');
      }
      if (content !== '') {
        if (optional & OPTION_RENDER) {
          content = this.render(content, params);
        }
        if (filename === 'composer.json') {
          // extra require
          let json = JSON.parse(content);
          if (requirePackage) {
            requirePackage.forEach(item => {
              let [p, v] = item.split(':');
              json.require[p] = v;
            });
          }
          if (config.maintainers) {
            json.authors = [];
            config.maintainers.forEach(maintainer => {
              let name = maintainer.name ? maintainer.name : '';
              let email = maintainer.email ? maintainer.email : '';
              json.authors.push({ name: name, email: email });
            });
          }
          content = JSON.stringify(json, null, 2);
        }
        fs.writeFileSync(path.join(outputDir, filename), content);
      }
    });
  }
}

module.exports = PackageInfo;