<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests\Models;
use AlibabaCloud\Dara\Model;
/**
 * @remarks
 * TestModel
 */
class Test extends Model {
  /**
   * @var string
   */
  public $test;
  protected $_name = [
      'test' => 'test',
  ];

  public function validate()
  {
    Model::validateRequired('test', $this->test, true);
    parent::validate();
  }

  public function toArray($noStream = false)
  {
    $res = [];
    if (null !== $this->test) {
      $res['test'] = $this->test;
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

    return $model;
  }


}

