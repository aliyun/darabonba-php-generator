<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests\Models;

use AlibabaCloud\Tea\Model;

class A extends Model {
    public function validate() {
        Model::validateRequired('m', $this->m, true);
        Model::validateRequired('str', $this->str, true);
    }
    public function toMap() {
        $res = [];
        if (null !== $this->m) {
            $res['m'] = $this->m;
        }
        if (null !== $this->str) {
            $res['str'] = $this->str;
        }
        return $res;
    }
    /**
     * @param array $map
     * @return A
     */
    public static function fromMap($map = []) {
        $model = new self();
        if(isset($map['m'])){
            $model->m = $map['m'];
        }
        if(isset($map['str'])){
            $model->str = $map['str'];
        }
        return $model;
    }
    /**
     * @var string[]
     */
    public $m;

    /**
     * @var string
     */
    public $str;

}
