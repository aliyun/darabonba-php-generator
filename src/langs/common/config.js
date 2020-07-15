'use strict';

module.exports = {
  indent: '    ',
  ext: '.tea',
  resolvePathByPackage: false,
  package: 'DarabonbaSDK',
  pkgDir: '',
  output: true,
  layer: '',
  keywords: [],
  typeMap: {},
  symbolMap: {},
  modifyOrder: [],
  exceptionMap: {},
  model: {
    include: [],
    constructor: {
      params: []
    }
  },
  client: {
    filename: 'client',
    include: []
  },
  generateFileInfo: 'This file is auto-generated, don\'t edit it. Thanks.',
  response: '_response',
  request: '_request',
  runtime: '_runtime',
  baseClient: [],
  tea: {
    core: {
      name: 'TeaCore',
      doAction: 'doAction',
      allowRetry: 'allowRetry',
      sleep: 'sleep',
      getBackoffTime: 'getBackoffTime',
      isRetryable: 'isRetryable'
    },
    model: { name: 'TeaModel' },
    converter: { name: 'TeaConverter' },
    response: { name: 'TeaResponse' },
    request: { name: 'TeaRequest' },
    exception: { name: 'TeaException' },
    exceptionUnretryable: { name: 'TeaUnretryableException' },
  }
};