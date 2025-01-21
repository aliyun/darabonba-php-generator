<?php

// This file is auto-generated, don't edit it. Thanks.
 
namespace Dara\PHP\Tests;
use AlibabaCloud\Dara\Util\StringUtil;
use AlibabaCloud\Dara\Util\BytesUtil;
use AlibabaCloud\Dara\Date;
use AlibabaCloud\Dara\File;
use AlibabaCloud\Dara\Util\FormUtil;
use Dara\PHP\Tests\Models\M;
use AlibabaCloud\Dara\Util\Console;
use AlibabaCloud\Dara\Util\MathUtil;
use AlibabaCloud\Dara\Util\StreamUtil;
use AlibabaCloud\Dara\URL;
use AlibabaCloud\Dara\Util\XML;
use RuntimeException;
class Client {

  /**
   * @param string[] $args
   * @return void
   */
  static public function arrayTest($args)
  {
    if ((\count($args) > 0) && \in_array('cn-hanghzou', $args)) {
      $index = array_search('cn-hanghzou', $args);
      $regionId = $args[$index];
      $all = implode(',', $args);
      $first = array_shift($args);
      $last = array_pop($args);
      $length1 = array_unshift($args, $first);
      $length2 = array_pop($args, $last);
      $length3 = $length1 + $length2;
      $longStr = 'long' . $first . $last;
      $fullStr = implode(',', $args);
      $newArr = [
        'test'
      ];
      $cArr = array_merge($args, $newArr);
      $acsArr = sort($newArr);
      $descArr = rsort($newArr);
      $llArr = array_merge($descArr, $acsArr);
      array_splice($llArr, 10, 0, 'test');
      array_splice($llArr, array_search('test', $llArr), 1);
    }

  }

  /**
   * @param string[] $args
   * @return void
   */
  static public function bytesTest($args)
  {
    $fullStr = implode(',', $args);
    $data = StringUtil::toBytes($fullStr, 'utf8');
    $newFullStr = BytesUtil::toString($data);
    if ($fullStr != $newFullStr) {
      return null;
    }

    $hexStr = bin2hex(BytesUtil::toString($data));
    $base64Str = base64_encode(BytesUtil::toString($data));
    $length = strlen($data);
    $obj = BytesUtil::toString($data);
    $data2 = BytesUtil::from($fullStr, 'base64');
  }

  /**
   * @param string[] $args
   * @return void
   */
  static public function dateTest($args)
  {
    $date = new Date('2023-09-12 17:47:31.916000 +0800 UTC');
    $dateStr = Date::format();
    $timestamp = Date::unix();
    $yesterday = Date::sub();
    $oneDay = Date::diff();
    $tomorrow = Date::add();
    $twoDay = Date::diff() + $oneDay;
    $hour = Date::hour();
    $minute = Date::minute();
    $second = Date::second();
    $dayOfMonth = Date::dayOfMonth();
    $dayOfWeek = Date::dayOfWeek();
    $weekOfYear = Date::weekOfYear();
    $month = Date::month();
    $year = Date::year();
  }

  /**
   * @param string[] $args
   * @return void
   */
  static public function envTest($args)
  {
    $es = getenv('TEST');
    $ma = putenv('TEST='.$es . 'test');
    $ma1 = putenv('TEST1=test1');
    $ma2 = putenv('TEST2='.$es);
  }

  /**
   * @param string[] $args
   * @return void
   */
  static public function fileTest($args)
  {
    if (File::exists('/tmp/test')) {
      $file = new File('/tmp/test');
      $path = $file->path();
      $length = $file->length() + 10;
      $createTime = $file->createTime();
      $modifyTime = $file->modifyTime();
      $timeLong = Date::diff();
      $data = $file->read(300);
      $file->write(BytesUtil::from('test', 'utf8'));
      $rs = File::createReadStream('/tmp/test');
      $ws = File::createWriteStream('/tmp/test');
    }

  }

  /**
   * @param string[] $args
   * @return void
   */
  static public function formTest($args)
  {
    $m = [
      'key1' => 'test1',
      'key2' => 'test2',
      'key3' => 3,
      'key4' => [
        'key5' => 123,
        'key6' => '321',
      ],
    ];
    $form = FormUtil::toFormString($m);
    $form = $form . '&key7=23233&key8=' . FormUtil::getBoundary();
    $r = FormUtil::toFileForm($m, FormUtil::getBoundary());
  }

