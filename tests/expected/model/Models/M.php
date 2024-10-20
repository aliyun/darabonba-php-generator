<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests\Models;
use AlibabaCloud\Dara\Model;
use Dara\PHP\Tests\Models\M\subM;
class M extends Model {
  /**
   * @var subM
   */
  public $subM;
  protected $_name = [
      'subM' => 'subM',
  ];

  public function validate()
  {
    if(null !== $this->subM) {
      $this->subM->validate();
    }
    Model::validateRequired('subM', $this->subM, true);
    parent::validate();
  }

  public function toArray($noStream = false)
  {
    $res = [];
    if (null !== $this->subM) {
      $res['subM'] = null !== $this->subM ? $this->subM->toArray($noStream) : $this->subM;
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
    if (isset($map['subM'])) {
      $model->subM = subM::fromMap($map['subM']);
    }

    return $model;
  }


}

