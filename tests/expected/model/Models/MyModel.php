<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests\Models;
use AlibabaCloud\Dara\Model;
use Dara\PHP\Tests\Models\MyModel\model_;
use Dara\PHP\Tests\Models\MyModel\submodel;
use Dara\PHP\Tests\Models\M;
use Dara\PHP\Tests\Models\MyModel\subarraymodel;
use Darabonba\Import\Client as SourceClient;
use Darabonba\Import\Models\Request;
use Dara\PHP\Tests\Models\M\subM;
use GuzzleHttp\Psr7\Stream;
class MyModel extends Model {
  /**
   * @var model_
   */
  public $model;
  /**
   * @var string
   */
  public $stringfield;
  /**
   * @var int[]
   */
  public $bytesfield;
  /**
   * @var string[]
   */
  public $stringarrayfield;
  /**
   * @var string[]
   */
  public $mapfield;
  /**
   * @var string
   */
  public $name;
  /**
   * @var submodel
   */
  public $submodel;
  /**
   * @var submodel[]
   */
  public $submodelMap;
  /**
   * @var M[]
   */
  public $mapModel;
  /**
   * @var subarraymodel[]
   */
  public $subarraymodel;
  /**
   * @var M[]
   */
  public $subarray;
  /**
   * @var M[][]
   */
  public $ssubarray;
  /**
   * @var SourceClient[][]
   */
  public $ssubmarray;
  /**
   * @var Request[][]
   */
  public $ssubmmarray;
  /**
   * @var mixed[][]
   */
  public $maparray;
  /**
   * @var SourceClient[][]
   */
  public $mapsubmarray;
  /**
   * @var Request[]
   */
  public $moduleModelMap;
  /**
   * @var subM[]
   */
  public $subModelMap;
  /**
   * @var M[]
   */
  public $modelMap;
  /**
   * @var SourceClient[]
   */
  public $moduleMap;
  /**
   * @var mixed[]
   */
  public $object;
  /**
   * @var Stream
   */
  public $readable;
  /**
   * @var Stream
   */
  public $writable;
  /**
   * @var M
   */
  public $existModel;
  /**
   * @var \AlibabaCloud\Dara\Request
   */
  public $request;
  /**
   * @var string[][]
   */
  public $complexList;
  /**
   * @var int
   */
  public $numberfield;
  /**
   * @var int
   */
  public $integerField;
  /**
   * @var float
   */
  public $floatField;
  /**
   * @var float
   */
  public $doubleField;
  /**
   * @var int
   */
  public $longField;
  /**
   * @var int
   */
  public $ulongField;
  /**
   * @var int
   */
  public $int8Field;
  /**
   * @var int
   */
  public $int16Field;
  /**
   * @var int
   */
  public $int32Field;
  /**
   * @var int
   */
  public $int64Field;
  /**
   * @var int
   */
  public $uint8Field;
  /**
   * @var int
   */
  public $uint16Field;
  /**
   * @var int
   */
  public $uint32Field;
  /**
   * @var int
   */
  public $uint64Field;
  /**
   * @var string
   */
  public $link;
  protected $_name = [
      'model' => 'model',
      'stringfield' => 'stringfield',
      'bytesfield' => 'bytesfield',
      'stringarrayfield' => 'stringarrayfield',
      'mapfield' => 'mapfield',
      'name' => 'realName',
      'submodel' => 'submodel',
      'submodelMap' => 'submodelMap',
      'mapModel' => 'mapModel',
      'subarraymodel' => 'subarraymodel',
      'subarray' => 'subarray',
      'ssubarray' => 'ssubarray',
      'ssubmarray' => 'ssubmarray',
      'ssubmmarray' => 'ssubmmarray',
      'maparray' => 'maparray',
      'mapsubmarray' => 'mapsubmarray',
      'moduleModelMap' => 'moduleModelMap',
      'subModelMap' => 'subModelMap',
      'modelMap' => 'modelMap',
      'moduleMap' => 'moduleMap',
      'object' => 'object',
      'readable' => 'readable',
      'writable' => 'writable',
      'existModel' => 'existModel',
      'request' => 'request',
      'complexList' => 'complexList',
      'numberfield' => 'numberfield',
      'integerField' => 'integerField',
      'floatField' => 'floatField',
      'doubleField' => 'doubleField',
      'longField' => 'longField',
      'ulongField' => 'ulongField',
      'int8Field' => 'int8Field',
      'int16Field' => 'int16Field',
      'int32Field' => 'int32Field',
      'int64Field' => 'int64Field',
      'uint8Field' => 'uint8Field',
      'uint16Field' => 'uint16Field',
      'uint32Field' => 'uint32Field',
      'uint64Field' => 'uint64Field',
      'link' => 'link',
  ];

