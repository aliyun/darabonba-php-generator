<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests\Exceptions;
use AlibabaCloud\Dara\Exception\DaraException;
class Err1 extends DaraException {
  /**
  * @var string[]
  */
  protected $data;

  public function __construct($map)
  {
    parent::__construct($map);
    $this->data = $map['data'];
  }

  /**
  * @return string[]
  */
  public function getData()
  {
    return $this->data;
  }
}

