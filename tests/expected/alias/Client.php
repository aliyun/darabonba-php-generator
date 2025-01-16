<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests;
use Source\Models\M;
use Import\Client as ImportClient;
use Source\Client as SourceClient;
class Client {

  /**
   * @return void
   */
  static public function emptyModel()
  {
    $m1 = new M([ ]);
    $m2 = new \Import\Models\M([ ]);
    ImportClient::test($m2);
    SourceClient::test($m1);
  }

}