  public function validate()
  {
    if(null !== $this->model) {
      $this->model->validate();
    }
    Model::validateRequired('model', $this->model, true);
    Model::validateRequired('stringfield', $this->stringfield, true);
    Model::validateRequired('bytesfield', $this->bytesfield, true);
    if(is_array($this->stringarrayfield)) {
      Model::validateArray($this->stringarrayfield);
    }
    Model::validateRequired('stringarrayfield', $this->stringarrayfield, true);
    if(is_array($this->mapfield)) {
      Model::validateArray($this->mapfield);
    }
    Model::validateRequired('mapfield', $this->mapfield, true);
    Model::validateRequired('name', $this->name, true);
    if(null !== $this->submodel) {
      $this->submodel->validate();
    }
    Model::validateRequired('submodel', $this->submodel, true);
    if(is_array($this->submodelMap)) {
      Model::validateArray($this->submodelMap);
    }
    Model::validateRequired('submodelMap', $this->submodelMap, true);
    if(is_array($this->mapModel)) {
      Model::validateArray($this->mapModel);
    }
    Model::validateRequired('mapModel', $this->mapModel, true);
    if(is_array($this->subarraymodel)) {
      Model::validateArray($this->subarraymodel);
    }
    Model::validateRequired('subarraymodel', $this->subarraymodel, true);
    if(is_array($this->subarray)) {
      Model::validateArray($this->subarray);
    }
    Model::validateRequired('subarray', $this->subarray, true);
    if(is_array($this->ssubarray)) {
      Model::validateArray($this->ssubarray);
    }
    Model::validateRequired('ssubarray', $this->ssubarray, true);
    if(is_array($this->ssubmarray)) {
      Model::validateArray($this->ssubmarray);
    }
    Model::validateRequired('ssubmarray', $this->ssubmarray, true);
    if(is_array($this->ssubmmarray)) {
      Model::validateArray($this->ssubmmarray);
    }
    Model::validateRequired('ssubmmarray', $this->ssubmmarray, true);
    if(is_array($this->maparray)) {
      Model::validateArray($this->maparray);
    }
    Model::validateRequired('maparray', $this->maparray, true);
    if(is_array($this->mapsubmarray)) {
      Model::validateArray($this->mapsubmarray);
    }
    Model::validateRequired('mapsubmarray', $this->mapsubmarray, true);
    if(is_array($this->moduleModelMap)) {
      Model::validateArray($this->moduleModelMap);
    }
    Model::validateRequired('moduleModelMap', $this->moduleModelMap, true);
    if(is_array($this->subModelMap)) {
      Model::validateArray($this->subModelMap);
    }
    Model::validateRequired('subModelMap', $this->subModelMap, true);
    if(is_array($this->modelMap)) {
      Model::validateArray($this->modelMap);
    }
    Model::validateRequired('modelMap', $this->modelMap, true);
    if(is_array($this->moduleMap)) {
      Model::validateArray($this->moduleMap);
    }
    Model::validateRequired('moduleMap', $this->moduleMap, true);
    Model::validateRequired('object', $this->object, true);
    Model::validateRequired('readable', $this->readable, true);
    Model::validateRequired('writable', $this->writable, true);
    if(null !== $this->existModel) {
      $this->existModel->validate();
    }
    Model::validateRequired('existModel', $this->existModel, true);
    Model::validateRequired('request', $this->request, true);
    if(is_array($this->complexList)) {
      Model::validateArray($this->complexList);
    }
    Model::validateRequired('complexList', $this->complexList, true);
    Model::validateRequired('numberfield', $this->numberfield, true);
    Model::validateRequired('integerField', $this->integerField, true);
    Model::validateRequired('floatField', $this->floatField, true);
    Model::validateRequired('doubleField', $this->doubleField, true);
    Model::validateRequired('longField', $this->longField, true);
    Model::validateRequired('ulongField', $this->ulongField, true);
    Model::validateRequired('int8Field', $this->int8Field, true);
    Model::validateRequired('int16Field', $this->int16Field, true);
    Model::validateRequired('int32Field', $this->int32Field, true);
    Model::validateRequired('int64Field', $this->int64Field, true);
    Model::validateRequired('uint8Field', $this->uint8Field, true);
    Model::validateRequired('uint16Field', $this->uint16Field, true);
    Model::validateRequired('uint32Field', $this->uint32Field, true);
    Model::validateRequired('uint64Field', $this->uint64Field, true);
    parent::validate();
  }

