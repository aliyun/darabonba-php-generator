<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests;

use Source\SourceClient;
use AlibabaCloud\Tea\Tea;
use AlibabaCloud\Tea\Request;
use AlibabaCloud\Tea\Exception\TeaError;
use \Exception;
use AlibabaCloud\Tea\Exception\TeaUnableRetryError;

use Source\Models\Config;
use Tea\PHP\Tests\Models\ComplexRequest;
use Source\Models\RuntimeObject;
use Tea\PHP\Tests\Models\Source;
use Tea\PHP\Tests\Models\ComplexRequest\header;
use AlibabaCloud\Tea\Response;

class Client extends SourceClient {
    protected $_configs;

    public function __construct($config){
        parent::__construct($config);
        @$_configs[0] = $config;
    }

    /**
     * @param ComplexRequest $request
     * @param SourceClient $client
     * @return RuntimeObject
     * @throws TeaError
     * @throws Exception
     * @throws TeaUnableRetryError
     */
    public function complex1($request, $client){
        $request->validate();
        $_runtime = [
            "timeouted" => "retry"
        ];
        $_lastRequest = null;
        $_lastException = null;
        $_now = time();
        $_retryTimes = 0;
        while (Tea::allowRetry(@$_runtime["retry"], $_retryTimes, $_now)) {
            if ($_retryTimes > 0) {
                $_backoffTime = Tea::getBackoffTime(@$_runtime["backoff"], $_retryTimes);
                if ($_backoffTime > 0) {
                    Tea::sleep($_backoffTime);
                }
            }
            $_retryTimes = $_retryTimes + 1;
            try {
                $_request = new Request();
                $name = "complex";
                $mapVal = [
                    "test" => "ok"
                ];
                $moduleModelMapVal = [];
                $moduleMapVal = [];
                $modelMapVal = [];
                $subModelMapVal = [];
                $version = "/" . "2019-01-08" . "" . $this->_pathname . "";
                $mapAccess = @$_API[$version];
                $_request->protocol = $this->_protocol;
                $_request->port = 80;
                $_request->method = "GET";
                $_request->pathname = "/" . $this->_pathname . "";
                $_request->query = SourceClient::query(Tea::merge([
                    "date" => "2019",
                    "access" => $mapAccess,
                    "test" => @$mapVal["test"]
                ], $request->header));
                $_request->body = SourceClient::body();
                $_lastRequest = $_request;
                $_response= Tea::send($_request, $_runtime);
                if (true && true) {
                    return null;
                }
                else if (true || false) {
                    return new RuntimeObject([]);
                }
                $client->print_(Tea::merge($request), "1");
                $client->printAsync(Tea::merge($request), "1");
                $this->hello(Tea::merge($request), [
                    "1",
                    "2"
                ]);
                $this->hello(null, null);
                $this->Complex3(null);
                return RuntimeObject::fromMap([]);
            }
            catch (Exception $e) {
                if (!($e instanceof TeaError)) {
                    $e = new TeaError([], $e->getMessage(), $e->getCode(), $e);
                }
                if (Tea::isRetryable($e)) {
                    $_lastException = $e;
                    continue;
                }
                throw $e;
            }
        }
        throw new TeaUnableRetryError($_lastRequest, $_lastException);
    }

    /**
     * @param ComplexRequest $request
     * @param string[] $str
     * @param string[] $val
     * @return array
     */
    public function Complex2($request, $str, $val){
        $request->validate();
        $_request = new Request();
        $name = "complex";
        $config = new Config([]);
        $client = new SourceClient($config);
        $_request->protocol = "HTTP";
        $_request->port = 80;
        $_request->method = "GET";
        $_request->pathname = "/";
        $_request->query = SourceClient::query([
            "date" => "2019",
            "version" => "2019-01-08",
            "protocol" => $_request->protocol
        ]);
        $_request->body = SourceClient::body();
        $_lastRequest = $_request;
        $_response= Tea::send($_request);
    }

