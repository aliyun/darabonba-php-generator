<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests;
use AlibabaCloud\Dara\Dara;
use AlibabaCloud\Dara\Request;
use AlibabaCloud\Dara\RetryPolicy\RetryPolicyContext;
use AlibabaCloud\Dara\Exception\DaraException;
use AlibabaCloud\Dara\Exception\DaraUnableRetryException;
class Client {

  /**
   * @return void
   */
  public function hello()
  {
    $_request = new Request();
    $_reqeust->method = 'GET';
    $_reqeust->pathname = '/';
    $_reqeust->headers = [
      'host' => 'www.test.com',
    ];
    $_response = Dara::send($_request);

    return null;
  }

  /**
   * @return void
   */
  public function helloRuntime()
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
        $_reqeust->method = 'GET';
        $_reqeust->pathname = '/';
        $_reqeust->headers = [
          'host' => 'www.test.com',
        ];
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


}
