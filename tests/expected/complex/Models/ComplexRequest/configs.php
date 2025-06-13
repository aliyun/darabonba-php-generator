<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests\Models\ComplexRequest;
use AlibabaCloud\Dara\Model;
class configs extends Model {
  /**
   * @var string
   */
  public $key;
  /**
   * @var string[]
   */
  public $value;
  /**
   * @var string[]
   */
  public $extra;
  protected $_name = [
      'key' => 'key',
      'value' => 'value',
      'extra' => 'extra',
  ];

  public function validate()
  {
    Model::validateRequired('key', $this->key, true);
    if(is_array($this->value)) {
      Model::validateArray($this->value);
    }
    Model::validateRequired('value', $this->value, true);
    if(is_array($this->extra)) {
      Model::validateArray($this->extra);
    }
    Model::validateRequired('extra', $this->extra, true);
    parent::validate();
  }

  public function toArray($noStream = false)
  {
    $res = [];
    if (null !== $this->key) {
      $res['key'] = $this->key;
    }

    if (null !== $this->value) {
      if(is_array($this->value)) {
        $res['value'] = [];
        $n1 = 0;
        foreach($this->value as $item1) {
          $res['value'][$n1] = $item1;
          $n1++;
        }
      }
    }

    if (null !== $this->extra) {
      if(is_array($this->extra)) {
        $res['extra'] = [];
        foreach($this->extra as $key1 => $value1) {
          $res['extra'][$key1] = $value1;
        }
      }
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
    if (isset($map['key'])) {
      $model->key = $map['key'];
    }

    if (isset($map['value'])) {
      if(!empty($map['value'])) {
        $model->value = [];
        $n1 = 0;
        foreach($map['value'] as $item1) {
          $model->value[$n1] = $item1;
          $n1++;
        }
      }
    }

    if (isset($map['extra'])) {
      if(!empty($map['extra'])) {
        $model->extra = [];
        foreach($map['extra'] as $key1 => $value1) {
          $model->extra[$key1] = $value1;
        }
      }
    }

    return $model;
  }


}

