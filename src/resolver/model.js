'use strict';

// eslint-disable-next-line no-unused-vars
const debug = require('../lib/debug');
const assert = require('assert');
const BaseResolver = require('./base');

const {
  ObjectItem,
  AnnotationItem,
  PropItem,
  NoteItem,
} = require('../langs/common/items');

const {
  Modify,
} = require('../langs/common/enum');

class ModelResolver extends BaseResolver {
  constructor(astNode, combinator, globalAst) {
    super(astNode, combinator, globalAst);
    this.object = new ObjectItem('model');
  }

  resolve() {
    const object = this.object;
    const combinator = this.combinator;
    const config = this.config;
    const ast = this.ast;

    assert.strictEqual(ast.type, 'model');

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
      const prop = new PropItem();
      prop.belong = object.index;
      prop.name = node.fieldName.lexeme;
      prop.type = this.resolveTypeItem(node.fieldValue, node);
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
      for (let i = 0; i < node.attrs.length; i++) {
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