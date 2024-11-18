<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests;
use AlibabaCloud\Dara\Exception\DaraException;
use Source\SourceClient;
use Source\Models\RuntimeObject;
use Source\Models\Request;
class Client {
  /**
   * @var string[]
   */
  protected $_id;

  /**
   * @var string
   */
  protected $_str;


  public function __construct($id, $str)
  {
    $this->_id = $id;
    $this->_str = $str;
    throw new DaraException([
      'code' => 'SomeError',
      'messge' => 'ErrorMessage',
    ]);
  }


  /**
   * @param SourceClient $client
   * @return void
   */
  static public function Sample($client)
  {
    $runtime = new RuntimeObject([ ]);
    $request = new Request([
      'accesskey' => 'accesskey',
      'region' => 'region',
    ]);
    $client->print_($runtime);
  }

}
