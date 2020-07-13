<?php

// This file is auto-generated, don't edit it. Thanks.
namespace Tea\PHP\Tests;

use Import\Client as ImportClient;
use Source\Client as SourceClient;

class Client {

    /**
     * @return void
     */
    public static function emptyModel(){
        ImportClient::test();
        SourceClient::test();
    }
}