  /**
   * @param string[] $args
   * @return void
   */
  static public function jsonTest($args)
  {
    $m = [
      'key1' => 'test1',
      'key2' => 'test2',
      'key3' => 3,
      'key4' => [
        'key5' => 123,
        'key6' => '321',
      ],
    ];
    $m1 = new M([
      'a' => 'test',
    ]);
    $ms = json_encode($m, JSON_UNESCAPED_UNICODE + JSON_UNESCAPED_SLASHES);
    $m1s = json_encode($m1->toArray(), JSON_UNESCAPED_UNICODE + JSON_UNESCAPED_SLASHES);
    $ma = json_decode($ms, true);
    $arrStr = '[1,2,3,4]';
    $arr = json_decode($arrStr, true);
  }

  /**
   * @param string[] $args
   * @return void
   */
  static public function logerTest($args)
  {
    Console::log('test');
    Console::info('test');
    Console::warning('test');
    Console::debug('test');
    Console::error('test');
  }

  /**
   * @param string[] $args
   * @return void
   */
  static public function mapTestCase($args)
  {
    $mapTest = [
      'key1' => 'value1',
      'key2' => 'value2',
      'key3' => 'value3',
    ];
    $length = \count($mapTest);
    $num = $length + 3;
    $keys = array_keys($mapTest);
    $allKey = '';

    foreach($keys as $key) {
      $allKey = $allKey . $key;
    }
    $entries = array_map(null, array_keys($mapTest), array_values($mapTest));
    $newKey = '';
    $newValue = '';

    foreach($entries as $e) {
      $newKey = $newKey . $e[0];
      $newValue = $newValue . $e[1];
    }
    $json = json_encode($mapTest, JSON_UNESCAPED_UNICODE + JSON_UNESCAPED_SLASHES);
    $mapTest2 = [
      'key1' => 'value4',
      'key4' => 'value5',
    ];
    $mapTest3 = array_merge($mapTest , $mapTest2);
    if (@$mapTest3['key1'] == 'value4') {
      return null;
    }

  }

  /**
   * @param string[] $args
   * @return void
   */
  static public function numberTest($args)
  {
    $num = 3.2;
    $inum = intval(''.$num);
    $lnum = intval(''.$num);
    $fnum = floatval(''.$num);
    $dnum = floatval(''.$num);
    $inum = intval(''.$inum);
    $lnum = intval(''.$inum);
    $fnum = floatval(''.$inum);
    $dnum = floatval(''.$inum);
    $inum = intval(''.$lnum);
    $lnum = intval(''.$lnum);
    $fnum = floatval(''.$lnum);
    $dnum = floatval(''.$lnum);
    $inum = intval(''.$fnum);
    $lnum = intval(''.$fnum);
    $fnum = floatval(''.$fnum);
    $dnum = floatval(''.$fnum);
    $inum = intval(''.$dnum);
    $lnum = intval(''.$dnum);
    $fnum = floatval(''.$dnum);
    $dnum = floatval(''.$dnum);
    $lnum = $inum;
    $inum = $lnum;
    $randomNum = MathUtil::random();
    $inum = floor($inum);
    $inum = round($inum);
  }

  /**
   * @param string[] $args
   * @return void
   */
  static public function streamTest($args)
  {
    if (File::exists('/tmp/test')) {
      $rs = File::createReadStream('/tmp/test');
      $ws = File::createWriteStream('/tmp/test');
      $data = $rs->read(30);
      $ws->write($data);
      $rs->pipe($ws);
      $data = StreamUtil::readAsBytes($rs);
      $obj = StreamUtil::readAsJSON($rs);
      $jsonStr = StreamUtil::readAsString($rs);
    }

  }

