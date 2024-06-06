<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests;
use Source\SourceClient;
use Dara\PHP\Tests\Models\B;
class Client extends SourceClient {

  public function __construct($config)
  {
    parent::__construct($config);
    $this->_endpointRule = 'central';
    $this->_endpointMap = [
      'ap-northeast-1' => 'cusanalytic.aliyuncs.com',
      'ap-south-1' => 'cusanalytic.aliyuncs.com',
    ];
    @$this->_endpointMap['ap-northeast-1'];
    @$this->_endpointMap['ap-northeast-1'] = '';
    @$this->_endpointMap['test'] = 'test';
    $b = new B([ ]);

    foreach($b->mm as $a) {
      @$a->m[$a->str];
    }
  }



}
