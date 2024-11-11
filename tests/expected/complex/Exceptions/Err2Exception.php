<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests\Exceptions;
use AlibabaCloud\Dara\Exception\DaraException;
class Err2Exception extends DaraException {
  /**
  * @var string
  */
  protected $accessErrMessage;

  public function __construct($map)
  {
    parent::__construct($map);
    $this->accessErrMessage = $map['accessErrMessage'];
  }

  /**
  * @return string
  */
  public function getAccessErrMessage()
  {
    return $this->accessErrMessage;
  }
}

