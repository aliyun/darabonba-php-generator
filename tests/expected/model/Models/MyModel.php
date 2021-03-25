<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests\Models;

use AlibabaCloud\Tea\Model;
use import\Client as importClient;
use GuzzleHttp\Psr7\Stream;

use Tea\PHP\Tests\Models\MyModel\submodel;
use Tea\PHP\Tests\Models\MyModel\subarraymodel;
use Tea\PHP\Tests\Models\M;
use AlibabaCloud\Tea\Request;
use Tea\PHP\Tests\Models\M\subM;

class MyModel extends Model {
    protected $_name = [
        'name' => 'realName',
        'link' => 'link',
    ];
    public function validate() {
        Model::validateRequired('stringfield', $this->stringfield, true);
        Model::validateRequired('bytesfield', $this->bytesfield, true);
        Model::validateRequired('stringarrayfield', $this->stringarrayfield, true);
        Model::validateRequired('mapfield', $this->mapfield, true);
        Model::validateRequired('name', $this->name, true);
        Model::validateRequired('submodel', $this->submodel, true);
        Model::validateRequired('submodelMap', $this->submodelMap, true);
        Model::validateRequired('mapModel', $this->mapModel, true);
        Model::validateRequired('subarraymodel', $this->subarraymodel, true);
        Model::validateRequired('subarray', $this->subarray, true);
        Model::validateRequired('maparray', $this->maparray, true);
        Model::validateRequired('moduleModelMap', $this->moduleModelMap, true);
        Model::validateRequired('subModelMap', $this->subModelMap, true);
        Model::validateRequired('modelMap', $this->modelMap, true);
        Model::validateRequired('moduleMap', $this->moduleMap, true);
        Model::validateRequired('object', $this->object, true);
        Model::validateRequired('readable', $this->readable, true);
        Model::validateRequired('writable', $this->writable, true);
        Model::validateRequired('existModel', $this->existModel, true);
        Model::validateRequired('request', $this->request, true);
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
    }
    public function toMap() {
        $res = [];
        if (null !== $this->stringfield) {
            $res['stringfield'] = $this->stringfield;
        }
        if (null !== $this->bytesfield) {
            $res['bytesfield'] = $this->bytesfield;
        }
        if (null !== $this->stringarrayfield) {
            $res['stringarrayfield'] = $this->stringarrayfield;
        }
        if (null !== $this->mapfield) {
            $res['mapfield'] = $this->mapfield;
        }
        if (null !== $this->name) {
            $res['realName'] = $this->name;
        }
        if (null !== $this->submodel) {
            $res['submodel'] = null !== $this->submodel ? $this->submodel->toMap() : null;
        }
        if (null !== $this->submodelMap) {
            $res['submodelMap'] = [];
            if(null !== $this->submodelMap && is_array($this->submodelMap)){
                foreach($this->submodelMap as $key => $val){
                    $res['submodelMap'][$key] = null !== $val ? $val->toMap() : $val;
                }
            }
        }
        if (null !== $this->mapModel) {
            $res['mapModel'] = [];
            if(null !== $this->mapModel && is_array($this->mapModel)){
                foreach($this->mapModel as $key => $val){
                    $res['mapModel'][$key] = null !== $val ? $val->toMap() : $val;
                }
            }
        }
        if (null !== $this->subarraymodel) {
            $res['subarraymodel'] = [];
            if(null !== $this->subarraymodel && is_array($this->subarraymodel)){
                $n = 0;
                foreach($this->subarraymodel as $item){
                    $res['subarraymodel'][$n++] = null !== $item ? $item->toMap() : $item;
                }
            }
        }
        if (null !== $this->subarray) {
            $res['subarray'] = [];
            if(null !== $this->subarray && is_array($this->subarray)){
                $n = 0;
                foreach($this->subarray as $item){
                    $res['subarray'][$n++] = null !== $item ? $item->toMap() : $item;
                }
            }
        }
        if (null !== $this->maparray) {
            $res['maparray'] = $this->maparray;
        }
        if (null !== $this->moduleModelMap) {
            $res['moduleModelMap'] = [];
            if(null !== $this->moduleModelMap && is_array($this->moduleModelMap)){
                foreach($this->moduleModelMap as $key => $val){
                    $res['moduleModelMap'][$key] = null !== $val ? $val->toMap() : $val;
                }
            }
        }
        if (null !== $this->subModelMap) {
            $res['subModelMap'] = [];
            if(null !== $this->subModelMap && is_array($this->subModelMap)){
                foreach($this->subModelMap as $key => $val){
                    $res['subModelMap'][$key] = null !== $val ? $val->toMap() : $val;
                }
            }
        }
        if (null !== $this->modelMap) {
            $res['modelMap'] = [];
            if(null !== $this->modelMap && is_array($this->modelMap)){
                foreach($this->modelMap as $key => $val){
                    $res['modelMap'][$key] = null !== $val ? $val->toMap() : $val;
                }
            }
        }
        if (null !== $this->moduleMap) {
            $res['moduleMap'] = [];
            if(null !== $this->moduleMap && is_array($this->moduleMap)){
                foreach($this->moduleMap as $key => $val){
                    $res['moduleMap'][$key] = null !== $val ? $val->toMap() : $val;
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
            $res['existModel'] = null !== $this->existModel ? $this->existModel->toMap() : null;
        }
        if (null !== $this->request) {
            $res['request'] = null !== $this->request ? $this->request->toMap() : null;
        }
        if (null !== $this->complexList) {
            $res['complexList'] = $this->complexList;
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
    /**
     * @param array $map
     * @return MyModel
     */
    public static function fromMap($map = []) {
        $model = new self();
        if(isset($map['stringfield'])){
            $model->stringfield = $map['stringfield'];
        }
        if(isset($map['bytesfield'])){
            $model->bytesfield = $map['bytesfield'];
        }
        if(isset($map['stringarrayfield'])){
            if(!empty($map['stringarrayfield'])){
                $model->stringarrayfield = $map['stringarrayfield'];
            }
        }
        if(isset($map['mapfield'])){
            $model->mapfield = $map['mapfield'];
        }
        if(isset($map['realName'])){
            $model->name = $map['realName'];
        }
        if(isset($map['submodel'])){
            $model->submodel = submodel::fromMap($map['submodel']);
        }
        if(isset($map['submodelMap'])){
            $model->submodelMap = $map['submodelMap'];
        }
        if(isset($map['mapModel'])){
            $model->mapModel = $map['mapModel'];
        }
        if(isset($map['subarraymodel'])){
            if(!empty($map['subarraymodel'])){
                $model->subarraymodel = [];
                $n = 0;
                foreach($map['subarraymodel'] as $item) {
                    $model->subarraymodel[$n++] = null !== $item ? subarraymodel::fromMap($item) : $item;
                }
            }
        }
        if(isset($map['subarray'])){
            if(!empty($map['subarray'])){
                $model->subarray = [];
                $n = 0;
                foreach($map['subarray'] as $item) {
                    $model->subarray[$n++] = null !== $item ? M::fromMap($item) : $item;
                }
            }
        }
        if(isset($map['maparray'])){
            if(!empty($map['maparray'])){
                $model->maparray = $map['maparray'];
            }
        }
        if(isset($map['moduleModelMap'])){
            $model->moduleModelMap = $map['moduleModelMap'];
        }
        if(isset($map['subModelMap'])){
            $model->subModelMap = $map['subModelMap'];
        }
        if(isset($map['modelMap'])){
            $model->modelMap = $map['modelMap'];
        }
        if(isset($map['moduleMap'])){
            $model->moduleMap = $map['moduleMap'];
        }
        if(isset($map['object'])){
            $model->object = $map['object'];
        }
        if(isset($map['readable'])){
            $model->readable = $map['readable'];
        }
        if(isset($map['writable'])){
            $model->writable = $map['writable'];
        }
        if(isset($map['existModel'])){
            $model->existModel = M::fromMap($map['existModel']);
        }
        if(isset($map['request'])){
            $model->request = Request::fromMap($map['request']);
        }
        if(isset($map['complexList'])){
            if(!empty($map['complexList'])){
                $model->complexList = $map['complexList'];
            }
        }
        if(isset($map['numberfield'])){
            $model->numberfield = $map['numberfield'];
        }
        if(isset($map['integerField'])){
            $model->integerField = $map['integerField'];
        }
        if(isset($map['floatField'])){
            $model->floatField = $map['floatField'];
        }
        if(isset($map['doubleField'])){
            $model->doubleField = $map['doubleField'];
        }
        if(isset($map['longField'])){
            $model->longField = $map['longField'];
        }
        if(isset($map['ulongField'])){
            $model->ulongField = $map['ulongField'];
        }
        if(isset($map['int8Field'])){
            $model->int8Field = $map['int8Field'];
        }
        if(isset($map['int16Field'])){
            $model->int16Field = $map['int16Field'];
        }
        if(isset($map['int32Field'])){
            $model->int32Field = $map['int32Field'];
        }
        if(isset($map['int64Field'])){
            $model->int64Field = $map['int64Field'];
        }
        if(isset($map['uint8Field'])){
            $model->uint8Field = $map['uint8Field'];
        }
        if(isset($map['uint16Field'])){
            $model->uint16Field = $map['uint16Field'];
        }
        if(isset($map['uint32Field'])){
            $model->uint32Field = $map['uint32Field'];
        }
        if(isset($map['uint64Field'])){
            $model->uint64Field = $map['uint64Field'];
        }
        if(isset($map['link'])){
            $model->link = $map['link'];
        }
        return $model;
    }
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
     * @var mixed[][]
     */
    public $maparray;

    /**
     * @var \import\Models\Request[]
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
     * @var importClient[]
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
     * @var Request
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
     * @example http://*\/*.png
     * @var string
     */
    public $link;

}
