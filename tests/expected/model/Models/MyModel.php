<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests\Models;

use AlibabaCloud\Tea\Model;

use Tea\PHP\Tests\Models\MyModel\submodel;
use Tea\PHP\Tests\Models\MyModel\subarraymodel;
use Tea\PHP\Tests\Models\M;

class MyModel extends Model {
    protected $_name = [
        'name' => 'realName',
    ];
    public function validate() {
        Model::validateRequired('stringfield', $this->stringfield, true);
        Model::validateRequired('bytesfield', $this->bytesfield, true);
        Model::validateRequired('stringarrayfield', $this->stringarrayfield, true);
        Model::validateRequired('mapfield', $this->mapfield, true);
        Model::validateRequired('name', $this->name, true);
        Model::validateRequired('submodel', $this->submodel, true);
        Model::validateRequired('subarraymodel', $this->subarraymodel, true);
        Model::validateRequired('subarray', $this->subarray, true);
        Model::validateRequired('maparray', $this->maparray, true);
        Model::validateRequired('object', $this->object, true);
        Model::validateRequired('numberfield', $this->numberfield, true);
        Model::validateRequired('readable', $this->readable, true);
        Model::validateRequired('existModel', $this->existModel, true);
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
            $res['stringarrayfield'] = [];
            if(null !== $this->stringarrayfield){
                $res['stringarrayfield'] = $this->stringarrayfield;
            }
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
            $res['maparray'] = [];
            if(null !== $this->maparray){
                $res['maparray'] = $this->maparray;
            }
        }
        if (null !== $this->object) {
            $res['object'] = $this->object;
        }
        if (null !== $this->numberfield) {
            $res['numberfield'] = $this->numberfield;
        }
        if (null !== $this->readable) {
            $res['readable'] = $this->readable;
        }
        if (null !== $this->existModel) {
            $res['existModel'] = null !== $this->existModel ? $this->existModel->toMap() : null;
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
                $model->stringarrayfield = [];
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
                $model->maparray = [];
                $model->maparray = $map['maparray'];
            }
        }
        if(isset($map['object'])){
            $model->object = $map['object'];
        }
        if(isset($map['numberfield'])){
            $model->numberfield = $map['numberfield'];
        }
        if(isset($map['readable'])){
            $model->readable = $map['readable'];
        }
        if(isset($map['existModel'])){
            $model->existModel = M::fromMap($map['existModel']);
        }
        return $model;
    }
    /**
     * @var string
     */
    public $stringfield;

    /**
     * @var array
     */
    public $bytesfield;

    /**
     * @var array
     */
    public $stringarrayfield;

    /**
     * @var array
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
     * @var array
     */
    public $subarraymodel;

    /**
     * @var array
     */
    public $subarray;

    /**
     * @var array
     */
    public $maparray;

    /**
     * @var object
     */
    public $object;

    /**
     * @var integer
     */
    public $numberfield;

    /**
     * @var Stream
     */
    public $readable;

    /**
     * @var M
     */
    public $existModel;

}
