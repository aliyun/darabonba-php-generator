'use strict';

const debug = require('../lib/debug');
const BaseResolver = require('./base');

const {
  AnnotationItem,
  ConstructItem,
  ObjectItem,
  FuncItem,
  PropItem,

  GrammerVar,
  GrammerCall,
  GrammerExpr,
  GrammerLoop,
  GrammerBreak,
  GrammerCatch,
  GrammerValue,
  GrammerReturn,
  GrammerThrows,
  GrammerFinally,
  GrammerContinue,
  GrammerTryCatch,
  GrammerNewObject,
  GrammerCondition,
  GrammerException,

  BehaviorRetry,
  BehaviorToMap,
  BehaviorToModel,
  BehaviorTimeNow,
  BehaviorDoAction,
  BehaviorSetMapItem,
  BehaviorTamplateString,

  TypeMap,
  TypeBool,
  TypeVoid,
  TypeItem,
  TypeNull,
  TypeObject,
  TypeString,
  TypeInteger,
  TypeGeneric,
} = require('../langs/common/items');

const {
  Symbol,
  Modify,
} = require('../langs/common/enum');

const {
  _isBasicType
} = require('../lib/helper');
const assert = require('assert');

const systemPackage = ['Util'];

const int16 = new TypeInteger(16);
const genericType = new TypeGeneric();
const runtimeType = new TypeMap(new TypeString(), genericType);
const errorType = new TypeObject('$Error');
const exceptionType = new TypeObject('$Exception');
const requestType = new TypeObject('$Request');
const nullType = new TypeNull();
const unretryableType = new TypeObject('$ExceptionUnretryable');

class ClientResolver extends BaseResolver {
  constructor(astNode, combinator, globalAst) {
    super(astNode, combinator, globalAst);
    this.object = new ObjectItem('client');
    this.currThrows = {};
  }

  resolve() {
    const object = this.object;
    const combinator = this.combinator;
    const config = this.config;
    const ast = this.ast;

    combinator.config.emitType = 'client';
    object.name = config.clientName || 'Client';

    // resolve props
    this.resolveProps(ast);

    // resolve global annotation
    if (ast.annotation) {
      this.initAnnotation(ast.annotation);
    }
    object.topAnnotation.push(new AnnotationItem(
      object.index,
      'single',
      config.generateFileInfo
    ));

    // resolve extends
    if (ast.extends) {
      object.extends.push(combinator.addInclude(ast.extends.lexeme));
    } else if (config.baseClient) {
      let extendsClass = [];
      if (Array.isArray(config.baseClient)) {
        config.baseClient.forEach(item => extendsClass.push(combinator.addInclude(item)));
      } else {
        extendsClass = [combinator.addInclude(config.baseClient)];
      }
      object.extends = extendsClass;
    }

    // resolve construct body
    const [init] = ast.moduleBody.nodes.filter((item) => {
      return item.type === 'init';
    });
    if (init) {
      this.resolveInitBody(init);
    }

    // resolve api
    ast.moduleBody.nodes.filter((item) => {
      return item.type === 'api';
    }).forEach(item => {
      const func = new FuncItem();
      func.name = item.apiName.lexeme;
      this.resolveFunc(func, item, item.apiBody);
    });

    // resolve function
    ast.moduleBody.nodes.filter((item) => {
      return item.type === 'function';
    }).forEach(item => {
      const func = new FuncItem();
      func.name = item.functionName.lexeme;
      this.resolveFunc(func, item, item.functionBody);
    });

    return object;
  }

