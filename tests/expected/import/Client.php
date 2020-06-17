<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests;

use Source\SourceClient;

use Source\Models\RuntimeObject;
use Source\Models\Request;

class Client {
    protected $_id;

    protected $_str;

    public function __construct($id, string $str){
        $this->_id = $id;
        $this->_str = $str;
    }

    /**
     * @param Source $client
     * @return void
     * @throws \Exception
     */
    public static function Sample(Source $client){
        $runtime = new RuntimeObject([]);
        $request = new Request([
            "accesskey" => "accesskey",
            "region" => "region"
            ]);
        $client->print_($runtime);
    }
}
