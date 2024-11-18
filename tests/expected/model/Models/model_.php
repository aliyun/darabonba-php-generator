<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests\Models;
use AlibabaCloud\Dara\Model;
class model_ extends Model {
  /**
   * @var string
   */
  public $str;
  protected $_name = [
      'str' => 'str',
  ];

  public function validate()
  {
    Model::validateRequired('str', $this->str, true);
    parent::validate();
  }

  public function toArray($noStream = false)
  {
    $res = [];
    if (null !== $this->str) {
      $res['str'] = $this->str;
    }

    return $res;
  }

  public function toMap($noStream = false)
  {
    return $this->toArray($noStream);
  }

  public static function fromMap($map = [])
  {
    $model = new self();
    if (isset($map['str'])) {
      $model->str = $map['str'];
    }

    return $model;
  }


}