    /**
     * @param ComplexRequest $request
     * @return ComplexRequest
     */
    public function Complex3($request){
        $request->validate();
        $_request = new Request();
        $name = "complex";
        $_request->protocol = $this->TemplateString();
        $_request->port = 80;
        $_request->method = "GET";
        $_request->pathname = "/";
        $_request->query = SourceClient::query([
            "date" => "2019"
        ]);
        $_request->body = SourceClient::body();
        $_request->headers["host"] = "hello";
        $_lastRequest = $_request;
        $_response= Tea::send($_request);
        $temp_str = "test " . (string) (100) . " " . (string) (true) . "";
        $resp = $_response;
        $req = new \Source\Models\Request([
            "accesskey" => $request->accessKey,
            "region" => $resp->statusMessage
        ]);
        self::array0(Tea::merge($request));
        $req->accesskey = "accesskey";
        $req->accesskey = $request->accessKey;
        SourceClient::parse(ComplexRequest::class);
        SourceClient::array_(Tea::merge($request), "1");
        SourceClient::asyncFunc();
        return ComplexRequest::fromMap(Tea::merge($_request->query));
    }

    /**
     * @param mixed[] $request
     * @param string[] $strs
     * @return array
     */
    public function hello($request, $strs){
        return self::array1();
    }

    /**
     * @param Request $reqeust
     * @param ComplexRequest[] $reqs
     * @param Response $response
     * @param string[] $val
     * @return \Source\Models\Request
     */
    public static function print_($reqeust, $reqs, $response, $val){
        return Request::fromMap([]);
    }

    /**
     * @param mixed[] $req
     * @return array
     */
    public static function array0($req){
        $temp = new Config([]);
        $anyArr = [
            $temp
        ];
        return [];
    }

    /**
     * @return array
     */
    public static function array1(){
        return [
            "1"
        ];
    }

    /**
     * @return string
     */
    public static function arrayAccess(){
        $configs = [
            "a",
            "b",
            "c"
        ];
        $config = @$configs[0];
        return $config;
    }

    /**
     * @return string
     */
    public static function arrayAccess2(){
        $data = [
            "configs" => [
                "a",
                "b",
                "c"
            ]
        ];
        $config = @$data["configs"][0];
        return $config;
    }

    /**
     * @param ComplexRequest $request
     * @return string
     */
    public static function arrayAccess3($request){
        $configVal = $request->configs->value[0];
        return $configVal;
    }

    /**
     * @param ComplexRequest $request
     * @param string $config
     * @param int $index
     * @return void
     */
    public static function arrayAccess4($request, $config, $index){
        $request->configs->value[$index] = $config;
    }

    /**
     * @param string $config
     * @return array
     */
    public static function arrayAssign($config){
        $configs = [
            "a",
            "b",
            "c"
        ];
        @$configs[3] = $config;
        return $configs;
    }

    /**
     * @param string $config
     * @return array
     */
    public static function arrayAssign2($config){
        $data = [
            "configs" => [
                "a",
                "b",
                "c"
            ]
        ];
        @$data["configs"][3] = $config;
        return @$data["configs"];
    }

    /**
     * @param ComplexRequest $request
     * @param string $config
     * @return void
     */
    public static function arrayAssign3($request, $config){
        $request->configs->value[0] = $config;
    }

    /**
     * @param ComplexRequest $request
     * @return string
     */
    public static function mapAccess($request){
        $configInfo = $request->configs->extra["name"];
        return $configInfo;
    }

    /**
     * @param \Source\Models\Request $request
     * @return string
     */
    public static function mapAccess2($request){
        $configInfo = $request->configs->extra["name"];
        return $configInfo;
    }

    /**
     * @return string
     */
    public static function mapAccess3(){
        $data = [
            "configs" => [
                "value" => "string"
            ]
        ];
        return @$data["configs"]["value"];
    }

    /**
     * @param ComplexRequest $request
     * @param string $name
     * @return void
     */
    public static function mapAssign($request, $name){
        $request->configs->extra["name"] = $name;
    }

    /**
     * @return string
     */
    public function TemplateString(){
        return "/" . $this->_protocol . "";
    }

    /**
     * @return void
     */
    public function emptyModel(){
        new ComplexRequest();
        new header();
    }

    /**
     * @return void
     */
    public function tryCatch(){
        try {
            $str = $this->TemplateString();
        }
        catch (Exception $err) {
            if (!($err instanceof TeaError)) {
                $err = new TeaError([], $err->getMessage(), $err->getCode(), $err);
            }
            $error = $err;
        }
        finally {
            $final = "ok";
        }
        try {
            $strNoFinal = $this->TemplateString();
        }
        catch (Exception $e) {
            if (!($e instanceof TeaError)) {
                $e = new TeaError([], $e->getMessage(), $e->getCode(), $e);
            }
            $errorNoFinal = $e;
        }
        try {
            $strNoCatch = $this->TemplateString();
        }
        finally {
            $finalNoCatch = "ok";
        }
    }
}
