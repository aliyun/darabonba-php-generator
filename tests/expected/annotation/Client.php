<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests;
use AlibabaCloud\Dara\Dara;
use AlibabaCloud\Dara\RetryPolicy\RetryPolicyContext;
use AlibabaCloud\Dara\Request;
use AlibabaCloud\Dara\Exception\DaraException;
use AlibabaCloud\Dara\Exception\DaraUnableRetryException;
/**
 * @remarks
 * top annotation
 */
class Client {
  /**
   * @var string
   */
  protected $_a;


  /**
   * @remarks
   * Init Func
   */
  public function __construct()
  {
  }

  /**
   * @remarks
   * testAPI
   * @return void
   */
  public function testAPI()
  {
    $_runtime = [ ];

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
        $_response = Dara::send($_request, $_runtime);
        $_lastRequest = $_request;
        $_lastResponse = $_response;

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

    throw DaraUnableRetryException($_context);
  }

  /**
   * @remarks
   * testFunc
   * @return void
   */
  static public function testFunc()
  {
  }

}
