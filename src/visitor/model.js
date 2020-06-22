'use strict';

const assert = require('assert');
const BaseVisitor = require('./base');
const debug = require('../lib/debug');

const {
  AnnotationItem,
  ObjectItem,
  PropItem,
  NoteItem,
} = require('../langs/common/items');

const {
  Modify,
} = require('../langs/common/enum');

const {
  _isBasicType
} = require('../lib/helper');

class ModelVisitor extends BaseVisitor {

  init(ast, level) {
    this.modelName = ast.modelName.lexeme;

    if (this.langConfig.modelDirName) {
      this.langConfig.model.dir = this.langConfig.modelDirName;
      this.layer = this.langConfig.modelDirName;
    } else {
      this.layer = this.langConfig.model.dir;
    }

    this.emitConfig = {
      ...this.emitConfig,
      ext: this.langConfig.ext,
      layer: this.layer,
      filename: this.modelName,
      emitType: 'model'
    };
  }

  visit(ast, level = 0, predefined, globalAst) {
    assert.equal(ast.type, 'model');

    this.init(ast, level);
    const combinator = this.getCombinator();
    combinator.includeList = this.langConfig.model.include;

    combinator.init(globalAst);

    this.object = new ObjectItem();
    this.object.name = ast.modelName.lexeme;

    if (ast.annotation) {
      this.initAnnotation(ast.annotation);
    }
    this.object.topAnnotation.push(new AnnotationItem(
      this.object.index,
      'single',
      this.emitConfig.generateFileInfo
    ));

    this.object.addExtends(combinator.addInclude('$Model'));

    // props
    this.initProp(this.object, ast.modelBody.nodes);
    if (ast.modelBody.nodes.length === 0) {
      if (ast.tokenRange) {
        this.resolveAnnotations(
          this.getBetweenComments(ast.tokenRange[0], ast.tokenRange[1]),
          this.object.index
        ).forEach(c => {
          this.object.addBodyNode(c);
        });
      }
    }

    if (predefined) {
      // for parser 1.0+
      // submodels
      const subModels = Object.keys(predefined).filter((key) => {
        return !key.startsWith('$')
          && predefined[key].type === 'model'
          && key.indexOf('.') !== -1
          && key.indexOf(this.modelName + '.') !== -1;
      }).map((key) => {
        return predefined[key];
      });

      if (subModels.length !== 0) {
        for (let i = 0; i < subModels.length; i++) {
          let subModelObject = new ObjectItem();
          subModelObject.addExtends(combinator.addInclude('$Model'));
          this.initProp(subModelObject, subModels[i].modelBody.nodes);
          this.object.addBodyNode(subModelObject);
        }
      }
    }
    this.done();
  }

  findSubModelsUsed(node, subModelUsed = [], pre = '') {
    let name = node.fieldName.lexeme;
    if (pre !== '') {
      name = pre + '.' + name;
    }
    subModelUsed.push(name);
    node.fieldValue.nodes.forEach(item => {
      if (typeof item.fieldValue.fieldType === 'undefined') {
        this.findSubModelsUsed(item, subModelUsed, name);
      }
    });
  }

  initProp(obj, nodes) {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (typeof node.fieldValue.fieldType === 'undefined') {
        let subModelUsed = [];
        this.findSubModelsUsed(node, subModelUsed, obj.name);
        subModelUsed.forEach(subModel => {
          this.combinator.addModelInclude(subModel);
        });
      } else if (node.fieldValue.fieldType === 'array') {
        let name = '';
        if (node.fieldValue.fieldItemType.lexeme) {
          name = node.fieldValue.fieldItemType.lexeme;
        } else if (node.fieldValue.itemType) {
          name = node.fieldValue.fieldItemType.lexeme;
        }
        if (name && !_isBasicType(name)) {
          this.combinator.addModelInclude(name);
        }
      }

      const prop = new PropItem();
      prop.belong = obj.index;
      prop.name = node.fieldName.lexeme;
      if (node.fieldValue.fieldType) {
        prop.type = node.fieldValue.fieldType;
      } else if (node.fieldValue.type && node.fieldValue.type === 'modelBody') {
        prop.type = this.combinator.addModelInclude([obj.name, node.fieldName.lexeme].join('.'));
      } else {
        debug.stack(obj, node);
      }
      if (node.fieldValue && node.fieldValue.fieldItemType) {
        if (node.fieldValue.fieldItemType.type) {
          if (node.fieldValue.fieldItemType.type === 'modelBody') {
            prop.itemType = this.combinator.addModelInclude(node.fieldValue.itemType);
          } else if (node.fieldValue.fieldItemType.type === 'map') {
            prop.itemType = `map[${node.fieldValue.fieldItemType.keyType.lexeme},${node.fieldValue.fieldItemType.valueType.lexeme}]`;
          } else {
            debug.stack(node);
          }
        } else if (node.fieldValue.fieldItemType.idType === 'model') {
          prop.itemType = this.combinator.addModelInclude(node.fieldValue.fieldItemType.lexeme);
        } else if (node.fieldValue.itemType) {
          prop.itemType = node.fieldValue.itemType;
        } else if (node.fieldValue.fieldItemType.valueType) {
          prop.itemType = node.fieldValue.fieldItemType.valueType.lexeme;
        } else if (_isBasicType(node.fieldValue.fieldItemType.lexeme)) {
          prop.itemType = node.fieldValue.fieldItemType.lexeme;
        } else if (node.type === 'modelField') {
          if (node.fieldValue && node.fieldValue.fieldItemType && !_isBasicType(node.fieldValue.fieldItemType.lexeme)) {
            prop.itemType = this.combinator.addModelInclude(node.fieldValue.fieldItemType.lexeme);
          } else {
            debug.stack(node);
          }
        } else {
          debug.stack(node);
        }
        if (!prop.itemType) {
          debug.stack(prop, node);
        }
      } else if (node.fieldValue && node.fieldValue.fieldType) {
        if (node.fieldValue.fieldType.type === 'moduleModel') {
          let tmp = [];
          node.fieldValue.fieldType.path.forEach(item => {
            tmp.push(item.lexeme);
          });
          prop.type = this.combinator.addModelInclude(tmp.join('.'));
        } else if (!prop.type) {
          debug.stack(node, prop);
        }
      } else if (!prop.type) {
        debug.stack(node, prop);
      }
      prop.modify.push(Modify.public());
      if (node.required) {
        prop.addNote(new NoteItem('required', true));
      }
      if (node.tokenRange) {
        let annotations = this.resolveAnnotations(
          this.getFrontComments(node.tokenRange[0]),
          obj.index
        );
        annotations.forEach(c => {
          obj.addBodyNode(c);
        });
      }

      node.attrs.forEach((attr) => {
        let value;
        if (typeof attr.attrValue.string !== 'undefined') {
          value = attr.attrValue.string;
        } else if (typeof attr.attrValue.value !== 'undefined') {
          value = attr.attrValue.value;
        } else if (typeof attr.attrValue.lexeme !== 'undefined') {
          value = attr.attrValue.lexeme;
        } else {
          debug.stack(attr);
        }
        let note = new NoteItem(
          attr.attrName.lexeme,
          value
        );
        prop.addNote(note);
      });
      obj.addBodyNode(prop);
    }
    if (nodes[nodes.length - 1] && nodes[nodes.length - 1].tokenRange) {
      let annotations = this.resolveAnnotations(
        this.getBackComments(nodes[nodes.length - 1].tokenRange[1]),
        obj.index
      );
      annotations.forEach(c => {
        obj.addBodyNode(c);
      });
    }
  }
}

module.exports = ModelVisitor;
