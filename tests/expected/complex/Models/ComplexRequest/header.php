<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests\Models\ComplexRequest;
use AlibabaCloud\Dara\Model;
class header extends Model {
  /**
   * @var string
   */
  public $content;
  protected $_name = [
      'content' => 'Content',
  ];

  public function validate()
  {
    Model::validateRequired('content', $this->content, true);
    parent::validate();
  }

  public function toArray($noStream = false)
  {
    $res = [];
    if (null !== $this->content) {
      $res['Content'] = $this->content;
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
    if (isset($map['Content'])) {
      $model->content = $map['Content'];
    }

    return $model;
  }


}

