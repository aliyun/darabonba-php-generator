<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Darabonba\Tests;
use GuzzleHttp\Psr7\Request;
use AlibabaCloud\Dara\Model;
use Source\SourceClient;
use Darabonba\Tests\Models\M;
use GuzzleHttp\Psr7\Response;
use RuntimeException;
class Client {
  /**
   * @var Request
   */
  protected $_vid;

  /**
   * @var Model
   */
  protected $_model;


  public function __construct($request, $model)
  {
    $this->_vid = $request;
    $this->_model = $model;
  }


  /**
   * @param Request $test1
   * @param array $test2
   * @param Model $test3
   * @return void
   */
  public function main($test1, $test2, $test3)
  {
    $oss = new SourceClient($test1);
    $m = new M([
      'a' => $test1,
      'b' => $test2,
    ]);
    $this->_vid = $test1;
    $this->_model = $test3;
  }

  /**
   * @param Request $req
   * @return Response
   */
  public function testHttpRequest($req)
  {
    return self::testHttpRequestWith('test', $req);
  }

  /**
   * @param string $method
   * @param Request $req
   * @return Response
   */
  static public function testHttpRequestWith($method, $req)
  {
    throw new RuntimeException('Un-implemented!');
  }

  /**
   * @param string $method
   * @param array $headers
   * @return Response
   */
  static public function testHttpHeader($method, $headers)
  {
    throw new RuntimeException('Un-implemented!');
  }

}
