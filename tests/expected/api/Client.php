<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests;

use AlibabaCloud\Tea\Request;
use AlibabaCloud\Tea\Tea;
use AlibabaCloud\Tea\Exception\TeaError;
use \Exception;
use AlibabaCloud\Tea\Exception\TeaUnableRetryError;

class Client {

    /**
     * @return void
     */
    public function hello(){
        $_request = new Request();
        $_request->method = "GET";
        $_request->pathname = "/";
        $_request->headers = [
            "host" => "www.test.com"
        ];
        $_lastRequest = $_request;
        $_response= Tea::send($_request);
        return null;
    }

    /**
     * @return void
     * @throws TeaError
     * @throws Exception
     * @throws TeaUnableRetryError
     */
    public function helloRuntime(){
        $_runtime = [];
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
                $_request->method = "GET";
                $_request->pathname = "/";
                $_request->headers = [
                    "host" => "www.test.com"
                ];
                $_lastRequest = $_request;
                $_response= Tea::send($_request, $_runtime);
                return null;
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
}
