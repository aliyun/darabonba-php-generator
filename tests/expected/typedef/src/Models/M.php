<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Darabonba\Tests\Models;
use AlibabaCloud\Dara\Model;
use GuzzleHttp\Psr7\Request;
class M extends Model {
  /**
   * @var Request
   */
  public $a;
  /**
   * @var array
   */
  public $b;
  /**
   * @var Model
   */
  public $c;
  protected $_name = [
      'a' => 'a',
      'b' => 'b',
      'c' => 'c',
  ];

  public function validate()
  {
    parent::validate();
  }

  public function toArray($noStream = false)
  {
    $res = [];
    if (null !== $this->a) {
      $res['a'] = $this->a;
    }

    if (null !== $this->b) {
      $res['b'] = $this->b;
    }

    if (null !== $this->c) {
      $res['c'] = $this->c;
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
    if (isset($map['a'])) {
      $model->a = $map['a'];
    }

    if (isset($map['b'])) {
      $model->b = $map['b'];
    }

    if (isset($map['c'])) {
      $model->c = $map['c'];
    }

    return $model;
  }


}

