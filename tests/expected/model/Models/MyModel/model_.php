<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests\Models\MyModel;

use AlibabaCloud\Tea\Model;

class model_ extends Model {
    public function validate() {
        Model::validateRequired('str', $this->str, true);
        Model::validateRequired('model', $this->model, true);
    }
    public function toMap() {
        $res = [];
        if (null !== $this->str) {
            $res['str'] = $this->str;
        }
        if (null !== $this->model) {
            $res['model'] = null !== $this->model ? $this->model->toMap() : null;
        }
        return $res;
    }
    /**
     * @param array $map
     * @return model_
     */
    public static function fromMap($map = []) {
        $model = new self();
        if(isset($map['str'])){
            $model->str = $map['str'];
        }
        if(isset($map['model'])){
            $model->model = \Tea\PHP\Tests\Models\MyModel\model\model_::fromMap($map['model']);
        }
        return $model;
    }
    /**
     * @var string
     */
    public $str;

    /**
     * @var \Tea\PHP\Tests\Models\MyModel\model\model_
     */
    public $model;

}
