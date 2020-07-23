<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests;

use \Exception;
use AlibabaCloud\Tea\Tea;

class Client {

    /**
     * @return void
     */
    public static function hello(){
        return null;
    }

    /**
     * @return array
     */
    public static function helloMap(){
        $m = [];
        return Tea::merge([
            "key" => "value",
            "key-1" => "value-1"
            ], $m);
    }

    /**
     * @return array
     */
    public static function helloArrayMap(){
        return [
            [
                "key" => "value"
                ]
            ];
    }

    /**
     * @param string $a
     * @param string $b
     * @return void
     */
    public static function helloParams($a, $b){
    }

    /**
     * interface mode
     * @return void
     */
    public static function helloInterface(){
        throw new Exception('Un-implemented');
    }
}
