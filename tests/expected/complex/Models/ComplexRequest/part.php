<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests\Models\ComplexRequest;

use AlibabaCloud\Tea\Model;

class part extends Model {
    protected $_name = [
        'partNumber' => 'PartNumber',
    ];
    public function validate() {}
    public function toMap() {
        $res = [];
        if (null !== $this->partNumber) {
            $res['PartNumber'] = $this->partNumber;
        }
        return $res;
    }
    /**
     * @param array $map
     * @return part
     */
    public static function fromMap($map = []) {
        $model = new self();
        if(isset($map['PartNumber'])){
            $model->partNumber = $map['PartNumber'];
        }
        return $model;
    }
    /**
     * @description PartNumber
     * @var string
     */
    public $partNumber;

}
