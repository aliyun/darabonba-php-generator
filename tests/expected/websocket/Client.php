<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests;
use Darabonba\OpenApi\WebsocketUtils\Models\WebSocketClient;
use Darabonba\OpenApi\WebsocketUtils\Client as WebSocketUtilsClient;
class Client {

  public function __construct()
  {
  }


  /**
   * @param mixed $client
   * @return WebSocketClient
   */
  static public function wrapWebSocketClient($client)
  {
    return WebSocketUtilsClient::createWebSocketClient($client);
  }

}
