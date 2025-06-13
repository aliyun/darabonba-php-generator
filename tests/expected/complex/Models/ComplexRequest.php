<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests\Models;
use AlibabaCloud\Dara\Model;
use Source\Models\complexrequest;
use GuzzleHttp\Psr7\Stream;
use Dara\PHP\Tests\Models\ComplexRequest\header;
use Dara\PHP\Tests\Models\ComplexRequest\configs;
use Dara\PHP\Tests\Models\ComplexRequest\part;
class ComplexRequest extends Model {
  /**
   * @var complexrequest
   */
  public $duplicatName;
  /**
   * @var string
   */
  public $accessKey;
  /**
   * @var Stream
   */
  public $body;
  /**
   * @var string[]
   */
  public $strs;
  /**
   * @var header
   */
  public $header;
  /**
   * @var int
   */
  public $Num;
  /**
   * @var configs
   */
  public $configs;
  /**
   * @var part[]
   */
  public $part;
  protected $_name = [
      'duplicatName' => 'duplicatName',
      'accessKey' => 'accessKey',
      'body' => 'Body',
      'strs' => 'Strs',
      'header' => 'header',
      'Num' => 'Num',
      'configs' => 'configs',
      'part' => 'Part',
  ];

  public function validate()
  {
    if(null !== $this->duplicatName) {
      $this->duplicatName->validate();
    }
    Model::validateRequired('duplicatName', $this->duplicatName, true);
    Model::validateRequired('accessKey', $this->accessKey, true);
    Model::validateRequired('body', $this->body, true);
    if(is_array($this->strs)) {
      Model::validateArray($this->strs);
    }
    Model::validateRequired('strs', $this->strs, true);
    if(null !== $this->header) {
      $this->header->validate();
    }
    Model::validateRequired('header', $this->header, true);
    Model::validateRequired('Num', $this->Num, true);
    if(null !== $this->configs) {
      $this->configs->validate();
    }
    Model::validateRequired('configs', $this->configs, true);
    if(is_array($this->part)) {
      Model::validateArray($this->part);
    }
    parent::validate();
  }

  public function toArray($noStream = false)
  {
    $res = [];
    if (null !== $this->duplicatName) {
      $res['duplicatName'] = null !== $this->duplicatName ? $this->duplicatName->toArray($noStream) : $this->duplicatName;
    }

    if (null !== $this->accessKey) {
      $res['accessKey'] = $this->accessKey;
    }

    if (null !== $this->body) {
      $res['Body'] = $this->body;
    }

    if (null !== $this->strs) {
      if(is_array($this->strs)) {
        $res['Strs'] = [];
        $n1 = 0;
        foreach($this->strs as $item1) {
          $res['Strs'][$n1] = $item1;
          $n1++;
        }
      }
    }

    if (null !== $this->header) {
      $res['header'] = null !== $this->header ? $this->header->toArray($noStream) : $this->header;
    }

    if (null !== $this->Num) {
      $res['Num'] = $this->Num;
    }

    if (null !== $this->configs) {
      $res['configs'] = null !== $this->configs ? $this->configs->toArray($noStream) : $this->configs;
    }

    if (null !== $this->part) {
      if(is_array($this->part)) {
        $res['Part'] = [];
        $n1 = 0;
        foreach($this->part as $item1) {
          $res['Part'][$n1] = null !== $item1 ? $item1->toArray($noStream) : $item1;
          $n1++;
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
    if (isset($map['duplicatName'])) {
      $model->duplicatName = complexrequest::fromMap($map['duplicatName']);
    }

    if (isset($map['accessKey'])) {
      $model->accessKey = $map['accessKey'];
    }

    if (isset($map['Body'])) {
      $model->body = $map['Body'];
    }

    if (isset($map['Strs'])) {
      if(!empty($map['Strs'])) {
        $model->strs = [];
        $n1 = 0;
        foreach($map['Strs'] as $item1) {
          $model->strs[$n1] = $item1;
          $n1++;
        }
      }
    }

    if (isset($map['header'])) {
      $model->header = header::fromMap($map['header']);
    }

    if (isset($map['Num'])) {
      $model->Num = $map['Num'];
    }

    if (isset($map['configs'])) {
      $model->configs = configs::fromMap($map['configs']);
    }

    if (isset($map['Part'])) {
      if(!empty($map['Part'])) {
        $model->part = [];
        $n1 = 0;
        foreach($map['Part'] as $item1) {
          $model->part[$n1] = part::fromMap($item1);
          $n1++;
        }
      }
    }

    return $model;
  }


}

