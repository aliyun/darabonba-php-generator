<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests\Models;
use AlibabaCloud\Dara\Model;
class A extends Model {
  /**
   * @var string[]
   */
  public $m;
  /**
   * @var string
   */
  public $str;
  protected $_name = [
      'm' => 'm',
      'str' => 'str',
  ];

  public function validate()
  {
    if(is_array($this->m)) {
      Model::validateArray($this->m);
    }
    Model::validateRequired('m', $this->m, true);
    Model::validateRequired('str', $this->str, true);
    parent::validate();
  }

  public function toArray($noStream = false)
  {
    $res = [];
    if (null !== $this->m) {
      if(is_array($this->m)) {
        $res['m'] = [];
        foreach($this->m as $key1 => $value1) {
          $res['m'][$key1] = $value1;
        }
      }
    }

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
    if (isset($map['m'])) {
      if(!empty($map['m'])) {
        $model->m = [];
        foreach($map['m'] as $key1 => $value1) {
          $model->m[$key1] = $value1;
        }
      }
    }

    if (isset($map['str'])) {
      $model->str = $map['str'];
    }

    return $model;
  }


}

