<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests\Models;

use AlibabaCloud\Tea\Model;

use Tea\PHP\Tests\Models\M\subM;

class M extends Model {
    public function validate() {
        Model::validateRequired('subM', $this->subM, true);
    }
    public function toMap() {
        $res = [];
        if (null !== $this->subM) {
            $res['subM'] = null !== $this->subM ? $this->subM->toMap() : null;
        }
        return $res;
    }
    /**
     * @param array $map
     * @return M
     */
    public static function fromMap($map = []) {
        $model = new self();
        if(isset($map['subM'])){
            $model->subM = subM::fromMap($map['subM']);
        }
        return $model;
    }
    /**
     * @var subM
     */
    public $subM;

}
