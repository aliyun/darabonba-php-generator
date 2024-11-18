<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests;
use Dara\PHP\Tests\Model\Models\Info;
use Dara\PHP\Tests\Lib\UtilClient;
use Dara\PHP\Tests\ApiClient;
class Client {
  /**
   * @var Info
   */
  protected $_user;


  public function __construct()
  {
    $this->_user = new Info([
      'name' => 'test',
    ]);
  }


  /**
   * @return string
   */
  public function test3()
  {
    $it = UtilClient::test1();

    foreach($it as $test) {
      yield $test;
    }
  }

  /**
   * @return int
   */
  public function test4()
  {
    $api = new ApiClient();
    $status = $api->test3();
    return $status;
  }

}
