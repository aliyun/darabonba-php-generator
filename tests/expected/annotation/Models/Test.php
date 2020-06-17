<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests\Models;

use AlibabaCloud\Tea\Model;

/**
 * TestModel
 */
class Test extends Model {
    protected $_name = [
        'test' => 'test',
    ];
    public function validate() {
        Model::validateRequired('test', $this->test, true);
    }
    public function toMap() {
        $res = [];
        if (null !== $this->test) {
            $res['test'] = $this->test;
        }
        return $res;
    }
    /**
     * @param array $map
     * @return Test
     */
    public static function fromMap($map = []) {
        $model = new self();
        if(isset($map['test'])){
            $model->test = $map['test'];
        }
        return $model;
    }
    /**
     * @description Alichange app id 
     * @var string
     */
    public $test;

}
