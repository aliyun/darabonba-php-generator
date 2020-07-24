<?php

// top comment
// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests;

use AlibabaCloud\Tea\Tea;
use AlibabaCloud\Tea\Request;
use AlibabaCloud\Tea\Exception\TeaError;
use \Exception;
use AlibabaCloud\Tea\Exception\TeaUnableRetryError;

use Tea\PHP\Tests\Models\Test1;
use Tea\PHP\Tests\Models\Test3;

/**
 * top annotation
 */
class Client {
    // type's comment
    protected $_a;

    /**
     * Init Func
     */
    public function __construct(){
        // string declate comment
        $str = "sss";
        // new model instance comment
        $modelInstance = new Test1([
            "test" => "test",
            // test declare back comment
            "test2" => "test2",
            // test2 declare back comment
        ]);
        $array = [
            // array string comment
            "string",
            // array number comment
            300
        ];
    }

    /**
     * testAPI
     * testAPI comment one
     * testAPI comment two
     * @return void
     * @throws TeaError
     * @throws Exception
     * @throws TeaUnableRetryError
     */
    public function testAPI(){
        $_runtime = [
            // empty runtime comment
            // another runtime comment
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
                // new model instance comment
                $modelInstance = new Test1([
                    // test declare front comment
                    "test" => "test",
                    // test2 declare front comment
                    "test2" => "test2"
                ]);
                // number declare comment
                $num = 123;
                // static function call comment
                self::staticFunc();
                $_lastRequest = $_request;
                $_response= Tea::send($_request, $_runtime);
                // static async function call
                self::testFunc("test", true);
                // return comment
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

    /**
     * testAPI2 comment
     * @return void
     * @throws TeaError
     * @throws Exception
     * @throws TeaUnableRetryError
     */
    public function testAPI2(){
        $_runtime = [
            // runtime retry comment
            "retry" => true,
            // runtime back comment one
            // runtime back comment two
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
                // new model instance comment
                $modelInstance = new Test3([
                    // empty model
                ]);
                // boolean declare comment
                $bool = true;
                if ($bool) {
                    // empty if
                }
                else {
                    // empty else
                }
                // api function call comment
                $this->testAPI();
                $_lastRequest = $_request;
                $_response= Tea::send($_request, $_runtime);
                // empty return comment
                // back comment
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
     * @return void
     */
    public static function staticFunc(){
        $a = [
            // empty annotation comment
        ];
    }

    /**
     * testFunc
     * @param string $str description: string parameter
     * @param bool $val description: boolean parameter
     * @return void description for return
     */
    public static function testFunc($str, $val){
        // empty comment1
        // empty comment2
    }
}
