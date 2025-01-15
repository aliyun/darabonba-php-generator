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
  public function helloSSE()
  {
    $_request = new Request();
    $_request->method = 'GET';
    $_request->pathname = '/';
    $_request->headers = [
      'host' => 'www.test.com',
      'accept' => 'text/event-stream',
    ];
    $_response = Dara::send($_request, [ 'stream' => true, ]);

    return null;
  }

  /**
   * @return void
   */
  public function hello()
  {
    $_request = new Request();
    $_request->method = 'GET';
    $_request->pathname = '/';
    $_request->headers = [
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
        $_request->method = 'GET';
        $_request->pathname = '/';
        $_request->headers = [
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

    throw new DaraUnableRetryException($_context);
  }

  /**
   * @return void
   */
  public function helloRuntimeSSE()
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
        $_request->method = 'GET';
        $_request->pathname = '/';
        $_request->headers = [
          'host' => 'www.test.com',
          'accept' => 'text/event-stream',
        ];
        $_runtime['stream'] = true;
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

    throw new DaraUnableRetryException($_context);
  }


}
