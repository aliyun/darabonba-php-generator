<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests\Exceptions;
use AlibabaCloud\Dara\Exception\DaraException;
use Dara\PHP\Tests\Models\model_;
class MainFileException extends DaraException {
  /**
  * @var int
  */
  protected $size;
  /**
  * @var model_[]
  */
  public $data;
  /**
  * @var \Dara\PHP\Tests\Models\MainFile\model_
  */
  protected $model;

  public function __construct($map)
  {
    parent::__construct($map);
    $this->size = $map['size'];
    $this->data = $map['data'];
    $this->model = $map['model'];
  }

  /**
  * @return int
  */
  public function getSize()
  {
    return $this->size;
  }
  /**
  * @return model_[]
  */
  public function getData()
  {
    return $this->data;
  }
  /**
  * @return \Dara\PHP\Tests\Models\MainFile\model_
  */
  public function getModel()
  {
    return $this->model;
  }
}

