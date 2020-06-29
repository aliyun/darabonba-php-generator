'use strict';

// eslint-disable-next-line no-unused-vars
const debug = require('../lib/debug');
const assert = require('assert');
const BaseResolver = require('./base');

const {
  _isBasicType
} = require('../lib/helper');

const {
  AnnotationItem,
  PropItem,
  NoteItem,
} = require('../langs/common/items');

const {
  Modify,
} = require('../langs/common/enum');

class ModelResolver extends BaseResolver{
  resolve() {
    const object = this.object;
    const combinator = this.combinator;
    const config = this.config;
    const ast = this.ast;

    assert.equal(ast.type, 'model');
      
    combinator.config.emitType = 'model';

    object.name = ast.modelName.lexeme;
    if (config.modelDirName) {
      config.model.dir = config.modelDirName;
    }
    config.layer = config.model.dir;
      
    if (ast.annotation) {
      this.initAnnotation(ast.annotation);
    }
      
    object.topAnnotation.push(new AnnotationItem(
      object.index,
      'single',
      config.generateFileInfo
    ));
      
    object.addExtends(combinator.addInclude('$Model'));
      
    this.initProp(ast.modelBody.nodes);
    if (ast.modelBody.nodes.length === 0) {
      if (ast.tokenRange) {
        this.resolveAnnotations(
          this.getBetweenComments(ast.tokenRange[0], ast.tokenRange[1]),
          object.index
        ).forEach(c => {
          object.addBodyNode(c);
        });
      }
    }
      
    return object;
  }
    
  initProp(nodes) {
    const object = this.object;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      if (typeof node.fieldValue.fieldType === 'undefined') {
        let subModelUsed = [];
        this.findSubModelsUsed(node, subModelUsed, object.name);
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
      prop.belong = object.index;
      prop.name = node.fieldName.lexeme;
      if (node.fieldValue.fieldType) {
        prop.type = node.fieldValue.fieldType;
      } else if (node.fieldValue.type && node.fieldValue.type === 'modelBody') {
        prop.type = this.combinator.addModelInclude([object.name, node.fieldName.lexeme].join('.'));
      }
      if (node.fieldValue && node.fieldValue.fieldItemType) {
        if (node.fieldValue.fieldItemType.type) {
          if (node.fieldValue.fieldItemType.type === 'modelBody') {
            prop.itemType = this.combinator.addModelInclude(node.fieldValue.itemType);
          } else if (node.fieldValue.fieldItemType.type === 'map') {
            prop.itemType = `map[${node.fieldValue.fieldItemType.keyType.lexeme},${node.fieldValue.fieldItemType.valueType.lexeme}]`;
          }
        } else if (node.fieldValue.fieldItemType.idType === 'model') {
          prop.itemType = this.combinator.addModelInclude(node.fieldValue.fieldItemType.lexeme);
        } else if (_isBasicType(node.fieldValue.fieldItemType.lexeme)) {
          prop.itemType = node.fieldValue.fieldItemType.lexeme;
        } else if (node.type === 'modelField') {
          if (node.fieldValue && node.fieldValue.fieldItemType && !_isBasicType(node.fieldValue.fieldItemType.lexeme)) {
            prop.itemType = this.combinator.addModelInclude(node.fieldValue.fieldItemType.lexeme);
          }
        }
      } else if (node.fieldValue && node.fieldValue.fieldType) {
        if (node.fieldValue.fieldType.type === 'moduleModel') {
          let tmp = [];
          node.fieldValue.fieldType.path.forEach(item => {
            tmp.push(item.lexeme);
          });
          prop.type = this.combinator.addModelInclude(tmp.join('.'));
        }
      }
      prop.modify.push(Modify.public());
      if (node.required) {
        prop.addNote(new NoteItem('required', true));
      }
      if (node.tokenRange) {
        let annotations = this.resolveAnnotations(
          this.getFrontComments(node.tokenRange[0]),
          object.index
        );
        annotations.forEach(c => {
          object.addBodyNode(c);
        });
      }
      for (let i = 0; i < node.attrs.length; i++){
        const attr = node.attrs[i];
        let value;
        if (typeof attr.attrValue.string !== 'undefined') {
          value = attr.attrValue.string;
        } else if (typeof attr.attrValue.value !== 'undefined') {
          value = attr.attrValue.value;
        } else if (typeof attr.attrValue.lexeme !== 'undefined') {
          value = attr.attrValue.lexeme;
        }
        let note = new NoteItem(
          attr.attrName.lexeme,
          value
        );
        prop.addNote(note);
      }
      object.addBodyNode(prop);
    }
    if (nodes[nodes.length - 1] && nodes[nodes.length - 1].tokenRange) {
      let annotations = this.resolveAnnotations(
        this.getBackComments(nodes[nodes.length - 1].tokenRange[1]),
        object.index
      );
      annotations.forEach(c => {
        object.addBodyNode(c);
      });
    }
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
}

module.exports = ModelResolver;