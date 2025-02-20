'use strict';
const DSL = require('@darabonba/parser');
const  { _vid, _name, _string } = require('./helper');

const types = [
  'integer', 'int8', 'int16', 'int32', 
  'int64', 'long', 'ulong', 'string',
  'uint8', 'uint16', 'uint32', 'uint64',
  'number', 'float', 'double', 'boolean',
  'bytes', 'readable', 'writable', 'object', 'any'
];

const integers = [
  'integer', 'int8', 'int16', 'int32', 
  'int64', 'long', 'ulong',
  'uint8', 'uint16', 'uint32', 'uint64'
];

const floats = ['float', 'double'];
const BuiltinModule = {
  DaraBuiltin:  {
    namespace: 'AlibabaCloud\\Dara\\Util',
    className: 'Utils',
  },
  DaraString: {
    namespace: 'AlibabaCloud\\Dara\\Util',
    className: 'StringUtil',
  },
  DaraMath: {
    namespace: 'AlibabaCloud\\Dara\\Util',
    className: 'MathUtil',
  },
  DaraStream: {
    namespace: 'AlibabaCloud\\Dara\\Util',
    className: 'StreamUtil',
  },
  DaraConsole: {
    namespace: 'AlibabaCloud\\Dara\\Util',
    className: 'Console',
  },
  DaraXML: {
    namespace: 'AlibabaCloud\\Dara\\Util',
    className: 'XML',
  },
  DaraURL: {
    namespace: 'AlibabaCloud\\Dara',
    className: 'Url',
  },
  DaraForm: {
    namespace: 'AlibabaCloud\\Dara\\Util',
    className: 'FormUtil',
  },
  DaraFile: {
    namespace: 'AlibabaCloud\\Dara',
    className: 'File',
  },
  DaraBytes: {
    namespace: 'AlibabaCloud\\Dara\\Util',
    className: 'BytesUtil',
  },
  DaraDate: {
    namespace: 'AlibabaCloud\\Dara',
    className: 'Date',
  },
};
class Builtin {
  constructor(generator, aliasId = 'DaraBuiltin', methods = []){
    this.generator = generator;
    this.module = module;
    this.aliasId = aliasId;
  

    methods.forEach(method => {
      this[method] = function(args, level) {
        const clientName = this.getClientName();
        this.generator.emit(`${clientName}::${method}`);
        this.generator.visitArgs(args, level);
      };
    });
  }

  getInstanceName(ast) {
    if (ast.left.id.tag === DSL.Tag.Tag.VID) {
      this.generator.emit(`$this->${_vid(ast.left.id)}`);
    } else {
      this.generator.emit(`$${_name(ast.left.id)}`);
    }
  }

  getClientName() {
    if(!this.generator.moduleClass.has(this.aliasId)) {
      const { namespace, className } = BuiltinModule[this.aliasId];
      this.generator.moduleClass.set(this.aliasId, {
        namespace,
        className,
        aliasName: this.generator.getAliasName(namespace, className, 'Dara')
      });
    }
    
    return this.generator.getRealClientName(this.aliasId);
  }
}

class Env extends Builtin {
  constructor(generator){
    super(generator);
  }

  get(args){
    const key = args[0];
    this.generator.emit('getenv(');
    this.generator.visitExpr(key);
    this.generator.emit(')');
  }

  set(args){
    const key = args[0];
    this.generator.emit('putenv(');
    if(key.type === 'string') {
      this.generator.emit(`'${_string(key.value)}=`);
    } else {
      this.generator.visitExpr(key);
      this.generator.emit('.\'=');
    }
    
    const value = args[1];
    if(value.type === 'string') {
      this.generator.emit(`${_string(value.value)}'`);
    } else {
      this.generator.emit('\'.');
      this.generator.visitExpr(value);
    }
    this.generator.emit(')');
  }
}

class Logger extends Builtin {
  constructor(generator){
    const methods = ['log', 'info', 'debug', 'error', 'warning'];
    super(generator, 'DaraConsole', methods);
  }
}

class XML extends Builtin {
  constructor(generator){
    const methods = ['parseXml', 'toXML'];
    super(generator, 'DaraXML', methods);
  }
}

class URL extends Builtin {
  constructor(generator){
    const methods = ['parse', 'urlEncode', 'percentEncode', 'pathEncode'];
    super(generator, 'DaraURL', methods);
  }
}

class Stream extends Builtin {
  constructor(generator){
    const methods = ['readAsBytes', 'readAsJSON', 'readAsString', 'readAsSSE', 'streamFor'];
    super(generator, 'DaraStream', methods);
  }
}

class Number extends Builtin {
  constructor(generator){
    const methods = ['random'];
    super(generator, 'DaraMath', methods);
  }

