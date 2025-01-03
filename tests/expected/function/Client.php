<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests;

use AlibabaCloud\Tea\Tea;
use \Exception;

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
            "key-1" => "value-1",
            "key-2" => "value-2",
            "\"\"" => "value-3"
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
        $x = false;
        $y = true;
        $z = false;
        if ($x && $y || !$z) {}
    }

    /**
     * interface mode
     * @return void
     */
    public static function helloInterface(){
        throw new Exception('Un-implemented');
    }
}
