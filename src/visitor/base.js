'use strict';

const debug = require('../lib/debug');
const DSL = require('@darabonba/parser');
const Emitter = require('../lib/emitter');

const {
  _getLangConfig,
  _getEmitConfig,
  _getCombinator,
  _deepClone
} = require('../lib/helper');

const {
  AnnotationItem
} = require('../langs/common/items');

class BaseVisitor {
  constructor(option = {}, lang, moduleInfo = {}) {
    this.__module = moduleInfo;
    this.option = option;
    this.lang = lang;
    this.langConfig = _deepClone(_getLangConfig(option, lang));
    this.emitConfig = _deepClone(_getEmitConfig(option, lang));
    this.object = null;
    this.combinator = null;

    this.statement = {};
    this.comments = moduleInfo.comments;
  }

  getCombinator() {
    if (this.combinator === null) {
      this.combinator = _getCombinator(this.lang, this.emitConfig);
    }
    return this.combinator;
  }

  visit(ast) {
    throw new Error('Please override visit(ast)');
  }

  done() {
    const emitter = new Emitter(this.emitConfig);
    this.getCombinator().combine(emitter, this.object);
    return emitter;
  }

  variables(ast) {
    ast.moduleBody.nodes.filter((item) => {
      return item.type === 'type' && item.value.type;
    }).forEach((item) => {
      this.statement[item.vid.lexeme] = {
        type: item.value.type,
        async: item.value.async ? true : false,
        static: item.value.isStatic ? true : false,
        return: item.value.returnType ? item.value.returnType.lexeme : ''
      };
    });
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
            debug.stack(obj, node);
          }
          this.commentsSet.push(c.index);
        }
      });
    }
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

  getBackComments(index) {
    return DSL.comment.getBackComments(this.comments, index);
  }

  getFrontComments(index) {
    return DSL.comment.getFrontComments(this.comments, index);
  }

  getBetweenComments(begin, end) {
    return DSL.comment.getBetweenComments(this.comments, begin, end);
  }
}

module.exports = BaseVisitor;
