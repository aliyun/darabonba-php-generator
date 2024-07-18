<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests\Models\ComplexRequest;
use AlibabaCloud\Dara\Model;
class part extends Model {
  /**
   * PartNumber
   * @var string
   */
  public $partNumber;
  protected $_name = [
      'partNumber' => 'PartNumber',
  ];

  public function validate()
  {
    parent::validate();
  }

  public function toArray($noStream = false)
  {
    $res = [];
    if (null !== $this->partNumber) {
      $res['PartNumber'] = $this->partNumber;
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
    if (isset($map['PartNumber'])) {
      $model->partNumber = $map['PartNumber'];
    }

    return $model;
  }


}

