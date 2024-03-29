<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests\Models\MyModel;

use AlibabaCloud\Tea\Model;

use Tea\PHP\Tests\Models\MyModel\submodel\model_;

class submodel extends Model {
    public function validate() {
        Model::validateRequired('stringfield', $this->stringfield, true);
        Model::validateRequired('model', $this->model, true);
    }
    public function toMap() {
        $res = [];
        if (null !== $this->stringfield) {
            $res['stringfield'] = $this->stringfield;
        }
        if (null !== $this->model) {
            $res['model'] = null !== $this->model ? $this->model->toMap() : null;
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
        if(isset($map['model'])){
            $model->model = model_::fromMap($map['model']);
        }
        return $model;
    }
    /**
     * @var string
     */
    public $stringfield;

    /**
     * @var model_
     */
    public $model;

}
