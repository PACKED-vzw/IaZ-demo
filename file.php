<?php
/**
 * Created by PhpStorm.
 * User: pieter
 * Date: 22/07/15
 * Time: 10:11
 */
$f = file_get_contents('api_response.json');
$j = json_decode($f, true);
echo json_encode($j);
exit;