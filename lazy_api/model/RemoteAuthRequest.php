<?php

/**
 * Created by PhpStorm.
 * User: pieter
 * Date: 17/07/15
 * Time: 09:07
 */
class RemoteAuthRequest {

    private $base_header;
    private $token;
    private $list;

    /**
     * Constructor. Creates an authorization header for apiRequest
     * @throws Exception
     */
    function __construct () {
        $this->base_header = 'Authorization: %s %s';
        if (! file_exists ('tokens/list.json')) {
            throw new Exception ('Error: token list doest not exist!');
        }
        $list = file_get_contents('tokens/list.json');
        $this->list = json_decode($list, true);
        if (json_last_error() != JSON_ERROR_NONE) {
            throw new Exception('Error: decoding JSON produced an error: '.json_last_error_msg());
        }
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

    /**
     * Function to authentication support with curl
     * @param $api_type: Type of the API (corresponds to a key in list.json)
     * @param $curl_object: curl object
     * @return object $curl_object
     */
    public function add_basic_header($api_type, $curl_object) {
        $auth = $this->get_auth_token($api_type);
        $username = $auth[0];
        $password = $auth[1];
        return 'Authorization: Basic '.base64_encode("$username:$password");
    }
}