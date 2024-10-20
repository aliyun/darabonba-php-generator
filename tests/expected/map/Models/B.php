<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests\Models;
use AlibabaCloud\Dara\Model;
use Dara\PHP\Tests\Models\A;
class B extends Model {
  /**
   * @var A[]
   */
  public $mm;
  protected $_name = [
      'mm' => 'mm',
  ];

  public function validate()
  {
    if(is_array($this->mm)) {
      Model::validateArray($this->mm);
    }
    Model::validateRequired('mm', $this->mm, true);
    parent::validate();
  }

  public function toArray($noStream = false)
  {
    $res = [];
    if (null !== $this->mm) {
      if(is_array($this->mm)) {
        $res['mm'] = [];
        $n1 = 0;
        foreach($this->mm as $item1) {
          $res['mm'][$n1++] = null !== $item1 ? $item1->toArray($noStream) : $item1;
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
    if (isset($map['mm'])) {
      if(!empty($map['mm'])) {
        $model->mm = [];
        $n1 = 0;
        foreach($map['mm'] as $item1) {
          $model->mm[$n1++] = A::fromMap($item1);
        }
      }
    }

    return $model;
  }


}

