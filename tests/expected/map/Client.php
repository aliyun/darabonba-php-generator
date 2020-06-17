<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests;

use Source\SourceClient;

class Client extends SourceClient {
    public function __construct($config){
        parent::__construct($config);
        $this->_endpointRule = "central";
        $this->_endpointMap = [
            "ap-northeast-1" => "cusanalytic.aliyuncs.com",
            "ap-south-1" => "cusanalytic.aliyuncs.com"
            ];
        $_endpointMap["ap-northeast-1"];
        $_endpointMap["ap-northeast-1"] = "";
    }
}
