<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests;

use Source\SourceClient;
use AlibabaCloud\Tea\Tea;
use AlibabaCloud\Tea\Request;
use AlibabaCloud\Tea\Exception\TeaError;
use \Exception;
use AlibabaCloud\Tea\Exception\TeaUnableRetryError;

use Tea\PHP\Tests\Models\ComplexRequest;
use Source\Models\RuntimeObject;
use Source\Models\Config;
use AlibabaCloud\Tea\Response;
use Tea\PHP\Tests\Models\ComplexRequest\header;

class Client extends SourceClient {

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
        while (Tea::allowRetry($_runtime["retry"], $_retryTimes, $_now)) {
            if ($_retryTimes > 0) {
                $_backoffTime = Tea::getBackoffTime($_runtime["backoff"], $_retryTimes);
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
                $version = "/" . "2019-01-08" . "" . $this->_pathname . "";
                $_request->protocol = $this->_protocol;
                $_request->port = 80;
                $_request->method = "GET";
                $_request->pathname = "/" . $this->_pathname . "";
                $_request->query = SourceClient::query(Tea::merge([
                    "date" => "2019"
                ], $request->header, $mapVal));
                $_request->body = SourceClient::body();
                $_lastRequest = $_request;
                $_response= Tea::send($_request, $_runtime);
                if (true && true) {
                    return null;
                }
                else if (true || false) {
                    return new RuntimeObject([]);
                }
                $client->print_($request, "1");
                $client->printAsync($request, "1");
                $this->hello($request, [
                    "1",
                    "2"
                ]);
                $this->hello(null, null);
                return RuntimeObject::fromMap([]);
                $this->Complex3(null);
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
     * @param array $str
     * @param array $val
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
        $resp = $_response;
        $req = new \Source\Models\Request([
            "accesskey" => $request->accessKey,
            "region" => $resp->statusMessage
        ]);
        self::array0($request);
        $req->accesskey = "accesskey";
        $req->accesskey = $request->accessKey;
        SourceClient::parse(ComplexRequest::class);
        SourceClient::array_($request, "1");
        SourceClient::asyncFunc();
        return ComplexRequest::fromMap(Tea::merge($_request->query));
    }

    /**
     * @param array $request
     * @param array $strs
     * @return array
     */
    public function hello($request, $strs){
        return self::array1();
    }

    /**
     * @param Request $reqeust
     * @param array $reqs
     * @param Response $response
     * @param array $val
     * @return \Source\Models\Request
     */
    public static function print_($reqeust, $reqs, $response, $val){
    }

    /**
     * @param array $req
     * @return array
     */
    public static function array0($req){
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
    public function TemplateString(){
        return "/" . $this->_protocol . "";
    }

    /**
     * @param TeaError $e
     * @return void
     */
    public function isError($e){
    }

    /**
     * @return void
     * @throws TeaError
     */
    public function emptyModel(){
        new ComplexRequest();
        new header();
        $status = "";
        try {
            $status = "failed";
            throw new TeaError([
                "name" => "errorName",
                "message" => "some error",
                "code" => 400
            ]);
        }
        catch (Exception $e) {
            if (!($e instanceof TeaError)) {
                $e = new TeaError([], $e->getMessage(), $e->getCode(), $e);
            }
            $e->name;
            $e->message;
            $e->code;
            $this->isError($e);
            $status = "catch exception";
        }
        finally {
            $status = "ok";
        }
    }
}
