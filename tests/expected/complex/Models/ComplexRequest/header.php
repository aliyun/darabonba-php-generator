<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests\Models\ComplexRequest;

use AlibabaCloud\Tea\Model;

class header extends Model {
    protected $_name = [
        'content' => 'Content',
    ];
    public function validate() {
        Model::validateRequired('content', $this->content, true);
    }
    public function toMap() {
        $res = [];
        if (null !== $this->content) {
            $res['Content'] = $this->content;
        }
        return $res;
    }
    /**
     * @param array $map
     * @return header
     */
    public static function fromMap($map = []) {
        $model = new self();
        if(isset($map['Content'])){
            $model->content = $map['Content'];
        }
        return $model;
    }
    /**
     * @example Content
     * @description Body
     * @var string
     */
    public $content;

}
