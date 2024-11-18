<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests\Models\MyModel;
use AlibabaCloud\Dara\Model;
class model_ extends Model {
  /**
   * @var string
   */
  public $str;
  /**
   * @var \Dara\PHP\Tests\Models\MyModel\model\model_
   */
  public $model;
  protected $_name = [
      'str' => 'str',
      'model' => 'model',
  ];

  public function validate()
  {
    Model::validateRequired('str', $this->str, true);
    if(null !== $this->model) {
      $this->model->validate();
    }
    Model::validateRequired('model', $this->model, true);
    parent::validate();
  }

  public function toArray($noStream = false)
  {
    $res = [];
    if (null !== $this->str) {
      $res['str'] = $this->str;
    }

    if (null !== $this->model) {
      $res['model'] = null !== $this->model ? $this->model->toArray($noStream) : $this->model;
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

    if (isset($map['model'])) {
      $model->model = \Dara\PHP\Tests\Models\MyModel\model\model_::fromMap($map['model']);
    }

    return $model;
  }


}

