<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests\Models;
use AlibabaCloud\Dara\Model;
// import comment
/**
 * @remarks
 * TestModel
 */
class Test1 extends Model {
  /**
   * @var string
   */
  public $test;
  //model的test back comment
  /**
   * @var string
   */
  public $test2;
  //model的test2 back comment
  protected $_name = [
      'test' => 'test',
      'test2' => 'test2',
  ];

  public function validate()
  {
    Model::validateRequired('test', $this->test, true);
    Model::validateRequired('test2', $this->test2, true);
    parent::validate();
  }

  public function toArray($noStream = false)
  {
    $res = [];
    if (null !== $this->test) {
      $res['test'] = $this->test;
    }

    if (null !== $this->test2) {
      $res['test2'] = $this->test2;
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
    if (isset($map['test'])) {
      $model->test = $map['test'];
    }

    if (isset($map['test2'])) {
      $model->test2 = $map['test2'];
    }

    return $model;
  }


}

