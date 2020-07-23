<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests\Models;

use AlibabaCloud\Tea\Model;
use GuzzleHttp\Psr7\Stream;

use Tea\PHP\Tests\Models\ComplexRequest\header;
use Tea\PHP\Tests\Models\ComplexRequest\part;

class ComplexRequest extends Model {
    protected $_name = [
        'body' => 'Body',
        'strs' => 'Strs',
        'header' => 'header',
        'part' => 'Part',
    ];
    public function validate() {
        Model::validateRequired('accessKey', $this->accessKey, true);
        Model::validateRequired('body', $this->body, true);
        Model::validateRequired('strs', $this->strs, true);
        Model::validateRequired('header', $this->header, true);
        Model::validateRequired('Num', $this->Num, true);
    }
    public function toMap() {
        $res = [];
        if (null !== $this->accessKey) {
            $res['accessKey'] = $this->accessKey;
        }
        if (null !== $this->body) {
            $res['Body'] = $this->body;
        }
        if (null !== $this->strs) {
            $res['Strs'] = $this->strs;
        }
        if (null !== $this->header) {
            $res['header'] = null !== $this->header ? $this->header->toMap() : null;
        }
        if (null !== $this->Num) {
            $res['Num'] = $this->Num;
        }
        if (null !== $this->part) {
            $res['Part'] = [];
            if(null !== $this->part && is_array($this->part)){
                $n = 0;
                foreach($this->part as $item){
                    $res['Part'][$n++] = null !== $item ? $item->toMap() : $item;
                }
            }
        }
        return $res;
    }
    /**
     * @param array $map
     * @return ComplexRequest
     */
    public static function fromMap($map = []) {
        $model = new self();
        if(isset($map['accessKey'])){
            $model->accessKey = $map['accessKey'];
        }
        if(isset($map['Body'])){
            $model->body = $map['Body'];
        }
        if(isset($map['Strs'])){
            if(!empty($map['Strs'])){
                $model->strs = $map['Strs'];
            }
        }
        if(isset($map['header'])){
            $model->header = header::fromMap($map['header']);
        }
        if(isset($map['Num'])){
            $model->Num = $map['Num'];
        }
        if(isset($map['Part'])){
            if(!empty($map['Part'])){
                $model->part = [];
                $n = 0;
                foreach($map['Part'] as $item) {
                    $model->part[$n++] = null !== $item ? part::fromMap($item) : $item;
                }
            }
        }
        return $model;
    }
    /**
     * @var string
     */
    public $accessKey;

    /**
     * @example Body
     * @description Body
     * @var Stream
     */
    public $body;

    /**
     * @example Strs
     * @description Strs
     * @var array
     */
    public $strs;

    /**
     * @description header
     * @var header
     */
    public $header;

    /**
     * @var int
     */
    public $Num;

    /**
     * @description Part
     * @var array
     */
    public $part;

}
