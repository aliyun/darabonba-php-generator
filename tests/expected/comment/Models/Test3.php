<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests\Models;
use AlibabaCloud\Dara\Model;
/**
 * @remarks
 * TestModel3
 */
class Test3 extends Model {
  // model的test front comment
  /**
   * @var string
   */
  public $test;
  // empty comment1
  // empy comment2
  /**
   * @var string
   */
  public $test1;
  //model的test1 back comment
  protected $_name = [
      'test' => 'test',
      'test1' => 'test1',
  ];

  public function validate()
  {
    Model::validateRequired('test', $this->test, true);
    Model::validateRequired('test1', $this->test1, true);
    parent::validate();
  }

  public function toArray($noStream = false)
  {
    $res = [];
    if (null !== $this->test) {
      $res['test'] = $this->test;
    }

    if (null !== $this->test1) {
      $res['test1'] = $this->test1;
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

    if (isset($map['test1'])) {
      $model->test1 = $map['test1'];
    }

    return $model;
  }


}

