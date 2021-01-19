<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests\Models;

use AlibabaCloud\Tea\Model;

use Tea\PHP\Tests\Models\A;

class B extends Model {
    public function validate() {
        Model::validateRequired('mm', $this->mm, true);
    }
    public function toMap() {
        $res = [];
        if (null !== $this->mm) {
            $res['mm'] = [];
            if(null !== $this->mm && is_array($this->mm)){
                $n = 0;
                foreach($this->mm as $item){
                    $res['mm'][$n++] = null !== $item ? $item->toMap() : $item;
                }
            }
        }
        return $res;
    }
    /**
     * @param array $map
     * @return B
     */
    public static function fromMap($map = []) {
        $model = new self();
        if(isset($map['mm'])){
            if(!empty($map['mm'])){
                $model->mm = [];
                $n = 0;
                foreach($map['mm'] as $item) {
                    $model->mm[$n++] = null !== $item ? A::fromMap($item) : $item;
                }
            }
        }
        return $model;
    }
    /**
     * @var A[]
     */
    public $mm;

}
