<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests\Models\MyModel;

use AlibabaCloud\Tea\Model;

class submodel extends Model {
    public function validate() {
        Model::validateRequired('stringfield', $this->stringfield, true);
    }
    public function toMap() {
        $res = [];
        if (null !== $this->stringfield) {
            $res['stringfield'] = $this->stringfield;
        }
        return $res;
    }
    /**
     * @param array $map
     * @return submodel
     */
    public static function fromMap($map = []) {
        $model = new self();
        if(isset($map['stringfield'])){
            $model->stringfield = $map['stringfield'];
        }
        return $model;
    }
    /**
     * @var string
     */
    public $stringfield;

}
