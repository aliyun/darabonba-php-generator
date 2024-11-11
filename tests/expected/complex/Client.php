<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests;
use AlibabaCloud\Dara\Dara;
use Source\SourceClient;
use Source\Models\Config;
use Dara\PHP\Tests\Models\ComplexRequest;
use Source\Models\RuntimeObject;
use AlibabaCloud\Dara\RetryPolicy\RetryPolicyContext;
use AlibabaCloud\Dara\Request;
use AlibabaCloud\Dara\Exception\DaraException;
use AlibabaCloud\Dara\Exception\DaraUnableRetryException;
use AlibabaCloud\Dara\Response;
use Dara\PHP\Tests\Models\ComplexRequest\header;
use Dara\PHP\Tests\Exceptions\Err1Exception;
use Dara\PHP\Tests\Exceptions\Err2Exception;
use Source\Exceptions\Err3Exception;
use AlibabaCloud\Dara\Util\Console;
class Client extends SourceClient {
  /**
   * @var Config[]
   */
  protected $_configs;


  public function __construct($config)
  {
    parent::__construct($config);
    @$this->_configs[0] = $config;
  }

  /**
   * @param ComplexRequest $request
   * @param SourceClient $client
   * @return RuntimeObject
   */
  public function complex1($request, $client)
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
        $name = 'complex';
        $mapVal = [
          'test' => 'ok',
        ];
        $moduleModelMapVal = [ ];
        $moduleMapVal = [ ];
        $modelMapVal = [ ];
        $subModelMapVal = [ ];
        $version = '/' . '2019-01-08' . '' . $this->_pathname . '';
        $mapAccess = @$this->_API[$version];
        $_request->protocol = $this->_protocol;
        $_request->port = 80;
        $_request->method = 'GET';
        $_request->pathname = '/' . $this->_pathname . '';
        $_request->query = SourceClient::query(Dara::merge([
          'date' => '2019',
          'access' => $mapAccess,
          'test' => @$mapVal['test'],
        ], $request->header));
        $_request->body = SourceClient::body();
        $_response = Dara::send($_request, $_runtime);
        $_lastRequest = $_request;
        $_lastResponse = $_response;

        if (true && true) {
          return null;
        } else if (true || false) {
          return new RuntimeObject([ ]);
        }

        $client->print_($request->toArray(), '1');
        $client->printAsync($request->toArray(), '1');
        $this->hello($request->toArray(), [
          '1',
          '2'
        ]);
        $this->hello(null, null);
        $this->Complex3(null);
        return RuntimeObject::fromMap([ ]);
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
   * @param ComplexRequest $request
   * @param string[] $str
   * @param string[] $val
   * @return mixed[]
   */
  public function Complex2($request, $str, $val)
  {
    $_request = new Request();
    $name = 'complex';
    $config = new Config([ ]);
    $client = new SourceClient($config);
    $_request->protocol = 'HTTP';
    $_request->port = 80;
    $_request->method = 'GET';
    $_request->pathname = '/';
    $_request->query = SourceClient::query([
      'date' => '2019',
      'version' => '2019-01-08',
      'protocol' => $_request->protocol,
    ]);
    $_request->body = SourceClient::body();
    $_response = Dara::send($_request);

    return [];
  }

  /**
   * @param ComplexRequest $request
   * @return ComplexRequest
   */
  public function Complex3($request)
  {
    $_request = new Request();
    $name = 'complex';
    $_request->protocol = $this->TemplateString();
    $_request->port = 80;
    $_request->method = 'GET';
    $_request->pathname = '/';
    $_request->query = SourceClient::query([
      'date' => '2019',
    ]);
    $_request->body = SourceClient::body();
    @$_request->headers['host'] = 'hello';
    $_response = Dara::send($_request);

    $temp_str = 'test ' . (string)100 . ' ' . (string)true . ' ' . (string)($_request->port + 4) . ' ' . @$_request->headers['host'] . '';
    $resp = $_response;
    $req = new \Source\Models\Request([
      'accesskey' => $request->accessKey,
      'region' => $resp->statusMessage,
    ]);
    self::array0($request->toArray());
    $req->accesskey = 'accesskey';
    $req->accesskey = $request->accessKey;
    SourceClient::parse(ComplexRequest::class);
    SourceClient::array_($request->toArray(), '1');
    SourceClient::asyncFunc();
    return ComplexRequest::fromMap(Dara::merge([
    ], $_request->query));
  }

  /**
   * @param mixed[] $request
   * @param string[] $strs
   * @return string[]
   */
  public function hello($request, $strs)
  {
    return self::array1();
  }

  /**
   * @param Request $reqeust
   * @param ComplexRequest[] $reqs
   * @param Response $response
   * @param string[] $val
   * @return \Source\Models\Request
   */
  static public function print_($reqeust, $reqs, $response, $val)
  {
    return \Source\Models\Request::fromMap([ ]);
  }

