'use strict';

const path = require('path');
const fs = require('fs');
const BasePackageInfo = require('../common/package_info');

const {
  _render,
  _deepClone,
  _toSnakeCase,
  _isExcludePackage
} = require('../../lib/helper');

const OPTION_LOCAL = 0b1;   // use local tmpl file to render content
const OPTION_SOURCE = 0b10;  // config by Darafile.{lang}.packageInfo
const OPTION_RENDER = 0b100;  // render content from tmpl
const OPTION_UPDATE = 0b1000;  // update if file already exist

// file_name : OPTIONS
const files = {
  'gitignore': {
    filename: '.gitignore',
    mode: OPTION_LOCAL
  },
  'php_cs': {
    filename: '.php_cs.dist',
    mode: OPTION_LOCAL,
  },
  'composer': {
    filename: 'composer.json',
    mode: OPTION_LOCAL | OPTION_RENDER | OPTION_SOURCE | OPTION_UPDATE
  },
  'LICENSE': {
    filename: 'LICENSE',
    mode: OPTION_SOURCE
  },
  'readme_cn': {
    filename: 'README-CN.md',
    mode: OPTION_SOURCE | OPTION_RENDER
  },
  'readme': {
    filename: 'README.md',
    mode: OPTION_SOURCE | OPTION_RENDER,
  },
  'phpunit': {
    filename: 'phpunit.xml',
    mode: OPTION_SOURCE
  },
  'autoload': {
    filename: 'autoload.php',
    mode: OPTION_LOCAL | OPTION_RENDER
  }
};

class PackageInfo extends BasePackageInfo {
  emit() {
    const dependencies = this.dependencies;
    const packageInfo = this.config.packageInfo;
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
    Object.keys(files).forEach(key => {
      const item = files[key];
      const filename = item.filename;
      const optional = item.mode;
      let content = '';
      if (optional & OPTION_UPDATE && fs.existsSync(path.join(outputDir, filename))) {
        content = fs.readFileSync(path.join(outputDir, filename), 'utf-8');
      } else if (optional & OPTION_SOURCE && packageInfo.files && packageInfo.files[key]) {
        let filepath = path.isAbsolute(packageInfo.files[key]) ?
          packageInfo.files[key] : path.join(config.pkgDir, packageInfo.files[key]);
        if (!fs.existsSync(filepath)) {
          return;
        }
        content = fs.readFileSync(filepath, 'utf-8');
      } else if (optional & OPTION_LOCAL) {
        content = fs.readFileSync(path.join(__dirname, './files/' + filename + '.tmpl'), 'utf-8');
      }
      if (content !== '') {
        if (optional & OPTION_RENDER) {
          content = _render(content, params);
        }
        if (filename === 'composer.json') {
          // extra require
          let json = JSON.parse(content);
          Object.keys(dependencies).forEach(key => {
            const item = dependencies[key].meta;
            let name;
            let version = '*';
            if (item.releases && item.releases.php) {
              let [p, v] = item.releases.php.split(':');
              name = p;
              version = v;
            } else {
              if (item.php && item.php.packageInfo && item.php.packageInfo.name) {
                name = item.php.packageInfo.name;
              } else {
                name = `${item.scope}/${_toSnakeCase(item.name)}`;
              }
            }
            if (_isExcludePackage(item.scope, item.name)) {
              if (json.require[name]) {
                delete json.require[name];
              }
              return;
            }
            if (version && version[0] && version[0] !== '^') {
              version = '^' + version;
            }
            json.require[name] = version;
          });
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
