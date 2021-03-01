'use strict';

const debug = require('../lib/debug');

const {
  AnnotationItem,
  TypeString,
  TypeArray,
  TypeInteger,
  TypeBytes,
  TypeMap,
  TypeObject,
  TypeGeneric,
  TypeStream,
  TypeVoid,
  TypeNumber,
  TypeBool,
  TypeNull,
  TypeDecimal
} = require('../langs/common/items');

const { _isBasicType } = require('../lib/helper');

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

  resolveTypeItem(typeNode, sourceNode = null) {
    if (typeNode.idType) {
      if (typeNode.idType === 'model') {
        return new TypeObject(`#${typeNode.lexeme}`);
      } else if (typeNode.idType === 'module') {
        return new TypeObject(`^${typeNode.lexeme}`);
      } else if (typeNode.idType === 'builtin_model') {
        return new TypeObject(`^${typeNode.lexeme}`);
      }
      debug.stack(typeNode, sourceNode);
    } else if (typeNode.type) {
      if (typeNode.type === 'fieldType') {
        if (typeNode.fieldType.idType) {
          if (typeNode.fieldType.idType === 'module') {
            return new TypeObject(`^${typeNode.fieldType.lexeme}`);
          }
          return new TypeObject(`#${typeNode.fieldType.lexeme}`);
        }
        return this.resolveTypeItem(typeNode.fieldType, typeNode);
      } else if (typeNode.type === 'modelBody') {
        // is sub model
        const modelName = `#${[this.object.name, sourceNode.fieldName.lexeme].join('.')}`;
        return new TypeObject(modelName);
      } else if (_isBasicType(typeNode.type)) {
        return this.resolveTypeItem(typeNode.type, typeNode);
      } else if (typeNode.type === 'basic') {
        return this.resolveTypeItem(typeNode.name, sourceNode);
      } else if (typeNode.type === 'model') {
        let name = typeNode.name;
        if (typeNode.moduleName) {
          name = typeNode.moduleName + '.' + name;
        }
        return new TypeObject(`#${name}`);
      } else if (typeNode.type === 'module_instance') {
        return new TypeObject(`^${typeNode.name}`);
      } else if (typeNode.type === 'param') {
        if (typeNode.paramType.idType) {
          return new TypeObject(`#${typeNode.paramType.lexeme}`);
        }
        return this.resolveTypeItem(typeNode.paramType, typeNode);
      } else if (typeNode.type === 'array') {
        const subType = typeNode.subType ? typeNode.subType : typeNode.itemType;
        return new TypeArray(this.resolveTypeItem(subType));
      } else if (typeNode.type === 'moduleModel') {
        let tmp = [];
        typeNode.path.forEach(item => {
          tmp.push(item.lexeme);
        });
        return new TypeObject(`#${tmp.join('.')}`);
      } else if (typeNode.type === 'subModel' || typeNode.type === 'subModel_or_moduleModel') {
        // subModel_or_moduleModel is retained for compatibility with older parser.
        let tmp = [];
        typeNode.path.forEach(item => {
          tmp.push(item.lexeme);
        });
        return new TypeObject(`#${tmp.join('.')}`);
      }
      debug.stack(typeNode, sourceNode);
    } else if (typeNode.lexeme) {
      return this.resolveTypeItem(typeNode.lexeme, sourceNode);
    } else if (typeNode === 'string') {
      return new TypeString();
    } else if (typeNode === 'bytes') {
      return new TypeBytes();
    } else if (typeNode === 'array') {
      let itemType;
      if (sourceNode.fieldItemType.type === 'modelBody') {
        itemType = new TypeObject(`#${sourceNode.itemType}`);
      } else if (sourceNode.fieldItemType.idType === 'model') {
        itemType = new TypeObject(`#${sourceNode.fieldItemType.lexeme}`);
      } else {
        itemType = this.resolveTypeItem(sourceNode.fieldItemType, sourceNode);
      }
      return new TypeArray(itemType);
    } else if (typeNode === 'map') {
      const keyType = this.resolveTypeItem(sourceNode.keyType);
      const valType = this.resolveTypeItem(sourceNode.valueType);
      return new TypeMap(keyType, valType);
    } else if (typeNode === 'any') {
      return new TypeGeneric();
    } else if (typeNode === 'object') {
      return new TypeMap(new TypeString(), new TypeGeneric());
    } else if (typeNode === 'integer') {
      return new TypeInteger();
    } else if (typeNode === 'readable') {
      return new TypeStream(false);
    } else if (typeNode === 'writable') {
      return new TypeStream(true);
    } else if (typeNode === 'class') {
      return new TypeObject();
    } else if (typeNode === 'void') {
      return new TypeVoid();
    } else if (typeNode === 'number') {
      return new TypeNumber();
    } else if (typeNode === 'boolean') {
      return new TypeBool();
    } else if (typeNode === 'null') {
      return new TypeNull();
    } else if (typeNode === 'float') {
      return new TypeDecimal(4);
    } else if (typeNode === 'double') {
      return new TypeDecimal(8);
    } else if (typeNode === 'long') {
      return new TypeInteger(64);
    } else if (typeNode === 'ulong') {
      return new TypeInteger(64, true);
    } else if (typeNode.indexOf('int') === 0) {
      let len = typeNode.substring(3);
      return new TypeInteger(parseInt(len));
    } else if (typeNode.indexOf('uint') === 0) {
      let len = typeNode.substring(4);
      return new TypeInteger(parseInt(len), true);
    }
    if (typeof typeNode === 'string' && typeNode.length > 0) {
      return new TypeObject(`#${typeNode}`);
    }
    debug.stack('Unsupported type node', { typeNode, sourceNode });
  }
}

module.exports = BaseResolver;
