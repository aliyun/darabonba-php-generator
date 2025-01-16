<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests\Models\MyModel;
use AlibabaCloud\Dara\Model;
use Dara\PHP\Tests\Models\MyModel\submodel\model_;
class submodel extends Model {
  /**
   * @var string
   */
  public $stringfield;
  /**
   * @var model_
   */
  public $model;
  protected $_name = [
      'stringfield' => 'stringfield',
      'model' => 'model',
  ];

  public function validate()
  {
    Model::validateRequired('stringfield', $this->stringfield, true);
    if(null !== $this->model) {
      $this->model->validate();
    }
    Model::validateRequired('model', $this->model, true);
    parent::validate();
  }

  public function toArray($noStream = false)
  {
    $res = [];
    if (null !== $this->stringfield) {
      $res['stringfield'] = $this->stringfield;
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
    if (isset($map['stringfield'])) {
      $model->stringfield = $map['stringfield'];
    }

    if (isset($map['model'])) {
      $model->model = model_::fromMap($map['model']);
    }

    return $model;
  }


}

