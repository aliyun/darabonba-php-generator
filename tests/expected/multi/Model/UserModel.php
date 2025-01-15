<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests\Model;
use AlibabaCloud\Tea\Utils\Utils;
use AlibabaCloud\Tea\Utils\Test\Test;
use Dara\PHP\Tests\Lib\UtilClient;
class UserModel {

  /**
   * @return string
   */
  static public function test()
  {
    $a = Utils::getNonce();
    yield $a;
    Test::convert('test');
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
