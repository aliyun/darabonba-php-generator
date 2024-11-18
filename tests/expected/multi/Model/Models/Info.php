<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests\Model\Models;
use AlibabaCloud\Dara\Model;
use AlibabaCloud\Tea\Utils\Utils\RuntimeOptions;
class Info extends Model {
  /**
   * @var string
   */
  public $name;
  /**
   * @var int
   */
  public $age;
  /**
   * @var RuntimeOptions
   */
  public $runtime;
  protected $_name = [
      'name' => 'name',
      'age' => 'age',
      'runtime' => 'runtime',
  ];

  public function validate()
  {
    Model::validateRequired('name', $this->name, true);
    Model::validateRequired('age', $this->age, true);
    if(null !== $this->runtime) {
      $this->runtime->validate();
    }
    Model::validateRequired('runtime', $this->runtime, true);
    parent::validate();
  }

  public function toArray($noStream = false)
  {
    $res = [];
    if (null !== $this->name) {
      $res['name'] = $this->name;
    }

    if (null !== $this->age) {
      $res['age'] = $this->age;
    }

    if (null !== $this->runtime) {
      $res['runtime'] = null !== $this->runtime ? $this->runtime->toArray($noStream) : $this->runtime;
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
    if (isset($map['name'])) {
      $model->name = $map['name'];
    }

    if (isset($map['age'])) {
      $model->age = $map['age'];
    }

    if (isset($map['runtime'])) {
      $model->runtime = RuntimeOptions::fromMap($map['runtime']);
    }

    return $model;
  }


}