  /**
   * @param string[] $args
   * @return void
   */
  static public function stringTest($args)
  {
    $fullStr = implode(',', $args);
    $args = explode($fullStr, ',');
    if ((strlen($fullStr) > 0) && false !== strpos($fullStr, 'hangzhou')) {
      $newStr1 = preg_replace('/hangzhou/g', 'beijing', $fullStr);
    }

    if (StringUtil::hasPrefix($fullStr, 'cn')) {
      $newStr2 = preg_replace('/cn/gi', 'zh', $fullStr);
    }

    if (StringUtil::hasSuffix($fullStr, 'beijing')) {
      $newStr3 = preg_replace('/beijing/', 'chengdu', $fullStr);
    }

    $start = strpos($fullStr, 'beijing');
    $end = $start + 7;
    $region = substr($fullStr, $start, $end);
    $lowerRegion = strtolower($region);
    $upperRegion = strtoupper($region);
    if ($region === 'beijing') {
      $region = $region . ' ';
      $region = trim($region);
    }

    $tb = StringUtil::toBytes($fullStr, 'utf8');
    $em = 'xxx';
    if (empty($em)) {
      return null;
    }

    $num = '32.0a';
    $inum = intval($num) + 3;
    $lnum = intval($num);
    $fnum = floatval($num) + 1;
    $dnum = floatval($num) + 1;
  }

  /**
   * @param string[] $args
   * @return void
   */
  static public function urlTest($args)
  {
    $url = new URL(@$args[0]);
    $path = $url->path();
    $pathname = $url->pathname();
    $protocol = $url->protocol();
    $hostname = $url->hostname();
    $port = $url->port();
    $host = $url->host();
    $hash = $url->hash();
    $search = $url->search();
    $href = $url->href();
    $auth = $url->auth();
    $url2 = URL::parse(@$args[1]);
    $path = $url2->path();
    $newUrl = URL::urlEncode(@$args[2]);
    $newSearch = URL::percentEncode($search);
    $newPath = URL::pathEncode($pathname);
    $all = 'test' . $path . $protocol . $hostname . $hash . $search . $href . $auth . $newUrl . $newSearch . $newPath;
  }

  /**
   * @param string[] $args
   * @return void
   */
  static public function xmlTest($args)
  {
    $m = [
      'key1' => 'test1',
      'key2' => 'test2',
      'key3' => 3,
      'key4' => [
        'key5' => 123,
        'key6' => '321',
      ],
    ];
    $xml = XML::toXML($m);
    $xml = $xml . '<key7>132</key7>';
    $respMap = XML::parseXml($xml, null);
  }

  /**
   * @return mixed
   */
  static public function returnAny()
  {
    throw new RuntimeException('Un-implemented!');
  }

  /**
   * @param string[] $args
   * @return void
   */
  static public function main($args)
  {
    self::arrayTest($args);
    self::bytesTest($args);
    self::dateTest($args);
    self::envTest($args);
    self::fileTest($args);
    self::formTest($args);
    self::logerTest($args);
    self::mapTestCase($args);
    self::numberTest($args);
    self::streamTest($args);
    self::stringTest($args);
    self::urlTest($args);
    self::xmlTest($args);
    $a = intval(@$args[0]) + 10;
    $b = ''.$a . @$args[1] . ''.self::returnAny();
    $c = ($b + 0) + ($a + 0) + (self::returnAny() + 0);
    $d = intval($b) + intval($a) + intval(self::returnAny());
    $e = intval($b) + intval($a) + intval(self::returnAny());
    $f = intval($b) + intval($a) + intval(self::returnAny());
    $g = intval($b) + intval($a) + intval(self::returnAny());
    $h = intval($b) + intval($a) + intval(self::returnAny());
    $i = intval($b) + intval($a) + intval(self::returnAny());
    $j = intval($b) + intval($a) + intval(self::returnAny());
    $k = intval($b) + intval($a) + intval(self::returnAny());
    $l = intval($b) + intval($a) + intval(self::returnAny());
    $m = intval($b) + intval($a) + intval(self::returnAny());
    $n = floatval($b) + floatval($a) + floatval(self::returnAny());
    $o = floatval($b) + floatval($a) + floatval(self::returnAny());
    if (boolval(@$args[2])) {
      $data = unpack('C*', self::returnAny());
      $length = strlen($data);
      $test = $data;
      $maps = [
        'key' => 'value',
      ];
      $obj = $maps;
      $ws = StreamUtil::streamFor($obj);
      $rs = StreamUtil::streamFor($maps);
      $data = $rs->read(30);
      if (!is_null($data)) {
        $ws->write($data);
      }

    }

    usleep($a * 1000);
    $defaultVal = ''.(@$args[0] ? @$args[0] : @$args[1]);
    if ($defaultVal === $b) {
      return null;
    }

  }

}
