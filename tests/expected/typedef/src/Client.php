<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Darabonba\Tests;

use GuzzleHttp\Psr7\Request;
use AlibabaCloud\Tea\Model;
use Source\SourceClient;
use GuzzleHttp\Psr7\Response;
use \Exception;

use Darabonba\Tests\Models\M;

class Client {
    protected $_vid;

    protected $_model;

    public function __construct($request, $model){
        $this->_vid = $request;
        $this->_model = $model;
    }

    /**
     * @param Request $test1
     * @param array $test2
     * @param Model $test3
     * @return void
     */
    public function main($test1, $test2, $test3){
        $oss = new SourceClient($test1);
        $m = new M([
            "a" => $test1,
            "b" => $test2
        ]);
        $this->_vid = $test1;
        $this->_model = $test3;
    }

    /**
     * @param Request $req
     * @return Response
     */
    public function testHttpRequest($req){
        return self::testHttpRequestWith("test", $req);
    }

    /**
     * @param string $method
     * @param Request $req
     * @return Response
     */
    public static function testHttpRequestWith($method, $req){
        throw new Exception('Un-implemented');
    }

    /**
     * @param string $method
     * @param array $headers
     * @return Response
     */
    public static function testHttpHeader($method, $headers){
        throw new Exception('Un-implemented');
    }
}
