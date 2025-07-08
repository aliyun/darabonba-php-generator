<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests;
use AlibabaCloud\Dara\Dara;
use Dara\PHP\Tests\Models\Test1;
use AlibabaCloud\Dara\RetryPolicy\RetryPolicyContext;
use AlibabaCloud\Dara\Request;
use AlibabaCloud\Dara\Exception\DaraException;
use AlibabaCloud\Dara\Exception\DaraUnableRetryException;
use Dara\PHP\Tests\Models\Test3;
// top comment
/**
 * @remarks
 * top annotation
 */
class Client {
  // type's comment
  /**
   * @var string[]
   */
  protected $_a;


  /**
   * @remarks
   * Init Func
   */
  // comment between init and annotation
  public function __construct()
  {
    // string declate comment
    $str = 'sss';
    // new model instance comment
    $modelInstance = new Test1([
      'test' => 'test',
      //test declare back comment
      'test2' => 'test2',
      //test2 declare back comment
    ]);
    $array = [
      // array string comment
      'string',
      // array number comment
      300
      // array back comment
    ];
  }

  //testAPI comment one
  //testAPI comment two
  /**
   * @remarks
   * testAPI
   * @return void
   */
  public function testAPI()
  {
    $_runtime = [ 
      // empty runtime comment
      // another runtime comment
    ];

    $_retriesAttempted = 0;
    $_lastRequest = null;
    $_lastResponse = null;
    $_context = new RetryPolicyContext([
      'retriesAttempted' => $_retriesAttempted,
    ]);
    while (Dara::shouldRetry($_runtime['retryOptions'], $_context)) {
      if ($_retriesAttempted > 0) {
        $_backoffTime = Dara::getBackoffDelay($_runtime['retryOptions'], $_context);
        if ($_backoffTime > 0) {
          Dara::sleep($_backoffTime);
        }
      }

      $_retriesAttempted++;
      try {
        $_request = new Request();
        // new model instance comment
        $modelInstance = new Test1([
          // test declare front comment
          'test' => 'test',
          // test2 declare front comment
          'test2' => 'test2',
        ]);
        // number declare comment
        $num = 123;
        // static function call comment
        self::staticFunc();
        $_lastRequest = $_request;
        $_response = Dara::send($_request, $_runtime);
        $_lastResponse = $_response;

        // static async function call
        self::testFunc('test', true);
        // return comment
        return null;
      } catch (DaraException $e) {
        $_context = new RetryPolicyContext([
          'retriesAttempted' => $_retriesAttempted,
          'lastRequest' => $_lastRequest,
          'lastResponse' => $_lastResponse,
          'exception' => $e,
        ]);
        continue;
      }
    }

    throw new DaraUnableRetryException($_context);
  }

  // testAPI2 comment
  /**
   * @return void
   */
  public function testAPI2()
  {
    $_runtime = [
      // runtime retry comment
      'retry' => true,
      // runtime back comment one
      // runtime back comment two
    ];

    $_retriesAttempted = 0;
    $_lastRequest = null;
    $_lastResponse = null;
    $_context = new RetryPolicyContext([
      'retriesAttempted' => $_retriesAttempted,
    ]);
    while (Dara::shouldRetry($_runtime['retryOptions'], $_context)) {
      if ($_retriesAttempted > 0) {
        $_backoffTime = Dara::getBackoffDelay($_runtime['retryOptions'], $_context);
        if ($_backoffTime > 0) {
          Dara::sleep($_backoffTime);
        }
      }

      $_retriesAttempted++;
      try {
        $_request = new Request();
        // new model instance comment
        $modelInstance = new Test3([ 
          //empty model 
        ]);
        // boolean declare comment
        $bool = true;
        if ($bool) {
          
          //empty if
        } else {
          //empty else
          
        }

        // api function call comment
        $this->testAPI();
        // back comment
        $_lastRequest = $_request;
        $_response = Dara::send($_request, $_runtime);
        $_lastResponse = $_response;

        // empty return comment
      } catch (DaraException $e) {
        $_context = new RetryPolicyContext([
          'retriesAttempted' => $_retriesAttempted,
          'lastRequest' => $_lastRequest,
          'lastResponse' => $_lastResponse,
          'exception' => $e,
        ]);
        continue;
      }
    }

    throw new DaraUnableRetryException($_context);
  }

  /**
   * @return void
   */
  static public function staticFunc()
  {
    $a = [ 
      // empty annotation comment
    ];
  }

  /**
   * @remarks
   * testFunc
   * 
   * @param str - description: string parameter
   * @param val - description: boolean parameter
   * @returns description for return
   * @param string $str
   * @param boolean $val
   * @return void
   */
  static public function testFunc($str, $val)
  {
    // empty comment1
    // empty comment2
  }

}
