<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests;
use RuntimeException;
class Client {

  /**
   * @return void
   */
  static public function hello()
  {
    return null;
  }

  /**
   * @return string[]
   */
  static public function helloMap()
  {
    $m = [ ];
    return Dara::merge([
      'key' => 'value',
      'key-1' => 'value-1',
      'key-2' => 'value-2',
      '""' => 'value-3',
    ], $m);
  }

  /**
   * @return string[][]
   */
  static public function helloArrayMap()
  {
    return [
      [
        'key' => 'value',
      ]
    ];
  }

  /**
   * @param string $a
   * @param string $b
   * @return void
   */
  static public function helloParams($a, $b)
  {
    $x = false;
    $y = true;
    $z = false;
    if ($x && $y || !$z) {
      
    }

  }

  // interface mode
  /**
   * @return void
   */
  static public function helloInterface()
  {
    throw new RuntimeException('Un-implemented!');
  }

}
