<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests;
use AlibabaCloud\Dara\Dara;
use AlibabaCloud\Dara\RetryPolicy\RetryPolicyContext;
use AlibabaCloud\Dara\Request;
use Dara\PHP\Tests\model\UserModel;
use Dara\PHP\Tests\lib\UtilClient;
use AlibabaCloud\Dara\Exception\DaraException;
use AlibabaCloud\Dara\Exception\DaraUnableRetryException;
class ApiClient {

  public function __construct()
  {
  }

  /**
   * @return int
   */
  public function test3()
  {
    $_runtime = [
      'timeouted' => 'retry',
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
        $_reqeust->protocol = 'https';
        $_reqeust->method = 'DELETE';
        $_reqeust->pathname = '/';
        $_reqeust->headers = [
          'host' => 'test.aliyun.com',
          'accept' => 'application/json',
          'test' => UserModel::test1(),
        ];
        $_reqeust->query = UtilClient::getQuery();
        $_response = Dara::send($_request, $_runtime);
        $_lastRequest = $_request;
        $_lastResponse = $_response;

        return $_response->statusCode;
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
