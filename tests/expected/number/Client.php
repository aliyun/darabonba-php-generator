<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests;
use Number\math\MathUtil;
use AlibabaCloud\Dara\Util\MathUtil as DaraMathUtil;
class Client {

  /**
   * @param string[] $args
   * @return void
   */
  static public function main($args)
  {
    $a = '123';
    $b = MathUtil::parseInt($a);
    $c = floatval(''.$b);
    $d = DaraMathUtil::random();
  }

}
