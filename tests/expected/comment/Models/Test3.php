<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests\Models;

use AlibabaCloud\Tea\Model;

/**
 * TestModel3
 */
class Test3 extends Model {
    protected $_name = [
        'test' => 'test',
        'test1' => 'test1',
    ];
    public function validate() {
        Model::validateRequired('test', $this->test, true);
        Model::validateRequired('test1', $this->test1, true);
    }
    public function toMap() {
        $res = [];
        if (null !== $this->test) {
            $res['test'] = $this->test;
        }
        if (null !== $this->test1) {
            $res['test1'] = $this->test1;
        }
        return $res;
    }
    /**
     * @param array $map
     * @return Test3
     */
    public static function fromMap($map = []) {
        $model = new self();
        if(isset($map['test'])){
            $model->test = $map['test'];
        }
        if(isset($map['test1'])){
            $model->test1 = $map['test1'];
        }
        return $model;
    }
    // model的test front comment
    /**
     * @description test desc
     * @var string
     */
    public $test;

    // empty comment1
    // empy comment2
    /**
     * @description test desc
     * @var string
     */
    public $test1;

    // model的test back comment
}
