<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests\Models\MyModel\submodel;

use AlibabaCloud\Tea\Model;

class model_ extends Model {
    public function validate() {
        Model::validateRequired('str', $this->str, true);
    }
    public function toMap() {
        $res = [];
        if (null !== $this->str) {
            $res['str'] = $this->str;
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
        return $model;
    }
    /**
     * @var string
     */
    public $str;

}
