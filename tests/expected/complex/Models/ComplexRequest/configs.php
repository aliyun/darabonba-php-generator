<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests\Models\ComplexRequest;

use AlibabaCloud\Tea\Model;

class configs extends Model {
    public function validate() {
        Model::validateRequired('key', $this->key, true);
        Model::validateRequired('value', $this->value, true);
        Model::validateRequired('extra', $this->extra, true);
    }
    public function toMap() {
        $res = [];
        if (null !== $this->key) {
            $res['key'] = $this->key;
        }
        if (null !== $this->value) {
            $res['value'] = $this->value;
        }
        if (null !== $this->extra) {
            $res['extra'] = $this->extra;
        }
        return $res;
    }
    /**
     * @param array $map
     * @return configs
     */
    public static function fromMap($map = []) {
        $model = new self();
        if(isset($map['key'])){
            $model->key = $map['key'];
        }
        if(isset($map['value'])){
            if(!empty($map['value'])){
                $model->value = $map['value'];
            }
        }
        if(isset($map['extra'])){
            $model->extra = $map['extra'];
        }
        return $model;
    }
    /**
     * @var string
     */
    public $key;

    /**
     * @var array
     */
    public $value;

    /**
     * @var array
     */
    public $extra;

}
