<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Darabonba\Tests\Models;

use AlibabaCloud\Tea\Model;

class M extends Model {
    public function validate() {}
    public function toMap() {
        $res = [];
        if (null !== $this->a) {
            $res['a'] = $this->a;
        }
        if (null !== $this->b) {
            $res['b'] = $this->b;
        }
        return $res;
    }
    /**
     * @param array $map
     * @return M
     */
    public static function fromMap($map = []) {
        $model = new self();
        if(isset($map['a'])){
            $model->a = $map['a'];
        }
        if(isset($map['b'])){
            $model->b = $map['b'];
        }
        return $model;
    }
    public $a;

    public $b;

}