  public function toArray($noStream = false)
  {
    $res = [];
    if (null !== $this->model) {
      $res['model'] = null !== $this->model ? $this->model->toArray($noStream) : $this->model;
    }

    if (null !== $this->stringfield) {
      $res['stringfield'] = $this->stringfield;
    }

    if (null !== $this->bytesfield) {
      $res['bytesfield'] = $this->bytesfield;
    }

    if (null !== $this->stringarrayfield) {
      if(is_array($this->stringarrayfield)) {
        $res['stringarrayfield'] = [];
        $n1 = 0;
        foreach($this->stringarrayfield as $item1) {
          $res['stringarrayfield'][$n1++] = $item1;
        }
      }
    }

    if (null !== $this->mapfield) {
      if(is_array($this->mapfield)) {
        $res['mapfield'] = [];
        foreach($this->mapfield as $key1 => $value1) {
          $res['mapfield'][$key1] = $value1;
        }
      }
    }

    if (null !== $this->name) {
      $res['realName'] = $this->name;
    }

    if (null !== $this->submodel) {
      $res['submodel'] = null !== $this->submodel ? $this->submodel->toArray($noStream) : $this->submodel;
    }

    if (null !== $this->submodelMap) {
      if(is_array($this->submodelMap)) {
        $res['submodelMap'] = [];
        foreach($this->submodelMap as $key1 => $value1) {
          $res['submodelMap'][$key1] = null !== $value1 ? $value1->toArray($noStream) : $value1;
        }
      }
    }

    if (null !== $this->mapModel) {
      if(is_array($this->mapModel)) {
        $res['mapModel'] = [];
        foreach($this->mapModel as $key1 => $value1) {
          $res['mapModel'][$key1] = null !== $value1 ? $value1->toArray($noStream) : $value1;
        }
      }
    }

    if (null !== $this->subarraymodel) {
      if(is_array($this->subarraymodel)) {
        $res['subarraymodel'] = [];
        $n1 = 0;
        foreach($this->subarraymodel as $item1) {
          $res['subarraymodel'][$n1++] = null !== $item1 ? $item1->toArray($noStream) : $item1;
        }
      }
    }

    if (null !== $this->subarray) {
      if(is_array($this->subarray)) {
        $res['subarray'] = [];
        $n1 = 0;
        foreach($this->subarray as $item1) {
          $res['subarray'][$n1++] = null !== $item1 ? $item1->toArray($noStream) : $item1;
        }
      }
    }

    if (null !== $this->ssubarray) {
      if(is_array($this->ssubarray)) {
        $res['ssubarray'] = [];
        $n1 = 0;
        foreach($this->ssubarray as $item1) {
          if(is_array($item1)) {
            $res['ssubarray'][$n1++] = [];
            $n2 = 0;
            foreach($item1 as $item2) {
              $res['ssubarray'][$n1++][$n2++] = null !== $item2 ? $item2->toArray($noStream) : $item2;
            }
          }
        }
      }
    }

    if (null !== $this->ssubmarray) {
      if(is_array($this->ssubmarray)) {
        $res['ssubmarray'] = [];
        $n1 = 0;
        foreach($this->ssubmarray as $item1) {
          if(is_array($item1)) {
            $res['ssubmarray'][$n1++] = [];
            $n2 = 0;
            foreach($item1 as $item2) {
              $res['ssubmarray'][$n1++][$n2++] = $item2;
            }
          }
        }
      }
    }

    if (null !== $this->ssubmmarray) {
      if(is_array($this->ssubmmarray)) {
        $res['ssubmmarray'] = [];
        $n1 = 0;
        foreach($this->ssubmmarray as $item1) {
          if(is_array($item1)) {
            $res['ssubmmarray'][$n1++] = [];
            $n2 = 0;
            foreach($item1 as $item2) {
              $res['ssubmmarray'][$n1++][$n2++] = null !== $item2 ? $item2->toArray($noStream) : $item2;
            }
          }
        }
      }
    }

    if (null !== $this->maparray) {
      if(is_array($this->maparray)) {
        $res['maparray'] = [];
        $n1 = 0;
        foreach($this->maparray as $item1) {
          if(is_array($item1)) {
            $res['maparray'][$n1++] = [];
            foreach($item1 as $key2 => $value2) {
              $res['maparray'][$n1++][$key2] = $value2;
            }
          }
        }
      }
    }

    if (null !== $this->mapsubmarray) {
      if(is_array($this->mapsubmarray)) {
        $res['mapsubmarray'] = [];
        $n1 = 0;
        foreach($this->mapsubmarray as $item1) {
          if(is_array($item1)) {
            $res['mapsubmarray'][$n1++] = [];
            foreach($item1 as $key2 => $value2) {
              $res['mapsubmarray'][$n1++][$key2] = $value2;
            }
          }
        }
      }
    }

    if (null !== $this->moduleModelMap) {
      if(is_array($this->moduleModelMap)) {
        $res['moduleModelMap'] = [];
        foreach($this->moduleModelMap as $key1 => $value1) {
          $res['moduleModelMap'][$key1] = null !== $value1 ? $value1->toArray($noStream) : $value1;
        }
      }
    }

    if (null !== $this->subModelMap) {
      if(is_array($this->subModelMap)) {
        $res['subModelMap'] = [];
        foreach($this->subModelMap as $key1 => $value1) {
          $res['subModelMap'][$key1] = null !== $value1 ? $value1->toArray($noStream) : $value1;
        }
      }
    }

    if (null !== $this->modelMap) {
      if(is_array($this->modelMap)) {
        $res['modelMap'] = [];
        foreach($this->modelMap as $key1 => $value1) {
          $res['modelMap'][$key1] = null !== $value1 ? $value1->toArray($noStream) : $value1;
        }
      }
    }

    if (null !== $this->moduleMap) {
      if(is_array($this->moduleMap)) {
        $res['moduleMap'] = [];
        foreach($this->moduleMap as $key1 => $value1) {
          $res['moduleMap'][$key1] = $value1;
        }
      }
    }

    if (null !== $this->object) {
      $res['object'] = $this->object;
    }

    if (null !== $this->readable) {
      $res['readable'] = $this->readable;
    }

    if (null !== $this->writable) {
      $res['writable'] = $this->writable;
    }

    if (null !== $this->existModel) {
      $res['existModel'] = null !== $this->existModel ? $this->existModel->toArray($noStream) : $this->existModel;
    }

    if (null !== $this->request) {
      $res['request'] = null !== $this->request ? $this->request->toArray($noStream) : $this->request;
    }

    if (null !== $this->complexList) {
      if(is_array($this->complexList)) {
        $res['complexList'] = [];
        $n1 = 0;
        foreach($this->complexList as $item1) {
          if(is_array($item1)) {
            $res['complexList'][$n1++] = [];
            $n2 = 0;
            foreach($item1 as $item2) {
              $res['complexList'][$n1++][$n2++] = $item2;
            }
          }
        }
      }
    }

    if (null !== $this->numberfield) {
      $res['numberfield'] = $this->numberfield;
    }

    if (null !== $this->integerField) {
      $res['integerField'] = $this->integerField;
    }

    if (null !== $this->floatField) {
      $res['floatField'] = $this->floatField;
    }

    if (null !== $this->doubleField) {
      $res['doubleField'] = $this->doubleField;
    }

    if (null !== $this->longField) {
      $res['longField'] = $this->longField;
    }

    if (null !== $this->ulongField) {
      $res['ulongField'] = $this->ulongField;
    }

    if (null !== $this->int8Field) {
      $res['int8Field'] = $this->int8Field;
    }

    if (null !== $this->int16Field) {
      $res['int16Field'] = $this->int16Field;
    }

    if (null !== $this->int32Field) {
      $res['int32Field'] = $this->int32Field;
    }

    if (null !== $this->int64Field) {
      $res['int64Field'] = $this->int64Field;
    }

    if (null !== $this->uint8Field) {
      $res['uint8Field'] = $this->uint8Field;
    }

    if (null !== $this->uint16Field) {
      $res['uint16Field'] = $this->uint16Field;
    }

    if (null !== $this->uint32Field) {
      $res['uint32Field'] = $this->uint32Field;
    }

    if (null !== $this->uint64Field) {
      $res['uint64Field'] = $this->uint64Field;
    }

    if (null !== $this->link) {
      $res['link'] = $this->link;
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
    if (isset($map['model'])) {
      $model->model = model_::fromMap($map['model']);
    }

    if (isset($map['stringfield'])) {
      $model->stringfield = $map['stringfield'];
    }

    if (isset($map['bytesfield'])) {
      $model->bytesfield = $map['bytesfield'];
    }

    if (isset($map['stringarrayfield'])) {
      if(!empty($map['stringarrayfield'])) {
        $model->stringarrayfield = [];
        $n1 = 0;
        foreach($map['stringarrayfield'] as $item1) {
          $model->stringarrayfield[$n1++] = $item1;
        }
      }
    }

    if (isset($map['mapfield'])) {
      if(!empty($map['mapfield'])) {
        $model->mapfield = [];
        foreach($map['mapfield'] as $key1 => $value1) {
          $model->mapfield[$key1] = $value1;
        }
      }
    }

    if (isset($map['realName'])) {
      $model->name = $map['realName'];
    }

    if (isset($map['submodel'])) {
      $model->submodel = submodel::fromMap($map['submodel']);
    }

    if (isset($map['submodelMap'])) {
      if(!empty($map['submodelMap'])) {
        $model->submodelMap = [];
        foreach($map['submodelMap'] as $key1 => $value1) {
          $model->submodelMap[$key1] = submodel::fromMap($value1);
        }
      }
    }

    if (isset($map['mapModel'])) {
      if(!empty($map['mapModel'])) {
        $model->mapModel = [];
        foreach($map['mapModel'] as $key1 => $value1) {
          $model->mapModel[$key1] = M::fromMap($value1);
        }
      }
    }

    if (isset($map['subarraymodel'])) {
      if(!empty($map['subarraymodel'])) {
        $model->subarraymodel = [];
        $n1 = 0;
        foreach($map['subarraymodel'] as $item1) {
          $model->subarraymodel[$n1++] = subarraymodel::fromMap($item1);
        }
      }
    }

    if (isset($map['subarray'])) {
      if(!empty($map['subarray'])) {
        $model->subarray = [];
        $n1 = 0;
        foreach($map['subarray'] as $item1) {
          $model->subarray[$n1++] = M::fromMap($item1);
        }
      }
    }

    if (isset($map['ssubarray'])) {
      if(!empty($map['ssubarray'])) {
        $model->ssubarray = [];
        $n1 = 0;
        foreach($map['ssubarray'] as $item1) {
          if(!empty($item1)) {
            $model->ssubarray[$n1++] = [];
            $n2 = 0;
            foreach($item1 as $item2) {
              $model->ssubarray[$n1++][$n2++] = M::fromMap($item2);
            }
          }
        }
      }
    }

    if (isset($map['ssubmarray'])) {
      if(!empty($map['ssubmarray'])) {
        $model->ssubmarray = [];
        $n1 = 0;
        foreach($map['ssubmarray'] as $item1) {
          if(!empty($item1)) {
            $model->ssubmarray[$n1++] = [];
            $n2 = 0;
            foreach($item1 as $item2) {
              $model->ssubmarray[$n1++][$n2++] = $item2;
            }
          }
        }
      }
    }

    if (isset($map['ssubmmarray'])) {
      if(!empty($map['ssubmmarray'])) {
        $model->ssubmmarray = [];
        $n1 = 0;
        foreach($map['ssubmmarray'] as $item1) {
          if(!empty($item1)) {
            $model->ssubmmarray[$n1++] = [];
            $n2 = 0;
            foreach($item1 as $item2) {
              $model->ssubmmarray[$n1++][$n2++] = Request::fromMap($item2);
            }
          }
        }
      }
    }

    if (isset($map['maparray'])) {
      if(!empty($map['maparray'])) {
        $model->maparray = [];
        $n1 = 0;
        foreach($map['maparray'] as $item1) {
          if(!empty($item1)) {
            $model->maparray[$n1++] = [];
            foreach($item1 as $key2 => $value2) {
              $model->maparray[$n1++][$key2] = $value2;
            }
          }
        }
      }
    }

    if (isset($map['mapsubmarray'])) {
      if(!empty($map['mapsubmarray'])) {
        $model->mapsubmarray = [];
        $n1 = 0;
        foreach($map['mapsubmarray'] as $item1) {
          if(!empty($item1)) {
            $model->mapsubmarray[$n1++] = [];
            foreach($item1 as $key2 => $value2) {
              $model->mapsubmarray[$n1++][$key2] = $value2;
            }
          }
        }
      }
    }

    if (isset($map['moduleModelMap'])) {
      if(!empty($map['moduleModelMap'])) {
        $model->moduleModelMap = [];
        foreach($map['moduleModelMap'] as $key1 => $value1) {
          $model->moduleModelMap[$key1] = Request::fromMap($value1);
        }
      }
    }

    if (isset($map['subModelMap'])) {
      if(!empty($map['subModelMap'])) {
        $model->subModelMap = [];
        foreach($map['subModelMap'] as $key1 => $value1) {
          $model->subModelMap[$key1] = subM::fromMap($value1);
        }
      }
    }

    if (isset($map['modelMap'])) {
      if(!empty($map['modelMap'])) {
        $model->modelMap = [];
        foreach($map['modelMap'] as $key1 => $value1) {
          $model->modelMap[$key1] = M::fromMap($value1);
        }
      }
    }

    if (isset($map['moduleMap'])) {
      if(!empty($map['moduleMap'])) {
        $model->moduleMap = [];
        foreach($map['moduleMap'] as $key1 => $value1) {
          $model->moduleMap[$key1] = $value1;
        }
      }
    }

    if (isset($map['object'])) {
      $model->object = $map['object'];
    }

    if (isset($map['readable'])) {
      $model->readable = $map['readable'];
    }

    if (isset($map['writable'])) {
      $model->writable = $map['writable'];
    }

    if (isset($map['existModel'])) {
      $model->existModel = M::fromMap($map['existModel']);
    }

    if (isset($map['request'])) {
      $model->request = \AlibabaCloud\Dara\Request::fromMap($map['request']);
    }

    if (isset($map['complexList'])) {
      if(!empty($map['complexList'])) {
        $model->complexList = [];
        $n1 = 0;
        foreach($map['complexList'] as $item1) {
          if(!empty($item1)) {
            $model->complexList[$n1++] = [];
            $n2 = 0;
            foreach($item1 as $item2) {
              $model->complexList[$n1++][$n2++] = $item2;
            }
          }
        }
      }
    }

    if (isset($map['numberfield'])) {
      $model->numberfield = $map['numberfield'];
    }

    if (isset($map['integerField'])) {
      $model->integerField = $map['integerField'];
    }

    if (isset($map['floatField'])) {
      $model->floatField = $map['floatField'];
    }

    if (isset($map['doubleField'])) {
      $model->doubleField = $map['doubleField'];
    }

    if (isset($map['longField'])) {
      $model->longField = $map['longField'];
    }

    if (isset($map['ulongField'])) {
      $model->ulongField = $map['ulongField'];
    }

    if (isset($map['int8Field'])) {
      $model->int8Field = $map['int8Field'];
    }

    if (isset($map['int16Field'])) {
      $model->int16Field = $map['int16Field'];
    }

    if (isset($map['int32Field'])) {
      $model->int32Field = $map['int32Field'];
    }

    if (isset($map['int64Field'])) {
      $model->int64Field = $map['int64Field'];
    }

    if (isset($map['uint8Field'])) {
      $model->uint8Field = $map['uint8Field'];
    }

    if (isset($map['uint16Field'])) {
      $model->uint16Field = $map['uint16Field'];
    }

    if (isset($map['uint32Field'])) {
      $model->uint32Field = $map['uint32Field'];
    }

    if (isset($map['uint64Field'])) {
      $model->uint64Field = $map['uint64Field'];
    }

    if (isset($map['link'])) {
      $model->link = $map['link'];
    }

    return $model;
  }


}