  floor(args) {
    this.generator.emit('floor');
    this.generator.visitArgs(args);
  }

  round(args) {
    this.generator.emit('round');
    this.generator.visitArgs(args);
  }

  min(args) {
    this.generator.emit('min');
    this.generator.visitArgs(args);
  }

  max(args) {
    this.generator.emit('max');
    this.generator.visitArgs(args);
  }

  parseInt(ast) {
    this.generator.emit('intval(\'\'.');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  parseLong(ast) {
    this.generator.emit('intval(\'\'.');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  parseFloat(ast) {
    this.generator.emit('floatval(\'\'.');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  parseDouble(ast) {
    this.generator.emit('floatval(\'\'.');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  itol(ast) {
    this.getInstanceName(ast);
  }

  ltoi(ast) {
    this.getInstanceName(ast);
  }
}

class JSON extends Builtin {
  stringify(args, level) {
    const expr = args[0];
    this.generator.emit('json_encode(');
    this.generator.visitExpr(expr, level);
    if(expr.inferred && expr.inferred.type === 'model') {
      this.generator.emit('->toArray()');
    }
    this.generator.emit(', JSON_UNESCAPED_UNICODE + JSON_UNESCAPED_SLASHES)');
  }

  parseJSON(args, level){
    const expr = args[0];
    this.generator.emit('json_decode(');
    this.generator.visitExpr(expr, level);
    this.generator.emit(', true)');
  }
}

class Form extends Builtin {
  constructor(generator){
    const methods = ['toFormString', 'getBoundary', 'toFileForm'];
    super(generator, 'DaraForm', methods);
  }
}

class File extends Builtin {
  constructor(generator){
    const methods = ['createReadStream', 'createWriteStream', 'exists'];
    super(generator, 'DaraFile', methods);
  }
}

class DaraDate extends Builtin {
  constructor(generator){
    const methods = [
      'format', 'unix', 'diff', 'UTC', 'add', 'sub', 'hour',
      'minute', 'second', 'dayOfYear', 'dayOfMonth', 'dayOfWeek',
      'weekOfYear', 'weekOfMonth', 'month', 'year'
    ];
    super(generator, 'DaraDate', methods);
  }
}

class Bytes extends Builtin {
  constructor(generator){
    super(generator, 'DaraBytes');
  }

  from(args) {
    const clientName = this.getClientName();
    this.generator.emit(`${clientName}::from`);
    this.generator.visitArgs(args);
  }

  toString(ast) {
    const clientName = this.getClientName();
    this.generator.emit(`${clientName}::toString(`);
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  toHex(ast) {
    const clientName = this.getClientName();
    this.generator.emit('bin2hex(');
    this.generator.emit(`${clientName}::toString(`);
    this.getInstanceName(ast);
    this.generator.emit('))');
  }

  toBase64(ast) {
    const clientName = this.getClientName();
    this.generator.emit('base64_encode(');
    this.generator.emit(`${clientName}::toString(`);
    this.getInstanceName(ast);
    this.generator.emit('))');
  }

  toJSON(ast) {
    const clientName = this.getClientName();
    this.generator.emit(`${clientName}::toString(`);
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  length(ast){ 
    this.generator.emit('strlen(');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }
}


class Converter {
  constructor(generator){
    this.generator = generator;
    this.stream = new Stream(generator);
    integers.forEach(type => {
      this[type] = function(args) {
        const expr = args[0];
        generator.emit('intval(');
        generator.visitExpr(expr);
        generator.emit(')');
      };
    });

    floats.forEach(type => {
      this[type] = function(args) {
        const expr = args[0];
        generator.emit('floatval(');
        generator.visitExpr(expr);
        generator.emit(')');
      };
    });
  }

  string(args) {
    const expr = args[0];
    this.generator.emit('\'\'.');
    this.generator.visitExpr(expr);
  }

  number(args) {
    const expr = args[0];
    this.generator.emit('(');
    this.generator.visitExpr(expr);
    this.generator.emit(' + 0)');
  }

  boolean(args) {
    const expr = args[0];
    this.generator.emit('boolval(');
    this.generator.visitExpr(expr);
    this.generator.emit(')');
  }

  bytes(args) {
    const expr = args[0];
    this.generator.emit('unpack(\'C*\', ');
    this.generator.visitExpr(expr);
    this.generator.emit(')');
  }

  any(args){
    const expr = args[0];
    this.generator.visitExpr(expr);
  }

  object(args){
    const expr = args[0];
    this.generator.visitExpr(expr);
  }

  readable(args){
    this.stream.streamFor(args);
  }

  writable(args){
    this.stream.streamFor(args);
  }
}

class Func {
  constructor(generator){
    this.generator = generator;
  }

  isNull(args) {
    this.generator.emit('is_null');
    this.generator.visitArgs(args);
  }

  sleep(args) {
    this.generator.emit('usleep');
    this.generator.visitArgs(args);
  }

  equal(args){
    this.generator.visitExpr(args[0]);
    this.generator.emit(' === ');
    this.generator.visitExpr(args[1]);
  }

  default(args){
    this.generator.emit('(');
    this.generator.visitExpr(args[0]);
    this.generator.emit(' ? ');
    this.generator.visitExpr(args[0]);
    this.generator.emit(' : ');
    this.generator.visitExpr(args[1]);
    this.generator.emit(')');
  }
}

class String extends Builtin {

  constructor(generator, methods = []){
    super(generator, 'DaraString', methods);
  }

  split(ast, level) {
    this.generator.emit('explode(');
    this.getInstanceName(ast);
    const args = ast.args;
    this.generator.emit(', ');
    const expr = args[0];
    this.generator.visitExpr(expr, level);
    this.generator.emit(')');
  }

  replace(ast, level) {
    const args = ast.args;
    const regex = args[0];
    this.generator.emit('preg_replace(');
    this.generator.visitExpr(regex, level);
    this.generator.emit(', ');
    this.generator.visitExpr(args[1], level);
    this.generator.emit(', ');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  contains(ast, level) {
    this.generator.emit('false !== strpos(');
    
    this.getInstanceName(ast);
    const args = ast.args;
    this.generator.emit(', ');
    const expr = args[0];
    this.generator.visitExpr(expr, level);
    this.generator.emit(')');
  }

  length(ast) {
    this.generator.emit('strlen(');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  hasPrefix(ast, level) {
    const clientName = this.getClientName();
    const args = ast.args;
    this.generator.emit(`${clientName}::hasPrefix(`);
    this.getInstanceName(ast);
    this.generator.emit(', ');
    const expr = args[0];
    this.generator.visitExpr(expr, level);
    this.generator.emit(')');
  }

  hasSuffix(ast, level) {
    const clientName = this.getClientName();
    const args = ast.args;
    this.generator.emit(`${clientName}::hasSuffix(`);
    this.getInstanceName(ast);
    this.generator.emit(', ');
    const expr = args[0];
    this.generator.visitExpr(expr, level);
    this.generator.emit(')');
  }

  index(ast, level) {
    this.generator.emit('strpos(');
    
    this.getInstanceName(ast);
    const args = ast.args;
    this.generator.emit(', ');
    const expr = args[0];
    this.generator.visitExpr(expr, level);
    this.generator.emit(')');
  }

  subString(ast, level) {
    this.generator.emit('substr(');
    
    this.getInstanceName(ast);
    const args = ast.args;
    this.generator.emit(', ');
    const start = args[0];
    this.generator.visitExpr(start, level);
    this.generator.emit(', ');
    const end = args[1];
    this.generator.visitExpr(end, level);
    this.generator.emit(')');
  }

  toLower(ast) {
    this.generator.emit('strtolower(');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  toUpper(ast) {
    this.generator.emit('strtoupper(');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  equals(ast) {
    this.getInstanceName(ast);
    const args = ast.args;
    const expr = args[0];
    this.generator.emit(' === ');
    this.generator.visitExpr(expr);

  }

  trim(ast) {
    this.generator.emit('trim(');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  empty_(ast) {
    this.generator.emit('empty(');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  toBytes(ast) {
    const clientName = this.getClientName();
    this.generator.emit(`${clientName}::toBytes(`);
    this.getInstanceName(ast);
    const args = ast.args;
    const expr = args[0];
    this.generator.emit(', ');
    this.generator.visitExpr(expr);
    this.generator.emit(')');
  }

  parseInt(ast) {
    this.generator.emit('intval(');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  parseLong(ast) {
    this.generator.emit('intval(');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  parseFloat(ast) {
    this.generator.emit('floatval(');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  parseDouble(ast) {
    this.generator.emit('floatval(');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }
}

class Array extends Builtin {
  join(ast ,level) {
    const args = ast.args;
    this.generator.emit('implode(');
    const expr = args[0];
    this.generator.visitExpr(expr, level);
    this.generator.emit(', ');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  full(ast, level) {
    const args = ast.args;
    const expr = args[0];
    this.generator.emit('array_map(function($item) {\n', level);
    this.generator.emit('return ', level + 1);
    this.generator.visitExpr(expr);
    this.generator.emit('\n');
    this.generator.emit('}, ', level);
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  shift(ast) {
    this.generator.emit('array_shift(');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  pop(ast) {
    this.generator.emit('array_pop(');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  push(ast) {
    const args = ast.args;
    const expr = args[0];
    this.generator.emit('array_pop(');
    this.getInstanceName(ast);
    this.generator.emit(', ');
    this.generator.visitExpr(expr);
    this.generator.emit(')');
  }

  unshift(ast) {
    const args = ast.args;
    const expr = args[0];
    this.generator.emit('array_unshift(');
    this.getInstanceName(ast);
    this.generator.emit(', ');
    this.generator.visitExpr(expr);
    this.generator.emit(')');
  }

  contains(ast, level) {
    const args = ast.args;
    this.generator.emit('\\in_array(');
    const expr = args[0];
    this.generator.visitExpr(expr, level);
    this.generator.emit(', ');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  concat(ast, level) {
    const args = ast.args;
    this.generator.emit('array_merge(');
    const expr = args[0];
    this.generator.visitExpr(expr, level);
    this.generator.emit(', ');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  length(ast) {
    this.generator.emit('\\count(');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  index(ast, level) {
    const args = ast.args;
    this.generator.emit('array_search(');
    const expr = args[0];
    this.generator.visitExpr(expr, level);
    this.generator.emit(', ');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  get(ast, level) {
    this.getInstanceName(ast);
    const args = ast.args;
    this.generator.emit('[');
    const expr = args[0];
    this.generator.visitExpr(expr, level);
    this.generator.emit(']');
  }

  sort(ast) {
    const order = _string(ast.args[0].value);
    if(order.toLowerCase() === 'asc') {
      this.generator.emit('sort(');
    } else if(order.toLowerCase() === 'desc'){
      this.generator.emit('rsort(');
    } else {
      throw Error('un-impelemented');
    }
    
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  append(ast) {
    const position = ast.args[1];
    const value = ast.args[0];
    this.generator.emit('array_splice(');
    this.getInstanceName(ast);
    this.generator.emit(', ');
    this.generator.visitExpr(position);
    this.generator.emit(', 0, ');
    this.generator.visitExpr(value);
    this.generator.emit(')');
  }

  remove(ast) {
    const value = ast.args[0];
    this.generator.emit('array_splice(');
    this.getInstanceName(ast);
    this.generator.emit(', array_search(');
    this.generator.visitExpr(value);
    this.generator.emit(', ');
    this.getInstanceName(ast);
    this.generator.emit('), 1)');
  }
}

class Map extends Builtin {

  length(ast) {
    this.generator.emit('\\count(');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  keySet(ast) {
    this.generator.emit('array_keys(');
    this.getInstanceName(ast);
    this.generator.emit(')');
  }

  entries(ast) {
    this.generator.emit('array_map(null, ');
    this.generator.emit('array_keys(');
    this.getInstanceName(ast);
    this.generator.emit('), ');
    this.generator.emit('array_values(');
    this.getInstanceName(ast);
    this.generator.emit('))');
  }

  toJSON(ast) {
    this.generator.emit('json_encode(');
    this.getInstanceName(ast);
    this.generator.emit(', JSON_UNESCAPED_UNICODE + JSON_UNESCAPED_SLASHES)');
  }

  merge(ast) {
    this.generator.emit('array_merge(');
    this.getInstanceName(ast);
    this.generator.emit(' , ');
    this.generator.visitExpr(ast.args[0]);
    this.generator.emit(')');
  }
}

class Entry extends Builtin {

  key(ast) {
    this.getInstanceName(ast);
    this.generator.emit('[0]');
  }

  value(ast) {
    this.getInstanceName(ast);
    this.generator.emit('[1]');
  }
}

module.exports = (generator) => {
  const builtin = {};
  builtin['$Env'] = new Env(generator);
  builtin['$Logger'] = new Logger(generator);
  builtin['$XML'] = new XML(generator);
  builtin['$URL'] = new URL(generator);
  builtin['$Stream'] = new Stream(generator);
  builtin['$Number'] = new Number(generator);
  builtin['$JSON'] = new JSON(generator);
  builtin['$Form'] = new Form(generator);
  builtin['$File'] = new File(generator);
  builtin['$Bytes'] = new Bytes(generator);
  const converter = new Converter(generator);
  types.map(type => {
    builtin[`$${type}`] = converter;
  });

  const func = new Func(generator);
  builtin['$isNull'] = func;
  builtin['$sleep'] = func;
  builtin['$default'] = func;
  builtin['$equal'] = func;

  builtin['$String'] = new String(generator);
  builtin['$Array'] = new Array(generator);
  builtin['$Date'] = new DaraDate(generator);
  builtin['$Map'] = new Map(generator);
  builtin['$Entry'] = new Entry(generator);

  return builtin;
};