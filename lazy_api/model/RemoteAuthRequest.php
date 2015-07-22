<?php

/**
 * Created by PhpStorm.
 * User: pieter
 * Date: 17/07/15
 * Time: 09:07
 */
class RemoteAuthRequest {

    private $base_header;
    private $token = array();
    private $list;
    public $username;
    public $password;

    /**
     * Constructor. Creates an authorization header for apiRequest
     * @param $api_type string QI in
     * @throws Exception
     */
    function __construct ($api_type) {
        $this->base_header = 'Authorization: %s %s';
        if (! file_exists ('tokens/list.php')) {
            throw new Exception ('Error: token list doest not exist!');
        }
        include_once('tokens/list.php');
        $list = $tokens;
        $this->list = json_decode($list, true);
        if (json_last_error() != JSON_ERROR_NONE) {
            throw new Exception('Error: decoding JSON produced an error: '.json_last_error_msg());
        }
        $this->token = $this->get_auth_token($api_type);
        $this->username = $this->token[0];
        $this->password = $this->token[1];
    }

    /**
     * Function to get the authentication token corresponding to the api $api_type from a list
     * @throws Exception
     * @param $api_type
     * @return array($username, $password)
     */
    protected function get_auth_token($api_type) {
        if (!isset ($this->list[$api_type])) {
            throw new Exception('Error: api type '.$api_type.' does not exist in the token list!');
        }
        $username = $this->list[$api_type]['username'];
        $password = $this->list[$api_type]['password'];
        return array(
            $username,
            $password
        );
    }
}