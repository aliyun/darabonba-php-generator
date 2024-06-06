<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests\model;
use AlibabaCloud\Tea\Utils\Utils;
use Dara\PHP\Tests\lib\UtilClient;
class UserModel {

  /**
   * @return string
   */
  static public function test()
  {
    $a = Utils::getNonce();
    yield $a;
    $it = UtilClient::test1();

    foreach($it as $test) {
      yield $test;
    }
  }

  /**
   * @return string
   */
  static public function test1()
  {
    return 'test1';
  }

}
