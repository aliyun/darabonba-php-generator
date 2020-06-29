'use strict';

const debug = require('../lib/debug');

const {
  _isBasicType
} = require('../lib/helper');

const {
  AnnotationItem,
  PropItem,
  ObjectItem
} = require('../langs/common/items');

const {
  //   Symbol,
  Modify,
  //   Exceptions,
  //   Types
} = require('../langs/common/enum');

const DSL = require('@darabonba/parser');

class BaseResolver {
  constructor(astNode, combinator, globalAst) {
    this.ast = astNode;
    this.combinator = combinator;
    this.config = combinator.config;

    this.comments = globalAst.comments ? globalAst.comments : {};
    this.commentsSet = [];

    this.object = new ObjectItem();
  }

  resolveAnnotations(annotations, belong) {
    if (annotations.length > 0) {
      let comments = [];
      annotations.forEach(annotation => {
        comments.push(this.resolveAnnotation(annotation, belong));
      });
      return comments;
    }
    return [];
  }

  resolveAnnotation(annotation, belong) {
    let type = annotation.value.indexOf('/**') === 0 ? 'multi' : 'single';
    let content = '';
    if (type === 'multi') {
      content = annotation.value.substring(3, annotation.value.length - 2)
        .trim().split('\n').filter(c => c.length > 0).map(c => {
          if (c.indexOf(' * ') === 0) {
            return c.substring(3);
          } else if (c.indexOf('* ') === 0) {
            return c.substring(2);
          }
          return c;
        });
    } else {
      content = annotation.value.substring(2).trim();
    }
    return new AnnotationItem(belong, type, content);
  }

  getBackComments(index) {
    return DSL.comment.getBackComments(this.comments, index);
  }

  getBetweenComments(begin, end) {
    return DSL.comment.getBetweenComments(this.comments, begin, end);
  }

  getFrontComments(index) {
    return DSL.comment.getFrontComments(this.comments, index);
  }

  getComments(node, position = 'front') {
    if (typeof node.tokenRange === 'undefined') {
      return [];
    }
    switch (position) {
    case 'back':
      return this.getBackComments(node.tokenRange[1]);
    case 'between':
      return this.getBetweenComments(node.tokenRange[0], node.tokenRange[1]);
    default:
      return this.getFrontComments(node.tokenRange[0]);
    }
  }

  addAnnotations(obj, node, position = 'front') {
    let comments = this.getComments(node, position);
    if (comments.length > 0) {
      comments.forEach(c => {
        if (this.commentsSet.indexOf(c.index) < 0) {
          if (typeof obj.annotations !== 'undefined') {
            obj.annotations.push(this.resolveAnnotation(c, obj.index));
          } else {
            debug.stack(obj, node);
          }
          this.commentsSet.push(c.index);
        }
      });
    }
  }

  findComments(obj, node, position = 'front') {
    let comments = this.getComments(node, position);

    if (comments.length > 0) {
      comments.forEach(c => {
        if (this.commentsSet.indexOf(c.index) < 0) {
          if (typeof obj.body !== 'undefined') {
            obj.body.push(this.resolveAnnotation(c, obj.index));
          } else if (typeof obj.value !== 'undefined') {
            obj.value.push(this.resolveAnnotation(c, obj.index));
          } else {
            debug.stack('Invalid data node', obj, node);
          }
          this.commentsSet.push(c.index);
        }
      });
    }
  }

  initAnnotation(annotation) {
    let topComments = this.getFrontComments(annotation.index);
    topComments.map(c => {
      this.object.topAnnotation.push(this.resolveAnnotation(c, this.object.index));
    });
    if (annotation && annotation.value) {
      this.object.annotations.push(this.resolveAnnotation(annotation, this.object.index));
    }
  }

  resolveProps(ast) {
    this.comments = ast.comments;

    ast.moduleBody.nodes.filter((item) => {
      return item.type === 'type';
    }).forEach(item => {
      const prop = new PropItem();
      prop.name = item.vid.lexeme.replace('@', '_');
      const type = item.value.lexeme ? item.value.lexeme : item.value.type;
      prop.type = type;
      if (type === 'array') {
        prop.itemType = item.value.subType;
        if (!_isBasicType(item.value.subType.lexeme)) {
          this.combinator.addModelInclude(item.value.subType.lexeme);
        }
      } else {
        if (!_isBasicType(type)) {
          if (item.value.idType && item.value.idType === 'module') {
            this.combinator.addInclude(type);
          } else if (item.value && item.value.returnType) {
            if (!_isBasicType(item.value.returnType.lexeme)) {
              this.combinator.addModelInclude(type);
            }
          } else {
            debug.stack(item);
          }
        }
      }
      prop.addModify(Modify.protected());
      if (item.tokenRange) {
        let comments = this.getFrontComments(item.tokenRange[0]);
        if (comments.length > 0) {
          comments.forEach(c => {
            this.object.addBodyNode(this.resolveAnnotation(c, this.object.index));
          });
        }
      }
      this.object.addBodyNode(prop);
    });
  }
}

module.exports = BaseResolver;