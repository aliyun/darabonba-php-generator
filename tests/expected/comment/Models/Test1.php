<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests\Models;

use AlibabaCloud\Tea\Model;

/**
 * TestModel
 */
class Test1 extends Model {
    protected $_name = [
        'test' => 'test',
        'test2' => 'test2',
    ];
    public function validate() {
        Model::validateRequired('test', $this->test, true);
        Model::validateRequired('test2', $this->test2, true);
    }
    public function toMap() {
        $res = [];
        if (null !== $this->test) {
            $res['test'] = $this->test;
        }
        if (null !== $this->test2) {
            $res['test2'] = $this->test2;
        }
        return $res;
    }
    /**
     * @param array $map
     * @return Test1
     */
    public static function fromMap($map = []) {
        $model = new self();
        if(isset($map['test'])){
            $model->test = $map['test'];
        }
        if(isset($map['test2'])){
            $model->test2 = $map['test2'];
        }
        return $model;
    }
    /**
     * @description test desc
     * @var string
     */
    public $test;

    // model的test back comment
    /**
     * @description test2 desc
     * @deprecated
     * @var string
     */
    public $test2;

    // model的test2 back comment
}
