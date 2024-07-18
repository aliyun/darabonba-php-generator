<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests;
use AlibabaCloud\Dara\Dara;
use AlibabaCloud\Dara\RetryPolicy\RetryPolicyContext;
use AlibabaCloud\Dara\Request;
use AlibabaCloud\Dara\Exception\DaraException;
use AlibabaCloud\Dara\Exception\DaraUnableRetryException;
/**
 * top annotation
 */
class Client {
  /**
   * @var string
   */
  protected $_a;


  /**
   * Init Func
   */
  public function __construct()
  {
  }

  /**
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
   * testFunc
   * @return void
   */
  static public function testFunc()
  {
  }

  // Deprecated
  /**
   * Queries available Alibaba Cloud regions. The natural language that is used to filter responses. For more information, visit [RFC 7231](https://tools.ietf.org/html/rfc7231). Valid values:
   * *   zh-CN: Chinese
   * *   en-US: English
   * *   ja: Japanese
   * 
   * Queries available Alibaba Cloud regions. The natural language that is used to filter responses. For more information, visit [RFC 7231](https://tools.ietf.org/html/rfc7231). Valid values:
   * *   zh-CN: Chinese
   * *   en-US: English
   * *   ja: Japanese
   * 
   * Default value: zh-CN.
   * 
   * 
   * > 这是Note的内容
   * 
   * > Notice: 这是注意的内容
   * 
   * @deprecated deprecatedFunc is deprecated.
   * 
   * @throws InternalError Server error. 500 服务器端出现未知异常。
   * @throws StackNotFound The Stack (%(stack_name)s) could not be found.  404 资源栈不存在。
   * @param string $test
   * @param string $_test
   * @return void
   */
  static public function deprecatedFunc($test, $_test)
  {
    // empty comment1
    // empty comment2
  }

  /**
   * annotation test summary
   * summary description1
   * summary description2
   * 
   * @deprecated test is deprecated, use xxx instead.
   * deprecated description1
   * deprecated description2
   * 
   * @throws InternalError Server error. 500 服务器端出现未知异常。
   * @param string $test
   * @param string $_test
   * @return void
   */
  static public function multiLineAnnotation($test, $_test)
  {
  }

  /**
   * @deprecated deprecated test for line break.
   * 
   * @throws InternalError Server error. 500 服务器端出现未知异常。
   * throws test for line break.
   * @param string $test
   * @param string $_test
   * @return void
   */
  static public function lineBreakAnnotation($test, $_test)
  {
  }

}