  resolveProps(ast) {
    this.comments = ast.comments;

    ast.moduleBody.nodes.filter((item) => {
      return item.type === 'type';
    }).forEach(item => {
      const prop = new PropItem();
      prop.name = item.vid.lexeme.replace('@', '_');
      prop.type = this.resolveTypeItem(item.value, item);
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

  resolveInitBody(init) {
    const object = this.object;

    let constructNode = new ConstructItem();
    this.currThrows = {};
    if (init.params && init.params.params) {
      init.params.params.forEach(param => {
        let type = this.resolveTypeItem(param.paramType, param);
        constructNode.addParamNode(new GrammerValue(type, param.defaultValue, param.paramName.lexeme));
      });
    }
    if (init.annotation) {
      constructNode.addAnnotation(this.resolveAnnotation(init.annotation, constructNode.index));
    }
    if (init.initBody && init.initBody.stmts) {
      init.initBody.stmts.forEach(stmt => {
        this.visitStmt(constructNode, stmt, constructNode.index);
      });
    }
    if (Object.keys(this.currThrows).length > 0) {
      constructNode.throws = Object.values(this.currThrows);
    }
    object.addBodyNode(constructNode);
  }

  resolveFunc(func, ast, body) {
    this.currThrows = {};
    if (ast.annotation) {
      func.addAnnotation(this.resolveAnnotation(ast.annotation, func.index));
    }
    this.addAnnotations(func, ast);
    if (body === null) {
      func.addBodyNode(new GrammerThrows(exceptionType, [], 'Un-implemented'));
    }

    if (ast.isAsync) {
      func.modify.push(Modify.async());
    }
    if (ast.isStatic) {
      func.modify.push(Modify.static());
    }
    func.modify.push(Modify.public());

    ast.params.params.forEach(p => {
      var param = new GrammerValue();
      param.type = this.resolveTypeItem(p.paramType, p);
      param.key = p.paramName.lexeme;
      if (p.needValidate) {
        func.addBodyNode(new GrammerCall('method', [
          { type: 'object', name: param.key },
          { type: 'call', name: 'validate' }
        ], [], new TypeVoid(), true)); // validator
      }
      func.params.push(param);
    });

    func.return.push(this.resolveTypeItem(ast.returnType));

    if (ast.runtimeBody) {
      this.runtimeMode(func, ast, body);
    } else {
      if (ast.functionBody || ast.wrapBody) {
        body.stmts.stmts.forEach(stmtItem => {
          this.visitStmt(func, stmtItem, func.index);
        });
      } else {
        this.requestBody(ast, body, func);
      }
    }

    if (func.body.length === 0) {
      this.findComments(func, body, 'between');
    }

    if (Object.keys(this.currThrows).length > 0) {
      func.throws = Object.values(this.currThrows);
    }
    this.object.addBodyNode(func);
  }

  runtimeMode(func, ast, body) {
    var val = new GrammerValue('array', []);
    this.renderGrammerValue(val, ast.runtimeBody);
    if (ast.runtimeBody.tokenRange) {
      this.resolveAnnotations(this.getFrontComments(ast.runtimeBody.tokenRange[1])).forEach(c => {
        val.value.push(c);
      });
    }

    // _runtime = {}
    func.addBodyNode(new GrammerExpr(
      new GrammerVar(this.config.runtime, runtimeType), Symbol.assign(), val
    ));

    // _lastRequest = null;
    func.addBodyNode(new GrammerExpr(
      new GrammerVar('_lastRequest', requestType, 'var'),
      Symbol.assign(),
      new GrammerValue('null', null, nullType)
    ));

    // _lastException = null;
    func.addBodyNode(new GrammerExpr(
      new GrammerVar('_lastException', exceptionType, 'var'),
      Symbol.assign(),
      new GrammerValue('null', null, nullType)
    ));

    // _now = Date.now();
    func.addBodyNode(new GrammerExpr(
      new GrammerVar('_now', int16),
      Symbol.assign(),
      new GrammerValue('behavior', new BehaviorTimeNow(), int16)
    ));

    // let _retryTimes = 0;
    func.addBodyNode(new GrammerExpr(
      new GrammerVar('_retryTimes', int16, 'var'),
      Symbol.assign(),
      new GrammerValue('number', 0, int16)
    ));

    let whileOperation = new GrammerCondition('while');
    whileOperation.addCondition(
      new GrammerCall('method', [
        { type: 'object_static', name: this.combinator.addInclude('$Core') },
        { type: 'call_static', name: this.config.tea.core.allowRetry }
      ], [
        new GrammerValue('call', new GrammerCall('key', [
          { type: 'object', name: this.config.runtime },
          { type: 'map', name: 'retry' }
        ], [], genericType)),
        new GrammerValue('param', '_retryTimes', int16),
        new GrammerValue('param', '_now', int16),
      ], new TypeBool())
    );

    let retryTimesIf = new GrammerCondition('if');
    retryTimesIf.addCondition(
      new GrammerExpr(
        new GrammerVar('_retryTimes', int16),
        Symbol.greater(),
        new GrammerValue('number', 0, int16)
      )
    );
    retryTimesIf.addBodyNode(
      new GrammerExpr(
        new GrammerVar('_backoffTime', int16),
        Symbol.assign(),
        new GrammerCall('method', [
          { type: 'object_static', name: this.combinator.addInclude('$Core') },
          { type: 'call_static', name: this.config.tea.core.getBackoffTime }
        ], [
          new GrammerValue('call', new GrammerCall('key', [
            { type: 'object', name: this.config.runtime },
            { type: 'map', name: 'backoff' }
          ]), genericType),
          new GrammerValue('param', '_retryTimes', int16),
        ], int16)
      )
    );

    let backoffTimeIf = new GrammerCondition('if');
    let backoffTimeValue = new GrammerValue('number', 0, int16);
    backoffTimeValue.dataType = int16;
    backoffTimeIf.addCondition(
      new GrammerExpr(
        new GrammerVar('_backoffTime', int16),
        Symbol.greater(),
        backoffTimeValue
      )
    );
    backoffTimeIf.addBodyNode(
      new GrammerCall('method', [
        { type: 'object_static', name: this.combinator.addInclude('$Core') },
        { type: 'call_static', name: this.config.tea.core.sleep }
      ], [
        new GrammerValue('param', '_backoffTime', int16),
      ])
    );

    retryTimesIf.addBodyNode(backoffTimeIf);
    whileOperation.addBodyNode(retryTimesIf);

    let retryTimesValue = new GrammerValue('number', 1, int16);
    retryTimesValue.dataType = int16;
    whileOperation.addBodyNode(new GrammerExpr(
      new GrammerVar('_retryTimes', int16),
      Symbol.assign(),
      new GrammerExpr(
        new GrammerVar('_retryTimes', int16),
        Symbol.plus(),
        retryTimesValue
      )
    ));

    let requestTryCatch = new GrammerTryCatch();
    let exceptionVar = new GrammerVar('e', exceptionType);
    let exceptionParam = new GrammerValue('var', exceptionVar, exceptionType);
    let catchException = new GrammerException(exceptionType, exceptionVar);

    let tryCatch = new GrammerCatch([
      new GrammerCondition('if', [
        new GrammerCall('method', [
          { type: 'object_static', name: this.combinator.addInclude('$Core') },
          { type: 'call_static', name: this.config.tea.core.isRetryable }
        ], [exceptionVar])
      ], [
        new GrammerExpr(
          new GrammerVar('_lastException', exceptionType, 'var'),
          Symbol.assign(),
          exceptionVar
        ),
        new GrammerContinue(whileOperation.index)
      ]),
      new GrammerThrows(null, [exceptionParam])
    ], catchException);
    this.currThrows['$Error'] = errorType;
    this.currThrows['$Exception'] = exceptionType;
    this.requestBody(ast, body, requestTryCatch);
    requestTryCatch.addCatch(tryCatch);

    whileOperation.addBodyNode(requestTryCatch);

    func.addBodyNode(whileOperation);

    func.addBodyNode(
      new GrammerThrows(
        unretryableType, [
          new GrammerValue('var', new GrammerVar('_lastRequest', requestType), requestType),
          new GrammerValue('var', new GrammerVar('_lastException', exceptionType), exceptionType)
        ]
      )
    );
    this.currThrows['$ExceptionUnretryable'] = unretryableType;
  }

  requestBody(ast, body, func) {
    if (body) {
      if (body.type === 'apiBody') {
        // TeaRequest _request = new TeaRequest()
        func.addBodyNode(
          new GrammerExpr(
            new GrammerVar(this.config.request, requestType),
            Symbol.assign(),
            new GrammerNewObject(this.combinator.addInclude('$Request'))
          )
        );
      }

      const stmt = ['declares', 'protocol', 'port', 'method', 'pathname', 'quert', 'headers', 'body', 'appendStmts'];
      stmt.forEach(key => {
        if (body[key] && body[key] !== 'undefined') {
          if (Array.isArray(body[key])) {
            body[key].forEach(stmtItem => {
              this.visitStmt(func, stmtItem, func.index);
            });
          } else {
            this.visitStmt(func, body[key], func.index);
          }
        }
      });

      if (body.type === 'apiBody') {
        var doActionParams = [];
        doActionParams.push(new GrammerValue('param', this.config.request, requestType));

        if (ast.runtimeBody) {
          doActionParams.push(new GrammerValue('param', this.config.runtime, runtimeType));
        }

        // response = Tea.doAction
        const doActionBehavior = new BehaviorDoAction(
          new GrammerVar(this.config.response, new TypeObject('$Response')), doActionParams
        );

        if (body.stmts) {
          body.stmts.stmts.forEach(stmt => {
            this.visitStmt(func, stmt, func.index);
          });
        }

        // _lastRequest = request_;
        func.addBodyNode(
          new GrammerExpr(
            new GrammerVar('_lastRequest', requestType, 'var'),
            Symbol.assign(),
            new GrammerVar(this.config.request, requestType)
          )
        );

        // returns
        if (ast.returns) {
          if (ast.returns.stmts.stmts.length > 0) {
            ast.returns.stmts.stmts.forEach(stmt => {
              this.visitStmt(doActionBehavior, stmt, doActionBehavior.index);
            });
          } else {
            this.findComments(doActionBehavior, ast.returns, 'between');
          }
        }
        func.addBodyNode(doActionBehavior);
      }
      if (body.tokenRange) {
        this.resolveAnnotations(this.getFrontComments(body.tokenRange[1], func.index)).forEach(c => {
          func.addBodyNode(c);
        });
      }
    }
  }

  renderGrammerValue(valGrammer, object, expectedType = null) {
    if (!valGrammer) {
      valGrammer = new GrammerValue();
    }
    if (!valGrammer.value && object.type === 'object') {
      valGrammer.value = [];
    }
    if (object.type === 'variable') {
      if (object.needCast) {
        let grammerVar = new GrammerVar(object.id.lexeme, this.resolveTypeItem(object.inferred));
        valGrammer.type = 'behavior';
        grammerVar.belong = valGrammer.index;
        const behaviorToMap = new BehaviorToMap(grammerVar, object.inferred);
        behaviorToMap.belong = valGrammer.index;
        valGrammer.value = behaviorToMap;
      } else {
        valGrammer.type = 'var';
        let grammerVar;
        if (object.id.type === 'model') {
          const name = this.combinator.addModelInclude(object.id.lexeme);
          const type = this.resolveTypeItem(object.inferred);
          type.objectName = name;
          grammerVar = new GrammerVar(object.id.lexeme, type);
          grammerVar.varType = 'static_class';
          grammerVar.name = name;
        } else if (object.type === 'variable') {
          grammerVar = new GrammerVar(object.id.lexeme, this.resolveTypeItem(object.inferred));
          grammerVar.varType = 'var';
        }
        valGrammer.value = grammerVar;
      }
    } else if (object.type === 'object') {
      object.fields.forEach(field => {
        var val = null;
        var type = field.expr.type;
        if (field.expr.type === 'object') {
          val = [];
          type = 'map';
        }
        var exprChild = new GrammerValue(type, val);
        if (field.type === 'expandField') {
          valGrammer.needCast = true;
          exprChild.isExpand = true;
        }
        if (field.fieldName && field.fieldName.lexeme) {
          exprChild.key = field.fieldName.lexeme;
        }
        this.renderGrammerValue(exprChild, field.expr, expectedType);
        this.findComments(valGrammer, field);
        valGrammer.value.push(exprChild);
        this.findComments(valGrammer, field.expr, 'back');
      });
      valGrammer.type = 'map';
      valGrammer.dataType = this.resolveTypeItem(object.inferred);
      valGrammer.expected = expectedType ? this.resolveTypeItem(expectedType) : null;
    } else if (object.type === 'string') {
      valGrammer.type = 'string';
      valGrammer.value = object.value.string;
    } else if (object.type === 'property_access') {
      var current = object.id.inferred;

      let call = new GrammerCall('key');
      var paramName = object.id.lexeme;
      call.addPath({ type: 'object', name: paramName });
      for (var i = 0; i < object.propertyPath.length; i++) {
        var name = object.propertyPath[i].lexeme;

        if (current.type === 'model') {
          call.type = 'prop';
          call.addPath({ type: 'prop', name: name });
        } else {
          call.addPath({ type: 'map', name: name });
        }
        current = object.propertyPathTypes[i];
      }
      call.returnType = this.resolveTypeItem(object.inferred);
      valGrammer.type = 'call';
      valGrammer.value = call;
      if (object.needCast) {
        valGrammer.type = 'behavior';
        valGrammer.value = new BehaviorToMap(valGrammer.value, object.inferred);
      }
    } else if (object.type === 'number') {
      valGrammer.type = 'number';
      valGrammer.value = object.value.value;
      valGrammer.dataType = this.resolveTypeItem(object.inferred);
    } else if (object.type === 'virtualVariable') {
      valGrammer.type = 'call';
      let call = new GrammerCall('prop', [
        { type: 'parent', name: '' },
        { type: 'prop', name: object.vid.lexeme },
      ]);
      valGrammer.value = call;
    } else if (object.type === 'template_string') {
      valGrammer.type = 'behavior';
      let behaviorTamplateString = new BehaviorTamplateString();
      object.elements.forEach(ele => {
        if (ele.type !== 'element') {
          behaviorTamplateString.addItem(this.renderGrammerValue(null, ele.expr));
        } else {
          behaviorTamplateString.addItem(new GrammerValue('string', ele.value.string, new TypeString()));
        }
      });
      valGrammer.value = behaviorTamplateString;
    } else if (object.type === 'null') {
      valGrammer.type = 'null';
      valGrammer.value = 'null';
    } else if (object.type === 'construct_model') {
      let objectName = object.aliasId.lexeme ? object.aliasId.lexeme : '';
      if (object.propertyPath && object.propertyPath.length > 0) {
        if (object.propertyPath.length > 0 && objectName !== '') {
          objectName = objectName + '.';
        }
        object.propertyPath.forEach((p, i) => {
          objectName += p.lexeme;
          if (i !== object.propertyPath.length - 1) {
            objectName += '.';
          }
        });
      }
      objectName = this.combinator.addModelInclude(objectName);

      valGrammer.type = 'instance';
      let params = [];
      if (object.object) {
        params = this.renderGrammerValue(null, object.object);
        if (params.value.length === 0) {
          this.findComments(params, object.object, 'between');
        }
        if (object.object.inferred.type === 'map') {
          params.type = 'model_construct_params';
        }
      }
      valGrammer.value = new GrammerNewObject(objectName, params);
    } else if (object.type === 'call') {
      let call_type = 'method';
      valGrammer.type = 'call';
      if (object.left && object.left.id && object.left.id.type === 'module') {
        if (systemPackage.indexOf(object.left.id.lexeme) > -1) {
          call_type = 'sys_func';
        }
      } else {
        valGrammer.type = 'call';
        call_type = 'method';
      }
      let call = new GrammerCall(call_type);

      if (object.left) {
        let isStatic = object.isStatic ? true : false;
        let callType = isStatic ? '_static' : '';
        if (object.left.type === 'method_call') {
          call.addPath({ type: 'parent', name: '' });
          call.addPath({ type: 'call' + callType, name: object.left.id.lexeme });
        } else if (object.left.type === 'instance_call') {
          if (object.left && object.left.id && object.left.id.lexeme) {
            if (object.left.id.type === 'variable') {
              call.addPath({ type: 'object' + callType, name: object.left.id.lexeme });
            } else if (typeof object.left.id.type === 'undefined' && object.left.id.lexeme.indexOf('@') > -1) {
              call.addPath({ type: 'parent', name: object.left.id.lexeme.replace('@', '_') });
            } else {
              debug.stack('Unsupported object.left.id.type : ' + object.left.id.type, object);
            }
          }
        } else if (object.left.type === 'static_call') {
          if (object.left.id.type === 'module') {
            call.addPath({ type: 'object_static', name: this.combinator.addInclude(object.left.id.lexeme) });
            isStatic = true;
          } else {
            // call.addPath({ type: 'call_static', name: object.left.id.lexeme });
            debug.stack(object);
          }
        } else {
          debug.stack(object.left);
        }

        if (object.left.propertyPath) {
          object.left.propertyPath.forEach(p => {
            call.addPath({
              type: 'call' + callType,
              name: p.lexeme
            });
          });
        }
      }
      if (object.args) {
        object.args.forEach(arg => {
          const grammerValue = this.renderGrammerValue(null, arg);
          grammerValue.belong = call.index;
          call.addParams(grammerValue);
        });
      }
      call.returnType = this.resolveTypeItem(object.inferred);
      valGrammer.value = call;
    } else if (object.type === 'construct') {
      valGrammer.type = 'instance';
      const objectName = this.combinator.addInclude(object.aliasId.lexeme);
      valGrammer.value = new GrammerNewObject(objectName);
      object.args.forEach(item => {
        valGrammer.value.addParam(this.renderGrammerValue(null, item));
      });
    } else if (object.type === 'boolean') {
      valGrammer.type = 'bool';
      valGrammer.value = object.value;
    } else if (object.type === 'not') {
      valGrammer.type = 'not';
      valGrammer.value = this.renderGrammerValue(null, object.expr);
    } else if (object.type === 'array') {
      valGrammer.type = 'array';
      valGrammer.value = [];
      if (object.items.length > 0) {
        object.items.forEach(field => {
          this.findComments(valGrammer, field);
          var exprChild = this.renderGrammerValue(null, field, expectedType);
          valGrammer.value.push(exprChild);
          this.findComments(valGrammer, field, 'back');
        });
      } else {
        this.findComments(valGrammer, object, 'between');
      }
      valGrammer.type = 'array';
      valGrammer.expected = expectedType ? this.resolveTypeItem(expectedType) : null;
    } else if (object.type === 'property') {
      object.type = 'property_access';
      this.renderGrammerValue(valGrammer, object);
    } else if (object.type === 'super') {
      valGrammer.type = 'call';
      let call = new GrammerCall('super');
      object.args.forEach(arg => {
        call.addParams(this.renderGrammerValue(null, arg));
      });
      valGrammer.value = call;
    } else if (object.type === 'map_access') {
      valGrammer.type = 'call';
      let accessKey = object.accessKey.id ? object.accessKey.id.lexeme : object.accessKey.value.lexeme;
      if (object.accessKey.id) {
        accessKey = object.accessKey.id.lexeme;
      } else if (object.accessKey.type === 'string') {
        accessKey = object.accessKey.value.string;
      } else {
        debug.stack(object);
      }
      let current = object.id.inferred;
      let call = new GrammerCall('key');
      call.addPath({ type: 'object', name: object.id.lexeme });
      if (object.propertyPathTypes) {
        for (let i = 0; i < object.propertyPath.length; i++) {
          if (current.type === 'model') {
            call.type = 'prop';
            call.addPath({ type: 'prop', name: object.propertyPath[i].lexeme });
          } else if (current.type === 'array') {
            call.addPath({ type: 'list', name: object.propertyPath[i].lexeme });
          } else {
            call.addPath({ type: 'map', name: object.propertyPath[i].lexeme });
          }
          current = object.propertyPathTypes[i];
        }
      }
      call.addPath({ type: 'map', name: accessKey, isVar: object.accessKey.type === 'variable' });
      valGrammer.value = call;
    } else if (object.type === 'array_access') {
      valGrammer.type = 'call';
      let accessKey;
      if (object.accessKey.type === 'number') {
        accessKey = object.accessKey.value.value;
      } else if (object.accessKey.type === 'variable') {
        accessKey = object.accessKey.id.lexeme;
      } else {
        debug.stack(object);
      }
      let current = object.id.inferred;
      let call = new GrammerCall('key');
      call.addPath({ type: 'object', name: object.id.lexeme });
      if (object.propertyPathTypes) {
        for (let i = 0; i < object.propertyPath.length; i++) {
          if (current.type === 'model') {
            call.type = 'prop';
            call.addPath({ type: 'prop', name: object.propertyPath[i].lexeme });
          } else if (current.type === 'array') {
            call.addPath({ type: 'list', name: object.propertyPath[i].lexeme });
          } else {
            call.addPath({ type: 'map', name: object.propertyPath[i].lexeme });
          }
          current = object.propertyPathTypes[i];
        }
      }
      call.addPath({ type: 'list', name: accessKey, isVar: object.accessKey.type === 'variable' });
      valGrammer.value = call;
    } else {
      debug.stack('unimpelemented : ' + object.type, object);
    }
    if (object.inferred) {
      valGrammer.dataType = this.resolveTypeItem(object.inferred);
    }
    if (!valGrammer.dataType) {
      debug.stack('Invalid GrammerValue.dataType', valGrammer, object);
    }

    return valGrammer;
  }

  visitStmt(obj, stmt, belong) {
    let node;
    let renderByGrammerValueTypes = [
      'construct_model',
      'property_access',
      'map_access',
      'boolean',
      'super',
      'not',
    ];
    if (renderByGrammerValueTypes.indexOf(stmt.type) > -1) {
      node = this.renderGrammerValue(null, stmt);
    } else if (stmt.type === 'declare') {
      let type = null;
      if (stmt.expectedType) {
        type = this.resolveTypeItem(stmt.expectedType);
      } else if (stmt.expr.inferred) {
        type = this.resolveTypeItem(stmt.expr.inferred);
      } else {
        debug.stack(stmt);
      }
      let expectedType = stmt.expectedType ? stmt.expectedType : null;
      assert.strictEqual(true, type instanceof TypeItem);
      let variate = new GrammerVar(stmt.id.lexeme, type);
      let value = this.renderGrammerValue(null, stmt.expr, expectedType);
      node = new GrammerExpr(variate, Symbol.assign(), value);
    } else if (stmt.type === 'requestAssign') {
      let variate = new GrammerCall('prop', [
        { type: 'object', name: this.config.request },
        { type: 'prop', name: stmt.left.id.lexeme }
      ]);
      let value = this.renderGrammerValue(null, stmt.expr);
      if (stmt.left.type === 'request_property_assign') {
        let key = '';
        stmt.left.propertyPath.forEach((p, i) => {
          if (i === stmt.left.propertyPath.length - 1) {
            key = p.lexeme;
          } else {
            variate.addPath({ type: 'map', name: p.lexeme });
          }
        });
        node = new BehaviorSetMapItem(variate, key, value);
      } else {
        node = new GrammerExpr(variate, Symbol.assign(), value);
      }
    } else if (stmt.type === 'ifRequestAssign' || stmt.type === 'if') {
      node = this.visitIfElse(stmt, 'if');
    } else if (stmt.type === 'elseIfRequestAssign') {
      node = this.visitIfElse(stmt, 'elseif');
    } else if (stmt.type === 'return') {
      node = new GrammerReturn();
      if (typeof stmt.expr === 'undefined') {
        node.type = 'null';
      } else if (stmt.expr.type === 'null') {
        node.type = 'null';
      } else if (stmt.expr.type === 'call') {
        let val = this.renderGrammerValue(null, stmt.expr);
        node.expr = val;
        node.type = 'grammer';
      } else if (_isBasicType(stmt.expr.type)) {
        node.type = stmt.expr.type;
        node.expr = this.renderGrammerValue(null, stmt.expr);
      } else {
        node.expr = this.renderGrammerValue(null, stmt.expr);
        node.type = 'grammer';
      }
      if (stmt.expectedType && stmt.expectedType.type === 'model') {
        node.expr = new BehaviorToModel(node.expr, stmt.expectedType.name);
      }
    } else if (stmt.type === 'throw') {
      this.currThrows['$Error'] = errorType;
      node = new GrammerThrows(errorType);
      if (Array.isArray(stmt.expr)) {
        stmt.expr.forEach(e => {
          node.addParam(this.renderGrammerValue(null, e));
        });
      } else {
        node.addParam(this.renderGrammerValue(null, stmt.expr));
      }
    } else if (stmt.type === 'virtualCall') {
      let val = this.renderGrammerValue(null, stmt);
      node = val.value;
    } else if (stmt.type === 'while') {
      node = new GrammerCondition('while');
      if (Array.isArray(stmt.condition)) {
        stmt.condition.forEach(c => {
          node.addCondition(this.renderGrammerValue(null, c));
        });
      } else {
        node.addCondition(this.renderGrammerValue(null, stmt.condition));
      }
      if (stmt.stmts) {
        stmt.stmts.stmts.forEach(s => {
          this.visitStmt(node, s, node.index);
        });
      }
    } else if (stmt.type === 'for') {
      node = new GrammerLoop('foreach');
      node.item = new GrammerVar(stmt.id.lexeme, this.resolveTypeItem(stmt.list.inferred.itemType));
      node.source = this.renderGrammerValue(null, stmt.list);
      if (stmt.stmts) {
        stmt.stmts.stmts.forEach(s => {
          this.visitStmt(node, s, node.index);
        });
      }
    } else if (stmt.type === 'assign') {
      let hasMapAccess = false;
      const right = this.renderGrammerValue(null, stmt.expr);
      if (stmt.left.type === 'property') {
        hasMapAccess = stmt.left.propertyPathTypes.some(item => item.type === 'map');
        if (hasMapAccess) {
          const grammerValue = this.renderGrammerValue(null, stmt.left);
          const call = grammerValue.value;
          let lastIndex = 0;
          for (let i = 0; i < stmt.left.propertyPathTypes.length; i++) {
            const propertyPathType = stmt.left.propertyPathTypes[i];
            if (propertyPathType.type === 'map') {
              lastIndex = i;
              break;
            }
          }
          if (lastIndex + 1 < stmt.left.propertyPathTypes.length) {
            call.type = 'prop';
            call.path = call.path.splice(0, lastIndex + 2);
            const key = stmt.left.propertyPath[lastIndex + 1].lexeme;
            node = new BehaviorSetMapItem(call, key, right);
          } else {
            hasMapAccess = false;
          }
        }
      } else if (stmt.left.type === 'map_access') {
        hasMapAccess = true;
        const grammerValue = this.renderGrammerValue(null, stmt.left);
        const call = grammerValue.value;
        call.type = 'prop';
        call.path = call.path.splice(0, call.path.length - 1);
        node = new BehaviorSetMapItem(call, stmt.left.accessKey.value.string, right);
      }

      if (!hasMapAccess) {
        const left = this.renderGrammerValue(null, stmt.left);
        let isBehavior = false;
        if (left.type === 'call' && left.value instanceof GrammerCall && left.value.type === 'key') {
          const keyPath = left.value.path[left.value.path.length - 1];
          if (keyPath.type === 'map') {
            left.value.path = left.value.path.slice(0, left.value.path.length - 1);
            node = new BehaviorSetMapItem(left.value, keyPath.name, right);
            isBehavior = true;
          }
        }
        if (!isBehavior) {
          node = new GrammerExpr(
            left,
            Symbol.assign(),
            right
          );
        }
      }
    } else if (stmt.type === 'call') {
      node = this.renderGrammerValue(null, stmt).value;
    } else if (stmt.type === 'break') {
      node = new GrammerBreak();
    } else if (stmt.type === 'retry') {
      node = new BehaviorRetry();
    } else if (stmt.type === 'try') {
      const tryGram = new GrammerTryCatch();
      stmt.tryBlock.stmts.forEach(item => {
        this.visitStmt(tryGram, item, tryGram.index);
      });
      if (stmt.catchId) {
        const exceptionGram = new GrammerException(
          exceptionType,
          new GrammerVar(stmt.catchId.lexeme, exceptionType)
        );
        const catchGram = new GrammerCatch([], exceptionGram);

        if (stmt.catchBlock) {
          stmt.catchBlock.stmts.forEach(item => {
            this.visitStmt(catchGram, item, catchGram.index);
          });
        }
        tryGram.addCatch(catchGram);
      }
      if (stmt.finallyBlock) {
        const finallyGram = new GrammerFinally();
        stmt.finallyBlock.stmts.forEach(item => {
          this.visitStmt(finallyGram, item, finallyGram.index);
        });
        tryGram.setFinally(finallyGram);
      }
      node = tryGram;
    } else {
      debug.stack(stmt);
    }
    if (belong) {
      node.belong = belong;
    }
    this.findComments(obj, stmt, belong);
    obj.addBodyNode(node);
    this.findComments(obj, stmt, belong, 'back');
  }

  visitIfConfition(stmtCondition) {
    let condition;
    if (stmtCondition.left) {
      let opt;
      let optList = ['and', 'or', 'not'];
      if (optList.indexOf(stmtCondition.type) > -1) {
        switch (stmtCondition.type) {
        case 'and': opt = Symbol.and(); break;
        case 'or': opt = Symbol.or(); break;
        case 'not': opt = Symbol.not(); break;
        }
        condition = new GrammerExpr(
          this.renderGrammerValue(null, stmtCondition.left),
          opt,
          this.renderGrammerValue(null, stmtCondition.right)
        );
      } else if (stmtCondition.type === 'call') {
        condition = this.renderGrammerValue(null, stmtCondition);
      } else {
        debug.stack(stmtCondition);
      }
    } else {
      condition = this.renderGrammerValue(null, stmtCondition);
    }
    return condition;
  }

  visitIfElse(stmt, type = 'if') {
    let node = new GrammerCondition(type);
    if (stmt.condition) {
      node.addCondition(this.visitIfConfition(stmt.condition));
    }
    if (stmt.stmts) {
      if (stmt.stmts.type && stmt.stmts.type === 'stmts') {
        if (stmt.stmts.stmts.length > 0) {
          stmt.stmts.stmts.forEach(item => {
            this.visitStmt(node, item, node.index);
          });
        } else {
          this.findComments(node, stmt.stmts, 'between');
        }
      } else if (stmt.type && stmt.type === 'stmts') {
        if (stmt.stmts.length > 0) {
          stmt.stmts.forEach(item => {
            this.visitStmt(node, item, node.index);
          });
        } else {
          this.findComments(node, stmt, 'between');
        }
      } else {
        debug.stack(stmt);
      }
    } else {
      debug.stack(stmt);
    }

    if (stmt.elseIfs) {
      stmt.elseIfs.forEach(elseIf => {
        node.addElse(this.visitIfElse(elseIf, 'elseif'));
      });
    }

    if (stmt.elseStmts) {
      node.addElse(this.visitIfElse(stmt.elseStmts, 'else'));
    }

    if (stmt.elseAssigns) {
      stmt.elseAssigns.forEach(elseAssign => {
        node.elseItem.push(this.visitIfElse(elseAssign, 'else'));
      });
    }

    return node;
  }
}

module.exports = ClientResolver;