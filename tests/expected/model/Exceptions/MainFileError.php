<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests\Exceptions;
use AlibabaCloud\Dara\Exception\DaraException;
use Dara\PHP\Tests\Models\model_;
class MainFileError extends DaraException {
  /**
  * @var int
  */
  protected $size;
  /**
  * @var model_[]
  */
  protected $data;
  /**
  * @var \Dara\PHP\Tests\Models\MainFileError\model_
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
  * @return \Dara\PHP\Tests\Models\MainFileError\model_
  */
  public function getModel()
  {
    return $this->model;
  }
}

