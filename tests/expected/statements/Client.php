<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests;
use AlibabaCloud\Dara\Dara;
use AlibabaCloud\Dara\Request;
use AlibabaCloud\Dara\Exception\DaraUnableRetryException;
use AlibabaCloud\Dara\Exception\DaraException;
class Client {

  /**
   * @return void
   */
  public function hello()
  {
    $_request = new Request();
    $_request->method = 'GET';
    $_request->pathname = '/';
    $_request->headers = [
      'host' => 'www.test.com',
    ];
    if (true) {
      @$_request->headers['host'] = 'www.test2.com';
    }

    $_response = Dara::send($_request);

    if (true) {
      throw DaraUnableRetryException($_lastRequest, $_lastException);
    } else {
      true;
    }

    self::helloIf();
    !false;
    $a = null;
    $a = 'string';
    return null;
  }

  /**
   * @return void
   */
  static public function helloIf()
  {
    if (true) {
      
    }

    if (true) {
      
    } else if (true) {
      
    } else {
      
    }

  }

  /**
   * @return void
   */
  static public function helloThrow()
  {
    throw new DaraException([ ]);
  }

  /**
   * @return void
   */
  static public function helloForBreak()
  {

    foreach([ ] as $item) {
      break;
    }
  }

  /**
   * @return void
   */
  static public function helloWhile()
  {

    while (true) {
      break;
    }
  }

  /**
   * @return void
   */
  static public function helloDeclare()
  {
    $hello = 'world';
    $helloNull = null;
    $hello = 'hehe';
  }

}
