'use strict';

const debug = require('../lib/debug');

const {
  AnnotationItem,
} = require('../langs/common/items');

const DSL = require('@darabonba/parser');

class BaseResolver {
  constructor(astNode, combinator, globalAst) {
    this.ast = astNode;
    this.combinator = combinator;
    this.config = combinator.config;

    this.comments = globalAst.comments ? globalAst.comments : {};
    this.commentsSet = [];
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
}

module.exports = BaseResolver;