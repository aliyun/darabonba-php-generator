<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests;

use AlibabaCloud\Tea\Exception\TeaError;
use Source\SourceClient;

use Source\Models\RuntimeObject;
use Source\Models\Request;

class Client {
    protected $_id;

    protected $_str;

    public function __construct($id, $str){
        $this->_id = $id;
        $this->_str = $str;
        throw new TeaError([
            "code" => "SomeError",
            "messge" => "ErrorMessage"
            ]);
    }

    /**
     * @param Source $client
     * @return void
     */
    public static function Sample($client){
        $runtime = new RuntimeObject([]);
        $request = new Request([
            "accesskey" => "accesskey",
            "region" => "region"
            ]);
        $client->print_($runtime);
    }
}