  /**
   * @param mixed[] $req
   * @return mixed[]
   */
  static public function array0($req)
  {
    $temp = new Config([ ]);
    $anyArr = [
      $temp
    ];
    return [ ];
  }

  /**
   * @return string[]
   */
  static public function array1()
  {
    return [
      '1'
    ];
  }

  /**
   * @return string
   */
  static public function arrayAccess()
  {
    $configs = [
      'a',
      'b',
      'c'
    ];
    $config = @$configs[0];
    return $config;
  }

  /**
   * @return string
   */
  static public function arrayAccess2()
  {
    $data = [
      'configs' => [
        'a',
        'b',
        'c'
      ],
    ];
    $config = @$data['configs'][0];
    $i = 0;
    $config = @$data['configs'][$i];
    return $config;
  }

  /**
   * @param ComplexRequest $request
   * @return string
   */
  static public function arrayAccess3($request)
  {
    $configVal = @$request->configs->value[0];
    return $configVal;
  }

  /**
   * @param ComplexRequest $request
   * @param string $config
   * @param int $index
   * @return void
   */
  static public function arrayAccess4($request, $config, $index)
  {
    @$request->configs->value[$index] = $config;
    $i = 1;
    @$request->configs->value[$i] = $config;
  }

  /**
   * @param string $config
   * @return string[]
   */
  static public function arrayAssign($config)
  {
    $configs = [
      'a',
      'b',
      'c'
    ];
    @$configs[3] = $config;
    return $configs;
  }

  /**
   * @param string $config
   * @return string[]
   */
  static public function arrayAssign2($config)
  {
    $data = [
      'configs' => [
        'a',
        'b',
        'c'
      ],
    ];
    @$data['configs'][3] = $config;
    return @$data['configs'];
  }

  /**
   * @param ComplexRequest $request
   * @param string $config
   * @return void
   */
  static public function arrayAssign3($request, $config)
  {
    @$request->configs->value[0] = $config;
  }

  /**
   * @param ComplexRequest $request
   * @return string
   */
  static public function mapAccess($request)
  {
    $key = 'name';
    $configInfo = @$request->configs->extra[$key];
    return $configInfo;
  }

  /**
   * @param \Source\Models\Request $request
   * @return string
   */
  static public function mapAccess2($request)
  {
    $configInfo = @$request->configs->extra['name'];
    return $configInfo;
  }

  /**
   * @return string
   */
  static public function mapAccess3()
  {
    $data = [
      'configs' => [
        'value' => 'string',
      ],
    ];
    return @$data['configs']['value'];
  }

  /**
   * @param ComplexRequest $request
   * @param string $name
   * @return void
   */
  static public function mapAssign($request, $name)
  {
    @$request->configs->extra['name'] = $name;
    $key = 'name';
    @$request->configs->extra[$key] = $name;
  }

  /**
   * @return string
   */
  public function TemplateString()
  {
    return '/' . $this->_protocol . '';
  }

  /**
   * @return void
   */
  public function emptyModel()
  {
    new ComplexRequest([ ]);
    new header([ ]);
  }

  /**
   * @return void
   */
  public function tryCatch()
  {
    try {
      $str = $this->TemplateString();
    } catch (DaraException $err) {
      $error = $err;
    } finally {
      $final = 'ok';
    }    
    try {
      $strNoFinal = $this->TemplateString();
    } catch (DaraException $e) {
      $errorNoFinal = $e;
    }    
    try {
      $strNoCatch = $this->TemplateString();
    } finally {
      $finalNoCatch = 'ok';
    }    
  }

  /**
   * @param int $a
   * @return void
   */
  public function multiTryCatch($a)
  {
    try {
      if ($a > 0) {
        throw new Err1Exception([
          'name' => 'str',
          'code' => 'str',
          'data' => [
            'key1' => 'str',
          ],
        ]);
      } else if ($a == 0) {
        throw new Err2Exception([
          'name' => 'str',
          'code' => 'str',
          'accessErrMessage' => 'str2',
        ]);
      } else if ($a == -10) {
        throw new Err3Exception([
          'name' => 'str',
          'code' => 'str',
        ]);
      } else if ($a == -20) {
        throw new \Source\Exceptions\Err2Exception([
          'name' => 'str',
          'code' => 'str',
        ]);
      } else {
        throw new DaraException([
          'name' => 'str',
          'code' => 'str',
        ]);
      }

    } catch (Err1Exception $err) {
      Console::log($err->name);
    } catch (Err2Exception $err) {
      Console::log($err->name);
    } catch (Err3Exception $err) {
      Console::log($err->name);
    } catch (DaraException $err) {
      Console::log($err->name);
    } finally {
      $final = 'ok';
    }    
  }

}
